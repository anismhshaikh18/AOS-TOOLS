import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Type,
  Calculator,
  Copy,
  Check,
  Send,
  RotateCcw,
} from 'lucide-react';
import { buildWhatsAppShareUrl } from '../utils/shareUtils';

type CalcTab = 'age' | 'word' | 'fee';

const FEE_PRESETS = [
  { label: 'PAN Card New / Update', govFee: 107, workCharge: 143 },
  { label: 'Smart Ration Card Print', govFee: 0, workCharge: 50 },
  { label: 'Aadhaar PVC / Download', govFee: 50, workCharge: 50 },
  { label: 'Income / Community Cert', govFee: 60, workCharge: 90 },
  { label: 'Passport Photo + Sheet', govFee: 0, workCharge: 60 },
];

export const QuickCalculatorSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalcTab>('age');

  // 1. Age Calculator State
  const [dob, setDob] = useState('2000-01-01');
  const [asOfDate, setAsOfDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );

  // 2. Word / Typing Counter State
  const [sampleText, setSampleText] = useState('');
  const [copiedWordStats, setCopiedWordStats] = useState(false);

  // 3. Cyber Cafe Fee & Commission Calculator State
  const [serviceName, setServiceName] = useState('PAN Card Application');
  const [govFee, setGovFee] = useState(107);
  const [workCharge, setWorkCharge] = useState(143);
  const [quantity, setQuantity] = useState(1);
  const [commissionPct, setCommissionPct] = useState(0);
  const [cashTendered, setCashTendered] = useState(250);

  const ageMetrics = useMemo(() => {
    if (!dob || !asOfDate) return null;
    const d1 = new Date(dob);
    const d2 = new Date(asOfDate);
    if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime()) || d1 > d2) {
      return null;
    }

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    const nextBday = new Date(d2.getFullYear(), d1.getMonth(), d1.getDate());
    if (nextBday < d2) {
      nextBday.setFullYear(d2.getFullYear() + 1);
    }
    const nextBirthdayDays = Math.ceil(
      (nextBday.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)
    );

    return { years, months, days, totalDays, totalWeeks, totalHours, nextBirthdayDays };
  }, [dob, asOfDate]);

  const textMetrics = useMemo(() => {
    const trimmed = sampleText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const charsWithSpaces = sampleText.length;
    const charsNoSpaces = sampleText.replace(/\s/g, '').length;
    const sentences = trimmed
      ? trimmed.split(/[.!?।]+/).filter((s) => s.trim().length > 0).length
      : 0;
    const paragraphs = trimmed
      ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length
      : 0;
    const readingSeconds = words > 0 ? Math.max(1, Math.ceil((words / 200) * 60)) : 0;
    const bytes = new Blob([sampleText]).size;

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingSeconds,
      bytes,
    };
  }, [sampleText]);

  const feeSummary = useMemo(() => {
    const qty = Math.max(1, quantity);
    const totalGov = Math.max(0, govFee) * qty;
    const baseService = Math.max(0, workCharge) * qty;
    const extraCommission = Math.round((baseService * Math.max(0, commissionPct)) / 100);
    const netProfit = baseService + extraCommission;
    const grandTotal = totalGov + netProfit;
    const balanceOrChange = cashTendered - grandTotal;

    const whatsappSummary = [
      `*AOS FEE ESTIMATE · QUOTATION*`,
      `Service: ${serviceName || 'Citizen Service'} × ${qty}`,
      `Official Govt Fee: ₹${totalGov.toLocaleString('en-IN')}`,
      `Center Service Charge: ₹${netProfit.toLocaleString('en-IN')}`,
      `*Total Payable: ₹${grandTotal.toLocaleString('en-IN')}/-*`,
      '',
      'Prepared at Anis Online Services · AOS Tools',
    ].join('\n');

    return {
      totalGov,
      netProfit,
      extraCommission,
      grandTotal,
      balanceOrChange,
      whatsappUrl: buildWhatsAppShareUrl(whatsappSummary),
    };
  }, [serviceName, govFee, workCharge, quantity, commissionPct, cashTendered]);

  return (
    <div className="space-y-5">
      {/* Deep Blue Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#0B192C] border border-sky-400/25">
        {[
          { id: 'age', label: 'Age Calculator', icon: Calendar },
          { id: 'word', label: 'Word Counter', icon: Type },
          { id: 'fee', label: 'Cafe Fee Calculator', icon: Calculator },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CalcTab)}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-md'
                  : 'text-sky-200/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. AGE CALCULATOR */}
      {activeTab === 'age' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cutoff / Exam Reference Date
              </label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1">
              Exam Cutoffs:
            </span>
            {[
              { label: 'Today', date: new Date().toISOString().split('T')[0] },
              { label: `Jan 1 (${new Date().getFullYear()})`, date: `${new Date().getFullYear()}-01-01` },
              { label: `Jul 1 (${new Date().getFullYear()})`, date: `${new Date().getFullYear()}-07-01` },
              { label: `Aug 1 (${new Date().getFullYear()})`, date: `${new Date().getFullYear()}-08-01` },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setAsOfDate(preset.date)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#072642] border border-slate-200 dark:border-sky-500/25 text-slate-700 dark:text-sky-200 hover:border-[#0284c7] font-semibold cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {ageMetrics ? (
            <div className="guide-banner-dark p-5 rounded-2xl bg-[#0B192C] text-white border border-sky-400/25 space-y-4">
              <div className="text-center">
                <span className="text-[11px] uppercase tracking-wider font-bold text-sky-300">
                  Exact Chronological Age
                </span>
                <div className="text-2xl sm:text-3xl font-black mt-1 tabular-nums">
                  {ageMetrics.years} <span className="text-sm font-medium text-sky-200">Yrs</span>{' '}
                  {ageMetrics.months} <span className="text-sm font-medium text-sky-200">Mos</span>{' '}
                  {ageMetrics.days} <span className="text-sm font-medium text-sky-200">Days</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 text-center text-xs">
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-sky-200/80 block">Total Days</span>
                  <span className="font-bold font-mono">{ageMetrics.totalDays.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-sky-200/80 block">Total Weeks</span>
                  <span className="font-bold font-mono">{ageMetrics.totalWeeks.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-sky-200/80 block">Total Hours</span>
                  <span className="font-bold font-mono">{ageMetrics.totalHours.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] text-sky-200/80 block">Next Birthday</span>
                  <span className="font-bold text-emerald-300 font-mono">
                    {ageMetrics.nextBirthdayDays} days
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-800 dark:text-amber-200">
              Ensure Date of Birth is earlier than or equal to the Cutoff Date.
            </div>
          )}
        </div>
      )}

      {/* 2. WORD & TYPING COUNTER */}
      {activeTab === 'word' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: 'Words', value: textMetrics.words },
              { label: 'Chars (All)', value: textMetrics.charsWithSpaces },
              { label: 'Chars (No Space)', value: textMetrics.charsNoSpaces },
              { label: 'UTF-8 Bytes', value: textMetrics.bytes },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl bg-[#0B192C] text-white border border-sky-400/25 text-center"
              >
                <div className="text-lg font-black font-mono tabular-nums text-sky-300">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-sky-100/80 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <textarea
            rows={6}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Paste application form text, affidavit draft, or citizen statement here to inspect exact word, character, sentence & byte limits..."
            className="w-full p-3.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-slate-600 dark:text-slate-300 font-mono">
              Sentences: <strong>{textMetrics.sentences}</strong> · Paragraphs:{' '}
              <strong>{textMetrics.paragraphs}</strong> · Read Time:{' '}
              <strong>~{textMetrics.readingSeconds}s</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSampleText((s) => s.replace(/\s+/g, ' ').trim())}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#072642] border border-slate-200 dark:border-sky-500/25 text-slate-700 dark:text-sky-200 font-semibold cursor-pointer"
              >
                Clean Extra Spaces
              </button>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(sampleText);
                  setCopiedWordStats(true);
                  setTimeout(() => setCopiedWordStats(false), 1800);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0284c7] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedWordStats ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWordStats ? 'Copied' : 'Copy Text'}</span>
              </button>
              {sampleText && (
                <button
                  type="button"
                  onClick={() => setSampleText('')}
                  className="p-1.5 rounded-xl bg-red-500/10 text-red-500 cursor-pointer"
                  title="Clear text"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. CYBER CAFE FEE & COMMISSION CALCULATOR */}
      {activeTab === 'fee' && (
        <div className="space-y-4">
          {/* Quick Service Presets */}
          <div className="flex flex-wrap gap-1.5">
            {FEE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setServiceName(p.label);
                  setGovFee(p.govFee);
                  setWorkCharge(p.workCharge);
                  setCashTendered((p.govFee + p.workCharge) * quantity);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#072642] hover:border-[#0284c7] border border-slate-200 dark:border-sky-500/25 text-[11px] font-semibold text-slate-700 dark:text-sky-200 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service Label
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Govt Fee (₹ / unit)
              </label>
              <input
                type="number"
                min={0}
                value={govFee}
                onChange={(e) => setGovFee(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Service / Work Charge (₹ / unit)
              </label>
              <input
                type="number"
                min={0}
                value={workCharge}
                onChange={(e) => setWorkCharge(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity / Forms Count
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Extra Commission / Margin (%)
              </label>
              <input
                type="number"
                min={0}
                max={200}
                value={commissionPct}
                onChange={(e) => setCommissionPct(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cash / UPI Tendered (₹)
              </label>
              <input
                type="number"
                min={0}
                value={cashTendered}
                onChange={(e) => setCashTendered(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="guide-banner-dark p-4 rounded-2xl bg-[#0B192C] text-white border border-sky-400/30 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
            <div>
              <span className="text-[10px] uppercase text-sky-200/80 block">Govt Challan</span>
              <span className="text-base font-bold font-mono">
                ₹{feeSummary.totalGov.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-emerald-300 block">Operator Profit</span>
              <span className="text-base font-bold font-mono text-emerald-300">
                ₹{feeSummary.netProfit.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-sky-200/80 block">Client Grand Total</span>
              <span className="text-xl font-black font-mono text-white">
                ₹{feeSummary.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-sky-200/80 block">
                {feeSummary.balanceOrChange >= 0 ? 'Change to Return' : 'Balance Due'}
              </span>
              <span
                className={`text-base font-bold font-mono ${
                  feeSummary.balanceOrChange >= 0 ? 'text-sky-300' : 'text-amber-300'
                }`}
              >
                ₹{Math.abs(feeSummary.balanceOrChange).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href={feeSummary.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share Quote via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
