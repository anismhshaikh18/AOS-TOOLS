import React, { useState } from 'react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { ToolCard } from '../components/ToolCard';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
  BookMarked,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Building2,
  QrCode,
  Laptop,
  Check
} from 'lucide-react';
import { LanguageCode, TemplateId, TRANSLATIONS, DESIGN_TEMPLATES } from '../utils/translations';

interface HomeViewProps {
  onSelectTool: (tool: ToolItem) => void;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  templateId?: TemplateId;
  lang?: LanguageCode;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTool,
  setActiveTab,
  onOpenSearch,
  templateId = 'template-3',
  lang = 'en',
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [searchInput, setSearchInput] = useState('');

  // Featured subsets
  const featuredPdfTools = PDF_TOOLS.slice(0, 8);
  const featuredImageTools = IMAGE_TOOLS.slice(0, 8);
  const coreSpecialTools = SPECIAL_TOOLS.slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenSearch();
  };

  // Template-specific gradient text for subtitle
  const getSubtitleGradient = () => {
    switch (templateId) {
      case 'template-1':
        return 'from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent';
      case 'template-2':
        return 'from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent';
      case 'template-4':
        return 'from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent';
      case 'template-3':
      default:
        return 'from-pink-500 via-purple-500 to-cyan-500 dark:from-pink-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent';
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 w-full max-w-full min-w-0">
      
      {/* =========================================================================
          HERO SECTION (Adapts dynamically to the 4 Template styles)
          ========================================================================= */}
      <section className="theme-card relative overflow-hidden rounded-3xl p-6 sm:p-10 lg:p-12">
        
        {/* Soft Ambient Radial Glow matching the active template */}
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-30"
          style={{ backgroundColor: 'var(--accent-glow)' }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Title, Subtitle, Description, Search, Trust Badges */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-2xs">
                {t.heroTitle}
              </h1>
              {/* Template-aware Gradient Subtitle */}
              <div className={`text-2xl sm:text-4xl font-extrabold mt-1 tracking-tight bg-gradient-to-r ${getSubtitleGradient()}`}>
                {t.heroSubtitle}
              </div>
            </div>

            {/* Clean, spacious value proposition */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-purple-200/90 leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>

            {/* High-Tech Rounded Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-1">
              <div className="relative w-full max-w-xl flex items-center bg-white dark:bg-[#160a2e]/90 rounded-2xl p-1.5 pl-4 sm:pl-5 border border-slate-200 dark:border-white/10 shadow-md backdrop-blur-xl group focus-within:ring-2 focus-within:ring-[color:var(--accent-500)] transition-all">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onClick={onOpenSearch}
                  placeholder={t.searchBarPlaceholder}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/50 focus:outline-none pr-3"
                />
                <button
                  type="button"
                  onClick={onOpenSearch}
                  aria-label={t.search}
                  className="theme-btn-primary w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </form>

            {/* 3 Feature / Trust Badges */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Badge 1: 100% Free */}
              <div className="theme-card flex items-center gap-3 p-3 rounded-2xl">
                <div className="theme-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.freeBadge}</div>
                  <div className="text-[10px] text-slate-500 dark:text-purple-300/80 truncate">{t.freeBadgeSub}</div>
                </div>
              </div>

              {/* Badge 2: Secure & Private */}
              <div className="theme-card flex items-center gap-3 p-3 rounded-2xl">
                <div className="theme-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.secureBadge}</div>
                  <div className="text-[10px] text-slate-500 dark:text-purple-300/80 truncate">{t.secureBadgeSub}</div>
                </div>
              </div>

              {/* Badge 3: Works on Mobile */}
              <div className="theme-card flex items-center gap-3 p-3 rounded-2xl">
                <div className="theme-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.mobileBadge}</div>
                  <div className="text-[10px] text-slate-500 dark:text-purple-300/80 truncate">{t.mobileBadgeSub}</div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: 3D Visual Mockup matching the exact template from reference */}
          <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
            
            {/* Glowing Backdrop Mesh */}
            <div
              className="absolute w-72 h-72 rounded-full blur-2xl animate-pulse pointer-events-none opacity-40"
              style={{ backgroundColor: 'var(--accent-glow)' }}
            />

            {/* Template 1: Red & Black Tech Laptop */}
            {templateId === 'template-1' && (
              <div className="theme-card relative w-72 h-[320px] rounded-3xl p-4 flex flex-col justify-between border-2 border-red-500/40 shadow-2xl shadow-red-950/60 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between pb-2 border-b border-red-500/30 text-[10px] font-bold text-red-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>DARK MODERN · RED &amp; BLACK</span>
                  </span>
                  <span>100% PRIVATE</span>
                </div>

                <div className="my-auto space-y-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/80 to-black/80 border border-red-500/40 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Document Engine</div>
                      <div className="text-[10px] text-red-300">19 Local Utilities</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/80 to-black/80 border border-red-500/40 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center font-bold">
                      IMG
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Image Studio</div>
                      <div className="text-[10px] text-red-300">12 Precision Tools</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-red-500/20 text-[10px] text-red-300/80 text-center font-mono">
                  Offline Client-Side Sandbox
                </div>
              </div>
            )}

            {/* Template 2: Light Clean Blue & White Cloud Laptop */}
            {templateId === 'template-2' && (
              <div className="theme-card relative w-72 h-[320px] rounded-3xl p-4 flex flex-col justify-between border border-blue-200 shadow-xl shadow-blue-500/10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-blue-100 text-[10px] font-bold text-blue-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span>LIGHT CLEAN · BLUE &amp; WHITE</span>
                  </span>
                  <span>ZERO UPLOADS</span>
                </div>

                <div className="my-auto space-y-3">
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">PDF &amp; Documents</div>
                      <div className="text-[10px] text-blue-600 font-medium">Fast In-Browser Engine</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Image Processing</div>
                      <div className="text-[10px] text-sky-600 font-medium">Lossless Compression</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-100 text-[10px] text-slate-500 text-center font-mono">
                  Pure WebAssembly Architecture
                </div>
              </div>
            )}

            {/* Template 3: 3D Smartphone with Glowing Neon Tiles (Purple) */}
            {templateId === 'template-3' && (
              <div className="theme-card relative w-64 h-[370px] rounded-[36px] p-3 transform rotate-6 hover:rotate-3 transition-transform duration-500 shadow-2xl">
                {/* Phone Speaker & Notch */}
                <div className="w-20 h-3.5 bg-black/80 rounded-full mx-auto mb-3 flex items-center justify-center gap-1.5 border border-purple-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <div className="w-2.5 h-1 rounded-full bg-purple-300/40" />
                </div>

                {/* Phone Screen */}
                <div className="w-full h-[310px] rounded-[24px] bg-[#120726]/90 p-3 flex flex-col justify-between overflow-hidden relative border border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-bold pb-2 border-b border-white/10 text-purple-200">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>GRADIENT MODERN</span>
                    </span>
                    <span>100% Client-Side</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 my-auto">
                    <div
                      onClick={() => setActiveTab('pdf')}
                      className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-pink-500/30 flex flex-col items-center justify-center gap-1 cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <FileText className="w-6 h-6 text-white" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.pdf}</span>
                    </div>

                    <div
                      onClick={() => setActiveTab('image')}
                      className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-md shadow-cyan-500/30 flex flex-col items-center justify-center gap-1 cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <ImageIcon className="w-6 h-6 text-white" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.image}</span>
                    </div>

                    <div
                      onClick={() => setActiveTab('khata')}
                      className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 flex flex-col items-center justify-center gap-1 cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <BookMarked className="w-6 h-6 text-white" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.khata}</span>
                    </div>

                    <div
                      onClick={() => setActiveTab('special')}
                      className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 flex flex-col items-center justify-center gap-1 cursor-pointer transform hover:scale-105 transition-transform"
                    >
                      <QrCode className="w-6 h-6 text-white" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.special}</span>
                    </div>
                  </div>

                  <div className="w-16 h-1 rounded-full mx-auto mt-2 bg-white/20" />
                </div>
              </div>
            )}

            {/* Template 4: Minimal & Professional Workplace Flatlay */}
            {templateId === 'template-4' && (
              <div className="theme-card relative w-72 h-[320px] rounded-3xl p-5 flex flex-col justify-between border border-slate-300/80 shadow-md bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                    <span>MINIMAL &amp; PROFESSIONAL</span>
                  </span>
                  <span>EST. 2026</span>
                </div>

                <div className="my-auto space-y-2.5">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        P
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Document Processing</div>
                        <div className="text-[10px] text-slate-500">19 Core Engines</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        I
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Visual Processing</div>
                        <div className="text-[10px] text-slate-500">12 High-Res Utilities</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono">
                  Clean Architecture · Privacy by Design
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          PROMOTIONAL BANNER: ANIS ONLINE SERVICES
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/90 via-[#220a42]/95 to-indigo-950/95 border border-purple-500/30 p-6 sm:p-8 shadow-xl backdrop-blur-2xl text-white">
        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            {/* Service Partner Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>{t.partnerBadge}</span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
              {t.partnerHeadline}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
              {t.partnerDesc}
            </p>

            {/* Service Pills Grid */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Aadhaar Update & e-KYC Support',
                'PAN Card (Form 49A / Correction / Reprint)',
                'Online Government Documentation & Affidavits',
                'Official Administrative Applications',
                'Certificate & Portal Assistance',
              ].map((service, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 dark:bg-white/5 border border-purple-300/20 text-[11px] font-medium text-purple-200 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{service}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-3">
            <a
              href="https://anisonlineservices.my.canva.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-purple-300/30 group text-center"
            >
              <span>{t.partnerCta}</span>
              <ExternalLink className="w-4 h-4 text-purple-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <span className="text-[11px] text-purple-300/70 text-center sm:text-left lg:text-center block">
              {t.partnerNote}
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          POPULAR CATEGORIES (ONLY GENUINE WORKING CATEGORIES: 6 Cards)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.popularCategories}</span>
          </h2>
          <button
            onClick={onOpenSearch}
            className="theme-text-accent text-xs font-bold hover:underline transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Grid Cards: Strictly genuine, functioning tool categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* Category 1: PDF Tools */}
          <button
            onClick={() => setActiveTab('pdf')}
            className="theme-card group p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform mb-3">
              <div className="w-full h-full bg-white dark:bg-[#16062a] rounded-[10px] flex items-center justify-center">
                <FileText className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">
              {t.pdf}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-purple-300/80 font-semibold mt-0.5">
              19 Tools
            </div>
          </button>

          {/* Category 2: Image Tools */}
          <button
            onClick={() => setActiveTab('image')}
            className="theme-card group p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform mb-3">
              <div className="w-full h-full bg-white dark:bg-[#16062a] rounded-[10px] flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
              {t.image}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-purple-300/80 font-semibold mt-0.5">
              12 Tools
            </div>
          </button>

          {/* Category 3: Special Tools */}
          <button
            onClick={() => setActiveTab('special')}
            className="theme-card group p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-400 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform mb-3">
              <div className="w-full h-full bg-white dark:bg-[#16062a] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
              {t.special}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-purple-300/80 font-semibold mt-0.5">
              9 Tools
            </div>
          </button>

          {/* Category 4: Client Khata Diary */}
          <button
            onClick={() => setActiveTab('khata')}
            className="theme-card group p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform mb-3">
              <div className="w-full h-full bg-white dark:bg-[#16062a] rounded-[10px] flex items-center justify-center">
                <BookMarked className="w-6 h-6 text-indigo-600 dark:text-blue-300" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-blue-300 transition-colors">
              {t.khata}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-purple-300/80 font-semibold mt-0.5">
              Client Ledger
            </div>
          </button>

          {/* Category 5: PAN Master Hub */}
          <button
            onClick={() => setActiveTab('pan')}
            className="theme-card group p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform mb-3">
              <div className="w-full h-full bg-white dark:bg-[#16062a] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              {t.pan}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-purple-300/80 font-semibold mt-0.5">
              UTIITSL &amp; NSDL
            </div>
          </button>

          {/* Category 6: Government Portals */}
          <button
            onClick={() => setActiveTab('portals')}
            className="theme-card group p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 p-0.5 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform mb-3">
              <div className="w-full h-full bg-white dark:bg-[#16062a] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
              {t.portals}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-purple-300/80 font-semibold mt-0.5">
              50 Portals
            </div>
          </button>

        </div>
      </section>


      {/* =========================================================================
          DETAILED SECTION 01: PDF TOOLS (All 19 Working Engines)
          ========================================================================= */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="theme-text-accent flex items-center gap-2 text-xs font-semibold mb-1">
              <span>{t.sectionPdf}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.featuredPdf}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('pdf')}
            className="theme-text-accent text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{t.viewAll} ({PDF_TOOLS.length} {t.pdf})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPdfTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          DETAILED SECTION 02: IMAGE TOOLS (All 12 Working Engines)
          ========================================================================= */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="theme-text-accent flex items-center gap-2 text-xs font-semibold mb-1">
              <span>{t.sectionImage}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.featuredImage}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('image')}
            className="theme-text-accent text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{t.viewAll} ({IMAGE_TOOLS.length} {t.image})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredImageTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          DETAILED SECTION 03: SPECIAL SUITE (QR, Barcode, Ledger, etc.)
          ========================================================================= */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="theme-text-accent flex items-center gap-2 text-xs font-semibold mb-1">
              <span>{t.sectionSpecial}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.specialSuite}
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('special')}
            className="theme-text-accent text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{t.viewAll} ({SPECIAL_TOOLS.length} {t.special})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreSpecialTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          STRICT CLIENT-SIDE PRIVACY GUARANTEE BANNER
          ========================================================================= */}
      <section className="p-8 bg-gradient-to-r from-purple-950 via-[#200a40] to-indigo-950 text-white rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.privacyGuaranteeTitle}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Client-Side Browser Execution Without Remote Data Transmission
          </h2>
          <p className="text-xs sm:text-sm text-purple-100/90 mt-2 leading-relaxed">
            {t.privacyGuaranteeDesc}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('pan')}
            className="theme-btn-primary px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer"
          >
            Explore {t.pan} →
          </button>
          <button
            onClick={() => setActiveTab('portals')}
            className="px-4 py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {t.portals} →
          </button>
        </div>
      </section>

    </div>
  );
};
