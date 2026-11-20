import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AosLogoSvg } from './AosLogoSvg';

export const PWAInstallPromptBanner: React.FC = () => {
  const {
    canInstall,
    isInstalled,
    isIOS,
    isPrompting,
    hasInteracted,
    isBannerDismissed,
    promptInstall,
    dismissPromptBanner,
  } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  // Reveal non-intrusively after user completes their first meaningful interaction
  useEffect(() => {
    if (isInstalled || isBannerDismissed || !hasInteracted) {
      setIsVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 850);

    return () => window.clearTimeout(timer);
  }, [hasInteracted, isInstalled, isBannerDismissed]);

  useEffect(() => {
    if (!showManualGuide) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowManualGuide(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showManualGuide]);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setIsVisible(false);
      return;
    }
    if (outcome === 'dismissed') {
      return;
    }
    setShowManualGuide(true);
  };

  const fallbackModal =
    showManualGuide && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Install AOS Tools on Your Device"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowManualGuide(false);
            }}
          >
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/30 shadow-2xl overflow-hidden">
              <div className="guide-banner-dark bg-[#0B192C] px-5 py-4 flex items-center justify-between border-b border-sky-400/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="guide-banner-title text-sm font-extrabold text-white">
                      Install AOS Tools App
                    </h3>
                    <p className="text-[11px] text-sky-200/85">
                      Offline PWA Workstation &amp; Quick Home Launcher
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualGuide(false)}
                  aria-label="Close install instructions"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {isIOS ? (
                  <>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Install on iPhone / iPad (Safari):
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Tap the <Share className="inline w-3.5 h-3.5 text-[#0284c7] mx-0.5" />{' '}
                        <strong>Share</strong> icon in your Safari toolbar.
                      </li>
                      <li>
                        Scroll down and select <strong>Add to Home Screen</strong>.
                      </li>
                      <li>
                        Tap <strong>Add</strong> to launch AOS Tools full-screen offline.
                      </li>
                    </ol>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Install on Android, Samsung Internet, Chrome, or Edge Desktop:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>
                        Open your browser menu (<strong>⋮</strong> or <strong>≡</strong>) or the
                        address bar <strong>Install</strong> icon.
                      </li>
                      <li>
                        Choose <strong>Install AOS Tools</strong> or{' '}
                        <strong>Add to Home Screen</strong>.
                      </li>
                      <li>
                        AOS Tools caches PDF utilities, Calculators &amp; Client Diary offline
                        automatically.
                      </li>
                    </ol>
                  </>
                )}

                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-[#071a30] border border-slate-200 dark:border-sky-500/20 px-3.5 py-2.5 text-[11px] text-slate-600 dark:text-sky-200/90">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Zero app-store download required • Strict ₹0-Cost local browser execution.
                  </span>
                </div>

                <div className="pt-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      dismissPromptBanner();
                      setShowManualGuide(false);
                      setIsVisible(false);
                    }}
                    className="aos-btn-primary inline-flex items-center justify-center min-h-[40px] px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {isVisible && (
        <aside
          aria-label="Install AOS Tools on your device"
          className="guide-banner-dark fixed bottom-20 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[390px] z-40 rounded-3xl border border-indigo-400/30 bg-[linear-gradient(135deg,#0B192C_0%,#112747_65%,#19204d_100%)] p-4 shadow-[0_20px_42px_-12px_rgba(3,10,24,0.88),0_0_24px_-6px_rgba(56,189,248,0.28)] animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-[0_6px_16px_-4px_rgba(56,189,248,0.45)]">
              <AosLogoSvg className="w-full h-full object-contain" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="guide-banner-title text-sm font-extrabold text-white leading-tight">
                  Install AOS Tools
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    dismissPromptBanner();
                    setIsVisible(false);
                  }}
                  aria-label="Dismiss install prompt"
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 inline-flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-sky-100/85 leading-relaxed">
                {canInstall
                  ? 'Tap Install App to add AOS Tools directly to your home screen for offline access.'
                  : 'Add to Home Screen for instant launch & offline access to Client Diary, Calculators, and PDF utilities.'}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isPrompting}
                  onClick={() => void handleInstallClick()}
                  className="aos-btn-primary inline-flex items-center justify-center gap-1.5 min-h-[38px] px-4 py-1.5 text-xs font-bold cursor-pointer whitespace-nowrap disabled:opacity-70"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>{isPrompting ? 'Opening...' : 'Install App'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissPromptBanner();
                    setIsVisible(false);
                  }}
                  className="min-h-[38px] px-3 py-1.5 rounded-full text-xs font-semibold text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {fallbackModal}
    </>
  );
};
