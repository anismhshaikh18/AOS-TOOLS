import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  LogOut,
  KeyRound,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  UserCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  useAuthSecurity,
  AutoLockMinutes,
  PRO_TIER_TOOL_IDS,
  AUTH_REQUIRED_CORE_IDS,
  CORE_SUITE_GATE_TOOLS,
} from '../context/AuthSecurityContext';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { AosLogoSvg } from './AosLogoSvg';

const AUTO_LOCK_OPTIONS: { value: AutoLockMinutes; label: string }[] = [
  { value: 0, label: 'Off' },
  { value: 1, label: '1 min' },
  { value: 5, label: '5 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
];

export const AuthSecurityModal: React.FC = () => {
  const {
    user,
    isSigningIn,
    authError,
    clearAuthError,
    securityConfig,
    isSessionLocked,
    secondsUntilAutoLock,
    signInWithGoogle,
    signOutUser,
    setPinCode,
    disablePinCode,
    verifyAndUnlockPin,
    lockSessionNow,
    setAutoLockMinutes,
    setRequireAuthForProTools,
    toggleToolLock,
    lockAllProTools,
    unlockAllTools,
    isToolProtectedUntouched,
    isAuthModalOpen,
    authModalInitialTab,
    closeAuthModal,
  } = useAuthSecurity();

  const [activeTab, setActiveTab] = useState<'account' | 'locks'>(authModalInitialTab);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [unlockPinAttempt, setUnlockPinAttempt] = useState('');
  const [pinStatus, setPinStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [toolFilter, setToolFilter] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalInitialTab);
      setPinStatus(null);
      setUnlockPinAttempt('');
    }
  }, [isAuthModalOpen, authModalInitialTab]);

  const allManageableTools = useMemo(() => {
    const coreSuites = [
      CORE_SUITE_GATE_TOOLS.pan,
      CORE_SUITE_GATE_TOOLS.portals,
    ];
    // Prioritize Client Diary, PAN Master Hub, AOS Receipt Hub, and Advanced Portals at top
    const combined = [...SPECIAL_TOOLS, ...coreSuites, ...PDF_TOOLS, ...IMAGE_TOOLS];
    const priorityOrder = new Map<string, number>([
      ['khata-diary', 1],
      ['pan-master-hub', 2],
      ['receipt-hub', 3],
      ['gov-portals', 4],
      ['smart-id-card-studio', 5],
      ['passport-photo-studio', 6],
    ]);
    const sorted = [...combined].sort((a, b) => {
      const pa = priorityOrder.get(a.id) ?? 99;
      const pb = priorityOrder.get(b.id) ?? 99;
      return pa - pb;
    });

    const query = toolFilter.trim().toLowerCase();
    return sorted.filter((t) => {
      if (isToolProtectedUntouched(t.id)) return false;
      if (!query) return true;
      return (
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    });
  }, [toolFilter, isToolProtectedUntouched]);

  if (!isAuthModalOpen) return null;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus(null);
    if (!/^\d{4,6}$/.test(pinInput.trim())) {
      setPinStatus({ type: 'err', msg: 'Enter a valid 4 to 6 digit numeric PIN.' });
      return;
    }
    if (pinInput.trim() !== pinConfirm.trim()) {
      setPinStatus({ type: 'err', msg: 'PIN confirmation does not match.' });
      return;
    }
    setIsSavingPin(true);
    try {
      await setPinCode(pinInput.trim());
      setPinInput('');
      setPinConfirm('');
      setPinStatus({
        type: 'ok',
        msg: 'Operator PIN encrypted (SHA-256) and activated for locked tools.',
      });
    } catch (err) {
      setPinStatus({
        type: 'err',
        msg: err instanceof Error ? err.message : 'Unable to save PIN.',
      });
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleRemovePin = async () => {
    setIsSavingPin(true);
    try {
      await disablePinCode();
      setPinInput('');
      setPinConfirm('');
      setPinStatus({ type: 'ok', msg: 'Operator PIN lock removed.' });
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleQuickPinUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatus(null);
    const ok = await verifyAndUnlockPin(unlockPinAttempt);
    if (ok) {
      setUnlockPinAttempt('');
      setPinStatus({ type: 'ok', msg: 'Session unlocked cleanly.' });
    } else {
      setPinStatus({ type: 'err', msg: 'Incorrect PIN code. Please retry.' });
    }
  };

  const formatRemaining = (secs: number | null) => {
    if (secs === null) return null;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="AOS Tools Account and Access Control"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/30 shadow-2xl">
        {/* Deep Blue Corporate Branded Header */}
        <div className="guide-banner-dark bg-gradient-to-r from-[#0B192C] via-[#072642] to-[#0d4775] px-5 py-4 border-b border-sky-400/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-sky-400/70 shrink-0 flex items-center justify-center">
              <AosLogoSvg className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="guide-banner-title text-base sm:text-lg font-extrabold tracking-tight truncate">
                  AOS Access & Security Control
                </h2>
              </div>
              <p className="text-[11px] text-sky-200/90 truncate">
                Anis Online Services · Google Authentication & Operator Lock Suite
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 dark:bg-[#072642]/70 border-b border-slate-200 dark:border-sky-500/20 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('account');
              clearAuthError();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Account & Session</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('locks');
              clearAuthError();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'locks'
                ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Tool Locks & PIN</span>
            {(securityConfig.lockedToolIds.length > 0 || securityConfig.pinEnabled || securityConfig.requireAuthForProTools) && (
              <span className="px-1.5 py-0.5 rounded-md bg-sky-400/25 text-[10px] font-mono">
                {securityConfig.lockedToolIds.length + (securityConfig.pinEnabled ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-[#0B192C]">
          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">{authError}</div>
            </div>
          )}

          {activeTab === 'account' ? (
            <div className="space-y-4">
              {!user ? (
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-sky-500/25 bg-slate-50/80 dark:bg-[#072642]/60 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#0B192C] flex items-center justify-center text-white shadow-md shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Sign in to AOS Tools Operator Account
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Connect your Google account via secure client-side verification (fully compatible with Cloudflare Workers) to sync your tool locks, manage Pro Studios, and persist your operator session.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => void signInWithGoogle()}
                    disabled={isSigningIn}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#03182b] dark:hover:bg-[#072642] border border-slate-300 dark:border-sky-400/40 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0284c7]" />
                        <span>Connecting with Google...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/20">
                      <span className="font-bold text-[#0284c7] dark:text-sky-300 block">Zero Server Upload</span>
                      Document files remain 100% inside your browser RAM.
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/20">
                      <span className="font-bold text-[#0284c7] dark:text-sky-300 block">Persistent Session</span>
                      Remembers login status & lock rules across restarts.
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/20">
                      <span className="font-bold text-[#0284c7] dark:text-sky-300 block">Pro Access Gate</span>
                      Unlocks Client Diary, PAN Master Hub, Receipt Hub &amp; Advanced Portals.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-sky-500/25 bg-slate-50/90 dark:bg-[#072642]/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#0284c7] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#0B192C] text-white font-black text-lg flex items-center justify-center shrink-0">
                          {(user.displayName || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                            {user.displayName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                                : 'bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/30'
                            }`}
                          >
                            {user.role === 'admin' ? 'AOS Admin' : 'Verified Operator'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => void signOutUser()}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Active Session Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-sky-500/20">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/20">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        Session State
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active & Synced
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/20">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        PIN Vault Status
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        {securityConfig.pinEnabled ? (
                          isSessionLocked ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Locked (PIN Required)</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Unlocked Session</span>
                            </>
                          )
                        ) : (
                          <span>PIN Not Set</span>
                        )}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/20">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                        Auto-Lock Timer
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                        {securityConfig.autoLockMinutes === 0
                          ? 'Disabled'
                          : secondsUntilAutoLock !== null && !isSessionLocked
                          ? `Idle Lock in ${formatRemaining(secondsUntilAutoLock)}`
                          : `${securityConfig.autoLockMinutes} min inactivity`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Session Lock Controls */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-sky-500/20 bg-slate-50/60 dark:bg-[#072642]/45 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Quick Workstation Lock & Auto-Lock
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">
                    Instantly lock protected tools when stepping away from your counter PC.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {securityConfig.pinEnabled && !isSessionLocked && (
                    <button
                      onClick={lockSessionNow}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Now</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('locks')}
                    className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Configure Locks</span>
                  </button>
                </div>
              </div>

              {securityConfig.pinEnabled && isSessionLocked && (
                <form
                  onSubmit={handleQuickPinUnlock}
                  className="p-4 rounded-2xl border border-amber-300 dark:border-amber-500/35 bg-amber-50/70 dark:bg-amber-950/30 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
                    <KeyRound className="w-4 h-4 shrink-0" />
                    <span>Session is currently PIN-locked. Enter PIN to unlock tools:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={unlockPinAttempt}
                      onChange={(e) => setUnlockPinAttempt(e.target.value.replace(/\D/g, ''))}
                      placeholder="4-6 digit PIN"
                      className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-sky-500/30 bg-white dark:bg-[#0B192C] text-xs font-mono tracking-widest text-center"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold cursor-pointer"
                    >
                      Unlock
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {pinStatus && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                    pinStatus.type === 'ok'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30'
                  }`}
                >
                  {pinStatus.type === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{pinStatus.msg}</span>
                </div>
              )}

              {/* 1. Custom PIN / Passcode Setup */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-sky-500/25 bg-slate-50/80 dark:bg-[#072642]/60 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Custom Operator PIN Protection
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      securityConfig.pinEnabled
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {securityConfig.pinEnabled ? 'PIN Active' : 'Disabled'}
                  </span>
                </div>

                <form onSubmit={handleSavePin} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder={securityConfig.pinEnabled ? 'New PIN (4-6 digits)' : 'Create PIN (4-6 digits)'}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-sky-500/30 bg-white dark:bg-[#0B192C] text-xs font-mono tracking-widest"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm PIN"
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-sky-500/30 bg-white dark:bg-[#0B192C] text-xs font-mono tracking-widest"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSavingPin}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                    >
                      {securityConfig.pinEnabled ? 'Update PIN' : 'Enable PIN'}
                    </button>
                    {securityConfig.pinEnabled && (
                      <button
                        type="button"
                        onClick={() => void handleRemovePin()}
                        disabled={isSavingPin}
                        className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-300 text-xs font-bold cursor-pointer"
                      >
                        Off
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* 2. Inactivity Auto-Lock & Pro Tier Gate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-sky-500/25 bg-slate-50/80 dark:bg-[#072642]/60 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Auto-Lock Inactive Session
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AUTO_LOCK_OPTIONS.map((opt) => {
                      const active = securityConfig.autoLockMinutes === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => void setAutoLockMinutes(opt.value)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#0284c7] text-white shadow-sm'
                              : 'bg-white dark:bg-[#0B192C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-sky-500/20'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-sky-500/25 bg-slate-50/80 dark:bg-[#072642]/60 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Google Auth Gate for Pro Studios
                      </h4>
                    </div>
                    <button
                      onClick={() =>
                        void setRequireAuthForProTools(!securityConfig.requireAuthForProTools)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase cursor-pointer transition-colors ${
                        securityConfig.requireAuthForProTools
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {securityConfig.requireAuthForProTools ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Requires active Google login to open Passport Studio, Smart ID Card Studio, Client Diary, PAN Master Hub, Receipt Hub, Advanced Portals &amp; PDF Encryption tools.
                  </p>
                </div>
              </div>

              {/* 3. Auth-Gated Core Suites Info Box (Deep Blue Brand Theme) */}
              <div className="p-3.5 rounded-2xl border border-[#0284c7]/30 bg-[#072642]/5 dark:bg-[#072642]/70 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0284c7] dark:text-sky-300 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Google Auth-Gated Suites &amp; Individual Lock Controls
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-sky-100/80">
                    <strong>Client Diary</strong>, <strong>PAN Master Hub</strong>, <strong>AOS Receipt Hub</strong>, and <strong>Advanced Portals</strong> require Google Sign-In for guest access. You can also lock or PIN-protect each module individually below.
                  </p>
                </div>
              </div>

              {/* 4. Per-Tool Lock Access Matrix */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-sky-300">
                    Individual Tool Lock Controls
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void lockAllProTools()}
                      className="px-2.5 py-1 rounded-lg bg-[#0284c7]/15 hover:bg-[#0284c7]/25 text-[#0284c7] dark:text-sky-300 text-[11px] font-bold cursor-pointer"
                    >
                      Lock Pro Tools
                    </button>
                    <button
                      onClick={() => void unlockAllTools()}
                      className="px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 text-slate-700 dark:text-slate-200 text-[11px] font-bold cursor-pointer"
                    >
                      Unlock All
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={toolFilter}
                    onChange={(e) => setToolFilter(e.target.value)}
                    placeholder="Filter tools by name or category..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-sky-500/25 bg-slate-50 dark:bg-[#072642] text-xs"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allManageableTools.map((tool) => {
                    const isExplicitLocked = securityConfig.lockedToolIds.includes(tool.id);
                    const isProAutoLocked =
                      securityConfig.requireAuthForProTools &&
                      (PRO_TIER_TOOL_IDS as readonly string[]).includes(tool.id);
                    const isCoreAuthGate = (AUTH_REQUIRED_CORE_IDS as readonly string[]).includes(
                      tool.id
                    );
                    const locked = isExplicitLocked || isProAutoLocked;

                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => void toggleToolLock(tool.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          locked
                            ? 'bg-[#0284c7]/15 dark:bg-[#0284c7]/25 border-[#0284c7]/50'
                            : isCoreAuthGate
                            ? 'bg-sky-50/80 dark:bg-[#072642]/75 border-sky-300/60 dark:border-sky-500/35 hover:border-[#0284c7]'
                            : 'bg-white dark:bg-[#072642]/50 border-slate-200 dark:border-sky-500/15 hover:border-sky-400/40'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {tool.name}
                          </div>
                          <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-sky-300/80 truncate">
                            {tool.category}
                            {isCoreAuthGate ? ' · Auth Gate' : ''}
                            {isProAutoLocked ? ' · Pro Lock' : ''}
                            {isExplicitLocked ? ' · PIN/Lock' : ''}
                          </div>
                        </div>
                        <span
                          className={`p-1.5 rounded-lg shrink-0 ${
                            locked
                              ? 'bg-[#0284c7] text-white'
                              : isCoreAuthGate
                              ? 'bg-[#072642] text-sky-300 border border-sky-400/40'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                          }`}
                        >
                          {locked || isCoreAuthGate ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
