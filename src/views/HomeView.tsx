import React, { useState } from 'react';
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
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Headphones,
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

interface HomeViewProps {
  onSelectTool: (tool: ToolItem) => void;
  setActiveTab: (tab: string) => void;
  onOpenSearch?: () => void;
  templateId?: string;
  lang?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTool,
  setActiveTab,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const allTools = [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS];
  const filteredTools = searchQuery.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Direct launcher helpers
  const handleLaunchPassport = () => {
    const passportTool =
      IMAGE_TOOLS.find((t) => t.id === 'passport-photo-studio') ||
      IMAGE_TOOLS.find((t) => t.id === 'passport-photo-sheet');
    if (passportTool) {
      onSelectTool(passportTool);
    } else {
      setActiveTab('image');
    }
  };

  const handleLaunchIdStudio = () => {
    const idTool =
      SPECIAL_TOOLS.find((t) => t.id === 'smart-id-card-studio') ||
      SPECIAL_TOOLS.find((t) => t.id === 'id-card-maker');
    if (idTool) {
      onSelectTool(idTool);
    } else {
      setActiveTab('special');
    }
  };

  const handleLaunchPhotoResizer = () => {
    const photoTool = IMAGE_TOOLS.find((t) => t.id === 'photo-signature-resize');
    if (photoTool) {
      onSelectTool(photoTool);
    } else {
      setActiveTab('image');
    }
  };

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* =========================================================================
          HERO SECTION WITH VECTOR WORKSPACE DESK SVG & ACTION LAUNCHER
          ========================================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#072642]/95 via-[#093256]/90 to-[#04192d]/98 border border-[#0d4775]/80 p-6 sm:p-10 shadow-2xl shadow-red-950/20 backdrop-blur-xl overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Headline, Search, Badges & Quick Launchers */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#03182b] border border-[#0d4775] text-red-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Free • Private • Zero Uploads Browser Suite</span>
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                AOS <span className="text-red-500">TOOLS</span>
              </h1>
              <div className="text-xl sm:text-2xl font-bold text-slate-200 mt-2 tracking-tight">
                All-in-One Digital Workstation &amp; Citizen Utilities
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mt-3">
                Complete client-side processing for official passport photo sheets, CR80 PVC ID cards, 19 PDF utilities, image optimization, and citizen client ledgers. 100% private in your browser.
              </p>
            </div>

            {/* Search Input Bar with Red Search Button */}
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for tools... (e.g. Passport Studio, ID Card, PDF Merge)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onOpenSearch) {
                      onOpenSearch();
                    }
                  }}
                  className="w-full bg-[#03182b]/95 border border-[#0d4775] hover:border-[#135994] focus:border-red-500 text-white placeholder-slate-400 rounded-2xl py-3.5 pl-5 pr-14 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
                />
                <button
                  onClick={() => {
                    if (onOpenSearch) onOpenSearch();
                  }}
                  aria-label="Search Tools"
                  className="absolute right-2 w-10 h-10 bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-red-600/40 active:scale-95"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Quick search dropdown if user typed in hero input */}
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#072642] border border-[#0d4775] rounded-2xl p-2 shadow-2xl z-30 max-h-64 overflow-y-auto space-y-1">
                  {filteredTools.length > 0 ? (
                    filteredTools.slice(0, 6).map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          onSelectTool(tool);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{tool.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{tool.shortDesc}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/70 text-red-300 border border-red-500/30 font-medium">
                          {tool.category}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Passport Photo Studio</span>
              </button>

              <button
                onClick={handleLaunchIdStudio}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b3b64] hover:bg-[#0e487a] border border-[#1a629b] text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4 text-cyan-300" />
                <span>Smart ID Card Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#03182b] hover:bg-[#06243f] border border-[#0d4775] text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-red-400" />
                <span>19 PDF Tools</span>
              </button>
            </div>

            {/* 3 Micro-feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#03182b]/80 border border-[#0d4775]/50 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">100% Free</div>
                  <div className="text-[10px] text-slate-400">Strict zero-cost policy</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#03182b]/80 border border-[#0d4775]/50 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Private &amp; Local</div>
                  <div className="text-[10px] text-slate-400">Zero files uploaded</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#03182b]/80 border border-[#0d4775]/50 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Mobile Ready</div>
                  <div className="text-[10px] text-slate-400">Works on all browsers</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: PAN Master Hub Compliance & Quick Utilities */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <PanMasterHeroCard
              onOpenFullHub={() => setActiveTab('pan')}
              onLaunchImageResize={handleLaunchPhotoResizer}
            />
          </div>

        </div>
      </section>

      {/* =========================================================================
          FLAGSHIP PROFESSIONAL STUDIOS & SERVICES (With Custom SVG Illustrations)
          ========================================================================= */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Flagship Creative &amp; Document Suites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Specialized Production Tools
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('tools')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer group"
          >
            <span>View All 35+ Tools</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Studio Card 1: Passport Photo Studio */}
          <div
            onClick={handleLaunchPassport}
            className="rounded-2xl bg-gradient-to-b from-[#072642] to-[#041a2e] border border-[#0d4775] hover:border-red-500/80 p-5 shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#031526] border border-[#0d4775] flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
                  <PassportIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
                  STUDIO CROP &amp; PRINT
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white group-hover:text-red-400 transition-colors">
                  Passport Photo Studio
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  Generate 4×6 (8 or 6 photos) and A4 (30 or 36) studio sheets. SSC, UPSC, and Police exam standard DOP &amp; Candidate name printing with red laser cut guides.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[#0d4775]/40 flex items-center justify-between text-xs font-bold text-red-400 group-hover:text-red-300">
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Studio Card 2: Smart ID Card Studio */}
          <div
            onClick={handleLaunchIdStudio}
            className="rounded-2xl bg-gradient-to-b from-[#072642] to-[#041a2e] border border-[#0d4775] hover:border-blue-500/80 p-5 shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#031526] border border-[#0d4775] flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
                  <IdCardIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold">
                  CR80 300 DPI
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white group-hover:text-blue-400 transition-colors">
                  Smart ID Card Studio
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  Design official CR80 PVC identity cards (85.6 × 54 mm). Live QR code generator, candidate photo &amp; signature, custom headers, and print sheets.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[#0d4775]/40 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Studio Card 3: 19 PDF Tools Suite */}
          <div
            onClick={() => setActiveTab('pdf')}
            className="rounded-2xl bg-gradient-to-b from-[#072642] to-[#041a2e] border border-[#0d4775] hover:border-red-500/80 p-5 shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#031526] border border-[#0d4775] flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
                  <PdfSuiteIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 font-bold">
                  19 UTILITIES
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white group-hover:text-red-400 transition-colors">
                  19+ PDF Power Suite
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  Merge, Split, Compress, Rotate, Watermark, Page Numbering, AES Encrypt, Unlock, PDF to JPG/Word, and Booklet imposition — entirely offline.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[#0d4775]/40 flex items-center justify-between text-xs font-bold text-red-400 group-hover:text-red-300">
              <span>Explore All 19</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Studio Card 4: Client Khata & Citizen Portal Services */}
          <div
            onClick={() => setActiveTab('khata')}
            className="rounded-2xl bg-gradient-to-b from-[#072642] to-[#041a2e] border border-[#0d4775] hover:border-emerald-500/80 p-5 shadow-xl transition-all duration-200 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#031526] border border-[#0d4775] flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
                  <SupportHelpIllustrationSvg className="w-full h-full" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  CITIZEN LEDGER
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                  Client Khata Ledger Diary
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                  Store customer credit/debit records, send instant WhatsApp payment reminders, search transactions, and export ledger sheets securely.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-[#0d4775]/40 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Open Khata Diary</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          ANIS ONLINE SERVICES PROMOTIONAL BANNER (#052f52 Prussian Navy Theme)
          ========================================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#052f52] via-[#07365e] to-[#031d33] border border-[#0d4775] p-6 sm:p-10 shadow-2xl shadow-[#052f52]/40 space-y-6 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            {/* Partner Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#031d33] border border-[#135994] text-cyan-300 text-[11px] font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>OFFICIAL DIGITAL SERVICES PARTNER · ANIS ONLINE SERVICES</span>
            </div>

            {/* Banner Headline & Text */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Need Professional Assistance with Government &amp; Citizen Applications?
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
                Experience verified, reliable citizen support handled directly by Anis Online Services. From official documentation to online government submissions, get your work done accurately without hassle.
              </p>
            </div>

            {/* Verified Support Pills */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="px-3.5 py-1.5 rounded-full bg-[#031d33]/90 border border-[#0d4775] hover:border-cyan-400/50 text-xs text-slate-100 flex items-center gap-2 font-medium transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Aadhaar Update &amp; e-KYC Support</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#031d33]/90 border border-[#0d4775] hover:border-cyan-400/50 text-xs text-slate-100 flex items-center gap-2 font-medium transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>PAN Card (Form 49A / Correction / Reprint)</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#031d33]/90 border border-[#0d4775] hover:border-cyan-400/50 text-xs text-slate-100 flex items-center gap-2 font-medium transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Online Government Documentation &amp; Affidavits</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#031d33]/90 border border-[#0d4775] hover:border-cyan-400/50 text-xs text-slate-100 flex items-center gap-2 font-medium transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Certificate &amp; Official Portal Assistance</span>
              </div>
            </div>

            {/* Button & Subtext */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3">
              <a
                href="https://anis-online-services.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/35 transition-all duration-150 cursor-pointer active:scale-95 shrink-0"
              >
                <span>Explore Anis Online Services Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <span className="text-xs text-slate-300/90 font-medium">
                Direct Verified Portal • Opens in New Tab
              </span>
            </div>
          </div>

          {/* Right side illustration emblem */}
          <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
            <div className="p-4 rounded-3xl bg-[#031d33]/80 border border-[#0d4775] shadow-2xl flex flex-col items-center text-center space-y-3">
              <SupportHelpIllustrationSvg className="w-24 h-24" />
              <div>
                <div className="text-sm font-bold text-white">Anis Online Services</div>
                <div className="text-[11px] text-cyan-300">Verified Citizen Support</div>
              </div>
              <span className="text-[10px] text-slate-400 px-3 py-1 bg-white/5 rounded-full">
                Fast &amp; Accurate Processing
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          OFFICIAL CITIZEN HELPDESK & QUALITY ASSURANCE SECTION
          ========================================================================= */}
      <section className="rounded-3xl bg-gradient-to-r from-[#03182b] to-[#06243f] border border-[#0d4775]/70 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0d4775]/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Privacy &amp; Local Execution Guarantee</h3>
              <p className="text-xs text-slate-400">Every photo, ID card, and PDF stays entirely in your device's memory.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('privacy')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Read Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('portals')}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 transition-colors"
            >
              15+ Govt Portals
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-[#02111f]/60 border border-[#0d4775]/40 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-red-400" />
              <span>SSC / UPSC Photo Rules</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Standard 35×45mm dimensions with candidate full name and date of photo (DOP) printed automatically with zero distortion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#02111f]/60 border border-[#0d4775]/40 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>CR80 PVC Precision</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exact 85.6 × 54 mm card standard with dual-sided print sheets, 300 DPI vector exports, dynamic live QR, and digital signatures.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#02111f]/60 border border-[#0d4775]/40 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client Khata Ledger</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Never lose track of client balances or xerox/lamination payments. Local storage encryption and 1-click WhatsApp alerts.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
