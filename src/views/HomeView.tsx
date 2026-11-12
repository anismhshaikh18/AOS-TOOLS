import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Zap,
  Lock,
  Smartphone,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Camera,
  CreditCard,
  FileText,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Headphones,
  Unlock,
} from 'lucide-react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { PanMasterHeroCard } from '../components/PanMasterHeroCard';
import {
  PassportIllustrationSvg,
  IdCardIllustrationSvg,
  PdfSuiteIllustrationSvg,
  SupportHelpIllustrationSvg,
} from '../components/ServiceIllustrationsSvg';
import { AosLogoSvg } from '../components/AosLogoSvg';
import { LanguageCode, TRANSLATIONS, getTranslatedTool } from '../utils/translations';

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isSearchStatePushedRef = useRef(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Browser back handling on mobile so pressing back closes suggestions or keyboard instead of exiting website
  const handleSearchFocus = () => {
    if (!isSearchStatePushedRef.current) {
      window.history.pushState({ heroSearchActive: true }, '');
      isSearchStatePushedRef.current = true;
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim() && !isSearchStatePushedRef.current) {
      window.history.pushState({ heroSearchActive: true }, '');
      isSearchStatePushedRef.current = true;
    }
  };

  const closeSearchSuggestions = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    if (isSearchStatePushedRef.current) {
      isSearchStatePushedRef.current = false;
      if (window.history.state?.heroSearchActive) {
        window.history.back();
      }
    }
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isSearchStatePushedRef.current) {
        isSearchStatePushedRef.current = false;
        setSearchQuery('');
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const allTools = [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS].map((tool) =>
    getTranslatedTool(tool, lang)
  );

  const filteredTools = searchQuery.trim()
    ? allTools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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

  const handleLaunchUnlockPdf = () => {
    const unlockTool = PDF_TOOLS.find((item) => item.id === 'unlock-pdf');
    if (unlockTool) {
      onSelectTool(getTranslatedTool(unlockTool, lang));
    } else {
      setActiveTab('pdf');
    }
  };

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* =========================================================================
          HERO SECTION (Anis Online Services Deep Navy Corporate Styling)
          ========================================================================= */}
      <section className="relative rounded-3xl liquid-glass p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-200 dark:border-sky-500/20">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0284c7]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#0d4775]/20 rounded-full blur-3xl pointer-events-none" />

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

            {/* Search Input Bar with Corporate Sapphire Circular Button */}
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.searchBarPlaceholder || 'Search for tools... (e.g. Passport Photo, Smart ID, PDF to Word)'}
                  value={searchQuery}
                  onFocus={handleSearchFocus}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      closeSearchSuggestions();
                    } else if (e.key === 'Enter' && onOpenSearch) {
                      onOpenSearch();
                    }
                  }}
                  className="w-full liquid-glass-sub hover:border-slate-300 dark:hover:border-sky-500/50 focus:border-[#0284c7] text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl py-3.5 pl-5 pr-14 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
                />
                <button
                  onClick={() => {
                    if (onOpenSearch) onOpenSearch();
                  }}
                  aria-label="Search Tools"
                  className="absolute right-2 w-10 h-10 bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md shadow-sky-500/25 active:scale-95"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick search dropdown if user typed in hero input */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 liquid-glass rounded-2xl p-2 shadow-2xl z-30 max-h-64 overflow-y-auto space-y-1">
                  {filteredTools.length > 0 ? (
                    filteredTools.slice(0, 6).map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          onSelectTool(tool);
                          isSearchStatePushedRef.current = false;
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{tool.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{tool.shortDesc}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/30 font-medium">
                          {tool.category}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
                      No tools found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Studio Launch CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleLaunchPassport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{t.passportStudioTitle || 'Passport Photo Studio'}</span>
              </button>

              <button
                onClick={handleLaunchIdStudio}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass-sub hover:border-[#0284c7] text-slate-700 dark:text-slate-100 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <CreditCard className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
                <span>{t.smartIdTitle || 'Smart ID Card Studio'}</span>
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass-sub hover:border-[#0284c7] text-slate-700 dark:text-slate-100 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <FileText className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
                <span>{t.pdf || '19 PDF Tools'}</span>
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
          SPECIALIZED PRODUCTION TOOLS (Liquid Glass Cards)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0284c7] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.specializedSub || 'Flagship Creative & Document Suites'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {t.specializedHeader || 'Specialized Production Tools'}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('tools')}
            className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] dark:hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>{t.viewAll || 'View All 50+ Tools'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Studio Card 1: Passport Photo Studio */}
          <div
            onClick={handleLaunchPassport}
            className="rounded-2xl liquid-glass liquid-glass-hover p-5 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl liquid-glass-sub flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
                  <PassportIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/30 font-bold whitespace-nowrap shrink-0 inline-flex items-center">
                  STUDIO CROP &amp; PRINT
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors">
                  {t.passportStudioTitle || 'Passport Photo Studio'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {t.passportStudioDesc || 'Generate 4×6 (8 or 6 photos) and A4 (30 or 36) studio sheets. SSC, UPSC, and Police exam standard DOP & Candidate name printing with red laser cut guides.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-sky-300">
              <span>{t.openTool || 'Open Studio'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Studio Card 2: Smart ID Card Studio */}
          <div
            onClick={handleLaunchIdStudio}
            className="rounded-2xl liquid-glass liquid-glass-hover p-5 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl liquid-glass-sub flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
                  <IdCardIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-sky-600/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold whitespace-nowrap shrink-0 inline-flex items-center">
                  CR80 300 DPI
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors">
                  {t.smartIdTitle || 'Smart ID Card Studio'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {t.smartIdDesc || 'Design official CR80 PVC identity cards (85.6 × 54 mm). Live QR code generator, candidate photo & signature, custom headers, and print sheets.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-sky-300">
              <span>{t.launchTool || 'Launch Studio'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Studio Card 3: 19 PDF Tools Suite */}
          <div
            onClick={() => setActiveTab('pdf')}
            className="rounded-2xl liquid-glass liquid-glass-hover p-5 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl liquid-glass-sub flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
                  <PdfSuiteIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold whitespace-nowrap shrink-0 inline-flex items-center">
                  19 UTILITIES
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors">
                  {t.pdfPowerSuiteTitle || '19+ PDF Power Suite'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {t.pdfPowerSuiteDesc || 'Merge, Split, Compress, Rotate, Watermark, Page Numbering, AES Encrypt, Unlock, PDF to JPG/Word, and Booklet imposition — entirely offline.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#0284c7] dark:text-sky-400 group-hover:text-[#0369a1] dark:group-hover:text-sky-300">
              <span>{t.viewAll || 'Explore All 19'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Studio Card 4: Client Khata Ledger Diary */}
          <div
            onClick={() => setActiveTab('khata')}
            className="rounded-2xl liquid-glass liquid-glass-hover p-5 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="w-14 h-14 rounded-2xl liquid-glass-sub flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
                  <SupportHelpIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold whitespace-nowrap shrink-0 inline-flex items-center">
                  CITIZEN LEDGER
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {t.khataDiaryTitle || 'Client Khata Ledger Diary'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  {t.khataDiaryDesc || 'Store customer credit/debit records, send instant WhatsApp payment reminders, search transactions, and export ledger sheets securely.'}
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500">
              <span>{t.openTool || 'Open Khata Diary'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          ANIS ONLINE SERVICES PROMOTIONAL BANNER
          ========================================================================= */}
      <section className="relative rounded-3xl liquid-glass p-6 sm:p-10 shadow-xl space-y-6 overflow-hidden border border-slate-200 dark:border-sky-500/20">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0284c7]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0d4775]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            {/* Partner Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-sub text-[#0284c7] dark:text-sky-300 text-[11px] font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
              <span>{t.partnerBadge || 'OFFICIAL DIGITAL SERVICES PARTNER · ANIS ONLINE SERVICES'}</span>
            </div>

            {/* Banner Headline & Text */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {t.partnerHeadline || 'Need Professional Assistance with Government & Citizen Applications?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {t.partnerDesc || 'Experience verified, reliable citizen support handled directly by Anis Online Services. From official documentation to online government submissions, get your work done accurately without hassle.'}
              </p>
            </div>

            {/* Verified Support Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="px-3.5 py-1.5 rounded-full liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 font-medium transition-colors shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
                <span>Aadhaar Update &amp; e-KYC Support</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 font-medium transition-colors shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
                <span>PAN Card (Form 49A / Correction / Reprint)</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 font-medium transition-colors shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
                <span>Online Government Documentation &amp; Affidavits</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 font-medium transition-colors shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
                <span>Certificate &amp; Official Portal Assistance</span>
              </div>
            </div>

            {/* Action Button & Disclaimer */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <a
                href="https://anis-online-services.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95 group shrink-0"
              >
                <span>Explore Services</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t.partnerNote || 'Direct Verified Portal • Opens in New Tab'}
              </span>
            </div>

          </div>

          {/* Right Visual Graphic */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl liquid-glass-sub space-y-3 text-center border border-slate-200 dark:border-sky-500/25">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white ring-4 ring-[#0284c7]/30 flex items-center justify-center shadow-lg p-1 aspect-square shrink-0">
              <AosLogoSvg className="w-full h-full aspect-square object-contain shrink-0" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">Anis Online Services</div>
              <div className="text-[11px] text-[#0284c7] dark:text-sky-300 font-medium">{t.verifiedCitizenSupport || 'Verified Citizen Support'}</div>
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 px-3 py-1 liquid-glass-sub rounded-full">
              {t.fastAccurateProcessing || 'Fast & Accurate Processing'}
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          CITIZEN HELPDESK & QUALITY ASSURANCE SECTION
          ========================================================================= */}
      <section className="rounded-3xl liquid-glass p-6 sm:p-8 shadow-xl space-y-6 border border-slate-200 dark:border-sky-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284c7]/20 border border-[#0284c7]/30 flex items-center justify-center text-[#0284c7] dark:text-sky-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.privacyGuaranteeTitle || 'Privacy & Local Execution Guarantee'}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">{t.privacyGuaranteeDesc || 'Every photo, ID card, and PDF stays entirely in your device\'s memory.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('privacy')}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg liquid-glass-sub hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {t.readPrivacyPolicy || 'Read Privacy Policy'}
            </button>
            <button
              onClick={() => setActiveTab('portals')}
              className="text-xs font-semibold text-[#0284c7] dark:text-sky-300 hover:text-[#0369a1] dark:hover:text-sky-200 px-3 py-1.5 rounded-lg liquid-glass-sub hover:bg-slate-100 dark:hover:bg-white/10 border-[#0284c7]/30 transition-colors"
            >
              {t.govtPortalsBtn || '50+ Govt Portals'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl liquid-glass-sub space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
              <span>{t.photoRulesTitle || 'SSC / UPSC Photo Rules'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.photoRulesDesc || 'Standard 35×45mm dimensions with candidate full name and date of photo (DOP) printed automatically with zero distortion.'}
            </p>
          </div>

          <div className="p-4 rounded-xl liquid-glass-sub space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
              <span>{t.pvcPrecisionTitle || 'CR80 PVC Precision'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.pvcPrecisionDesc || 'Exact 85.6 × 54 mm card standard with dual-sided print sheets, 300 DPI vector exports, dynamic live QR, and digital signatures.'}
            </p>
          </div>

          <div
            onClick={handleLaunchUnlockPdf}
            className="p-4 rounded-xl liquid-glass-sub hover:border-emerald-500/60 transition-all cursor-pointer group space-y-1.5"
          >
            <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.pdfUnlockerTitle || 'PDF Security Unlocker'}</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">Launch →</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.pdfUnlockerDesc || 'Remove password restrictions, printing limits, and decryption locks securely 100% in-browser in seconds.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
