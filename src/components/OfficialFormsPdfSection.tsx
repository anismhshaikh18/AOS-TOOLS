import React, { useMemo, useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  OFFICIAL_FORM_PDFS,
  OFFICIAL_PDF_PROOF_FILTERS,
  OFFICIAL_PDF_SERVICE_FILTERS,
  OfficialPdfProofFilterId,
  OfficialPdfProofTag,
  OfficialPdfServiceId,
} from '../data/officialFormsPdfs';

function getProofChipTone(tag: OfficialPdfProofTag): string {
  switch (tag) {
    case 'Forms':
      return 'bg-sky-500/12 text-[#0284c7] dark:bg-sky-400/15 dark:text-sky-300 border-sky-500/25';
    case 'PoI':
      return 'bg-blue-500/12 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300 border-blue-500/25';
    case 'PoA':
      return 'bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300 border-indigo-500/25';
    case 'PoR':
      return 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300 border-emerald-500/25';
    case 'PDB':
      return 'bg-amber-500/12 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 border-amber-500/25';
  }
}

export const OfficialFormsPdfSection: React.FC = () => {
  const [serviceFilter, setServiceFilter] = useState<OfficialPdfServiceId>('all');
  const [proofFilter, setProofFilter] = useState<OfficialPdfProofFilterId>('all');
  const [query, setQuery] = useState<string>('');

  const filteredPdfs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OFFICIAL_FORM_PDFS.filter((item) => {
      if (serviceFilter !== 'all' && item.service !== serviceFilter) return false;
      if (proofFilter !== 'all' && !item.proofTypes.includes(proofFilter)) return false;
      if (!q) return true;
      const haystack = [
        item.serviceLabel,
        item.formCode,
        item.title,
        item.applicableGroup,
        ...item.proofTypes,
        ...item.keywords,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [serviceFilter, proofFilter, query]);

  const hasActiveFilters = serviceFilter !== 'all' || proofFilter !== 'all' || query.trim() !== '';

  const resetFilters = () => {
    setServiceFilter('all');
    setProofFilter('all');
    setQuery('');
  };

  return (
    <section
      id="official-forms-pdfs"
      aria-labelledby="official-forms-pdfs-heading"
      className="rounded-3xl liquid-glass p-5 sm:p-7 border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-5 scroll-mt-24"
    >
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-sky-300/80">
            <FileText className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
            <span>Direct Official Downloads</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {filteredPdfs.length} of {OFFICIAL_FORM_PDFS.length} PDFs
            </span>
          </div>
          <h2
            id="official-forms-pdfs-heading"
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Official Forms &amp; Proof PDFs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Download Aadhaar enrolment/update forms (Forms 1–8), acceptable document lists, HoF &amp;
            Standard Certificate formats, and PAN application forms directly.
          </p>
        </div>

        {/* Compact Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-[#0284c7] dark:text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Form 1–8, HoF, PoA, 49A..."
            aria-label="Search official forms and proof PDFs"
            className="w-full min-h-[44px] pl-10 pr-10 rounded-full text-xs sm:text-sm bg-white dark:bg-[#061324] text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-sky-400/25 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/25 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear PDF search"
              className="aos-btn-icon w-7 h-7 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar: Service + Proof Type */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Service Filter Segmented Pill Track */}
        <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
          <div
            role="tablist"
            aria-label="Filter PDFs by document service"
            className="aos-segmented-track inline-flex items-center gap-1 p-1 min-w-max"
          >
            {OFFICIAL_PDF_SERVICE_FILTERS.map((svc) => {
              const active = serviceFilter === svc.id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setServiceFilter(svc.id)}
                  className={`px-3.5 py-1.5 min-h-[36px] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
                  }`}
                >
                  {svc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Proof Type Filter Pills */}
        <div
          role="group"
          aria-label="Filter PDFs by proof category"
          className="flex flex-wrap items-center gap-1.5"
        >
          {OFFICIAL_PDF_PROOF_FILTERS.map((proof) => {
            const active = proofFilter === proof.id;
            return (
              <button
                key={proof.id}
                type="button"
                aria-pressed={active}
                onClick={() => setProofFilter(proof.id)}
                className={`px-3 py-1.5 min-h-[34px] text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  active ? 'aos-btn-soft-active' : 'aos-btn-soft'
                }`}
              >
                {proof.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Cards Grid (No Full-Text Dump) */}
      {filteredPdfs.length === 0 ? (
        <div className="rounded-2xl bg-slate-50/90 dark:bg-[#071a30]/80 border border-slate-200 dark:border-sky-400/20 p-6 text-center space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            No matching PDFs found
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Try clearing the search query or selecting All Services and All Proofs.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="aos-btn-primary px-4 py-2 min-h-[40px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPdfs.map((item) => (
            <article
              key={item.id}
              className="aos-card-perf rounded-2xl bg-white/90 dark:bg-[#071a30]/90 border border-slate-200/90 dark:border-sky-400/20 p-4 flex flex-col justify-between gap-4 shadow-sm hover:border-[#0284c7]/50 dark:hover:border-sky-400/45 transition-colors"
            >
              <div className="space-y-2.5 min-w-0">
                {/* Service & Form Code */}
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                  <span className="text-[#0284c7] dark:text-sky-300 truncate">
                    {item.serviceLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0B192C] text-slate-700 dark:text-sky-200 border border-slate-200/80 dark:border-sky-400/20 shrink-0 font-mono">
                    {item.formCode}
                  </span>
                </div>

                {/* Document Title */}
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Applicable Group */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {item.applicableGroup}
                </p>

                {/* Proof Category Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {item.proofTypes.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getProofChipTone(
                        tag
                      )}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Download Action */}
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={item.isDirectPdf ? item.downloadName : undefined}
                className="aos-btn-primary w-full min-h-[42px] px-4 py-2 text-xs font-bold inline-flex items-center justify-center gap-2 text-center"
              >
                {item.isDirectPdf ? (
                  <>
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>Download PDF</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>Open Official UIDAI PDF</span>
                  </>
                )}
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
