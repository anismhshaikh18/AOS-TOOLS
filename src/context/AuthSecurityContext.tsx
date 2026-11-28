import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from '../firebase';

export type UserRole = 'admin' | 'operator' | 'member';
export type AutoLockMinutes = 0 | 1 | 5 | 15 | 30;

export interface AosUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface AosSecurityConfig {
  pinHash: string;
  pinEnabled: boolean;
  requireAuthForProTools: boolean;
  autoLockMinutes: AutoLockMinutes;
  lockedToolIds: string[];
}

export type ToolLockReason = 'auth-required' | 'pin-required' | 'both' | null;

// Core utilities that remain always open
export const PROTECTED_ALWAYS_OPEN_TOOL_IDS = [
  'qr-code-generator',
] as const;

// Core professional suites that require active Google Authentication for guest access
// and can also be individually locked / PIN-protected by the operator
export const AUTH_REQUIRED_CORE_IDS = [
  'khata-diary',
  'pan-master-hub',
  'receipt-hub',
  'gov-portals',
] as const;

export const CORE_SUITE_GATE_TOOLS = {
  khata: {
    id: 'khata-diary',
    name: 'Client Diary',
    shortDesc:
      'Digital customer ledger, token registry, billing receipts, and balance tracking for AOS operators.',
    category: 'special' as const,
    iconName: 'BookMarked',
    badge: 'AUTH REQUIRED',
  },
  pan: {
    id: 'pan-master-hub',
    name: 'PAN Master Hub',
    shortDesc:
      'Complete NSDL & UTIITSL PAN application suite, <300 KB PDF compression, and biometric photo/signature tools.',
    category: 'special' as const,
    iconName: 'Building2',
    badge: 'AUTH REQUIRED',
  },
  portals: {
    id: 'gov-portals',
    name: 'Advanced Portals (50+ Govt Portals)',
    shortDesc:
      'Direct verified directory of 50+ central and state citizen service portals.',
    category: 'special' as const,
    iconName: 'Building',
    badge: 'AUTH REQUIRED',
  },
} as const;

export function getGateToolForTab(tab: string) {
  if (tab === 'khata') return CORE_SUITE_GATE_TOOLS.khata;
  if (tab === 'pan') return CORE_SUITE_GATE_TOOLS.pan;
  if (tab === 'portals') return CORE_SUITE_GATE_TOOLS.portals;
  return null;
}

// High-tier studios & core modules eligible for 1-click Pro Lock / PIN gating
export const PRO_TIER_TOOL_IDS = [
  'khata-diary',
  'pan-master-hub',
  'receipt-hub',
  'gov-portals',
  'passport-photo-studio',
  'passport-photo-sheet',
  'smart-id-card-studio',
  'protect-pdf',
  'unlock-pdf',
] as const;

const BOOTSTRAP_ADMIN_EMAIL = 'anis.onlineservices@gmail.com';
const LOCAL_SECURITY_STORAGE_KEY = 'aos_security_prefs_v1';
const LOCAL_SESSION_STORAGE_KEY = 'aos_session_meta_v1';
const LAST_ACTIVITY_STORAGE_KEY = 'aos_last_activity_ts';
const ALLOWED_AUTO_LOCK_VALUES: AutoLockMinutes[] = [0, 1, 5, 15, 30];

const DEFAULT_SECURITY_CONFIG: AosSecurityConfig = {
  pinHash: '',
  pinEnabled: false,
  requireAuthForProTools: false,
  autoLockMinutes: 15,
  lockedToolIds: [],
};

function sanitizeAutoLock(val: unknown): AutoLockMinutes {
  if (typeof val === 'number' && ALLOWED_AUTO_LOCK_VALUES.includes(val as AutoLockMinutes)) {
    return val as AutoLockMinutes;
  }
  return 15;
}

function sanitizeLockedToolIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const filtered = ids
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0 && id.length <= 64)
    .filter((id) => !(PROTECTED_ALWAYS_OPEN_TOOL_IDS as readonly string[]).includes(id));
  return Array.from(new Set(filtered)).slice(0, 50);
}

function setSessionCookie(name: string, value: string, maxAgeSeconds = 2592000) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  } catch {
    // Ignore cookie errors in restricted contexts
  }
}

function clearSessionCookie(name: string) {
  try {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Ignore cookie errors
  }
}

export async function hashSecurityPin(pin: string): Promise<string> {
  const clean = pin.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(`AOS_TOOLS_OPERATOR_PIN_V1::${clean}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadLocalSecurityConfig(): AosSecurityConfig {
  try {
    const raw = localStorage.getItem(LOCAL_SECURITY_STORAGE_KEY);
    if (!raw) return DEFAULT_SECURITY_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AosSecurityConfig>;
    return {
      pinHash: typeof parsed.pinHash === 'string' ? parsed.pinHash.slice(0, 128) : '',
      pinEnabled: Boolean(parsed.pinEnabled && parsed.pinHash),
      requireAuthForProTools: Boolean(parsed.requireAuthForProTools),
      autoLockMinutes: sanitizeAutoLock(parsed.autoLockMinutes),
      lockedToolIds: sanitizeLockedToolIds(parsed.lockedToolIds),
    };
  } catch {
    return DEFAULT_SECURITY_CONFIG;
  }
}

function persistLocalSecurityConfig(config: AosSecurityConfig) {
  try {
    localStorage.setItem(LOCAL_SECURITY_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota issues
  }
}

interface AuthSecurityContextValue {
  user: AosUserProfile | null;
  authReady: boolean;
  isSigningIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  securityConfig: AosSecurityConfig;
  isSessionLocked: boolean;
  secondsUntilAutoLock: number | null;
  lastActivityAt: number;
  signInWithGoogle: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  setPinCode: (pin: string) => Promise<void>;
  disablePinCode: () => Promise<void>;
  verifyAndUnlockPin: (pin: string) => Promise<boolean>;
  lockSessionNow: () => void;
  setAutoLockMinutes: (minutes: AutoLockMinutes) => Promise<void>;
  setRequireAuthForProTools: (enabled: boolean) => Promise<void>;
  toggleToolLock: (toolId: string) => Promise<void>;
  lockAllProTools: () => Promise<void>;
  unlockAllTools: () => Promise<void>;
  isToolProtectedUntouched: (toolId: string) => boolean;
  isCoreAuthRequiredTool: (toolId: string) => boolean;
  isToolCurrentlyLocked: (toolId: string) => boolean;
  getToolLockReason: (toolId: string) => ToolLockReason;
  isAuthModalOpen: boolean;
  authModalInitialTab: 'account' | 'locks';
  openAuthModal: (tab?: 'account' | 'locks') => void;
  closeAuthModal: () => void;
}

const AuthSecurityContext = createContext<AuthSecurityContextValue | null>(null);

export const AuthSecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AosUserProfile | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [securityConfig, setSecurityConfig] = useState<AosSecurityConfig>(() =>
    loadLocalSecurityConfig()
  );
  const [pinUnlockedInSession, setPinUnlockedInSession] = useState<boolean>(false);
  const [lastActivityAt, setLastActivityAt] = useState<number>(() => Date.now());
  const [secondsUntilAutoLock, setSecondsUntilAutoLock] = useState<number | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'account' | 'locks'>('account');

  const securityConfigRef = useRef<AosSecurityConfig>(securityConfig);
  securityConfigRef.current = securityConfig;

  const isToolProtectedUntouched = useCallback((toolId: string) => {
    return (PROTECTED_ALWAYS_OPEN_TOOL_IDS as readonly string[]).includes(toolId);
  }, []);

  const isCoreAuthRequiredTool = useCallback((toolId: string) => {
    return (AUTH_REQUIRED_CORE_IDS as readonly string[]).includes(toolId);
  }, []);

  const persistSecurityToFirestore = useCallback(
    async (uid: string, config: AosSecurityConfig) => {
      const path = `users/${uid}/private/security`;
      try {
        await setDoc(doc(db, 'users', uid, 'private', 'security'), {
          ownerId: uid,
          pinHash: config.pinHash.slice(0, 128),
          pinEnabled: config.pinEnabled,
          requireAuthForProTools: config.requireAuthForProTools,
          autoLockMinutes: sanitizeAutoLock(config.autoLockMinutes),
          lockedToolIds: sanitizeLockedToolIds(config.lockedToolIds),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    []
  );

  const syncUserAndSecurity = useCallback(async (fbUser: User) => {
    const email = (fbUser.email || '').trim().slice(0, 150);
    const displayName = (fbUser.displayName || email.split('@')[0] || 'AOS Operator')
      .trim()
      .slice(0, 100);
    const photoURL = (fbUser.photoURL || '').trim().slice(0, 500);
    const isBootstrapAdmin =
      fbUser.emailVerified && email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
    let resolvedRole: UserRole = isBootstrapAdmin ? 'admin' : 'operator';

    // 1. Establish local authenticated session immediately so Google Auth always works
    const initialProfile: AosUserProfile = {
      uid: fbUser.uid,
      displayName,
      email,
      photoURL,
      role: resolvedRole,
      emailVerified: fbUser.emailVerified,
    };
    setUser(initialProfile);

    const saveLocalSession = (profile: AosUserProfile) => {
      try {
        localStorage.setItem(
          LOCAL_SESSION_STORAGE_KEY,
          JSON.stringify({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
            role: profile.role,
            loggedInAt: Date.now(),
          })
        );
      } catch {
        // Ignore storage error
      }
      setSessionCookie('aos_session_active', '1');
      setSessionCookie('aos_user_role', profile.role);
    };

    saveLocalSession(initialProfile);

    // 2. Best-effort Firestore profile & security sync with graceful local fallback
    if (!fbUser.emailVerified) {
      return;
    }

    const profileRef = doc(db, 'users', fbUser.uid);
    const profilePath = `users/${fbUser.uid}`;
    let profileExistsInFirestore = false;

    try {
      const existingProfile = await getDoc(profileRef);
      if (!existingProfile.exists()) {
        const createPayload: Record<string, unknown> = {
          uid: fbUser.uid,
          email,
          role: resolvedRole,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };
        if (displayName) createPayload.displayName = displayName;
        if (photoURL) createPayload.photoURL = photoURL;

        try {
          await setDoc(profileRef, createPayload);
          profileExistsInFirestore = true;
        } catch (writeErr) {
          handleFirestoreError(writeErr, OperationType.CREATE, profilePath);
        }
      } else {
        profileExistsInFirestore = true;
        const existingData = existingProfile.data();
        const currentStoredRole = existingData?.role as UserRole | undefined;
        if (isBootstrapAdmin) {
          resolvedRole = 'admin';
        } else if (
          currentStoredRole === 'member' ||
          currentStoredRole === 'operator' ||
          currentStoredRole === 'admin'
        ) {
          resolvedRole = currentStoredRole;
        }

        const updatedProfile: AosUserProfile = {
          ...initialProfile,
          role: resolvedRole,
        };
        setUser(updatedProfile);
        saveLocalSession(updatedProfile);

        const updatePayload: Record<string, unknown> = {
          email,
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (displayName) updatePayload.displayName = displayName;
        if (photoURL) updatePayload.photoURL = photoURL;
        if (isBootstrapAdmin && currentStoredRole !== 'admin') {
          updatePayload.role = 'admin';
        }

        try {
          await updateDoc(profileRef, updatePayload);
        } catch (updateErr) {
          handleFirestoreError(updateErr, OperationType.UPDATE, profilePath);
        }
      }
    } catch (readErr) {
      handleFirestoreError(readErr, OperationType.GET, profilePath);
    }

    // Sync security configuration from private subcollection only if parent profile succeeded
    if (!profileExistsInFirestore) {
      return;
    }

    const securityRef = doc(db, 'users', fbUser.uid, 'private', 'security');
    const securityPath = `users/${fbUser.uid}/private/security`;
    try {
      const secSnap = await getDoc(securityRef);
      if (secSnap.exists()) {
        const remote = secSnap.data();
        const merged: AosSecurityConfig = {
          pinHash: typeof remote.pinHash === 'string' ? remote.pinHash.slice(0, 128) : '',
          pinEnabled: Boolean(remote.pinEnabled && remote.pinHash),
          requireAuthForProTools: Boolean(remote.requireAuthForProTools),
          autoLockMinutes: sanitizeAutoLock(remote.autoLockMinutes),
          lockedToolIds: sanitizeLockedToolIds(remote.lockedToolIds),
        };
        setSecurityConfig(merged);
        persistLocalSecurityConfig(merged);
      } else {
        const localCurrent = securityConfigRef.current;
        await persistSecurityToFirestore(fbUser.uid, localCurrent);
      }
    } catch (secErr) {
      handleFirestoreError(secErr, OperationType.GET, securityPath);
    }
  }, [persistSecurityToFirestore]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          await syncUserAndSecurity(fbUser);
        } catch {
          // Local session fallback already applied inside syncUserAndSecurity
        }
      } else {
        setUser(null);
        clearSessionCookie('aos_session_active');
        clearSessionCookie('aos_user_role');
        try {
          localStorage.removeItem(LOCAL_SESSION_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [syncUserAndSecurity]);

  // Activity tracker & auto-lock countdown timer
  const touchActivity = useCallback(() => {
    const now = Date.now();
    setLastActivityAt(now);
    try {
      localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, String(now));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = [
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];
    let lastRecorded = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 4000) {
        lastRecorded = now;
        touchActivity();
      }
    };
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [touchActivity]);

  // Determine whether PIN / Protected tools are currently locked in this session
  const hasAnyLockActive =
    securityConfig.pinEnabled ||
    securityConfig.requireAuthForProTools ||
    securityConfig.lockedToolIds.length > 0;

  const isSessionLocked = Boolean(securityConfig.pinEnabled && !pinUnlockedInSession);

  useEffect(() => {
    setSessionCookie('aos_session_locked', isSessionLocked ? '1' : '0');
  }, [isSessionLocked]);

  useEffect(() => {
    if (!hasAnyLockActive || securityConfig.autoLockMinutes === 0) {
      setSecondsUntilAutoLock(null);
      return;
    }

    const intervalId = window.setInterval(() => {
      const timeoutMs = securityConfig.autoLockMinutes * 60 * 1000;
      const elapsed = Date.now() - lastActivityAt;
      const remainingSec = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
      setSecondsUntilAutoLock(remainingSec);

      if (elapsed >= timeoutMs) {
        if (pinUnlockedInSession) {
          setPinUnlockedInSession(false);
        }
        // If auto-lock triggers and auth-lock is enabled without PIN, re-lock session state
        setSessionCookie('aos_session_locked', '1');
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasAnyLockActive, securityConfig.autoLockMinutes, lastActivityAt, pinUnlockedInSession]);

  const updateSecurityState = useCallback(
    async (updater: (prev: AosSecurityConfig) => AosSecurityConfig) => {
      const next = updater(securityConfigRef.current);
      const sanitized: AosSecurityConfig = {
        pinHash: next.pinHash.slice(0, 128),
        pinEnabled: Boolean(next.pinEnabled && next.pinHash),
        requireAuthForProTools: Boolean(next.requireAuthForProTools),
        autoLockMinutes: sanitizeAutoLock(next.autoLockMinutes),
        lockedToolIds: sanitizeLockedToolIds(next.lockedToolIds),
      };
      setSecurityConfig(sanitized);
      persistLocalSecurityConfig(sanitized);

      const currentFbUser = auth.currentUser;
      if (currentFbUser && currentFbUser.emailVerified) {
        try {
          await persistSecurityToFirestore(currentFbUser.uid, sanitized);
        } catch {
          // Local storage security preferences already saved above
        }
      }
    },
    [persistSecurityToFirestore]
  );

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (credential.user) {
        try {
          await syncUserAndSecurity(credential.user);
        } catch {
          // Local session fallback already established inside syncUserAndSecurity
        }
        touchActivity();
        return true;
      }
      return false;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Google sign-in popup was closed before completing login.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Browser blocked the Google sign-in popup. Please allow popups for this AOS Tools site and retry.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'This domain is not yet authorized in Firebase Authentication settings. Add your Cloudflare Workers domain in Firebase Console -> Authentication -> Authorized Domains.'
        );
      } else {
        setAuthError(
          err instanceof Error ? err.message : 'Unable to complete Google authentication.'
        );
      }
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, [syncUserAndSecurity, touchActivity]);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setPinUnlockedInSession(false);
      clearSessionCookie('aos_session_active');
      clearSessionCookie('aos_user_role');
      localStorage.removeItem(LOCAL_SESSION_STORAGE_KEY);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to sign out.');
    }
  }, []);

  const setPinCode = useCallback(
    async (pin: string) => {
      const clean = pin.trim();
      if (!/^\d{4,6}$/.test(clean)) {
        throw new Error('Operator PIN must be 4 to 6 numeric digits.');
      }
      const hashed = await hashSecurityPin(clean);
      setPinUnlockedInSession(true);
      touchActivity();
      await updateSecurityState((prev) => ({
        ...prev,
        pinHash: hashed,
        pinEnabled: true,
      }));
    },
    [touchActivity, updateSecurityState]
  );

  const disablePinCode = useCallback(async () => {
    setPinUnlockedInSession(false);
    await updateSecurityState((prev) => ({
      ...prev,
      pinHash: '',
      pinEnabled: false,
    }));
  }, [updateSecurityState]);

  const verifyAndUnlockPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!securityConfig.pinEnabled || !securityConfig.pinHash) {
        setPinUnlockedInSession(true);
        return true;
      }
      const hashed = await hashSecurityPin(pin);
      if (hashed === securityConfig.pinHash) {
        setPinUnlockedInSession(true);
        touchActivity();
        return true;
      }
      return false;
    },
    [securityConfig.pinEnabled, securityConfig.pinHash, touchActivity]
  );

  const lockSessionNow = useCallback(() => {
    setPinUnlockedInSession(false);
    setSessionCookie('aos_session_locked', '1');
  }, []);

  const setAutoLockMinutes = useCallback(
    async (minutes: AutoLockMinutes) => {
      touchActivity();
      await updateSecurityState((prev) => ({
        ...prev,
        autoLockMinutes: sanitizeAutoLock(minutes),
      }));
    },
    [touchActivity, updateSecurityState]
  );

  const setRequireAuthForProTools = useCallback(
    async (enabled: boolean) => {
      await updateSecurityState((prev) => ({
        ...prev,
        requireAuthForProTools: enabled,
      }));
    },
    [updateSecurityState]
  );

  const toggleToolLock = useCallback(
    async (toolId: string) => {
      if (isToolProtectedUntouched(toolId)) return;
      await updateSecurityState((prev) => {
        const exists = prev.lockedToolIds.includes(toolId);
        const updated = exists
          ? prev.lockedToolIds.filter((id) => id !== toolId)
          : [...prev.lockedToolIds, toolId];
        return {
          ...prev,
          lockedToolIds: updated,
        };
      });
    },
    [isToolProtectedUntouched, updateSecurityState]
  );

  const lockAllProTools = useCallback(async () => {
    await updateSecurityState((prev) => ({
      ...prev,
      requireAuthForProTools: true,
      lockedToolIds: Array.from(
        new Set([...prev.lockedToolIds, ...PRO_TIER_TOOL_IDS])
      ).slice(0, 50),
    }));
  }, [updateSecurityState]);

  const unlockAllTools = useCallback(async () => {
    await updateSecurityState((prev) => ({
      ...prev,
      requireAuthForProTools: false,
      lockedToolIds: [],
    }));
  }, [updateSecurityState]);

  const getToolLockReason = useCallback(
    (toolId: string): ToolLockReason => {
      if (isToolProtectedUntouched(toolId)) return null;

      const isCoreAuth = (AUTH_REQUIRED_CORE_IDS as readonly string[]).includes(toolId);
      const isExplicitlyLocked = securityConfig.lockedToolIds.includes(toolId);
      const isProTierTool = (PRO_TIER_TOOL_IDS as readonly string[]).includes(toolId);

      const needsAuth =
        !user &&
        (isCoreAuth ||
          (securityConfig.requireAuthForProTools && isProTierTool) ||
          (isExplicitlyLocked && !securityConfig.pinEnabled));

      const needsPin =
        securityConfig.pinEnabled &&
        !pinUnlockedInSession &&
        (isExplicitlyLocked || (securityConfig.requireAuthForProTools && isProTierTool));

      if (needsAuth && needsPin) return 'both';
      if (needsAuth) return 'auth-required';
      if (needsPin) return 'pin-required';
      return null;
    },
    [
      isToolProtectedUntouched,
      securityConfig.lockedToolIds,
      securityConfig.requireAuthForProTools,
      securityConfig.pinEnabled,
      user,
      pinUnlockedInSession,
    ]
  );

  const isToolCurrentlyLocked = useCallback(
    (toolId: string): boolean => {
      return getToolLockReason(toolId) !== null;
    },
    [getToolLockReason]
  );

  const openAuthModal = useCallback((tab: 'account' | 'locks' = 'account') => {
    setAuthModalInitialTab(tab);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  return (
    <AuthSecurityContext.Provider
      value={{
        user,
        authReady,
        isSigningIn,
        authError,
        clearAuthError: () => setAuthError(null),
        securityConfig,
        isSessionLocked,
        secondsUntilAutoLock,
        lastActivityAt,
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
        isCoreAuthRequiredTool,
        isToolCurrentlyLocked,
        getToolLockReason,
        isAuthModalOpen,
        authModalInitialTab,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthSecurityContext.Provider>
  );
};

export function useAuthSecurity() {
  const ctx = useContext(AuthSecurityContext);
  if (!ctx) {
    throw new Error('useAuthSecurity must be used within an AuthSecurityProvider');
  }
  return ctx;
}
