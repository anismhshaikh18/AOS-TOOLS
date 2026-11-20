import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, Share, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  fullWidth?: boolean;
  inlinePill?: boolean;
  onActionComplete?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  fullWidth = false,
  inlinePill = false,
  onActionComplete,
}) => {
  const { canInstall, isInstalled, isIOS, isPrompting, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (!showGuideModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuideModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showGuideModal]);

  if (isInstalled) return null;

  const handleClick = async () => {
    // Always attempt the direct native browser install dialog first
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      onActionComplete?.();
      return;
    }
    if (outcome === 'dismissed') {
      // User explicitly dismissed the native prompt — do not open static guide
      return;
    }
    // Browser does not expose beforeinstallprompt (e.g., iOS Safari, Firefox, or already prompted)
    setShowGuideModal(true);
  };

  const guideModal =
    showGuideModal && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Install AOS Tools on Your Device"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowGuideModal(false);
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
                  onClick={() => setShowGuideModal(false)}
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
                        Tap the{' '}
                        <Share className="inline w-3.5 h-3.5 text-[#0284c7] mx-0.5" />{' '}
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

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuideModal(false);
                      onActionComplete?.();
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
      <button
        type="button"
        disabled={isPrompting}
        onClick={() => void handleClick()}
        title={
          canInstall
            ? 'Install AOS Tools natively on your device'
            : 'Install AOS Tools App for Offline Use'
        }
        aria-label="Install AOS Tools App"
        className={`${
          fullWidth
            ? 'w-full min-h-[44px] px-4 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-2 aos-btn-primary'
            : inlinePill
            ? 'aos-btn-primary min-h-[38px] px-3.5 py-1.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0'
            : compact
            ? 'aos-btn-soft h-9 w-9 2xl:w-auto 2xl:px-3.5 text-[#0284c7] dark:text-sky-300 text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0'
            : 'min-h-[40px] px-4 py-2 aos-btn-primary text-xs font-bold inline-flex items-center gap-1.5'
        } cursor-pointer whitespace-nowrap disabled:opacity-70`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className={compact ? 'hidden 2xl:inline' : ''}>
          {isPrompting ? 'Opening...' : 'Install App'}
        </span>
      </button>

      {guideModal}
    </>
  );
};
