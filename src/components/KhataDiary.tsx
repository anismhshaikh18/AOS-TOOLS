import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';

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

const STORAGE_KEY = 'aos_tools_khata_records_v1';
const SUMMARY_STORAGE_KEY = 'aos_tools_khata_summary_overrides_v1';

export const KhataDiary: React.FC = () => {
  const [records, setRecords] = useState<KhataRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'rec-1',
        date: new Date().toISOString().split('T')[0],
        clientName: 'Rajesh Kumar Verma',
        services: 'New PAN Card (Form 49A) & Aadhaar Link',
        tokenNum: 'TK-1082',
        government: 'Income Tax Department (Protean)',
        governmentFees: 107,
        workCharge: 100,
        totalPrice: 207,
        status: 'Completed',
        notes: 'Physical card dispatch requested',
        createdAt: Date.now() - 7200000,
      },
      {
        id: 'rec-2',
        date: new Date().toISOString().split('T')[0],
        clientName: 'Sunita Devi Sharma',
        services: 'Ayushman Bharat Golden Card & e-KYC',
        tokenNum: 'TK-1083',
        government: 'National Health Authority (NHA)',
        governmentFees: 0,
        workCharge: 80,
        totalPrice: 80,
        status: 'Completed',
        notes: 'Family ID verified via Ration card',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'rec-3',
        date: new Date().toISOString().split('T')[0],
        clientName: 'Mohammed Imtiyaz',
        services: 'Sarathi Driving Licence Renewal + Slot',
        tokenNum: 'TK-1084',
        government: 'Ministry of Road Transport (Parivahan)',
        governmentFees: 450,
        workCharge: 150,
        totalPrice: 600,
        status: 'Pending',
        notes: 'Slot booked for Friday 10:30 AM',
        createdAt: Date.now(),
      },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KhataRecord | null>(null);

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

  // Overrides
  const [summaryOverrides, setSummaryOverrides] = useState<SummaryOverrides>(() => {
    try {
      const saved = localStorage.getItem(SUMMARY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [overrideTodayWork, setOverrideTodayWork] = useState('');
  const [overrideGovFees, setOverrideGovFees] = useState('');
  const [overrideMonthWork, setOverrideMonthWork] = useState('');
  const [overridePending, setOverridePending] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaryOverrides));
    } catch {}
  }, [summaryOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {}
  }, [records]);

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
    setSummaryOverrides({
      todayWorkCharge: overrideTodayWork.trim() === '' ? null : Math.max(0, Number(overrideTodayWork)),
      totalGovFeesAll: overrideGovFees.trim() === '' ? null : Math.max(0, Number(overrideGovFees)),
      monthWorkCharge: overrideMonthWork.trim() === '' ? null : Math.max(0, Number(overrideMonthWork)),
      pendingCount: overridePending.trim() === '' ? null : Math.max(0, Number(overridePending)),
    });
    setIsSummaryModalOpen(false);
  };

  const handleResetSummaryOverrides = () => {
    setSummaryOverrides({});
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

    const govFee = Math.max(0, Number(formGovFees) || 0);
    const workCharge = Math.max(0, Number(formWorkCharge) || 0);
    const total = govFee + workCharge;

    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                date: formDate,
                clientName: formClientName.trim(),
                services: formServices.trim(),
                tokenNum: formTokenNum.trim(),
                government: formGovernment.trim() || 'General Public Service',
                governmentFees: govFee,
                workCharge: workCharge,
                totalPrice: total,
                status: formStatus,
                notes: formNotes.trim(),
              }
            : r
        )
      );
    } else {
      const newRec: KhataRecord = {
        id: `rec-${Date.now()}`,
        date: formDate,
        clientName: formClientName.trim(),
        services: formServices.trim(),
        tokenNum: formTokenNum.trim(),
        government: formGovernment.trim() || 'General Public Service',
        governmentFees: govFee,
        workCharge: workCharge,
        totalPrice: total,
        status: formStatus,
        notes: formNotes.trim(),
        createdAt: Date.now(),
      };
      setRecords((prev) => [newRec, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ledger record for "${name}"?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Completed' ? 'Pending' : 'Completed' } : r
      )
    );
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
      `AOS_Khata_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Real Client Ledger Diary (Khata)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compliant daily registry for E-Sevai, CSC operators, cyber cafes, and documentation centers.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleOpenNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
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
                    <p className="text-sm font-medium">No client records found</p>
                    <p className="text-xs mt-0.5">
                      Click "New Client Entry" above to add your first client ticket.
                    </p>
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
                        <button
                          onClick={() => handleEditRecord(r)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                          title="Edit Record"
                        >
                          <Pen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id, r.clientName)}
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

      {/* Local Storage Notice */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Local Storage Guarantee & Data Integrity</span>
        </div>
        <p className="leading-relaxed">
          Ledger records are saved strictly in your device’s browser storage (localStorage). No client names, phone records, or fees are uploaded to remote cloud databases. Please export regular CSV backups via the "Export CSV" button, as clearing your browser cache will erase offline records.
        </p>
      </div>

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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
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
                <Pen className="w-4 h-4 text-blue-600" />
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
                You can manually set or adjust these 4 summary balance figures. Leaving a field blank will revert it to auto-calculation from client records.
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
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
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
