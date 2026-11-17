import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_STORAGE_KEY = 'aos_pwa_banner_dismissed_at';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export function notifyPwaInteraction(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aos-pwa-interaction'));
  }
}

function readDismissedState(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < SNOOZE_MS;
  } catch {
    return false;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    );
  });

  const [isIOS] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => readDismissedState());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const syncInstalledState = () => {
      const standaloneActive =
        mediaQuery.matches ||
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setIsInstalled(standaloneActive);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsBannerDismissed(true);
    };

    const handleInteraction = () => {
      setHasInteracted(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('aos-pwa-interaction', handleInteraction);
    mediaQuery.addEventListener?.('change', syncInstalledState);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('aos-pwa-interaction', handleInteraction);
      mediaQuery.removeEventListener?.('change', syncInstalledState);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable';
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
    return outcome;
  }, [deferredPrompt]);

  const dismissPromptBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures in strict privacy browsers
    }
  }, []);

  return {
    canInstall: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    hasInteracted,
    isBannerDismissed,
    promptInstall,
    dismissPromptBanner,
  };
}
