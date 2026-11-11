import React from 'react';
import { Info, Target, Heart, CheckCircle2, ShieldCheck, Laptop, ArrowRight } from 'lucide-react';
import { AosLogoSvg } from '../components/AosLogoSvg';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';

interface AboutViewProps {
  onExploreTools: () => void;
  lang?: LanguageCode;
}

export const AboutView: React.FC<AboutViewProps> = ({ onExploreTools, lang = 'en' }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Banner / Heading */}
      <div className="relative overflow-hidden rounded-3xl liquid-glass p-6 sm:p-10 shadow-xl border border-slate-200 dark:border-sky-500/20">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#0284c7]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                <Info className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.about || 'About Us'}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              {t.aboutHeadline || 'Simple Tools. Real Value. Always Free.'}
            </p>
          </div>

          {/* Laptop Preview Graphic */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-48 sm:w-56 h-32 liquid-glass-sub rounded-xl p-2.5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#0284c7]/50 transition-colors border border-slate-200 dark:border-sky-500/20">
              <div className="w-full flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400">aostools.local</span>
              </div>
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-[#0284c7] flex items-center justify-center shadow-md mb-1 p-0.5 aspect-square shrink-0">
                  <AosLogoSvg className="w-full h-full aspect-square object-contain" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">AOS TOOLS</span>
                <span className="text-[8px] text-[#0284c7] dark:text-sky-300 font-semibold">100% Free Client-Side Tools</span>
              </div>
              <div className="w-full h-1 bg-[#0284c7]/20 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-[#0284c7]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-6">
        {/* Card 1: Our Mission */}
        <div className="p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-hover shadow-lg space-y-3 border border-slate-200 dark:border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0284c7]/15 border border-[#0284c7]/30 text-[#0284c7] dark:text-sky-300 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Our Mission
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AOS Tools was founded to bridge the digital gap for common citizens, small cyber cafe operators, students, and job aspirants across India. We believe fundamental utility tools — passport photo generation, PDF merging, document resizing, and citizen ledger bookkeeping — should be genuinely free, without subscriptions, paywalls, or privacy-invasive server uploads.
          </p>
        </div>

        {/* Card 2: 100% Private & In-Browser Execution */}
        <div className="p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-hover shadow-lg space-y-4 border border-slate-200 dark:border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Zero-Server &amp; Pure Client-Side Privacy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Unlike other web tools that upload sensitive personal documents, Aadhaar cards, marksheet scans, and photos to remote cloud servers, AOS Tools runs entirely inside your device's browser memory via WebAssembly, HTML5 Canvas, and modern web crypto algorithms. Your documents never touch external servers or third-party storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl liquid-glass-sub space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero Server Uploads</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Everything compiles inside your device.</p>
            </div>

            <div className="p-3.5 rounded-xl liquid-glass-sub space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Strict ₹0-Cost Policy</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">No premium tier, no paid subscriptions.</p>
            </div>

            <div className="p-3.5 rounded-xl liquid-glass-sub space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Mobile Optimized</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Designed for touchscreens & low-bandwidth.</p>
            </div>
          </div>
        </div>

        {/* Card 3: Anis Online Services Partnership */}
        <div className="p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-hover shadow-lg space-y-3 border border-slate-200 dark:border-sky-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Anis Online Services Ecosystem
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AOS Tools is an open utility initiative proudly engineered and maintained as part of the Anis Online Services digital ecosystem. For complex citizen services requiring authorized government filings, e-KYC assistance, or document attestation, visit our official portfolio at <a href="https://anis-online-services.pages.dev/" target="_blank" rel="noopener noreferrer" className="text-[#0284c7] hover:underline font-bold">anis-online-services.pages.dev</a>.
          </p>

          <div className="pt-2">
            <button
              onClick={onExploreTools}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white text-xs font-bold transition-all shadow-md shadow-sky-500/25 cursor-pointer"
            >
              <span>{t.viewAll || 'Explore All 50+ Working Tools'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
