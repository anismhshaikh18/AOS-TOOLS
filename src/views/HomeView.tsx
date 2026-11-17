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
  X,
} from 'lucide-react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
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
  const isSearchStatePushedRef = useRef(false);

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
    if (isSearchStatePushedRef.current) {
      isSearchStatePushedRef.current = false;
      if (window.history.state?.heroSearchActive) {
        window.history.back();
      }
    }
  }, []);

  // Browser back handling on mobile so pressing back closes suggestions or keyboard instead of exiting website
  const handleSearchFocus = () => {
    setIsHeroDropdownOpen(true);
    if (!isSearchStatePushedRef.current) {
      window.history.pushState({ heroSearchActive: true }, '');
      isSearchStatePushedRef.current = true;
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsHeroDropdownOpen(true);
    if (val.trim() && !isSearchStatePushedRef.current) {
      window.history.pushState({ heroSearchActive: true }, '');
      isSearchStatePushedRef.current = true;
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isSearchStatePushedRef.current) {
        isSearchStatePushedRef.current = false;
        setIsHeroDropdownOpen(false);
        setSearchQuery('');
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        heroSearchContainerRef.current &&
        !heroSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsHeroDropdownOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 130);

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
    isSearchStatePushedRef.current = false;
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
          HERO SECTION (Anis Online Services Deep Navy Corporate Styling)
          ========================================================================= */}
      <section className="relative z-20 rounded-3xl liquid-glass p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-sky-500/20">
        {/* Ambient atmospheric glows (desktop-only for smooth mobile GPU performance) */}
        <div className="hidden md:block absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0284c7]/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#0d4775]/20 rounded-full blur-3xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
          
          {/* Left Column: Headline, Search, Badges & Quick Launchers */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-sub text-[#0284c7] dark:text-sky-300 text-xs font-semibold tracking-wide border border-slate-200 dark:border-sky-500/30 shadow-xs w-fit">
              <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
              <span>{t.heroTag || 'Free • Private • Zero Uploads Browser Suite'}</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                AOS <span className="text-[#0284c7]">TOOLS</span>
              </h1>
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-sky-100 mt-2 tracking-tight">
                {t.heroTitle || 'All-in-One Digital Workstation'} <span className="text-[#0284c7]">{t.heroSubtitle || '& Citizen Utilities'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mt-3">
                {t.heroDesc || 'Complete client-side processing for official passport photo sheets, CR80 PVC ID cards, 19 PDF utilities, image optimization, and citizen client ledgers. 100% private in your browser.'}
              </p>
            </div>

            {/* Universal Search Input Bar with Deep Blue Glassmorphism Live Index Dropdown */}
            <div className="relative" ref={heroSearchContainerRef}>
              <div className="relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tools, portals (TNPDS, UTIITSL), calculators, or Client Diary..."
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
                  aria-label="Universal Search"
                  className="w-full liquid-glass-sub hover:border-slate-300 dark:hover:border-sky-500/50 focus:border-[#0284c7] text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl py-3.5 pl-5 pr-32 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsHeroDropdownOpen(true);
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Clear search query"
                      className="aos-btn-icon w-7 h-7 cursor-pointer"
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
            </div>

            {/* 3 Core Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <div className="p-3 rounded-2xl liquid-glass-sub flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                <div className="w-7 h-7 rounded-lg bg-[#0284c7]/20 flex items-center justify-center text-[#0284c7] dark:text-sky-300">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{t.freeBadge || '100% Free'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.freeBadgeSub || 'Strict ₹0-cost policy'}</span>
              </div>

              <div className="p-3 rounded-2xl liquid-glass-sub flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{t.secureBadge || 'Private & Local'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.secureBadgeSub || 'Zero files uploaded'}</span>
              </div>

              <div className="p-3 rounded-2xl liquid-glass-sub flex flex-col items-center sm:items-start text-center sm:text-left space-y-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{t.mobileBadge || 'Mobile Ready'}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.mobileBadgeSub || 'Works on all browsers'}</span>
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
