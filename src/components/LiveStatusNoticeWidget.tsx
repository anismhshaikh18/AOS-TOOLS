import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  LiveNoticeItem,
  loadLocalNotices,
  saveLocalNotices,
  uploadCloudBackup,
} from '../services/cloudBackupService';
import { useAuthSecurity } from '../context/AuthSecurityContext';

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

export const LiveStatusNoticeWidget: React.FC = () => {
  const { user } = useAuthSecurity();
  const [notices, setNotices] = useState<LiveNoticeItem[]>(() => {
    const saved = loadLocalNotices();
    return saved.length > 0 ? saved : DEFAULT_NOTICES;
  });
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState<'info' | 'warning' | 'urgent'>('info');
  const [notifPermission, setNotifPermission] = useState<string>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [alertStatusMsg, setAlertStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleRefresh = () => {
      const saved = loadLocalNotices();
      if (saved.length > 0) setNotices(saved);
    };
    window.addEventListener('aos-notices-updated', handleRefresh);
    return () => window.removeEventListener('aos-notices-updated', handleRefresh);
  }, []);

  const persistNotices = (next: LiveNoticeItem[]) => {
    const sorted = [...next].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
    setNotices(sorted);
    saveLocalNotices(sorted);
    if (user?.uid) {
      void uploadCloudBackup(user.uid);
    }
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;
    const item: LiveNoticeItem = {
      id: `notice-${Date.now()}`,
      title: newTitle.trim().slice(0, 120),
      message: newMessage.trim().slice(0, 400),
      severity: newSeverity,
      pinned: true,
      createdAt: Date.now(),
    };
    persistNotices([item, ...notices].slice(0, 20));
    setNewTitle('');
    setNewMessage('');
    setNewSeverity('info');
    setIsComposerOpen(false);
  };

  const handleTogglePin = (id: string) => {
    persistNotices(
      notices.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleDeleteNotice = (id: string) => {
    persistNotices(notices.filter((n) => n.id !== id));
  };

  const handleResetDefaults = () => {
    persistNotices(DEFAULT_NOTICES);
  };

  const handleEnablePushAlerts = async () => {
    if (typeof Notification === 'undefined') {
      setAlertStatusMsg('Push alerts unavailable in this browser.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        setAlertStatusMsg('Push Alerts Enabled for Notice Board updates.');
        new Notification('AOS Tools Notice Board', {
          body: 'Live operator portal advisories & sync notifications are now active.',
          icon: '/icon-192.png',
        });
      } else {
        setAlertStatusMsg('Notification permission not granted.');
      }
      setTimeout(() => setAlertStatusMsg(null), 3500);
    } catch {
      setAlertStatusMsg('Could not request notification permission.');
    }
  };

  return (
    <section
      aria-label="AOS Live Status and Notice Board"
      className="rounded-3xl bg-white dark:bg-[#0B192C]/90 border border-slate-200 dark:border-sky-500/25 shadow-xl overflow-hidden"
    >
      {/* Deep Blue Operator Header */}
      <div className="guide-banner-dark bg-gradient-to-r from-[#0B192C] via-[#072642] to-[#0d4775] px-5 sm:px-6 py-4 border-b border-sky-400/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-md shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="guide-banner-title text-sm sm:text-base font-extrabold text-white">
                AOS Live Status &amp; Notice Board
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-sky-200/85">
              Operator desk advisories, portal status updates &amp; citizen counter notices
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleEnablePushAlerts()}
            className={`px-3.5 py-2 min-h-[38px] rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
              notifPermission === 'granted'
                ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/50'
                : 'bg-white/10 hover:bg-white/20 text-sky-100 border border-sky-300/35'
            }`}
          >
            {notifPermission === 'granted' ? (
              <>
                <BellRing className="w-3.5 h-3.5" />
                <span>Alerts Active</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Push Alerts</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsComposerOpen((v) => !v)}
            className="aos-btn-primary px-4 py-2 min-h-[38px] text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Notice</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {alertStatusMsg && (
          <div className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-500/30 text-xs text-sky-800 dark:text-sky-200 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0284c7] shrink-0" />
            <span>{alertStatusMsg}</span>
          </div>
        )}

        {/* Composer Form */}
        {isComposerOpen && (
          <form
            onSubmit={handleAddNotice}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-sky-500/25 space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                maxLength={120}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Notice headline (e.g., Aadhaar Server Update)..."
                className="sm:col-span-2 px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as 'info' | 'warning' | 'urgent')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white"
              >
                <option value="info">Info Advisory</option>
                <option value="warning">Portal Alert</option>
                <option value="urgent">Urgent Notice</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              maxLength={400}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write details for counter operators or visiting citizens..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="aos-btn-soft px-4 py-2 min-h-[38px] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="aos-btn-primary px-5 py-2 min-h-[38px] text-xs font-bold cursor-pointer"
              >
                Publish Notice
              </button>
            </div>
          </form>
        )}

        {/* Notice Cards Grid */}
        {notices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notices.slice(0, 6).map((item) => {
              const badgeStyles =
                item.severity === 'urgent'
                  ? 'border-red-300 dark:border-red-500/35 bg-red-50/70 dark:bg-red-950/25'
                  : item.severity === 'warning'
                  ? 'border-amber-300 dark:border-amber-500/35 bg-amber-50/70 dark:bg-amber-950/25'
                  : 'border-slate-200 dark:border-sky-500/20 bg-slate-50/80 dark:bg-[#072642]/55';

              return (
                <article
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-2.5 transition-all ${badgeStyles}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${
                          item.severity === 'urgent'
                            ? 'text-red-600 dark:text-red-300'
                            : item.severity === 'warning'
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-[#0284c7] dark:text-sky-300'
                        }`}
                      >
                        {item.severity === 'urgent' || item.severity === 'warning' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        <span>{item.pinned ? 'Pinned Advisory' : 'Notice'}</span>
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(item.id)}
                          title={item.pinned ? 'Unpin notice' : 'Pin notice'}
                          aria-label={item.pinned ? 'Unpin notice' : 'Pin notice'}
                          className={`p-1 rounded-md cursor-pointer transition-colors ${
                            item.pinned
                              ? 'text-[#0284c7] dark:text-sky-300 bg-[#0284c7]/15'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(item.id)}
                          title="Remove notice"
                          aria-label="Remove notice"
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-200 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 dark:text-sky-200/70">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-sky-500/20 space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All notices cleared.
            </p>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="aos-btn-primary inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-xs font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Default Advisories</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
