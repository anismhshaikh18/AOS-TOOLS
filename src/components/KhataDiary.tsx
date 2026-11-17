import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Briefcase,
  Pen,
  Download,
  Printer,
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Trash2,
  AlertCircle,
  X,
  Cloud,
  HardDrive,
  UserCheck,
  Send,
  MessageSquare,
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError, isFirestorePermissionError } from '../firebase';
import { useAuthSecurity } from '../context/AuthSecurityContext';
import {
  buildWhatsAppShareUrl,
  buildSmsShareUrl,
  formatKhataEntryShareMessage,
  formatKhataSummaryShareMessage,
} from '../utils/shareUtils';

export interface KhataRecord {
  id: string;
  date: string;
  clientName: string;
  services: string;
  tokenNum: string;
  government: string;
  governmentFees: number;
  workCharge: number;
  totalPrice: number;
  status: 'Completed' | 'Pending';
  notes?: string;
  createdAt: number;
}

interface SummaryOverrides {
  todayWorkCharge?: number | null;
  totalGovFeesAll?: number | null;
  monthWorkCharge?: number | null;
  pendingCount?: number | null;
}

const RECORDS_STORAGE_PREFIX = 'aos_tools_khata_records_v1';
const SUMMARY_STORAGE_PREFIX = 'aos_tools_khata_summary_overrides_v1';

const getRecordsStorageKey = (uid: string | null) =>
  uid ? `${RECORDS_STORAGE_PREFIX}::${uid}` : `${RECORDS_STORAGE_PREFIX}::guest`;

const getSummaryStorageKey = (uid: string | null) =>
  uid ? `${SUMMARY_STORAGE_PREFIX}::${uid}` : `${SUMMARY_STORAGE_PREFIX}::guest`;

function loadPartitionRecords(uid: string | null): KhataRecord[] {
  try {
    const raw = localStorage.getItem(getRecordsStorageKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is KhataRecord => Boolean(item && typeof item.id === 'string' && typeof item.clientName === 'string'))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch {
    return [];
  }
}

function savePartitionRecords(uid: string | null, records: KhataRecord[]) {
  try {
    localStorage.setItem(getRecordsStorageKey(uid), JSON.stringify(records));
  } catch {
    // Ignore storage quota errors
  }
}

function loadPartitionSummary(uid: string | null): SummaryOverrides {
  try {
    const raw = localStorage.getItem(getSummaryStorageKey(uid));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function savePartitionSummary(uid: string | null, overrides: SummaryOverrides) {
  try {
    localStorage.setItem(getSummaryStorageKey(uid), JSON.stringify(overrides));
  } catch {
    // Ignore storage quota errors
  }
}

function sanitizeRecordId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned || `rec-${Date.now()}`;
}

export const KhataDiary: React.FC = () => {
  const { user, authReady } = useAuthSecurity();
  const activeUid = user?.uid || null;

  const [records, setRecords] = useState<KhataRecord[]>(() => loadPartitionRecords(activeUid));
  const [summaryOverrides, setSummaryOverrides] = useState<SummaryOverrides>(() =>
    loadPartitionSummary(activeUid)
  );
  const [syncState, setSyncState] = useState<'syncing' | 'cloud' | 'local'>(
    activeUid ? 'syncing' : 'local'
  );

  const loadedUidRef = useRef<string | null>(activeUid);
  const cloudDisabledForUidRef = useRef<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KhataRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formClientName, setFormClientName] = useState('');
  const [formServices, setFormServices] = useState('');
  const [formTokenNum, setFormTokenNum] = useState('');
  const [formGovernment, setFormGovernment] = useState('');
  const [formGovFees, setFormGovFees] = useState<number>(0);
  const [formWorkCharge, setFormWorkCharge] = useState<number>(50);
  const [formStatus, setFormStatus] = useState<'Completed' | 'Pending'>('Completed');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [overrideTodayWork, setOverrideTodayWork] = useState('');
  const [overrideGovFees, setOverrideGovFees] = useState('');
  const [overrideMonthWork, setOverrideMonthWork] = useState('');
  const [overridePending, setOverridePending] = useState('');

  // Dynamic account switching & Firestore real-time partition sync (users/{uid}/ledger)
  useEffect(() => {
    loadedUidRef.current = activeUid;
    cloudDisabledForUidRef.current = null;

    // Immediately swap UI state to the active user's isolated partition
    setRecords(loadPartitionRecords(activeUid));
    setSummaryOverrides(loadPartitionSummary(activeUid));
    setSearchQuery('');
    setStatusFilter('All');
    setDateFilter('');
    setIsModalOpen(false);
    setEditingRecord(null);
    setIsSummaryModalOpen(false);
    setDeleteTarget(null);

    if (!authReady || !activeUid || auth.currentUser?.uid !== activeUid) {
      setSyncState('local');
      return;
    }

    setSyncState('syncing');

    const ledgerPath = `users/${activeUid}/ledger`;
    const ledgerQuery = query(
      collection(db, 'users', activeUid, 'ledger'),
      where('ownerId', '==', activeUid)
    );

    const unsubLedger = onSnapshot(
      ledgerQuery,
      (snapshot) => {
        if (loadedUidRef.current !== activeUid) return;
        if (cloudDisabledForUidRef.current === activeUid) return;

        const cloudRecords: KhataRecord[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const createdTs =
            typeof d.clientCreatedAt === 'number'
              ? d.clientCreatedAt
              : d.createdAt instanceof Timestamp
              ? d.createdAt.toMillis()
              : Date.now();
          return {
            id: typeof d.id === 'string' ? d.id : docSnap.id,
            date: typeof d.date === 'string' ? d.date : new Date().toISOString().split('T')[0],
            clientName: typeof d.clientName === 'string' ? d.clientName : '',
            services: typeof d.services === 'string' ? d.services : '',
            tokenNum: typeof d.tokenNum === 'string' ? d.tokenNum : '',
            government: typeof d.government === 'string' ? d.government : 'General Public Service',
            governmentFees: typeof d.governmentFees === 'number' ? d.governmentFees : 0,
            workCharge: typeof d.workCharge === 'number' ? d.workCharge : 0,
            totalPrice: typeof d.totalPrice === 'number' ? d.totalPrice : 0,
            status: d.status === 'Pending' ? 'Pending' : 'Completed',
            notes: typeof d.notes === 'string' ? d.notes : '',
            createdAt: createdTs,
          };
        });

        cloudRecords.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Preserve any local partition records if snapshot is from empty cache while offline
        if (snapshot.metadata.fromCache && cloudRecords.length === 0) {
          const localCached = loadPartitionRecords(activeUid);
          if (localCached.length > 0) {
            setRecords(localCached);
            setSyncState('local');
            return;
          }
        }

        setRecords(cloudRecords);
        savePartitionRecords(activeUid, cloudRecords);
        setSyncState('cloud');
      },
      (error) => {
        if (loadedUidRef.current !== activeUid) return;
        handleFirestoreError(error, OperationType.LIST, ledgerPath);
        if (isFirestorePermissionError(error)) {
          cloudDisabledForUidRef.current = activeUid;
        }
        setSyncState('local');
      }
    );

    const summaryPath = `users/${activeUid}/ledgerSummary/default`;
    const summaryRef = doc(db, 'users', activeUid, 'ledgerSummary', 'default');

    const unsubSummary = onSnapshot(
      summaryRef,
      (docSnap) => {
        if (loadedUidRef.current !== activeUid) return;
        if (cloudDisabledForUidRef.current === activeUid) return;

        if (docSnap.exists()) {
          const d = docSnap.data();
          const nextSummary: SummaryOverrides = {
            todayWorkCharge: typeof d.todayWorkCharge === 'number' ? d.todayWorkCharge : null,
            totalGovFeesAll: typeof d.totalGovFeesAll === 'number' ? d.totalGovFeesAll : null,
            monthWorkCharge: typeof d.monthWorkCharge === 'number' ? d.monthWorkCharge : null,
            pendingCount: typeof d.pendingCount === 'number' ? d.pendingCount : null,
          };
          setSummaryOverrides(nextSummary);
          savePartitionSummary(activeUid, nextSummary);
        } else if (!docSnap.metadata.fromCache) {
          setSummaryOverrides({});
          savePartitionSummary(activeUid, {});
        }
      },
      (error) => {
        if (loadedUidRef.current !== activeUid) return;
        handleFirestoreError(error, OperationType.GET, summaryPath);
      }
    );

    return () => {
      unsubLedger();
      unsubSummary();
    };
  }, [activeUid, authReady]);

  const syncRecordToCloud = useCallback(
    async (uid: string, record: KhataRecord, isNew: boolean) => {
      if (!auth.currentUser || auth.currentUser.uid !== uid || !auth.currentUser.emailVerified) {
        setSyncState('local');
        return;
      }

      const safeId = sanitizeRecordId(record.id);
      const entryRef = doc(db, 'users', uid, 'ledger', safeId);
      const entryPath = `users/${uid}/ledger/${safeId}`;

      try {
        if (isNew) {
          await setDoc(entryRef, {
            id: safeId,
            ownerId: uid,
            date: record.date.slice(0, 20),
            clientName: record.clientName.trim().slice(0, 120),
            services: record.services.trim().slice(0, 240),
            tokenNum: record.tokenNum.trim().slice(0, 60),
            government: (record.government.trim() || 'General Public Service').slice(0, 150),
            governmentFees: Math.min(10000000, Math.max(0, Number(record.governmentFees) || 0)),
            workCharge: Math.min(10000000, Math.max(0, Number(record.workCharge) || 0)),
            totalPrice: Math.min(20000000, Math.max(0, Number(record.totalPrice) || 0)),
            status: record.status,
            notes: (record.notes || '').trim().slice(0, 500),
            clientCreatedAt: Math.max(0, Number(record.createdAt) || Date.now()),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(entryRef, {
            date: record.date.slice(0, 20),
            clientName: record.clientName.trim().slice(0, 120),
            services: record.services.trim().slice(0, 240),
            tokenNum: record.tokenNum.trim().slice(0, 60),
            government: (record.government.trim() || 'General Public Service').slice(0, 150),
            governmentFees: Math.min(10000000, Math.max(0, Number(record.governmentFees) || 0)),
            workCharge: Math.min(10000000, Math.max(0, Number(record.workCharge) || 0)),
            totalPrice: Math.min(20000000, Math.max(0, Number(record.totalPrice) || 0)),
            status: record.status,
            notes: (record.notes || '').trim().slice(0, 500),
            updatedAt: serverTimestamp(),
          });
        }
        if (loadedUidRef.current === uid) {
          setSyncState('cloud');
        }
      } catch (err) {
        handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, entryPath);
        if (isFirestorePermissionError(err)) {
          cloudDisabledForUidRef.current = uid;
        }
        if (loadedUidRef.current === uid) {
          setSyncState('local');
        }
      }
    },
    []
  );

  const syncSummaryToCloud = useCallback(async (uid: string, overrides: SummaryOverrides) => {
    if (!auth.currentUser || auth.currentUser.uid !== uid || !auth.currentUser.emailVerified) {
      return;
    }

    const summaryRef = doc(db, 'users', uid, 'ledgerSummary', 'default');
    const summaryPath = `users/${uid}/ledgerSummary/default`;

    const hasAnyOverride =
      (overrides.todayWorkCharge !== undefined && overrides.todayWorkCharge !== null) ||
      (overrides.totalGovFeesAll !== undefined && overrides.totalGovFeesAll !== null) ||
      (overrides.monthWorkCharge !== undefined && overrides.monthWorkCharge !== null) ||
      (overrides.pendingCount !== undefined && overrides.pendingCount !== null);

    try {
      if (!hasAnyOverride) {
        await deleteDoc(summaryRef);
        return;
      }

      const payload: Record<string, unknown> = {
        ownerId: uid,
        updatedAt: serverTimestamp(),
      };
      if (typeof overrides.todayWorkCharge === 'number' && overrides.todayWorkCharge >= 0) {
        payload.todayWorkCharge = Math.min(100000000, overrides.todayWorkCharge);
      }
      if (typeof overrides.totalGovFeesAll === 'number' && overrides.totalGovFeesAll >= 0) {
        payload.totalGovFeesAll = Math.min(100000000, overrides.totalGovFeesAll);
      }
      if (typeof overrides.monthWorkCharge === 'number' && overrides.monthWorkCharge >= 0) {
        payload.monthWorkCharge = Math.min(100000000, overrides.monthWorkCharge);
      }
      if (typeof overrides.pendingCount === 'number' && overrides.pendingCount >= 0) {
        payload.pendingCount = Math.min(1000000, overrides.pendingCount);
      }

      await setDoc(summaryRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, summaryPath);
    }
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rec.clientName.toLowerCase().includes(q) ||
        rec.tokenNum.toLowerCase().includes(q) ||
        rec.services.toLowerCase().includes(q) ||
        rec.government.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
      const matchesDate = !dateFilter || rec.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [records, searchQuery, statusFilter, dateFilter]);

  const rawStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = todayStr.slice(0, 7);

    let totalWorkChargeAll = 0;
    let totalGovFeesAll = 0;
    let totalPriceAll = 0;
    let todayWorkCharge = 0;
    let todayGovFees = 0;
    let todayTotal = 0;
    let monthWorkCharge = 0;
    let monthTotal = 0;
    let pendingCount = 0;

    records.forEach((r) => {
      totalWorkChargeAll += r.workCharge;
      totalGovFeesAll += r.governmentFees;
      totalPriceAll += r.totalPrice;

      if (r.date === todayStr) {
        todayWorkCharge += r.workCharge;
        todayGovFees += r.governmentFees;
        todayTotal += r.totalPrice;
      }

      if (r.date.startsWith(currentMonth)) {
        monthWorkCharge += r.workCharge;
        monthTotal += r.totalPrice;
      }

      if (r.status === 'Pending') {
        pendingCount++;
      }
    });

    return {
      totalWorkChargeAll,
      totalGovFeesAll,
      totalPriceAll,
      todayWorkCharge,
      todayGovFees,
      todayTotal,
      monthWorkCharge,
      monthTotal,
      pendingCount,
      totalRecords: records.length,
    };
  }, [records]);

  const displayStats = useMemo(() => {
    const todayWorkCharge =
      summaryOverrides.todayWorkCharge !== undefined && summaryOverrides.todayWorkCharge !== null
        ? summaryOverrides.todayWorkCharge
        : rawStats.todayWorkCharge;

    const monthWorkCharge =
      summaryOverrides.monthWorkCharge !== undefined && summaryOverrides.monthWorkCharge !== null
        ? summaryOverrides.monthWorkCharge
        : rawStats.monthWorkCharge;

    const totalGovFeesAll =
      summaryOverrides.totalGovFeesAll !== undefined && summaryOverrides.totalGovFeesAll !== null
        ? summaryOverrides.totalGovFeesAll
        : rawStats.totalGovFeesAll;

    const pendingCount =
      summaryOverrides.pendingCount !== undefined && summaryOverrides.pendingCount !== null
        ? summaryOverrides.pendingCount
        : rawStats.pendingCount;

    return {
      ...rawStats,
      todayWorkCharge,
      monthWorkCharge,
      totalGovFeesAll,
      pendingCount,
    };
  }, [rawStats, summaryOverrides]);

  const handleOpenSummaryModal = () => {
    setOverrideTodayWork(displayStats.todayWorkCharge.toString());
    setOverrideGovFees(displayStats.totalGovFeesAll.toString());
    setOverrideMonthWork(displayStats.monthWorkCharge.toString());
    setOverridePending(displayStats.pendingCount.toString());
    setIsSummaryModalOpen(true);
  };

  const handleSaveSummaryOverrides = (e: React.FormEvent) => {
    e.preventDefault();
    const nextOverrides: SummaryOverrides = {
      todayWorkCharge: overrideTodayWork.trim() === '' ? null : Math.max(0, Number(overrideTodayWork)),
      totalGovFeesAll: overrideGovFees.trim() === '' ? null : Math.max(0, Number(overrideGovFees)),
      monthWorkCharge: overrideMonthWork.trim() === '' ? null : Math.max(0, Number(overrideMonthWork)),
      pendingCount: overridePending.trim() === '' ? null : Math.max(0, Number(overridePending)),
    };
    setSummaryOverrides(nextOverrides);
    savePartitionSummary(activeUid, nextOverrides);
    if (activeUid) {
      void syncSummaryToCloud(activeUid, nextOverrides);
    }
    setIsSummaryModalOpen(false);
  };

  const handleResetSummaryOverrides = () => {
    const cleared: SummaryOverrides = {};
    setSummaryOverrides(cleared);
    savePartitionSummary(activeUid, cleared);
    if (activeUid) {
      void syncSummaryToCloud(activeUid, cleared);
    }
    setIsSummaryModalOpen(false);
  };

  const handleOpenNewEntry = () => {
    setEditingRecord(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormClientName('');
    setFormServices('');
    setFormTokenNum(`TK-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormGovernment('');
    setFormGovFees(0);
    setFormWorkCharge(50);
    setFormStatus('Completed');
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditRecord = (rec: KhataRecord) => {
    setEditingRecord(rec);
    setFormDate(rec.date);
    setFormClientName(rec.clientName);
    setFormServices(rec.services);
    setFormTokenNum(rec.tokenNum);
    setFormGovernment(rec.government);
    setFormGovFees(rec.governmentFees);
    setFormWorkCharge(rec.workCharge);
    setFormStatus(rec.status);
    setFormNotes(rec.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim()) {
      setFormError('Please enter Client Name.');
      return;
    }
    if (!formServices.trim()) {
      setFormError('Please enter Service(s) rendered.');
      return;
    }
    if (!formTokenNum.trim()) {
      setFormError('Please enter Token Number.');
      return;
    }

    const govFee = Math.min(10000000, Math.max(0, Number(formGovFees) || 0));
    const workCharge = Math.min(10000000, Math.max(0, Number(formWorkCharge) || 0));
    const total = govFee + workCharge;

    if (editingRecord) {
      const updatedRecord: KhataRecord = {
        ...editingRecord,
        date: formDate,
        clientName: formClientName.trim().slice(0, 120),
        services: formServices.trim().slice(0, 240),
        tokenNum: formTokenNum.trim().slice(0, 60),
        government: (formGovernment.trim() || 'General Public Service').slice(0, 150),
        governmentFees: govFee,
        workCharge: workCharge,
        totalPrice: total,
        status: formStatus,
        notes: formNotes.trim().slice(0, 500),
      };
      const nextRecords = records.map((r) => (r.id === editingRecord.id ? updatedRecord : r));
      setRecords(nextRecords);
      savePartitionRecords(activeUid, nextRecords);
      if (activeUid) {
        void syncRecordToCloud(activeUid, updatedRecord, false);
      }
    } else {
      const newRec: KhataRecord = {
        id: sanitizeRecordId(`rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
        date: formDate,
        clientName: formClientName.trim().slice(0, 120),
        services: formServices.trim().slice(0, 240),
        tokenNum: formTokenNum.trim().slice(0, 60),
        government: (formGovernment.trim() || 'General Public Service').slice(0, 150),
        governmentFees: govFee,
        workCharge: workCharge,
        totalPrice: total,
        status: formStatus,
        notes: formNotes.trim().slice(0, 500),
        createdAt: Date.now(),
      };
      const nextRecords = [newRec, ...records];
      setRecords(nextRecords);
      savePartitionRecords(activeUid, nextRecords);
      if (activeUid) {
        void syncRecordToCloud(activeUid, newRec, true);
      }
    }

    setIsModalOpen(false);
  };

  const confirmDeleteRecord = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);

    const nextRecords = records.filter((r) => r.id !== id);
    setRecords(nextRecords);
    savePartitionRecords(activeUid, nextRecords);

    if (activeUid && auth.currentUser?.uid === activeUid && auth.currentUser.emailVerified) {
      const safeId = sanitizeRecordId(id);
      const entryPath = `users/${activeUid}/ledger/${safeId}`;
      try {
        await deleteDoc(doc(db, 'users', activeUid, 'ledger', safeId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, entryPath);
      }
    }
  };

  const handleToggleStatus = (id: string) => {
    let toggledRecord: KhataRecord | null = null;
    const nextRecords = records.map((r) => {
      if (r.id !== id) return r;
      const nextStatus: 'Completed' | 'Pending' = r.status === 'Completed' ? 'Pending' : 'Completed';
      toggledRecord = { ...r, status: nextStatus };
      return toggledRecord;
    });
    setRecords(nextRecords);
    savePartitionRecords(activeUid, nextRecords);

    if (toggledRecord && activeUid) {
      void syncRecordToCloud(activeUid, toggledRecord, false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'DATE',
      'NAME',
      'SERVICES',
      'TOKEN NUM',
      'GOVERNMENT',
      'GOVERNMENT FEES',
      'WORK CHARGE',
      'TOTAL PRICE',
      'STATUS',
      'NOTES',
    ];
    const rows = filteredRecords.map((r) => [
      r.date,
      `"${r.clientName.replace(/"/g, '""')}"`,
      `"${r.services.replace(/"/g, '""')}"`,
      r.tokenNum,
      `"${r.government.replace(/"/g, '""')}"`,
      r.governmentFees,
      r.workCharge,
      r.totalPrice,
      r.status,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute(
      'download',
      `AOS_Client_Diary_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#0284c7]" />
            <span>Client Diary</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300 mt-1">
            <span>
              Compliant daily registry for E-Sevai, CSC operators, cyber cafes, and documentation centers.
            </span>
            {user && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0284c7] dark:text-sky-300">
                <UserCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Account: {user.email}</span>
                <span aria-hidden="true">·</span>
                {syncState === 'cloud' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <Cloud className="w-3 h-3" />
                    UID Cloud Synced
                  </span>
                ) : syncState === 'syncing' ? (
                  <span className="text-sky-600 dark:text-sky-300">Syncing Account Ledger...</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-300">
                    <HardDrive className="w-3 h-3" />
                    Account Local Partition
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenSummaryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer shadow-xs"
            title="Edit Today Work Charge, Monthly Charge, Govt Fees, or Pending Tokens"
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Edit Summary Balances</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <a
            href={buildWhatsAppShareUrl(
              formatKhataSummaryShareMessage(filteredRecords, displayStats)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            title="Share Client Diary Summary via WhatsApp"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp Report</span>
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleOpenNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Client Entry</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today Work Charge */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs relative group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Today's Work Charge (Net Profit)
            </span>
            <button
              onClick={handleOpenSummaryModal}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
              title="Edit Today's Work Charge"
            >
              <Pen className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            <span>₹</span>
            <span>{displayStats.todayWorkCharge.toLocaleString()}</span>
            {summaryOverrides.todayWorkCharge !== undefined && summaryOverrides.todayWorkCharge !== null && (
              <span className="ml-1 text-[10px] font-sans font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                Custom
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Today Total Turnover: ₹{displayStats.todayTotal.toLocaleString()}
          </span>
        </div>

        {/* Card 2: Monthly Work Charge */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs relative group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Monthly Work Charge
            </span>
            <button
              onClick={handleOpenSummaryModal}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
              title="Edit Monthly Work Charge"
            >
              <Pen className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            <span>₹</span>
            <span>{displayStats.monthWorkCharge.toLocaleString()}</span>
            {summaryOverrides.monthWorkCharge !== undefined && summaryOverrides.monthWorkCharge !== null && (
              <span className="ml-1 text-[10px] font-sans font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                Custom
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Month Gross: ₹{displayStats.monthTotal.toLocaleString()}
          </span>
        </div>

        {/* Card 3: Government Fees */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs relative group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Government Fees Disbursed
            </span>
            <button
              onClick={handleOpenSummaryModal}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
              title="Edit Government Fees Disbursed"
            >
              <Pen className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
            <span>₹</span>
            <span>{displayStats.totalGovFeesAll.toLocaleString()}</span>
            {summaryOverrides.totalGovFeesAll !== undefined && summaryOverrides.totalGovFeesAll !== null && (
              <span className="ml-1 text-[10px] font-sans font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                Custom
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Official portal challans passed through
          </span>
        </div>

        {/* Card 4: Pending Tokens */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs relative group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Pending Tokens
            </span>
            <button
              onClick={handleOpenSummaryModal}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
              title="Edit Pending Tokens"
            >
              <Pen className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-baseline gap-1 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            <span>{displayStats.pendingCount}</span>
            <span className="text-xs text-slate-400 font-normal">
              / {displayStats.totalRecords} total
            </span>
            {summaryOverrides.pendingCount !== undefined && summaryOverrides.pendingCount !== null && (
              <span className="ml-1 text-[10px] font-sans font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                Custom
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Awaiting portal response or signature
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, token num, or service..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {['All', 'Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                title="Clear date"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">DATE</th>
                <th className="py-3 px-3.5 whitespace-nowrap">TOKEN NUM</th>
                <th className="py-3 px-3.5 whitespace-nowrap">NAME</th>
                <th className="py-3 px-3.5 whitespace-nowrap">SERVICES</th>
                <th className="py-3 px-3.5 whitespace-nowrap">GOVERNMENT</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">GOVERNMENT FEES</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">WORK CHARGE</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">TOTAL PRICE</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">STATUS</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {records.length === 0
                        ? `No client records in ${user ? `${user.email}'s` : 'this'} Client Diary yet`
                        : 'No client records match your current filter'}
                    </p>
                    <p className="text-xs mt-1">
                      Click "New Client Entry" above to record your first client ticket for this account.
                    </p>
                    {records.length === 0 && (
                      <button
                        onClick={handleOpenNewEntry}
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Client Entry</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-3.5 font-mono whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {r.date}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {r.tokenNum}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {r.clientName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {r.services}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {r.government}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      ₹{r.governmentFees.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ₹{r.workCharge.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ₹{r.totalPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(r.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                          r.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                        title="Click to toggle status"
                      >
                        {r.status === 'Completed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{r.status}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        <a
                          href={buildWhatsAppShareUrl(formatKhataEntryShareMessage(r))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded"
                          title="Share Token Update via WhatsApp"
                          aria-label={`Share ${r.clientName} update via WhatsApp`}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={buildSmsShareUrl(formatKhataEntryShareMessage(r))}
                          className="p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded"
                          title="Share Token Update via SMS"
                          aria-label={`Share ${r.clientName} update via SMS`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleEditRecord(r)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                          title="Edit Record"
                        >
                          <Pen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: r.id, name: r.clientName })}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Sync & Data Isolation Notice */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <AlertCircle className="w-4 h-4 text-[#0284c7] shrink-0" />
          <span>Account-Scoped Ledger Sync &amp; Local Partition</span>
        </div>
        <p className="leading-relaxed">
          All ledger tickets, work charges, and summary balances are strictly isolated per Google account UID (
          <code className="text-[11px] font-mono text-[#0284c7] dark:text-sky-300">
            {user ? `users/${user.uid}/ledger` : 'local partition'}
          </code>
          ) with automatic local partition backup. Switching Google accounts dynamically loads that specific account&apos;s own ledger without cross-account data mixing. Use &quot;Export CSV&quot; anytime for offline spreadsheet backups.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete Client Record?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  This will remove the ledger entry for <strong>{deleteTarget.name}</strong> from this account&apos;s Client Diary.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecord}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Client Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingRecord ? 'Edit Client Record' : 'New Client Ticket / Entry'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TOKEN NUM
                  </label>
                  <input
                    type="text"
                    required
                    value={formTokenNum}
                    onChange={(e) => setFormTokenNum(e.target.value)}
                    placeholder="e.g. TK-1085"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CLIENT NAME
                </label>
                <input
                  type="text"
                  required
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SERVICES RENDERED
                </label>
                <input
                  type="text"
                  required
                  value={formServices}
                  onChange={(e) => setFormServices(e.target.value)}
                  placeholder="e.g. New PAN Card, Photo Resizing & Aadhaar Link"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GOVERNMENT / PORTAL
                </label>
                <input
                  type="text"
                  value={formGovernment}
                  onChange={(e) => setFormGovernment(e.target.value)}
                  placeholder="e.g. UTIITSL, Parivahan, UIDAI, EPFO"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GOVERNMENT FEES (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formGovFees}
                    onChange={(e) => setFormGovFees(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Official portal fee
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WORK CHARGE (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formWorkCharge}
                    onChange={(e) => setFormWorkCharge(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono tabular-nums"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Your center profit
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 block">
                    TOTAL PRICE (AUTO-CALCULATED)
                  </span>
                  <span className="text-xs text-blue-600/80 dark:text-blue-400">
                    Govt Fee (₹{formGovFees}) + Work Charge (₹{formWorkCharge})
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-700 dark:text-blue-300 font-mono tabular-nums">
                  ₹{(Number(formGovFees) || 0) + (Number(formWorkCharge) || 0)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    STATUS
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Completed' | 'Pending')}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NOTES (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. AWB speed post tracking"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg cursor-pointer shadow-xs"
                >
                  {editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Summary Balances Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Pen className="w-4 h-4 text-[#0284c7]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Summary Balances
                </h3>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSummaryOverrides} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can manually set or adjust these 4 summary balance figures for this account. Leaving a field blank will revert it to auto-calculation from client records.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Today's Work Charge (Net Profit) (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={overrideTodayWork}
                  onChange={(e) => setOverrideTodayWork(e.target.value)}
                  placeholder="Auto-calculated from today's tickets"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Government Fees Disbursed (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={overrideGovFees}
                  onChange={(e) => setOverrideGovFees(e.target.value)}
                  placeholder="Auto-calculated from all tickets"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Work Charge (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={overrideMonthWork}
                  onChange={(e) => setOverrideMonthWork(e.target.value)}
                  placeholder="Auto-calculated from this month's tickets"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pending Tokens (Count)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={overridePending}
                  onChange={(e) => setOverridePending(e.target.value)}
                  placeholder="Auto-calculated pending tickets count"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetSummaryOverrides}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                >
                  Reset All to Auto-Calculated
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSummaryModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0284c7] hover:bg-[#0369a1] rounded-lg cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
