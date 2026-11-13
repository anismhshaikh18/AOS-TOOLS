import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Printer, 
  Scissors, 
  FileCheck, 
  Upload, 
  Sliders, 
  Download,
  Eye,
  FileText,
  Lock,
  Layers
} from 'lucide-react';

/* =========================================================================
   1. PASSPORT PHOTO STUDIO ILLUSTRATIVE GRAPHIC
   Features 35×45 mm biometric framing, candidate name & DOP strip, and 300 DPI sheet layout
   ========================================================================= */
export const PassportStudioGraphicCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#07192b] dark:via-[#0d2a45] dark:to-[#03182b] border border-sky-200 dark:border-sky-500/30 p-4 sm:p-5 text-slate-900 dark:text-white shadow-md dark:shadow-xl transition-colors ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 rounded-full bg-[#0284c7]/10 dark:bg-[#0284c7]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-36 h-36 rounded-full bg-sky-400/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Graphic Visualizer */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Main 35×45 mm Portrait Visual Frame */}
          <div className="relative w-28 sm:w-32 aspect-[35/45] rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-[#0284c7] dark:border-[#38bdf8] shadow-md shadow-sky-500/10 overflow-hidden flex flex-col justify-between p-1.5">
            {/* Biometric overlay crosshairs */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-1.5 opacity-70">
              <div className="border-b border-dashed border-[#0284c7]/60 dark:border-[#38bdf8]/50 h-2/5 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-[#0284c7] dark:text-[#38bdf8] bg-white/80 dark:bg-black/60 px-1 rounded shadow-2xs">Eye Level</span>
              </div>
              <div className="border-t border-dashed border-emerald-500/60 dark:border-emerald-400/50 h-1/4 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-300 bg-white/80 dark:bg-black/60 px-1 rounded shadow-2xs">70-80% Face</span>
              </div>
            </div>

            {/* Candidate Silhouette */}
            <div className="w-full flex-1 flex flex-col items-center justify-center z-10 pt-1">
              <div className="w-9 h-11 rounded-full bg-gradient-to-b from-[#38bdf8] to-[#0284c7] border border-white/60 shadow-inner" />
              <div className="w-16 h-8 rounded-t-full bg-gradient-to-b from-[#0284c7] to-[#0369a1] -mt-1" />
            </div>

            {/* Candidate Name & DOP Strip */}
            <div className="z-10 w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-center shadow-xs">
              <p className="text-[8px] font-black uppercase tracking-tight truncate leading-tight">CANDIDATE NAME</p>
              <p className="text-[7px] font-bold font-mono text-slate-600 dark:text-slate-300 leading-tight">DOP: 24/11/2026</p>
            </div>
          </div>

          {/* Mini 4x6 / A4 Sheet Preview Mockup */}
          <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50 dark:bg-black/40 border border-sky-100 dark:border-white/10 w-24 aspect-[4/6] shadow-inner space-y-1">
            <span className="text-[9px] font-bold text-[#0284c7] dark:text-sky-300 font-mono">4×6" Sheet</span>
            <div className="grid grid-cols-2 gap-1 w-full flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded bg-[#0284c7]/20 dark:bg-[#0284c7]/40 border border-[#0284c7]/30 dark:border-[#38bdf8]/40 flex items-center justify-center">
                  <div className="w-2.5 h-3 rounded-full bg-[#0284c7] dark:bg-[#38bdf8]/70" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[8px] text-slate-600 dark:text-slate-300">
              <Scissors className="w-2.5 h-2.5 text-amber-500" />
              <span>Dotted Guides</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Badges & Feature Spec */}
        <div className="flex-1 min-w-0 space-y-2 text-left w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0284c7]/10 dark:bg-[#0284c7]/30 text-[#0284c7] dark:text-[#38bdf8] border border-[#0284c7]/20 dark:border-[#0284c7]/50 inline-flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3 text-[#0284c7] dark:text-[#38bdf8]" />
              AOS STUDIO ARCHITECTURE
            </span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              Govt Portal Compliant
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Standard 35×45 mm Biometric Passport Precision
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Exact 35×45 mm millimeter-perfect portrait cropping with integrated Name &amp; Date of Photo (DOP) plate, customizable border margins, and instant 4×6 / A4 thermal sheet export.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Resolution</div>
              <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">300 DPI Vector</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Standard Ratio</div>
              <div className="text-xs font-bold font-mono text-[#0284c7] dark:text-sky-400">35 × 45 mm</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Security</div>
              <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">100% Client-Side</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. SMART ID CARD STUDIO ILLUSTRATIVE GRAPHIC
   Features dual-sided CR80 PVC format (85.6 × 54 mm), transparent signature, and live QR stamp
   ========================================================================= */
export const SmartIdCardGraphicCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#07192b] dark:via-[#0d2a45] dark:to-[#03182b] border border-sky-200 dark:border-sky-500/30 p-4 sm:p-5 text-slate-900 dark:text-white shadow-md dark:shadow-xl transition-colors ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 rounded-full bg-[#0284c7]/10 dark:bg-[#0284c7]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-36 h-36 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Graphic Dual-Sided Visualizer */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Front CR80 Card Mockup */}
          <div className="relative w-36 sm:w-40 aspect-[85.6/54] rounded-xl bg-slate-50 dark:bg-gradient-to-br dark:from-[#0c243d] dark:to-[#07192b] border border-sky-300 dark:border-[#38bdf8]/50 shadow-md dark:shadow-xl overflow-hidden p-2 flex flex-col justify-between">
            {/* Header Strip */}
            <div className="w-full bg-[#0284c7] rounded px-1.5 py-0.5 flex items-center justify-between">
              <span className="text-[7px] font-black tracking-wider text-white">OFFICIAL IDENTITY CARD</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Front details: Photo + Text */}
            <div className="flex items-center gap-2 flex-1 pt-1">
              <div className="w-8 h-10 rounded bg-white p-0.5 shrink-0 flex flex-col items-center justify-center border border-slate-300 shadow-2xs">
                <div className="w-4 h-4 rounded-full bg-[#0284c7]" />
                <div className="w-6 h-3 rounded-t bg-[#0369a1] -mt-0.5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-2 w-16 bg-slate-300 dark:bg-white/90 rounded-sm" />
                <div className="h-1.5 w-12 bg-sky-400 dark:bg-sky-300/70 rounded-sm" />
                <div className="h-1.5 w-10 bg-slate-300 dark:bg-slate-400/60 rounded-sm" />
              </div>
            </div>

            {/* Bottom Barcode */}
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-0.5">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1].map((w, i) => (
                  <div key={i} className="bg-slate-800 dark:bg-white/70 h-2" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[6px] font-mono font-bold text-[#0284c7] dark:text-sky-300">FRONT</span>
            </div>
          </div>

          {/* Back CR80 Card Mockup */}
          <div className="relative w-32 sm:w-36 aspect-[85.6/54] rounded-xl bg-slate-100 dark:bg-gradient-to-br dark:from-[#081e35] dark:to-[#051424] border border-slate-300 dark:border-white/20 shadow-md dark:shadow-lg overflow-hidden p-2 flex flex-col justify-between">
            {/* Magnetic Stripe Strip */}
            <div className="w-full h-3 bg-slate-800 dark:bg-black/80 rounded -mx-2 -mt-2 px-2" />

            {/* Signature & QR Zone */}
            <div className="flex items-center justify-between gap-1.5 py-1">
              <div className="flex-1 p-1 rounded bg-white text-slate-900 border border-slate-300 shadow-2xs">
                <span className="text-[6px] font-mono font-bold block text-slate-500">AUTHORIZED SIGNATURE</span>
                <div className="h-2.5 flex items-center">
                  <span className="text-[8px] font-serif italic text-blue-900 font-bold">~ Transparent ~</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded bg-white p-0.5 shrink-0 flex items-center justify-center border border-slate-200 shadow-2xs">
                <div className="w-4 h-4 bg-slate-900 rounded-[1px] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white" />
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-200 dark:border-white/10">
              <span className="text-[6px] text-slate-500 dark:text-slate-400 font-mono">CR80 PVC STD</span>
              <span className="text-[6px] font-mono font-bold text-emerald-600 dark:text-emerald-400">BACK</span>
            </div>
          </div>
        </div>

        {/* Right: Technical Badges & Feature Spec */}
        <div className="flex-1 min-w-0 space-y-2 text-left w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0284c7]/10 dark:bg-[#0284c7]/30 text-[#0284c7] dark:text-[#38bdf8] border border-[#0284c7]/20 dark:border-[#0284c7]/50 inline-flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3 text-[#0284c7] dark:text-[#38bdf8]" />
              CR80 THERMAL STANDARDS
            </span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              Zero-Shift Alignment
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dual-Sided CR80 PVC Smart Identity Card Engine
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Standard 85.6 × 54 mm credit-card format with auto-transparent signature cleaning, vector QR &amp; barcode generation, and thermal printer-ready layout.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Card Dimensions</div>
              <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">85.6 × 54 mm</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Print Quality</div>
              <div className="text-xs font-bold font-mono text-[#0284c7] dark:text-sky-400">300 / 600 DPI</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Export Formats</div>
              <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">PDF, SVG &amp; PNG</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. PDF SUITE ILLUSTRATIVE GRAPHIC
   Features multi-page document pipeline, lossless merging, splitting & client-side unlocking
   ========================================================================= */
export const PdfSuiteGraphicCard: React.FC<{ className?: string; title?: string; desc?: string }> = ({ 
  className = '',
  title = 'AOS PDF Document Processing Architecture',
  desc = 'Lossless client-side PDF document manipulation: merge multiple files, extract selective pages, trim margins, and unlock password restrictions 100% in-browser.'
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#07192b] dark:via-[#0d2a45] dark:to-[#03182b] border border-sky-200 dark:border-sky-500/30 p-4 sm:p-5 text-slate-900 dark:text-white shadow-md dark:shadow-xl transition-colors ${className}`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 rounded-full bg-[#0284c7]/10 dark:bg-[#0284c7]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-36 h-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Graphic PDF Pipeline Visualizer */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Staggered Document Pages Stack */}
          <div className="relative w-28 sm:w-32 aspect-[3/4] flex items-center justify-center">
            {/* Page 3 (Back) */}
            <div className="absolute top-0 left-4 w-20 sm:w-22 aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-xs transform rotate-6 opacity-60" />
            {/* Page 2 (Middle) */}
            <div className="absolute top-1 left-2 w-20 sm:w-22 aspect-[3/4] rounded-lg bg-slate-50 dark:bg-slate-900 border border-sky-300 dark:border-sky-500/40 shadow-sm transform -rotate-3 opacity-80" />
            {/* Page 1 (Front) */}
            <div className="relative w-20 sm:w-22 aspect-[3/4] rounded-lg bg-white dark:bg-gradient-to-br dark:from-[#0a233a] dark:to-[#051624] border border-[#0284c7] dark:border-[#38bdf8] shadow-md p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-black font-mono px-1 py-0.2 rounded bg-rose-500 text-white shadow-2xs">PDF</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="space-y-1 py-1">
                <div className="h-1.5 w-14 bg-slate-300 dark:bg-white/90 rounded-sm" />
                <div className="h-1.5 w-10 bg-sky-400 dark:bg-sky-300/70 rounded-sm" />
                <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-400/60 rounded-sm" />
              </div>
              <div className="text-[7px] font-mono font-bold text-emerald-700 dark:text-emerald-400 text-center bg-emerald-50 dark:bg-black/40 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                100% PRIVATE
              </div>
            </div>
          </div>

          {/* Operation Indicator Arrow & Output Booklet */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-[9px] font-bold text-[#0284c7] dark:text-sky-300 font-mono">Process</span>
            <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-md">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">Lossless</span>
          </div>

          {/* Bound Output Document */}
          <div className="w-20 sm:w-22 aspect-[3/4] rounded-lg bg-gradient-to-br from-[#0284c7] to-[#0369a1] dark:from-[#0284c7] dark:to-[#072642] border border-[#0284c7] dark:border-[#38bdf8] shadow-md p-2 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between">
              <FileCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-[7px] font-bold font-mono text-emerald-300">READY</span>
            </div>
            <div className="space-y-1 py-1">
              <div className="h-1.5 w-12 bg-white rounded-sm" />
              <div className="h-1.5 w-8 bg-sky-200 rounded-sm" />
            </div>
            <div className="text-[7px] font-mono font-bold text-white text-center bg-black/40 py-0.5 rounded">
              300 DPI
            </div>
          </div>
        </div>

        {/* Right: Technical Badges & Feature Spec */}
        <div className="flex-1 min-w-0 space-y-2 text-left w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0284c7]/10 dark:bg-[#0284c7]/30 text-[#0284c7] dark:text-[#38bdf8] border border-[#0284c7]/20 dark:border-[#0284c7]/50 inline-flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3 text-[#0284c7] dark:text-[#38bdf8]" />
              IN-BROWSER ENGINE
            </span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              Zero Server Uploads
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {desc}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Data Flow</div>
              <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">100% Local RAM</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Quality</div>
              <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">Lossless Vector</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10">
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Speed</div>
              <div className="text-xs font-bold font-mono text-[#0284c7] dark:text-sky-400">Instant (No Queue)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. STEP-BY-STEP VISUAL BADGE FOR TOOL MANUAL CARDS
   Visual indicators for Step 1 (Upload/Input), Step 2 (Precision Adjust), Step 3 (Export/Print)
   ========================================================================= */
export const StepVisualBadge: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
  switch (stepIndex) {
    case 0:
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-black/30 px-2 py-0.5 rounded-md border border-sky-100 dark:border-white/10 shrink-0">
          <Upload className="w-3 h-3 text-[#0284c7] dark:text-sky-400" />
          <span>JPG · PNG · PDF</span>
        </div>
      );
    case 1:
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-black/30 px-2 py-0.5 rounded-md border border-amber-100 dark:border-white/10 shrink-0">
          <Sliders className="w-3 h-3 text-amber-500" />
          <span>Precision Controls</span>
        </div>
      );
    case 2:
    default:
      return (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-black/30 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-white/10 shrink-0">
          <Download className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>300 DPI Export</span>
        </div>
      );
  }
};

/* =========================================================================
   5. TOOL OVERVIEW ILLUSTRATIVE DISPATCHER
   Injects the relevant illustrative graphic based on tool ID and category
   ========================================================================= */
export const ToolOverviewIllustrativeDispatcher: React.FC<{
  toolId: string;
  category?: string;
  className?: string;
}> = ({ toolId, category, className = '' }) => {
  const normalizedId = toolId.toLowerCase();

  if (normalizedId.includes('passport')) {
    return <PassportStudioGraphicCard className={className} />;
  }

  if (normalizedId.includes('id-card') || normalizedId.includes('smart-id')) {
    return <SmartIdCardGraphicCard className={className} />;
  }

  if (
    category === 'pdf' ||
    normalizedId.includes('pdf') ||
    ['merge-pdf', 'split-pdf', 'crop-pdf', 'compress-pdf', 'pdf-to-word', 'word-to-pdf'].includes(normalizedId)
  ) {
    return <PdfSuiteGraphicCard className={className} />;
  }

  return null;
};
