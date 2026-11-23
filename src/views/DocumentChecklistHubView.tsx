import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  X,
  RotateCcw,
  CheckCheck,
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';
import {
  CHECKLIST_CATEGORIES,
  ChecklistCategoryId,
  ChecklistToolShortcut,
  DOCUMENT_CHECKLIST_GUIDES,
  DocumentChecklistGuide,
  DocumentProofTag,
} from '../data/documentChecklists';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { ToolItem } from '../types';
import { LanguageCode, getTranslatedTool } from '../utils/translations';
import { readSessionDraft, writeSessionDraft } from '../utils/sessionDraftStorage';

interface DocumentChecklistHubViewProps {
  initialGuideId?: string | null;
  onSelectTool: (tool: ToolItem) => void;
  onNavigateTab: (tab: string) => void;
  lang?: LanguageCode;
}

const STORAGE_KEY = 'aos_doc_checklist_progress_v1';
const VIEW_DRAFT_KEY = 'aos_doc_checklist_view_v1';

interface ChecklistViewDraft {
  category: ChecklistCategoryId;
  guideId: string;
}

type CheckedMap = Record<string, string[]>;

function loadSavedProgress(): CheckedMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as CheckedMap;
    return {};
  } catch {
    return {};
  }
}

function getProofTagTone(tag: DocumentProofTag): string {
  switch (tag) {
    case 'PoI':
      return 'text-[#0284c7] dark:text-sky-300';
    case 'PoA':
      return 'text-indigo-700 dark:text-indigo-300';
    case 'PoB / DOB':
      return 'text-amber-700 dark:text-amber-300';
    case 'Photo':
    case 'Signature':
      return 'text-emerald-700 dark:text-emerald-300';
    case 'Mandatory':
      return 'text-rose-700 dark:text-rose-300';
    default:
      return 'text-slate-600 dark:text-slate-300';
  }
}

export const DocumentChecklistHubView: React.FC<DocumentChecklistHubViewProps> = ({
  initialGuideId,
  onSelectTool,
  onNavigateTab,
  lang = 'en',
}) => {
  const initialDraft = useMemo(
    () =>
      readSessionDraft<ChecklistViewDraft>(VIEW_DRAFT_KEY, {
        category: 'all',
        guideId: DOCUMENT_CHECKLIST_GUIDES[0].id,
      }),
    []
  );

  const [selectedCategory, setSelectedCategory] = useState<ChecklistCategoryId>(() =>
    initialGuideId ? 'all' : initialDraft.category
  );
  const [localQuery, setLocalQuery] = useState<string>('');
  const [activeGuideId, setActiveGuideId] = useState<string>(
    () =>
      (initialGuideId &&
        DOCUMENT_CHECKLIST_GUIDES.find((g) => g.id === initialGuideId)?.id) ||
      (DOCUMENT_CHECKLIST_GUIDES.find((g) => g.id === initialDraft.guideId)?.id ||
        DOCUMENT_CHECKLIST_GUIDES[0].id)
  );
  const [checkedMap, setCheckedMap] = useState<CheckedMap>(loadSavedProgress);

  // Persist active category & selected checklist guide in sessionStorage
  useEffect(() => {
    writeSessionDraft<ChecklistViewDraft>(VIEW_DRAFT_KEY, {
      category: selectedCategory,
      guideId: activeGuideId,
    });
  }, [selectedCategory, activeGuideId]);

  // Sync when user opens a specific checklist from global search
  useEffect(() => {
    if (!initialGuideId) return;
    const target = DOCUMENT_CHECKLIST_GUIDES.find((g) => g.id === initialGuideId);
    if (target) {
      setSelectedCategory('all');
      setLocalQuery('');
      setActiveGuideId(target.id);
    }
  }, [initialGuideId]);

  // Persist checklist selections locally (offline-friendly PWA support)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap));
    } catch {
      // Storage quota ignored gracefully
    }
  }, [checkedMap]);

  const allTools = useMemo(() => [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS], []);

  const filteredGuides = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    return DOCUMENT_CHECKLIST_GUIDES.filter((guide) => {
      if (selectedCategory !== 'all' && guide.category !== selectedCategory) return false;
      if (!q) return true;
      const haystack = [
        guide.title,
        guide.shortTitle,
        guide.summary,
        guide.categoryLabel,
        guide.portalMode,
        ...guide.keywords,
        ...guide.checklist.map((c) => `${c.label} ${c.tag} ${c.note || ''}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [selectedCategory, localQuery]);

  // Ensure active guide stays valid when filtering
  const activeGuide: DocumentChecklistGuide = useMemo(() => {
    const inFiltered = filteredGuides.find((g) => g.id === activeGuideId);
    if (inFiltered) return inFiltered;
    if (filteredGuides.length > 0) return filteredGuides[0];
    return DOCUMENT_CHECKLIST_GUIDES[0];
  }, [filteredGuides, activeGuideId]);

  const activeCheckedSet = useMemo(
    () => new Set(checkedMap[activeGuide.id] || []),
    [checkedMap, activeGuide.id]
  );

  const toggleItem = useCallback((guideId: string, itemId: string) => {
    setCheckedMap((prev) => {
      const current = new Set(prev[guideId] || []);
      if (current.has(itemId)) {
        current.delete(itemId);
      } else {
        current.add(itemId);
      }
      return { ...prev, [guideId]: Array.from(current) };
    });
  }, []);

  const handleCheckAll = useCallback((guide: DocumentChecklistGuide) => {
    setCheckedMap((prev) => ({
      ...prev,
      [guide.id]: guide.checklist.map((item) => item.id),
    }));
  }, []);

  const handleResetGuide = useCallback((guideId: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [guideId]: [],
    }));
  }, []);

  const handleTriggerShortcut = useCallback(
    (shortcut: ChecklistToolShortcut) => {
      if (shortcut.kind === 'tab') {
        onNavigateTab(shortcut.targetId);
        return;
      }
      const match = allTools.find((t) => t.id === shortcut.targetId);
      if (match) {
        onSelectTool(getTranslatedTool(match, lang));
      } else {
        onNavigateTab('tools');
      }
    },
    [allTools, lang, onNavigateTab, onSelectTool]
  );

  // Readiness calculations for active guide
  const totalCount = activeGuide.checklist.length;
  const checkedCount = activeGuide.checklist.filter((item) =>
    activeCheckedSet.has(item.id)
  ).length;
  const remainingCount = Math.max(0, totalCount - checkedCount);
  const requiredItems = activeGuide.checklist.filter((item) => item.required);
  const checkedRequiredCount = requiredItems.filter((item) =>
    activeCheckedSet.has(item.id)
  ).length;
  const remainingRequiredCount = Math.max(0, requiredItems.length - checkedRequiredCount);
  const readinessPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const isMandatoryReady = remainingRequiredCount === 0 && requiredItems.length > 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-14 animate-in fade-in duration-200">
      {/* HEADER & FILTER BAR */}
      <section className="rounded-3xl liquid-glass p-5 sm:p-7 border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-sky-300/80">
              <span>Citizen Documentation Guide</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{DOCUMENT_CHECKLIST_GUIDES.length} Service Workflows</span>
              <span aria-hidden="true">·</span>
              <span>Saved Locally</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight text-balance">
              Document Checklist &amp; Eligibility Guide Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Verify basic eligibility rules, tick off PoI, PoA, and supporting documents before applying,
              and jump straight into AOS Tools to prepare compliant photos and PDFs.
            </p>
          </div>

          {/* Inline Hub Filter Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-[#0284c7] dark:text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Filter PAN, Aadhaar, Ration, Income..."
              aria-label="Filter document checklists"
              className="w-full min-h-[44px] pl-10 pr-10 rounded-full text-xs sm:text-sm bg-white dark:bg-[#061324] text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-sky-400/25 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/25 transition-all"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery('')}
                aria-label="Clear checklist filter"
                className="aos-btn-icon w-7 h-7 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Service Category Filter Pills */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div
            role="tablist"
            aria-label="Service categories"
            className="aos-segmented-track inline-flex items-center gap-1 p-1 min-w-max"
          >
            {CHECKLIST_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 min-h-[38px] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN 2-COLUMN WORKSPACE (Desktop) / STACKED FLOW (Mobile) */}
      {filteredGuides.length === 0 ? (
        <section className="rounded-3xl liquid-glass p-8 text-center border border-slate-200 dark:border-sky-400/20 space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            No checklists match &ldquo;{localQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Try clearing the filter or choosing All Services to view all citizen workflows.
          </p>
          <button
            type="button"
            onClick={() => {
              setLocalQuery('');
              setSelectedCategory('all');
            }}
            className="aos-btn-primary px-5 py-2.5 min-h-[44px] text-xs font-bold cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Checklists</span>
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT RAIL: Service Workflows Selector */}
          <aside
            aria-label="Citizen service checklist directory"
            className="lg:col-span-4 rounded-3xl liquid-glass p-3.5 sm:p-4 border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-2"
          >
            <div className="px-2 pb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-sky-300/80 font-semibold border-b border-slate-200 dark:border-sky-400/15">
              <span>Select Service Workflow</span>
              <span className="font-mono tabular-nums">{filteredGuides.length}</span>
            </div>

            <div className="space-y-1.5 max-h-[340px] lg:max-h-[720px] overflow-y-auto pr-0.5">
              {filteredGuides.map((guide) => {
                const isSelected = guide.id === activeGuide.id;
                const saved = new Set(checkedMap[guide.id] || []);
                const done = guide.checklist.filter((c) => saved.has(c.id)).length;
                const total = guide.checklist.length;
                const reqLeft = guide.checklist.filter((c) => c.required && !saved.has(c.id)).length;

                return (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => setActiveGuideId(guide.id)}
                    className={`w-full min-h-[56px] px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0284c7] via-[#1d4ed8] to-[#0B192C] text-white border-sky-300/45 shadow-lg shadow-sky-900/25'
                        : 'bg-slate-50/90 dark:bg-[#071a30]/80 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-sky-400/15 hover:border-[#0284c7]/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div
                        className={`text-[11px] font-medium truncate ${
                          isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-sky-300/80'
                        }`}
                      >
                        {guide.categoryLabel}
                      </div>
                      <div className="text-xs sm:text-[13px] font-bold leading-snug line-clamp-2">
                        {guide.shortTitle}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className={`text-xs font-mono font-bold tabular-nums ${
                          isSelected
                            ? 'text-white'
                            : reqLeft === 0 && done > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-700 dark:text-sky-200'
                        }`}
                      >
                        {done}/{total}
                      </div>
                      <div
                        className={`text-[10px] font-medium ${
                          isSelected
                            ? 'text-sky-100'
                            : reqLeft === 0 && done > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {reqLeft === 0 && done > 0 ? 'Ready' : `${total - done} left`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* RIGHT WORKSPACE: Active Eligibility Rules, Interactive Checklist & Cross-Tool Shortcuts */}
          <section className="lg:col-span-8 rounded-3xl liquid-glass p-5 sm:p-6 border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-6">
            {/* Guide Title & Metadata */}
            <div className="space-y-2 border-b border-slate-200 dark:border-sky-400/15 pb-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500 dark:text-sky-300/80">
                <span>{activeGuide.categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{activeGuide.portalMode}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeGuide.typicalTimeline}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {activeGuide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeGuide.summary}
              </p>
            </div>

            {/* Readiness Counter & Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-[#0284c7] dark:text-sky-400 shrink-0" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {checkedCount} of {totalCount} Checked
                    </span>
                    <span className="text-xs text-slate-400" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                      {remainingCount} Remaining
                    </span>
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      isMandatoryReady
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-sky-200/80'
                    }`}
                  >
                    {isMandatoryReady
                      ? 'All mandatory documents are checked and ready for submission.'
                      : `${remainingRequiredCount} mandatory ${
                          remainingRequiredCount === 1 ? 'item' : 'items'
                        } still remaining before applying.`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCheckAll(activeGuide)}
                    className="aos-btn-soft px-3.5 py-2 min-h-[40px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300" />
                    <span>Check All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetGuide(activeGuide.id)}
                    className="aos-btn-soft px-3.5 py-2 min-h-[40px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-sky-300" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Clean Readiness Progress Bar */}
              <div
                className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-[#061324] overflow-hidden border border-slate-300/60 dark:border-sky-400/20"
                role="progressbar"
                aria-valuenow={readinessPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Document readiness progress"
              >
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    isMandatoryReady
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8]'
                  }`}
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
            </div>

            {/* Interactive Document Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-sky-400 shrink-0" />
                  <span>Required &amp; Supporting Documents</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {readinessPct}% ready
                </span>
              </div>

              <div className="divide-y divide-slate-200/80 dark:divide-sky-400/15 border-t border-b border-slate-200/80 dark:border-sky-400/15">
                {activeGuide.checklist.map((item) => {
                  const isChecked = activeCheckedSet.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleItem(activeGuide.id, item.id)}
                      className="w-full min-h-[56px] py-3.5 px-2 sm:px-3 text-left flex items-start gap-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d2744]/55 cursor-pointer"
                    >
                      <span className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 dark:text-sky-300/60" />
                        )}
                      </span>

                      <span className="flex-1 min-w-0 space-y-1">
                        <span
                          className={`block text-xs sm:text-sm font-bold leading-snug ${
                            isChecked
                              ? 'line-through text-slate-400 dark:text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.label}
                        </span>

                        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                          <span className={`font-bold ${getProofTagTone(item.tag)}`}>
                            {item.tag}
                          </span>
                          <span aria-hidden="true" className="text-slate-400">
                            ·
                          </span>
                          <span
                            className={`font-semibold ${
                              item.required
                                ? 'text-slate-700 dark:text-slate-200'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.required ? 'Required' : 'Optional / If Applicable'}
                          </span>
                          {item.note && (
                            <>
                              <span aria-hidden="true" className="text-slate-400">
                                ·
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {item.note}
                              </span>
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Eligibility Rules */}
            <div className="space-y-2.5 pt-1">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0284c7] dark:text-sky-400 shrink-0" />
                <span>Basic Eligibility &amp; Preparation Rules</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                {activeGuide.eligibilityRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-[11px] font-bold text-[#0284c7] dark:text-sky-400 mt-0.5 shrink-0 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Cross-Tool Shortcuts */}
            <div className="pt-4 border-t border-slate-200 dark:border-sky-400/15 space-y-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#0284c7] dark:text-sky-400 shrink-0" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Prepare Documents with AOS Tools
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {activeGuide.shortcuts.map((shortcut, index) => (
                  <button
                    key={`${activeGuide.id}-${shortcut.targetId}`}
                    type="button"
                    onClick={() => handleTriggerShortcut(shortcut)}
                    className={`${
                      index === 0 ? 'aos-btn-primary' : 'aos-btn-soft'
                    } min-h-[44px] px-4 py-2 text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap`}
                  >
                    <span>{shortcut.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
