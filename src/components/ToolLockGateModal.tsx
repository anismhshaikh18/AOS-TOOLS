import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldAlert,
  KeyRound,
  X,
  Unlock,
  CheckCircle2,
  Loader2,
  Settings2,
} from 'lucide-react';
import { ToolItem } from '../types';
import { useAuthSecurity, ToolLockReason } from '../context/AuthSecurityContext';
import { AosLogoSvg } from './AosLogoSvg';

interface ToolLockGateModalProps {
  tool: ToolItem | null;
  onClose: () => void;
  onUnlocked: (tool: ToolItem) => void;
}

export const ToolLockGateModal: React.FC<ToolLockGateModalProps> = ({
  tool,
  onClose,
  onUnlocked,
}) => {
  const {
    user,
    isSigningIn,
    authError,
    signInWithGoogle,
    verifyAndUnlockPin,
    getToolLockReason,
    openAuthModal,
  } = useAuthSecurity();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  const reason: ToolLockReason = tool ? getToolLockReason(tool.id) : null;

  useEffect(() => {
    setPin('');
    setPinError(null);
  }, [tool?.id]);

  // If lock requirement clears while modal is open (e.g., user finished Google sign-in), proceed automatically
  useEffect(() => {
    if (tool && reason === null) {
      onUnlocked(tool);
    }
  }, [tool, reason, onUnlocked]);

  if (!tool || reason === null) return null;

  const needsGoogleAuth = reason === 'auth-required' || reason === 'both';
  const needsPin = reason === 'pin-required' || reason === 'both';

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (!pin.trim()) {
      setPinError('Please enter your 4–6 digit operator PIN.');
      return;
    }
    setCheckingPin(true);
    try {
      const ok = await verifyAndUnlockPin(pin.trim());
      if (!ok) {
        setPinError('Incorrect operator PIN. Please try again.');
        setPin('');
      }
    } finally {
      setCheckingPin(false);
    }
  };

  const handleKeypadDigit = (digit: string) => {
    if (pin.length < 6) {
      setPinError(null);
      setPin((prev) => prev + digit);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Protected Tool Access Gate"
    >
      <div className="w-full max-w-md rounded-3xl overflow-hidden bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/35 shadow-2xl">
        {/* Deep Blue Security Header */}
        <div className="guide-banner-dark bg-gradient-to-r from-[#0B192C] via-[#072642] to-[#0d4775] px-5 py-4 border-b border-sky-400/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white p-0.5 ring-2 ring-sky-400/60 shrink-0 flex items-center justify-center">
              <AosLogoSvg className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span className="guide-tag-sky text-[10px] font-bold uppercase tracking-wider">
                  AOS Access Control
                </span>
              </div>
              <h3 className="guide-banner-title text-sm font-extrabold truncate">
                {tool.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cancel"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#072642]/70 border border-slate-200 dark:border-sky-500/20 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#0284c7] dark:text-sky-300 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                Protected AOS Utility
              </span>
              {needsGoogleAuth && needsPin
                ? 'This tool requires both Google Account verification and your Operator PIN to launch.'
                : needsGoogleAuth
                ? 'Sign in with your verified Google account to unlock and run this protected utility.'
                : 'Enter your Operator PIN code to unlock this workstation session and open the tool.'}
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-200">
              {authError}
            </div>
          )}

          {/* Step 1: Google Sign-In Gate */}
          {needsGoogleAuth && (
            <div className="space-y-2">
              <button
                onClick={() => void signInWithGoogle()}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-sky-500 hover:to-[#0284c7] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-sky-500/25 cursor-pointer disabled:opacity-60 transition-all"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Google Account...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Sign In with Google to Unlock</span>
                  </>
                )}
              </button>
            </div>
          )}

          {user && needsPin && (
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Signed in as {user.email}</span>
            </div>
          )}

          {/* Step 2: PIN Keypad & Verification */}
          {needsPin && (
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-sky-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Operator PIN Code</span>
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus={!needsGoogleAuth}
                  value={pin}
                  onChange={(e) => {
                    setPinError(null);
                    setPin(e.target.value.replace(/\D/g, ''));
                  }}
                  placeholder="Enter 4–6 digit PIN"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-sky-500/35 bg-white dark:bg-[#072642] text-center font-mono text-base tracking-[0.4em]"
                />
              </div>

              {pinError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-300 text-center">
                  {pinError}
                </p>
              )}

              {/* Compact Touch Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'].map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === 'Clear') {
                          setPin('');
                          setPinError(null);
                        } else if (key === '⌫') {
                          setPin((p) => p.slice(0, -1));
                        } else {
                          handleKeypadDigit(key);
                        }
                      }}
                      className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#072642] dark:hover:bg-[#0d4775] text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-sky-500/20 cursor-pointer transition-colors"
                    >
                      {key}
                    </button>
                  )
                )}
              </div>

              <button
                type="submit"
                disabled={checkingPin}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{checkingPin ? 'Verifying...' : 'Unlock & Open Tool'}</span>
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-sky-500/20 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal('locks');
              }}
              className="text-[#0284c7] dark:text-sky-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Manage Lock Rules</span>
            </button>
            <span className="text-slate-400">Anis Online Services</span>
          </div>
        </div>
      </div>
    </div>
  );
};
