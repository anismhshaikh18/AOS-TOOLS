import React, { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Search,
  Zap,
  Lock,
  Smartphone,
  Camera,
  CreditCard,
  FileText,
  BookOpen,
  Mic,
  MicOff,
  Calculator,
  ClipboardCheck,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { DynamicIcon } from '../components/DynamicIcon';
import { PanMasterHeroCard } from '../components/PanMasterHeroCard';
import { AosPromoBanner } from '../components/AosPromoBanner';
import { LanguageCode, TRANSLATIONS, getTranslatedTool } from '../utils/translations';
import { useAuthSecurity } from '../context/AuthSecurityContext';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  buildUniversalIndex,
  getUniversalKindCounts,
  searchUniversalIndex,
  UniversalResultKind,
} from '../utils/universalSearchIndex';
import { UniversalSearchResults } from '../components/UniversalSearchResults';

const LiveStatusNoticeWidget = lazy(() =>
  import('../components/LiveStatusNoticeWidget').then((m) => ({
    default: m.LiveStatusNoticeWidget,
  }))
);

interface HomeViewProps {
  onSelectTool: (tool: ToolItem) => void;
  setActiveTab: (tab: string) => void;
  onOpenSearch?: () => void;
  templateId?: string;
  lang?: LanguageCode;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTool,
  setActiveTab,
  onOpenSearch,
  lang = 'en',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeroDropdownOpen, setIsHeroDropdownOpen] = useState(false);
  const [heroKindFilter, setHeroKindFilter] = useState<'all' | UniversalResultKind>('all');
  const [heroActiveIndex, setHeroActiveIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const heroSearchContainerRef = useRef<HTMLDivElement>(null);

  const { user, isToolCurrentlyLocked } = useAuthSecurity();
  const isClientDiaryLocked = isToolCurrentlyLocked('khata-diary');
  const isPortalsLocked = isToolCurrentlyLocked('gov-portals');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const { isSupported: voiceSupported, isListening, startListening } = useVoiceSearch(
    lang,
    (transcript) => {
      setSearchQuery(transcript);
      setIsHeroDropdownOpen(true);
    }
  );

  const closeSearchSuggestions = useCallback((clearInput = false) => {
    setIsHeroDropdownOpen(false);
    if (clearInput) {
      setSearchQuery('');
    }
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }, []);

  const handleSearchFocus = () => {
    setIsHeroDropdownOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsHeroDropdownOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        heroSearchContainerRef.current &&
        !heroSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsHeroDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 60);

  const universalIndex = useMemo(
    () =>
      isHeroDropdownOpen || debouncedSearchQuery.trim().length > 0
        ? buildUniversalIndex({
            lang,
            userId: user?.uid || null,
            isToolLocked: isToolCurrentlyLocked,
          })
        : [],
    [isHeroDropdownOpen, debouncedSearchQuery, lang, user?.uid, isToolCurrentlyLocked]
  );

  const heroCounts = useMemo(
    () => getUniversalKindCounts(universalIndex, debouncedSearchQuery),
    [universalIndex, debouncedSearchQuery]
  );

  const heroResults = useMemo(
    () => searchUniversalIndex(universalIndex, debouncedSearchQuery, heroKindFilter, 20),
    [universalIndex, debouncedSearchQuery, heroKindFilter]
  );

  useEffect(() => {
    setHeroActiveIndex(0);
  }, [debouncedSearchQuery, heroKindFilter]);

  const finishHeroSelection = useCallback(() => {
    setIsHeroDropdownOpen(false);
    setSearchQuery('');
  }, []);

  const triggerHeroActiveItem = useCallback(() => {
    const selected = heroResults[heroActiveIndex];
    if (!selected) return;
    const { item, resolvedPortalUrl } = selected;
    if (item.kind === 'tool' && item.tool) {
      onSelectTool(item.tool);
      finishHeroSelection();
      return;
    }
    if (item.kind === 'portal') {
      if (item.isLocked && item.targetTab) {
        setActiveTab(item.targetTab);
      } else if (resolvedPortalUrl) {
        const anchor = document.createElement('a');
        anchor.href = resolvedPortalUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
      }
      finishHeroSelection();
      return;
    }
    if (item.kind === 'utility') {
      if (item.tool) onSelectTool(item.tool);
      else if (item.targetTab) setActiveTab(item.targetTab);
      finishHeroSelection();
      return;
    }
    if (item.kind === 'diary' && item.targetTab) {
      setActiveTab(item.targetTab);
      finishHeroSelection();
    }
  }, [heroResults, heroActiveIndex, onSelectTool, setActiveTab, finishHeroSelection]);

  // Direct launcher helpers
  const handleLaunchPassport = () => {
    const passportTool =
      IMAGE_TOOLS.find((item) => item.id === 'passport-photo-studio') ||
      IMAGE_TOOLS.find((item) => item.id === 'passport-photo-sheet');
    if (passportTool) {
      onSelectTool(getTranslatedTool(passportTool, lang));
    } else {
      setActiveTab('image');
    }
  };

  const handleLaunchIdStudio = () => {
    const idTool =
      SPECIAL_TOOLS.find((item) => item.id === 'smart-id-card-studio') ||
      SPECIAL_TOOLS.find((item) => item.id === 'id-card-maker');
    if (idTool) {
      onSelectTool(getTranslatedTool(idTool, lang));
    } else {
      setActiveTab('special');
    }
  };

  const handleLaunchQuickCalculators = () => {
    const calcTool = SPECIAL_TOOLS.find((item) => item.id === 'quick-calculator-suite');
    if (calcTool) {
      onSelectTool(getTranslatedTool(calcTool, lang));
    } else {
      setActiveTab('special');
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* =========================================================================
          HERO SECTION (Modern Light Architectural + Deep Navy Dark Mode)
          ========================================================================= */}
      <section className="relative z-20 rounded-3xl liquid-glass p-6 sm:p-10 lg:p-11 border border-slate-200/80 dark:border-sky-500/20 overflow-visible">
        {/* Subtle top rim accent & ambient light aura (desktop-only for smooth mobile GPU performance) */}
        <div className="hidden md:block absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#0284c7]/45 to-transparent" />
          <div className="absolute -top-16 right-1/4 w-96 h-96 bg-[#0ea5e9]/10 dark:bg-[#0284c7]/16 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-8 w-80 h-80 bg-indigo-500/8 dark:bg-[#0d4775]/20 rounded-full blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch relative z-10">
          
          {/* Left Column: Headline, Search, Quick Launchers & Value Strip */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            
            {/* Clean Editorial Kicker (Zero Pulsing Dot / Zero Pill Clutter) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0284c7] dark:text-sky-300 tracking-tight">
              <span>{t.heroTag || 'Free · Private · Zero Uploads Browser Suite'}</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.06]">
                AOS{' '}
                <span className="bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#1d4ed8] dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                  TOOLS
                </span>
              </h1>
              <div className="font-display text-xl sm:text-2xl font-bold text-slate-800 dark:text-sky-100 tracking-tight leading-snug">
                {t.heroTitle || 'All-in-One Digital Workstation'}{' '}
                <span className="text-[#0284c7] dark:text-sky-400">
                  {t.heroSubtitle || '& Citizen Utilities'}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                {t.heroDesc || 'Complete client-side processing for official passport photo sheets, CR80 PVC ID cards, 19 PDF utilities, image optimization, and citizen client ledgers. 100% private in your browser.'}
              </p>
            </div>

            {/* Animated-Border Pill Search Bar with Instant Multi-Index Filtering */}
            <div className="relative" ref={heroSearchContainerRef}>
              <div className="aos-search-pill-wrap">
                <div className="aos-search-pill-inner">
                  <Search className="w-4 h-4 text-[#0284c7] dark:text-sky-400 ml-4 shrink-0 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search utility tools..."
                    value={searchQuery}
                    onFocus={handleSearchFocus}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        closeSearchSuggestions(true);
                      } else if (e.key === 'ArrowDown' && heroResults.length > 0) {
                        e.preventDefault();
                        setIsHeroDropdownOpen(true);
                        setHeroActiveIndex((prev) => (prev + 1) % heroResults.length);
                      } else if (e.key === 'ArrowUp' && heroResults.length > 0) {
                        e.preventDefault();
                        setIsHeroDropdownOpen(true);
                        setHeroActiveIndex(
                          (prev) => (prev - 1 + heroResults.length) % heroResults.length
                        );
                      } else if (e.key === 'Enter') {
                        if (isHeroDropdownOpen && heroResults.length > 0) {
                          e.preventDefault();
                          triggerHeroActiveItem();
                        } else if (onOpenSearch) {
                          onOpenSearch();
                        }
                      }
                    }}
                    aria-label="Search utility tools"
                    className="aos-search-pill-input w-full py-3.5 pl-3 pr-28 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-sky-200/60"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsHeroDropdownOpen(true);
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Clear search query"
                        className="aos-btn-icon w-8 h-8 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {voiceSupported && (
                      <button
                        type="button"
                        onClick={startListening}
                        aria-label={isListening ? 'Stop voice search' : 'Voice search'}
                        title={isListening ? 'Listening... tap to stop' : 'Voice Search (Multi-language)'}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-md'
                            : 'aos-btn-icon text-[#0284c7] dark:text-sky-300'
                        }`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenSearch) onOpenSearch();
                        else setIsHeroDropdownOpen(true);
                      }}
                      aria-label="Open Universal Search Palette"
                      title="Open Universal Search Palette (/ or Ctrl+K)"
                      className="aos-btn-primary w-10 h-10 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Search className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Universal Multi-Index Search Dropdown (Tools, Portals, Utilities, Client Diary) */}
              {isHeroDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-[#0B192C]/96 md:backdrop-blur-xl border border-slate-200 dark:border-sky-400/30 shadow-2xl overflow-hidden z-40">
                  <UniversalSearchResults
                    results={heroResults}
                    query={debouncedSearchQuery}
                    activeFilter={heroKindFilter}
                    onChangeFilter={setHeroKindFilter}
                    counts={heroCounts}
                    activeIndex={heroActiveIndex}
                    onSelectTool={(tool) => {
                      onSelectTool(tool);
                      finishHeroSelection();
                    }}
                    onNavigateTab={(tab) => {
                      setActiveTab(tab);
                      finishHeroSelection();
                    }}
                    onAfterSelect={finishHeroSelection}
                    maxHeightClass="max-h-80"
                    showDiaryTab={!isClientDiaryLocked}
                  />
                </div>
              )}
            </div>

            {/* Quick Studio Launch CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handleLaunchPassport}
                className="aos-btn-primary min-h-[44px] flex items-center gap-2 px-5 py-2.5 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>{t.passportStudioTitle || 'Passport Photo Studio'}</span>
              </button>

              <button
                onClick={handleLaunchIdStudio}
                className="aos-btn-soft min-h-[44px] flex items-center gap-2 px-4 py-2.5 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                <CreditCard className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <span>{t.smartIdTitle || 'Smart ID Card Studio'}</span>
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className="aos-btn-soft min-h-[44px] flex items-center gap-2 px-4 py-2.5 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <span>{t.pdf || '19 PDF Tools'}</span>
              </button>

              <button
                onClick={() => setActiveTab('khata')}
                className="aos-btn-soft min-h-[44px] flex items-center gap-2 px-4 py-2.5 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <span>{t.khataDiaryTitle || 'Client Diary'}</span>
                {isClientDiaryLocked && (
                  <Lock className="w-3 h-3 text-[#0284c7] dark:text-sky-300 shrink-0" />
                )}
              </button>

              <button
                onClick={handleLaunchQuickCalculators}
                className="aos-btn-soft min-h-[44px] flex items-center gap-2 px-4 py-2.5 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <span>Quick Calculators</span>
              </button>

              <button
                onClick={() => setActiveTab('checklists')}
                className="aos-btn-soft min-h-[44px] flex items-center gap-2 px-4 py-2.5 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                <ClipboardCheck className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <span>Document Checklists</span>
              </button>
            </div>

            {/* 3 Core Trust Pillars — Clean Hairline-Divided Strip (Zero Nested Card Clutter) */}
            <div className="grid grid-cols-3 divide-x divide-slate-200/80 dark:divide-sky-500/20 pt-4 border-t border-slate-200/80 dark:border-sky-500/20">
              <div className="pr-2 sm:pr-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                <div className="inline-flex items-center gap-1.5 text-[#0284c7] dark:text-sky-300">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.freeBadge || '100% Free'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {t.freeBadgeSub || 'Strict ₹0-cost policy'}
                </span>
              </div>

              <div className="px-2 sm:px-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.secureBadge || 'Private & Local'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {t.secureBadgeSub || 'Zero files uploaded'}
                </span>
              </div>

              <div className="pl-2 sm:pl-4 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.mobileBadge || 'Mobile Ready'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {t.mobileBadgeSub || 'Works on all browsers'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Interactive PAN Master Preview Card - Expanded & Balanced on Desktop */}
          <div className="lg:col-span-6 flex flex-col justify-center w-full">
            <div className="w-full">
              <PanMasterHeroCard
                onOpenFullHub={() => setActiveTab('pan')}
                onLaunchImageResize={() => {
                  const photoTool = IMAGE_TOOLS.find((tool) => tool.id === 'photo-signature-resize');
                  if (photoTool) onSelectTool(getTranslatedTool(photoTool, lang));
                }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          PRODUCTIVITY & SECURITY UTILITIES (Zero External APIs · Category Showcase)
          ========================================================================= */}
      <section className="rounded-3xl liquid-glass p-6 sm:p-8 border border-slate-200/80 dark:border-sky-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-sky-500/20">
          <div>
            <p className="text-xs font-semibold text-[#0284c7] dark:text-sky-300">
              Instant Browser Utilities · Zero External APIs
            </p>
            <h2 className="font-display text-2xl sm:text-[1.75rem] font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Productivity &amp; Security Toolkit
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className="aos-btn-soft px-4 py-2 min-h-[40px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Category 1: Productivity Utilities */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-slate-700 dark:text-sky-200 tracking-tight">
                Productivity Utilities
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Local Storage · 60fps
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {['typing-test', 'todo-list', 'notes-app', 'stopwatch'].map((id) => {
                const raw = SPECIAL_TOOLS.find((tool) => tool.id === id);
                if (!raw) return null;
                const localized = getTranslatedTool(raw, lang);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectTool(localized)}
                    className="p-4 rounded-2xl liquid-glass-sub hover:border-[#0284c7]/50 hover:-translate-y-0.5 hover:shadow-md text-left transition-all cursor-pointer group flex items-start gap-3.5 min-h-[86px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100/80 dark:from-[#0d4775]/65 dark:to-[#072642] border border-sky-200/80 dark:border-sky-400/25 text-[#0284c7] dark:text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <DynamicIcon name={localized.iconName} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 truncate transition-colors">
                          {localized.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {localized.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category 2: Security & Web Utilities */}
          <div className="lg:col-span-5 space-y-3.5 lg:pl-6 lg:border-l lg:border-slate-200/75 dark:lg:border-sky-500/20">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-slate-700 dark:text-sky-200 tracking-tight">
                Security &amp; Web Utilities
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>On-Device Crypto</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3.5">
              {['password-generator', 'url-encoder-decoder'].map((id) => {
                const raw = SPECIAL_TOOLS.find((tool) => tool.id === id);
                if (!raw) return null;
                const localized = getTranslatedTool(raw, lang);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectTool(localized)}
                    className="p-4 rounded-2xl liquid-glass-sub hover:border-[#0284c7]/50 hover:-translate-y-0.5 hover:shadow-md text-left transition-all cursor-pointer group flex items-start gap-3.5 min-h-[86px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/25 group-hover:scale-105 transition-transform">
                      <DynamicIcon name={localized.iconName} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 truncate transition-colors">
                          {localized.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {localized.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          AOS LIVE STATUS & NOTICE BOARD WIDGET (Lazy-loaded below fold)
          ========================================================================= */}
      <Suspense fallback={null}>
        <LiveStatusNoticeWidget />
      </Suspense>

      {/* =========================================================================
          AOS TOOLS PROMOTIONAL ECOSYSTEM BANNER
          ========================================================================= */}
      <AosPromoBanner
        onOpenPortals={() => setActiveTab('portals')}
        onOpenDiary={() => setActiveTab('khata')}
        onOpenUtilities={() => setActiveTab('tools')}
        isPortalsLocked={isPortalsLocked}
        isDiaryLocked={isClientDiaryLocked}
      />

    </div>
  );
};
