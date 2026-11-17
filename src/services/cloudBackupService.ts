import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  isFirestorePermissionError,
} from '../firebase';
import { LanguageCode, TemplateId } from '../utils/translations';

export interface LiveNoticeItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  pinned: boolean;
  createdAt: number;
}

export interface CloudBackupPayload {
  ownerId: string;
  backupVersion: number;
  deviceLabel: string;
  preferences: {
    theme: 'dark' | 'light';
    lang: LanguageCode;
    templateId: TemplateId;
  };
  securityPrefs: {
    pinEnabled: boolean;
    requireAuthForProTools: boolean;
    autoLockMinutes: 0 | 1 | 5 | 15 | 30;
    lockedToolIds: string[];
  };
  notices: LiveNoticeItem[];
  ledgerCount: number;
  ledgerSnapshot: Array<Record<string, unknown>>;
  summaryOverrides: Record<string, number | null>;
}

export interface CloudBackupRecord extends CloudBackupPayload {
  updatedAtMs: number;
}

export const NOTICES_STORAGE_KEY = 'aos_live_notices_v1';
const PENDING_SYNC_KEY = 'aos_pending_cloud_sync_v1';
const LAST_SYNC_META_PREFIX = 'aos_cloud_backup_meta_v1';

const VALID_LANGS: LanguageCode[] = ['en', 'hi', 'ta', 'te', 'mr', 'hinglish'];
const VALID_TEMPLATES: TemplateId[] = [
  'template-1',
  'template-2',
  'template-3',
  'template-4',
];
const VALID_AUTOLOCK = [0, 1, 5, 15, 30] as const;

export function getLastSyncMeta(uid: string | null): { lastSyncedAt: number; deviceLabel: string; ledgerCount: number } | null {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(`${LAST_SYNC_META_PREFIX}::${uid}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.lastSyncedAt === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveLastSyncMeta(uid: string, ledgerCount: number, deviceLabel: string) {
  try {
    localStorage.setItem(
      `${LAST_SYNC_META_PREFIX}::${uid}`,
      JSON.stringify({
        lastSyncedAt: Date.now(),
        deviceLabel,
        ledgerCount,
      })
    );
    window.dispatchEvent(new CustomEvent('aos-cloud-backup-updated', { detail: { uid } }));
  } catch {
    // Ignore storage quota issues
  }
}

export function getPendingCloudSyncFlag(): boolean {
  try {
    return localStorage.getItem(PENDING_SYNC_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPendingCloudSyncFlag(pending: boolean) {
  try {
    if (pending) {
      localStorage.setItem(PENDING_SYNC_KEY, '1');
    } else {
      localStorage.removeItem(PENDING_SYNC_KEY);
    }
    window.dispatchEvent(new CustomEvent('aos-cloud-sync-queue-changed'));
  } catch {
    // Ignore storage issues
  }
}

export function detectDeviceLabel(): string {
  try {
    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|Mobile/i.test(ua);
    const browser = /Edg/i.test(ua)
      ? 'Edge'
      : /Chrome/i.test(ua)
      ? 'Chrome'
      : /Firefox/i.test(ua)
      ? 'Firefox'
      : /Safari/i.test(ua)
      ? 'Safari'
      : 'Browser';
    return `${isMobile ? 'Mobile' : 'Desktop'} · ${browser}`.slice(0, 120);
  } catch {
    return 'AOS Web Terminal';
  }
}

export function loadLocalNotices(): LiveNoticeItem[] {
  try {
    const raw = localStorage.getItem(NOTICES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((n): n is LiveNoticeItem => Boolean(n && typeof n.id === 'string' && typeof n.title === 'string'))
      .slice(0, 20);
  } catch {
    return [];
  }
}

export function saveLocalNotices(notices: LiveNoticeItem[]) {
  try {
    localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices.slice(0, 20)));
    window.dispatchEvent(new CustomEvent('aos-notices-updated'));
  } catch {
    // Ignore storage quota issues
  }
}

function normalizeLedgerSnapshot(rawList: unknown[]): Array<Record<string, unknown>> {
  return rawList
    .slice(0, 100)
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((r) => ({
      id: typeof r.id === 'string' ? r.id.slice(0, 128) : `rec-${Date.now()}`,
      date: typeof r.date === 'string' ? r.date.slice(0, 20) : '',
      clientName: typeof r.clientName === 'string' ? r.clientName.slice(0, 120) : '',
      services: typeof r.services === 'string' ? r.services.slice(0, 240) : '',
      tokenNum: typeof r.tokenNum === 'string' ? r.tokenNum.slice(0, 60) : '',
      government: typeof r.government === 'string' ? r.government.slice(0, 150) : '',
      governmentFees: typeof r.governmentFees === 'number' ? Math.max(0, r.governmentFees) : 0,
      workCharge: typeof r.workCharge === 'number' ? Math.max(0, r.workCharge) : 0,
      totalPrice: typeof r.totalPrice === 'number' ? Math.max(0, r.totalPrice) : 0,
      status: r.status === 'Pending' ? 'Pending' : 'Completed',
      notes: typeof r.notes === 'string' ? r.notes.slice(0, 500) : '',
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
    }));
}

export function buildLocalCloudBackupPayload(
  uid: string,
  securityOverrides?: {
    pinEnabled?: boolean;
    requireAuthForProTools?: boolean;
    autoLockMinutes?: number;
    lockedToolIds?: string[];
  }
): CloudBackupPayload {
  let theme: 'dark' | 'light' = 'dark';
  let lang: LanguageCode = 'en';
  let templateId: TemplateId = 'template-1';
  let ledgerList: unknown[] = [];
  let summaryOverrides: Record<string, number | null> = {};
  let secRaw: Record<string, unknown> = {};

  try {
    theme = localStorage.getItem('aos_theme') === 'light' ? 'light' : 'dark';
    const rawLang = localStorage.getItem('aos_lang') as LanguageCode;
    if (rawLang && VALID_LANGS.includes(rawLang)) lang = rawLang;
    const rawTpl = localStorage.getItem('aos_template') as TemplateId;
    if (rawTpl && VALID_TEMPLATES.includes(rawTpl)) templateId = rawTpl;

    const rawLedger = localStorage.getItem(`aos_tools_khata_records_v1::${uid}`);
    if (rawLedger) {
      const parsed = JSON.parse(rawLedger);
      if (Array.isArray(parsed)) ledgerList = parsed;
    }

    const rawSummary = localStorage.getItem(`aos_tools_khata_summary_overrides_v1::${uid}`);
    if (rawSummary) {
      const parsedSum = JSON.parse(rawSummary);
      if (parsedSum && typeof parsedSum === 'object') {
        for (const k of ['todayWorkCharge', 'totalGovFeesAll', 'monthWorkCharge', 'pendingCount']) {
          const val = (parsedSum as Record<string, unknown>)[k];
          if (typeof val === 'number' && val >= 0) {
            summaryOverrides[k] = val;
          }
        }
      }
    }

    const rawSec = localStorage.getItem('aos_security_prefs_v1');
    if (rawSec) {
      const parsedSec = JSON.parse(rawSec);
      if (parsedSec && typeof parsedSec === 'object') {
        secRaw = parsedSec as Record<string, unknown>;
      }
    }
  } catch {
    // Use safe defaults
  }

  const rawAutoLock = securityOverrides?.autoLockMinutes ?? (typeof secRaw.autoLockMinutes === 'number' ? secRaw.autoLockMinutes : 0);
  const autoLockMinutes = (VALID_AUTOLOCK.includes(rawAutoLock as 0 | 1 | 5 | 15 | 30)
    ? rawAutoLock
    : 0) as 0 | 1 | 5 | 15 | 30;

  const rawLockedIds = securityOverrides?.lockedToolIds ?? (Array.isArray(secRaw.lockedToolIds) ? secRaw.lockedToolIds : []);
  const lockedToolIds = rawLockedIds
    .filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 64)
    .slice(0, 50);

  const notices = loadLocalNotices()
    .slice(0, 20)
    .map((n) => ({
      id: n.id.slice(0, 64),
      title: n.title.slice(0, 120),
      message: n.message.slice(0, 400),
      severity: n.severity,
      pinned: Boolean(n.pinned),
      createdAt: Number(n.createdAt) || Date.now(),
    }));

  const ledgerSnapshot = normalizeLedgerSnapshot(ledgerList);

  return {
    ownerId: uid,
    backupVersion: 1,
    deviceLabel: detectDeviceLabel(),
    preferences: {
      theme,
      lang,
      templateId,
    },
    securityPrefs: {
      pinEnabled: Boolean(securityOverrides?.pinEnabled ?? secRaw.pinEnabled),
      requireAuthForProTools: Boolean(securityOverrides?.requireAuthForProTools ?? secRaw.requireAuthForProTools),
      autoLockMinutes,
      lockedToolIds,
    },
    notices,
    ledgerCount: ledgerList.length,
    ledgerSnapshot,
    summaryOverrides,
  };
}

export async function uploadCloudBackup(
  uid: string,
  payload?: CloudBackupPayload
): Promise<{ ok: boolean; queuedOffline?: boolean; error?: string }> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid || !auth.currentUser.emailVerified) {
    return { ok: false, error: 'Verified Google account required for Cloud Backup.' };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    setPendingCloudSyncFlag(true);
    return { ok: false, queuedOffline: true };
  }

  const data = payload || buildLocalCloudBackupPayload(uid);
  const backupPath = `users/${uid}/cloudBackup/default`;

  try {
    await setDoc(doc(db, 'users', uid, 'cloudBackup', 'default'), {
      ...data,
      ownerId: uid,
      updatedAt: serverTimestamp(),
    });
    setPendingCloudSyncFlag(false);
    saveLastSyncMeta(uid, data.ledgerCount, data.deviceLabel);
    return { ok: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, backupPath);
    if (isFirestorePermissionError(err)) {
      return { ok: false, error: 'Cloud Backup permission unavailable for current account.' };
    }
    setPendingCloudSyncFlag(true);
    return { ok: false, queuedOffline: true, error: 'Offline or network unreachable — queued for auto-sync.' };
  }
}

export async function fetchCloudBackup(uid: string): Promise<CloudBackupRecord | null> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return null;
  }

  const backupPath = `users/${uid}/cloudBackup/default`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'cloudBackup', 'default'));
    if (!snap.exists()) return null;
    const d = snap.data();
    const updatedAtMs =
      d.updatedAt instanceof Timestamp ? d.updatedAt.toMillis() : Date.now();

    const prefs = (d.preferences && typeof d.preferences === 'object' ? d.preferences : {}) as Record<string, unknown>;
    const sec = (d.securityPrefs && typeof d.securityPrefs === 'object' ? d.securityPrefs : {}) as Record<string, unknown>;

    return {
      ownerId: uid,
      backupVersion: typeof d.backupVersion === 'number' ? d.backupVersion : 1,
      deviceLabel: typeof d.deviceLabel === 'string' ? d.deviceLabel : 'Synced Device',
      preferences: {
        theme: prefs.theme === 'light' ? 'light' : 'dark',
        lang: VALID_LANGS.includes(prefs.lang as LanguageCode)
          ? (prefs.lang as LanguageCode)
          : 'en',
        templateId: VALID_TEMPLATES.includes(prefs.templateId as TemplateId)
          ? (prefs.templateId as TemplateId)
          : 'template-1',
      },
      securityPrefs: {
        pinEnabled: Boolean(sec.pinEnabled),
        requireAuthForProTools: Boolean(sec.requireAuthForProTools),
        autoLockMinutes: VALID_AUTOLOCK.includes(sec.autoLockMinutes as 0 | 1 | 5 | 15 | 30)
          ? (sec.autoLockMinutes as 0 | 1 | 5 | 15 | 30)
          : 0,
        lockedToolIds: Array.isArray(sec.lockedToolIds)
          ? sec.lockedToolIds.filter((x): x is string => typeof x === 'string')
          : [],
      },
      notices: Array.isArray(d.notices) ? (d.notices as LiveNoticeItem[]) : [],
      ledgerCount: typeof d.ledgerCount === 'number' ? d.ledgerCount : 0,
      ledgerSnapshot: Array.isArray(d.ledgerSnapshot) ? (d.ledgerSnapshot as Array<Record<string, unknown>>) : [],
      summaryOverrides:
        d.summaryOverrides && typeof d.summaryOverrides === 'object'
          ? (d.summaryOverrides as Record<string, number | null>)
          : {},
      updatedAtMs,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, backupPath);
    return null;
  }
}

export async function restoreCloudBackup(
  uid: string,
  callbacks?: {
    onApplyPreferences?: (prefs: CloudBackupPayload['preferences']) => void;
    overwriteLedgerIfNonEmpty?: boolean;
  }
): Promise<{ ok: boolean; restoredCount: number; message: string }> {
  const remote = await fetchCloudBackup(uid);
  if (!remote) {
    return { ok: false, restoredCount: 0, message: 'No cloud backup snapshot found yet for this account.' };
  }

  try {
    // 1. Restore UI preferences
    localStorage.setItem('aos_theme', remote.preferences.theme);
    localStorage.setItem('aos_lang', remote.preferences.lang);
    localStorage.setItem('aos_template', remote.preferences.templateId);
    callbacks?.onApplyPreferences?.(remote.preferences);

    // 2. Restore live notices if present
    if (remote.notices.length > 0) {
      saveLocalNotices(remote.notices);
    }

    // 3. Restore Client Diary snapshot if local is empty or overwrite requested
    const existingLedgerRaw = localStorage.getItem(`aos_tools_khata_records_v1::${uid}`);
    const hasLocalLedger = Boolean(existingLedgerRaw && existingLedgerRaw !== '[]');
    if (
      remote.ledgerSnapshot.length > 0 &&
      (!hasLocalLedger || callbacks?.overwriteLedgerIfNonEmpty)
    ) {
      localStorage.setItem(
        `aos_tools_khata_records_v1::${uid}`,
        JSON.stringify(remote.ledgerSnapshot)
      );
    }

    if (Object.keys(remote.summaryOverrides).length > 0) {
      localStorage.setItem(
        `aos_tools_khata_summary_overrides_v1::${uid}`,
        JSON.stringify(remote.summaryOverrides)
      );
    }

    saveLastSyncMeta(uid, remote.ledgerCount, remote.deviceLabel);
    return {
      ok: true,
      restoredCount: remote.ledgerSnapshot.length,
      message: `Restored preferences, ${remote.notices.length} notices & ${remote.ledgerSnapshot.length} diary snapshot records from ${remote.deviceLabel}.`,
    };
  } catch {
    return { ok: false, restoredCount: 0, message: 'Unable to apply cloud backup locally.' };
  }
}

export async function flushPendingCloudSync(): Promise<boolean> {
  if (!getPendingCloudSyncFlag()) return false;
  const uid = auth.currentUser?.uid;
  if (!uid || !navigator.onLine) return false;
  const res = await uploadCloudBackup(uid);
  return res.ok;
}
