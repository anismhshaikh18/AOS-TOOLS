import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  flushPendingCloudSync,
  getPendingCloudSyncFlag,
} from '../services/cloudBackupService';

export const OfflineSyncIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(() =>
    getPendingCloudSyncFlag()
  );
  const [syncBannerMessage, setSyncBannerMessage] = useState<string | null>(null);
  const [offlineReadyToast, setOfflineReadyToast] = useState<boolean>(false);
  const [updateCallback, setUpdateCallback] = useState<((reloadPage?: boolean) => Promise<void>) | null>(
    null
  );

  useEffect(() => {
    const refreshPending = () => {
      setHasPendingSync(getPendingCloudSyncFlag());
    };

    const handleOfflineReady = () => {
      setOfflineReadyToast(true);
      window.setTimeout(() => setOfflineReadyToast(false), 4500);
    };

    const handleNeedRefresh = (event: Event) => {
      const detail = (
        event as CustomEvent<{ updateSW?: (reloadPage?: boolean) => Promise<void> }>
      ).detail;
      if (detail?.updateSW) {
        setUpdateCallback(() => detail.updateSW ?? null);
      }
    };

    window.addEventListener('aos-cloud-sync-queue-changed', refreshPending);
    window.addEventListener('aos-cloud-backup-updated', refreshPending);
    window.addEventListener('aos-pwa-offline-ready', handleOfflineReady);
    window.addEventListener('aos-pwa-need-refresh', handleNeedRefresh);

    return () => {
      window.removeEventListener('aos-cloud-sync-queue-changed', refreshPending);
      window.removeEventListener('aos-cloud-backup-updated', refreshPending);
      window.removeEventListener('aos-pwa-offline-ready', handleOfflineReady);
      window.removeEventListener('aos-pwa-need-refresh', handleNeedRefresh);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    if (!getPendingCloudSyncFlag()) return;

    let cancelled = false;
    setSyncBannerMessage('Connection restored — syncing AOS Cloud Backup...');
    void flushPendingCloudSync().then((flushed) => {
      if (cancelled) return;
      setHasPendingSync(getPendingCloudSyncFlag());
      if (flushed) {
        setSyncBannerMessage('Queued offline changes synced to Cloud Backup.');
        window.setTimeout(() => setSyncBannerMessage(null), 3500);
      } else {
        setSyncBannerMessage(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  if (
    isOnline &&
    !syncBannerMessage &&
    !hasPendingSync &&
    !offlineReadyToast &&
    !updateCallback
  ) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-40 max-w-xs sm:max-w-sm space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
      role="status"
      aria-live="polite"
    >
      {updateCallback && (
        <div className="guide-banner-dark px-3.5 py-2.5 rounded-2xl bg-[#0B192C]/96 text-white border border-sky-400/40 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold">AOS Tools update available</span>
          </div>
          <button
            type="button"
            onClick={() => void updateCallback(true)}
            className="aos-btn-primary px-3 py-1 text-[11px] font-bold cursor-pointer whitespace-nowrap"
          >
            Refresh
          </button>
        </div>
      )}

      {!isOnline ? (
        <div className="guide-banner-dark px-3.5 py-2.5 rounded-2xl bg-[#0B192C]/96 text-white border border-amber-400/40 shadow-xl flex items-center gap-2.5 text-xs">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold leading-tight">Offline Mode Active</div>
            <div className="text-[11px] text-sky-100/80">
              Tools, Calculators &amp; Client Diary run locally; changes auto-sync online.
            </div>
          </div>
        </div>
      ) : syncBannerMessage ? (
        <div className="guide-banner-dark px-3.5 py-2.5 rounded-2xl bg-[#0B192C]/96 text-white border border-emerald-400/40 shadow-xl flex items-center gap-2.5 text-xs">
          {syncBannerMessage.includes('synced') ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
          )}
          <span className="font-medium">{syncBannerMessage}</span>
        </div>
      ) : offlineReadyToast ? (
        <div className="guide-banner-dark px-3.5 py-2.5 rounded-2xl bg-[#0B192C]/96 text-white border border-emerald-400/40 shadow-xl flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">Ready for offline use — essential utilities cached.</span>
        </div>
      ) : null}
    </div>
  );
};
