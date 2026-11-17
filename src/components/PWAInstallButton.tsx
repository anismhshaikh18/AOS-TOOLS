import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  fullWidth?: boolean;
  onActionComplete?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  fullWidth = false,
  onActionComplete,
}) => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
      onActionComplete?.();
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        title="Install AOS Tools App for Offline Use"
        aria-label="Install AOS Tools App"
        className={`${
          fullWidth
            ? 'w-full min-h-[44px] px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 aos-btn-primary'
            : compact
            ? 'aos-btn-soft h-9 px-2.5 lg:px-3.5 text-[#0284c7] dark:text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0'
            : 'min-h-[40px] px-4 py-2 aos-btn-primary text-xs font-bold flex items-center gap-1.5'
        } cursor-pointer whitespace-nowrap`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className={compact ? 'hidden xl:inline' : ''}>Install App</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Install AOS Tools on Your Device"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/30 shadow-2xl overflow-hidden">
            <div className="guide-banner-dark bg-[#0B192C] px-5 py-4 flex items-center justify-between border-b border-sky-400/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center">
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
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              {isIOS ? (
                <>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Install on iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Tap the <Share className="inline w-3.5 h-3.5 text-[#0284c7] mx-0.5" /> <strong>Share</strong> icon in your Safari toolbar.
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
                    Install on Android, Chrome, or Edge Desktop:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Open your browser menu (<strong>⋮</strong> or address bar <strong>Install</strong> icon).
                    </li>
                    <li>
                      Choose <strong>Install AOS Tools</strong> or <strong>Add to Home Screen</strong>.
                    </li>
                    <li>
                      AOS Tools caches PDF utilities, calculators &amp; Client Diary offline automatically.
                    </li>
                  </ol>
                </>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuideModal(false);
                    onActionComplete?.();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
