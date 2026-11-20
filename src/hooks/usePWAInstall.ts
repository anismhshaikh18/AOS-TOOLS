import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

declare global {
  interface Window {
    __aosDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
    __aosAppInstalled?: boolean;
  }
}

const DISMISS_STORAGE_KEY = 'aos_pwa_banner_dismissed_at';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

interface PwaInstallStoreState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  hasInteracted: boolean;
  isBannerDismissed: boolean;
  isPrompting: boolean;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.__aosAppInstalled) return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
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

const listeners = new Set<() => void>();
let listenersInitialized = false;

let storeState: PwaInstallStoreState = {
  deferredPrompt:
    typeof window !== 'undefined' ? window.__aosDeferredInstallPrompt || null : null,
  isInstalled: detectStandalone(),
  hasInteracted: false,
  isBannerDismissed: readDismissedState(),
  isPrompting: false,
};

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function setStoreState(patch: Partial<PwaInstallStoreState>): void {
  storeState = { ...storeState, ...patch };
  emitChange();
}

export function initGlobalPWAInstallListeners(): void {
  if (typeof window === 'undefined' || listenersInitialized) return;
  listenersInitialized = true;

  // Hydrate immediately if index.html early capture already caught the event
  if (window.__aosDeferredInstallPrompt && !storeState.deferredPrompt) {
    setStoreState({ deferredPrompt: window.__aosDeferredInstallPrompt });
  }
  if (detectStandalone() && !storeState.isInstalled) {
    setStoreState({ isInstalled: true, deferredPrompt: null });
  }

  const mediaQuery = window.matchMedia('(display-mode: standalone)');

  const syncInstalledState = () => {
    const standaloneActive = detectStandalone();
    if (standaloneActive !== storeState.isInstalled) {
      setStoreState({
        isInstalled: standaloneActive,
        deferredPrompt: standaloneActive ? null : storeState.deferredPrompt,
      });
    }
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;
    window.__aosDeferredInstallPrompt = promptEvent;
    setStoreState({ deferredPrompt: promptEvent, isInstalled: false });
  };

  const handleCapturedBridge = () => {
    if (window.__aosDeferredInstallPrompt) {
      setStoreState({
        deferredPrompt: window.__aosDeferredInstallPrompt,
        isInstalled: false,
      });
    }
  };

  const handleAppInstalled = () => {
    window.__aosDeferredInstallPrompt = null;
    window.__aosAppInstalled = true;
    setStoreState({
      isInstalled: true,
      deferredPrompt: null,
      isBannerDismissed: true,
      isPrompting: false,
    });
  };

  const handleInteraction = () => {
    if (!storeState.hasInteracted) {
      setStoreState({ hasInteracted: true });
    }
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('aos-pwa-prompt-captured', handleCapturedBridge);
  window.addEventListener('appinstalled', handleAppInstalled);
  window.addEventListener('aos-pwa-installed', handleAppInstalled);
  window.addEventListener('aos-pwa-interaction', handleInteraction);
  mediaQuery.addEventListener?.('change', syncInstalledState);
}

// Initialize immediately on module evaluation so every mounted or lazy component shares one global capture
if (typeof window !== 'undefined') {
  initGlobalPWAInstallListeners();
}

export function notifyPwaInteraction(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aos-pwa-interaction'));
  }
}

export function usePWAInstall() {
  const [snapshot, setSnapshot] = useState<PwaInstallStoreState>(() => {
    initGlobalPWAInstallListeners();
    return storeState;
  });

  const [isIOS] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const isAppleTouchMac =
      navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return /iPad|iPhone|iPod/.test(ua) || isAppleTouchMac;
  });

  useEffect(() => {
    initGlobalPWAInstallListeners();
    const onChange = () => setSnapshot(storeState);
    listeners.add(onChange);
    // Sync immediately in case state updated between render and effect
    onChange();
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent =
      storeState.deferredPrompt ||
      (typeof window !== 'undefined' ? window.__aosDeferredInstallPrompt || null : null);

    if (!promptEvent || typeof promptEvent.prompt !== 'function') {
      return 'unavailable';
    }

    setStoreState({ isPrompting: true });
    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      const outcome = choiceResult?.outcome === 'accepted' ? 'accepted' : 'dismissed';

      // Native BeforeInstallPromptEvent is single-use; clear reference after consumption
      if (typeof window !== 'undefined') {
        window.__aosDeferredInstallPrompt = null;
      }

      if (outcome === 'accepted') {
        if (typeof window !== 'undefined') {
          window.__aosAppInstalled = true;
        }
        setStoreState({
          isInstalled: true,
          deferredPrompt: null,
          isBannerDismissed: true,
          isPrompting: false,
        });
      } else {
        setStoreState({
          deferredPrompt: null,
          isPrompting: false,
        });
      }
      return outcome;
    } catch {
      if (typeof window !== 'undefined') {
        window.__aosDeferredInstallPrompt = null;
      }
      setStoreState({ deferredPrompt: null, isPrompting: false });
      return 'unavailable';
    }
  }, []);

  const dismissPromptBanner = useCallback(() => {
    setStoreState({ isBannerDismissed: true });
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures in strict privacy browsers
    }
  }, []);

  return {
    canInstall: Boolean(snapshot.deferredPrompt),
    isInstalled: snapshot.isInstalled,
    isIOS,
    isPrompting: snapshot.isPrompting,
    hasInteracted: snapshot.hasInteracted,
    isBannerDismissed: snapshot.isBannerDismissed,
    promptInstall,
    dismissPromptBanner,
  };
}
