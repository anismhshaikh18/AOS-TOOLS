import React, { useState } from 'react';
import {
  Search,
  Zap,
  Lock,
  Smartphone,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';

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

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* =========================================================================
          HERO CARD
          ========================================================================= */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#072642]/95 via-[#093256]/90 to-[#04192d]/98 border border-[#0d4775]/80 p-6 sm:p-10 shadow-2xl shadow-red-950/20 backdrop-blur-xl space-y-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            AOS Tools
          </h1>
          <div className="text-xl sm:text-2xl font-bold text-red-500 mt-1 tracking-tight">
            Free • Secure • Online
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-4">
            All-in-one client-side suite for documents, images, and citizen utilities. Zero uploads, zero telemetry, 100% private in your browser.
          </p>
        </div>

        {/* Search Input Bar with Red Search Button */}
        <div className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for tools... (e.g. PDF to Word, Compress Image)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onOpenSearch) {
                  onOpenSearch();
                }
              }}
              className="w-full bg-[#03182b]/90 border border-[#0d4775] hover:border-[#135994] focus:border-red-500/80 text-white placeholder-slate-400 rounded-2xl py-3.5 pl-5 pr-14 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
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

        {/* 3 Micro-feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Card 1 */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#03182b]/80 border border-[#0d4775]/50 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">100% Free</div>
              <div className="text-[11px] text-slate-400">No hidden charges</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#03182b]/80 border border-[#0d4775]/50 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Secure & Private</div>
              <div className="text-[11px] text-slate-400">Your data stays on your device</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#03182b]/80 border border-[#0d4775]/50 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Works on Mobile</div>
              <div className="text-[11px] text-slate-400">Any device, anytime</div>
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

        {/* Partner Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#031d33] border border-[#135994] text-cyan-300 text-[11px] font-bold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>OFFICIAL DIGITAL SERVICES PARTNER · ANIS ONLINE SERVICES</span>
        </div>

        {/* Banner Headline & Text */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Need Professional Assistance with Government &amp; Citizen Applications?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
            Experience verified, reliable citizen support handled directly by Anis Online Services. From official documentation to online government submissions, get your work done accurately without hassle.
          </p>
        </div>

        {/* 5 Verified Support Pills */}
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
            <span>Official Administrative Applications</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#031d33]/90 border border-[#0d4775] hover:border-cyan-400/50 text-xs text-slate-100 flex items-center gap-2 font-medium transition-colors shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Certificate &amp; Portal Assistance</span>
          </div>
        </div>

        {/* Button & Subtext */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
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
      </section>

    </div>
  );
};
