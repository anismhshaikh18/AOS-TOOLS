import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    const refreshPending = () => {
      setHasPendingSync(getPendingCloudSyncFlag());
    };
    window.addEventListener('aos-cloud-sync-queue-changed', refreshPending);
    window.addEventListener('aos-cloud-backup-updated', refreshPending);
    return () => {
      window.removeEventListener('aos-cloud-sync-queue-changed', refreshPending);
      window.removeEventListener('aos-cloud-backup-updated', refreshPending);
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
        setTimeout(() => setSyncBannerMessage(null), 3500);
      } else {
        setSyncBannerMessage(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  if (isOnline && !syncBannerMessage && !hasPendingSync) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-40 max-w-xs sm:max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
      role="status"
      aria-live="polite"
    >
      {!isOnline ? (
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#0B192C]/95 text-white border border-amber-400/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="font-bold leading-tight">Offline Mode Active</div>
            <div className="text-[11px] text-sky-100/80">
              Tools &amp; Client Diary run locally; cloud changes auto-sync online.
            </div>
          </div>
        </div>
      ) : syncBannerMessage ? (
        <div className="px-3.5 py-2.5 rounded-2xl bg-[#0B192C]/95 text-white border border-emerald-400/40 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs">
          {syncBannerMessage.includes('synced') ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
          )}
          <span className="font-medium">{syncBannerMessage}</span>
        </div>
      ) : null}
    </div>
  );
};
