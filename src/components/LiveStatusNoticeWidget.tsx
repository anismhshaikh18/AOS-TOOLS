import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  BellRing,
  Pin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  RotateCcw,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  isFirestorePermissionError,
} from '../firebase';
import {
  LiveNoticeItem,
  loadLocalNotices,
  saveLocalNotices,
  uploadCloudBackup,
} from '../services/cloudBackupService';
import { useAuthSecurity } from '../context/AuthSecurityContext';

const OFFICIAL_NOTICE_ADMIN_EMAIL = 'anismhshaikh18@gmail.com';
const PUBLIC_NOTICES_COLLECTION = 'publicNotices';
const PUBLIC_NOTICES_DOC_ID = 'board';

const DEFAULT_NOTICES: LiveNoticeItem[] = [
  {
    id: 'notice-utiitsl-route',
    title: 'UTIITSL & Protean PAN Gateways Active',
    message:
      'Use Government Portals Hub for permanent root routes (www.utiitsl.com / onlineservices.proteantech.in) with 300 KB PDF compression ready in PDF Tools.',
    severity: 'info',
    pinned: true,
    createdAt: Date.now() - 3600 * 1000,
  },
  {
    id: 'notice-tnpds-smartcard',
    title: 'TNPDS Smart Card & State Portals Ready',
    message:
      'Tamil Nadu PDS Smart Card family updates, e-Sevai, Udyam MSME, National Scholarship & CEIR Lost Phone reporting are pinned in Portals Hub.',
    severity: 'info',
    pinned: false,
    createdAt: Date.now() - 7200 * 1000,
  },
  {
    id: 'notice-offline-pwa',
    title: 'Offline PWA & Instant Cloud Backup Enabled',
    message:
      'Install AOS Tools for counter offline access. Sign in with Google to sync Client Diary, preferences & operator notices across devices.',
    severity: 'warning',
    pinned: false,
    createdAt: Date.now() - 10800 * 1000,
  },
];

function sanitizeNoticeList(rawList: unknown[]): LiveNoticeItem[] {
  return rawList
    .slice(0, 20)
    .filter((n): n is Record<string, unknown> => Boolean(n && typeof n === 'object'))
    .map((n, index) => {
      const severity: LiveNoticeItem['severity'] =
        n.severity === 'urgent' || n.severity === 'warning' ? n.severity : 'info';
      return {
        id:
          typeof n.id === 'string' && n.id.trim().length > 0
            ? n.id.trim().slice(0, 64)
            : `notice-${Date.now()}-${index}`,
        title: typeof n.title === 'string' ? n.title.trim().slice(0, 120) : '',
        message: typeof n.message === 'string' ? n.message.trim().slice(0, 400) : '',
        severity,
        pinned: Boolean(n.pinned),
        createdAt: typeof n.createdAt === 'number' && n.createdAt >= 0 ? n.createdAt : Date.now(),
      };
    })
    .filter((n) => n.title.length > 0 && n.message.length > 0)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
}

export const LiveStatusNoticeWidget: React.FC = () => {
  const { user, authReady } = useAuthSecurity();
  const [notices, setNotices] = useState<LiveNoticeItem[]>(() => {
    const saved = loadLocalNotices();
    return saved.length > 0 ? saved : DEFAULT_NOTICES;
  });
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState<'info' | 'warning' | 'urgent'>('info');
  const [isPublishing, setIsPublishing] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [statusBanner, setStatusBanner] = useState<{
    tone: 'info' | 'warning';
    text: string;
  } | null>(null);

  // Strict official admin check: requires verified Google Sign-In matching exact official email
  const isOfficialAdmin = Boolean(
    authReady &&
      user &&
      user.emailVerified &&
      user.email.trim().toLowerCase() === OFFICIAL_NOTICE_ADMIN_EMAIL &&
      auth.currentUser &&
      auth.currentUser.emailVerified &&
      auth.currentUser.email?.trim().toLowerCase() === OFFICIAL_NOTICE_ADMIN_EMAIL
  );

  // Ensure composer closes immediately if admin signs out or switches accounts
  useEffect(() => {
    if (!isOfficialAdmin) {
      setIsComposerOpen(false);
    }
  }, [isOfficialAdmin]);

  // Listen for live public notice board updates (read-only for all visitors, instant sync for admin)
  useEffect(() => {
    const boardPath = `${PUBLIC_NOTICES_COLLECTION}/${PUBLIC_NOTICES_DOC_ID}`;
    const boardRef = doc(db, PUBLIC_NOTICES_COLLECTION, PUBLIC_NOTICES_DOC_ID);

    const unsubscribe = onSnapshot(
      boardRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (Array.isArray(data?.notices)) {
          const clean = sanitizeNoticeList(data.notices);
          setNotices(clean);
          saveLocalNotices(clean);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, boardPath);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync local cross-tab updates if updated locally
  useEffect(() => {
    const handleRefresh = () => {
      const saved = loadLocalNotices();
      if (saved.length > 0) setNotices(saved);
    };
    window.addEventListener('aos-notices-updated', handleRefresh);
    return () => window.removeEventListener('aos-notices-updated', handleRefresh);
  }, []);

  const flashStatus = useCallback((text: string, tone: 'info' | 'warning' = 'info') => {
    setStatusBanner({ text, tone });
    window.setTimeout(() => {
      setStatusBanner((curr) => (curr?.text === text ? null : curr));
    }, 3800);
  }, []);

  const persistNotices = useCallback(
    async (next: LiveNoticeItem[]) => {
      // Hard runtime guard: block any mutation unless exact verified official admin is active
      if (!isOfficialAdmin || !auth.currentUser) {
        return;
      }

      const sorted = sanitizeNoticeList(next);
      setNotices(sorted);
      saveLocalNotices(sorted);
      setIsPublishing(true);

      const boardPath = `${PUBLIC_NOTICES_COLLECTION}/${PUBLIC_NOTICES_DOC_ID}`;
      try {
        await setDoc(doc(db, PUBLIC_NOTICES_COLLECTION, PUBLIC_NOTICES_DOC_ID), {
          boardId: PUBLIC_NOTICES_DOC_ID,
          notices: sorted,
          updatedByUid: auth.currentUser.uid,
          updatedAt: serverTimestamp(),
        });
        if (user?.uid) {
          void uploadCloudBackup(user.uid);
        }
        flashStatus('Live Notice Board updated for all visitors.');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, boardPath);
        if (isFirestorePermissionError(err)) {
          flashStatus('Admin verification required by server rules to publish.', 'warning');
        } else {
          flashStatus('Saved locally. Will sync to visitors when online.', 'warning');
        }
      } finally {
        setIsPublishing(false);
      }
    },
    [isOfficialAdmin, user?.uid, flashStatus]
  );

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOfficialAdmin || !auth.currentUser) return;
    if (!newTitle.trim() || !newMessage.trim()) return;

    const item: LiveNoticeItem = {
      id: `notice-${Date.now()}`,
      title: newTitle.trim().slice(0, 120),
      message: newMessage.trim().slice(0, 400),
      severity: newSeverity,
      pinned: true,
      createdAt: Date.now(),
    };
    void persistNotices([item, ...notices].slice(0, 20));
    setNewTitle('');
    setNewMessage('');
    setNewSeverity('info');
    setIsComposerOpen(false);
  };

  const handleTogglePin = (id: string) => {
    if (!isOfficialAdmin || !auth.currentUser) return;
    void persistNotices(
      notices.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleDeleteNotice = (id: string) => {
    if (!isOfficialAdmin || !auth.currentUser) return;
    void persistNotices(notices.filter((n) => n.id !== id));
  };

  const handleResetDefaults = () => {
    if (!isOfficialAdmin || !auth.currentUser) return;
    void persistNotices(DEFAULT_NOTICES);
  };

  const handleEnablePushAlerts = async () => {
    if (typeof Notification === 'undefined') {
      flashStatus('Push alerts unavailable in this browser.', 'warning');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        flashStatus('Push Alerts Enabled for Notice Board updates.');
        new Notification('AOS Tools Notice Board', {
          body: 'Live official portal advisories & status updates are now active.',
          icon: '/icon-192.png',
        });
      } else {
        flashStatus('Notification permission not granted.', 'warning');
      }
    } catch {
      flashStatus('Could not request notification permission.', 'warning');
    }
  };

  return (
    <section
      aria-label="AOS Live Status and Notice Board"
      className="rounded-[20px] bg-white dark:bg-[#0B192C]/92 shadow-[0_14px_34px_-16px_rgba(37,99,235,0.16),0_4px_12px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_18px_38px_-14px_rgba(0,0,0,0.65)] overflow-hidden"
    >
      {/* Deep Blue Operator Header */}
      <div className="guide-banner-dark bg-gradient-to-r from-[#0B192C] via-[#072642] to-[#0d4775] px-5 sm:px-6 py-4 border-b border-sky-400/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#2563eb] text-white flex items-center justify-center shadow-md shadow-sky-500/30 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="guide-banner-title text-sm sm:text-base font-extrabold text-white">
                AOS Live Status &amp; Notice Board
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-sky-200/85 mt-0.5">
              Official operator desk advisories, portal status updates &amp; citizen counter notices
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleEnablePushAlerts()}
            className={`px-4 py-2 min-h-[44px] sm:min-h-[40px] rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm whitespace-nowrap ${
              notifPermission === 'granted'
                ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/50'
                : 'bg-white/10 hover:bg-white/20 text-sky-100 border border-sky-300/35'
            }`}
          >
            {notifPermission === 'granted' ? (
              <>
                <BellRing className="w-3.5 h-3.5 shrink-0" />
                <span>Alerts Active</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 shrink-0" />
                <span>Push Alerts</span>
              </>
            )}
          </button>

          {isOfficialAdmin ? (
            <>
              <span
                title="Authenticated as official AOS Tools administrator"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[40px] rounded-full bg-emerald-500/20 border border-emerald-400/45 text-xs font-bold text-emerald-100 whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Admin Access</span>
              </span>
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setIsComposerOpen((v) => !v)}
                className="aos-btn-primary px-4 py-2 min-h-[44px] sm:min-h-[40px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Post Notice</span>
              </button>
            </>
          ) : (
            <span
              role="status"
              aria-label="Official Notice Board Read-Only Mode"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[40px] rounded-full bg-[#061325]/85 border border-sky-300/30 text-xs font-bold text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] whitespace-nowrap select-none"
            >
              <Lock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span>Official Board • Read-Only</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {statusBanner && (
          <div
            className={`px-4 py-2.5 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
              statusBanner.tone === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200'
                : 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-500/30 text-sky-800 dark:text-sky-200'
            }`}
          >
            {statusBanner.tone === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </div>
        )}

        {/* Strict Admin-Only Composer Form (Never mounted for unauthenticated or non-admin users) */}
        {isOfficialAdmin && isComposerOpen && (
          <form
            onSubmit={handleAddNotice}
            className="p-4 rounded-[20px] bg-slate-50 dark:bg-[#071322] border border-slate-200/80 dark:border-sky-500/25 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                disabled={!isOfficialAdmin || isPublishing}
                maxLength={120}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Notice headline (e.g., Aadhaar Server Update)..."
                className="sm:col-span-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-sm bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
              <select
                disabled={!isOfficialAdmin || isPublishing}
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as 'info' | 'warning' | 'urgent')}
                className="px-3.5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white"
              >
                <option value="info">Info Advisory</option>
                <option value="warning">Portal Alert</option>
                <option value="urgent">Urgent Notice</option>
              </select>
            </div>
            <textarea
              required
              disabled={!isOfficialAdmin || isPublishing}
              rows={2}
              maxLength={400}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write details for counter operators or visiting citizens..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="aos-btn-soft inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isOfficialAdmin || isPublishing}
                className="aos-btn-primary inline-flex items-center justify-center gap-1.5 px-5 py-2 min-h-[44px] text-xs font-bold cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                {isPublishing ? 'Publishing...' : 'Publish Notice'}
              </button>
            </div>
          </form>
        )}

        {/* Notice Cards Grid */}
        {notices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notices.slice(0, 6).map((item) => {
              const isAlert = item.severity === 'urgent';
              const isPinned = !isAlert && item.pinned;

              const cardSurface = isAlert
                ? 'bg-red-50/75 dark:bg-red-950/30 shadow-[0_8px_22px_-12px_rgba(239,68,68,0.28)]'
                : isPinned
                ? 'bg-blue-50/70 dark:bg-[#0c2748]/80 shadow-[0_8px_22px_-12px_rgba(37,99,235,0.24)]'
                : 'bg-amber-50/65 dark:bg-amber-950/25 shadow-[0_8px_22px_-12px_rgba(245,158,11,0.22)]';

              const pillBadgeClass = isAlert
                ? 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/35'
                : isPinned
                ? 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-sky-300 border border-blue-200 dark:border-blue-400/35'
                : 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/35';

              const badgeLabel = isAlert
                ? 'Alert'
                : isPinned
                ? 'Pinned Advisory'
                : 'Notice';

              return (
                <article
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-[20px] flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-1 ${cardSurface}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${pillBadgeClass}`}
                      >
                        {isAlert ? (
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                        ) : isPinned ? (
                          <Pin className="w-3 h-3 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        )}
                        <span>{badgeLabel}</span>
                      </span>

                      {/* Strict Admin-Only Pin & Delete Controls */}
                      {isOfficialAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isPublishing}
                            onClick={() => handleTogglePin(item.id)}
                            title={item.pinned ? 'Unpin notice' : 'Pin notice'}
                            aria-label={item.pinned ? 'Unpin notice' : 'Pin notice'}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 ${
                              item.pinned
                                ? 'text-[#0284c7] dark:text-sky-300 bg-[#0284c7]/15'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isPublishing}
                            onClick={() => handleDeleteNotice(item.id)}
                            title="Remove notice"
                            aria-label="Remove notice"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-200 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-sky-200/70 pt-1">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-500 dark:text-sky-300/65">
                      Official Advisory
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-[20px] bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-sky-500/20 space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No active advisories published right now.
            </p>
            {isOfficialAdmin && (
              <button
                type="button"
                disabled={isPublishing}
                onClick={handleResetDefaults}
                className="aos-btn-primary inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Advisories</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
