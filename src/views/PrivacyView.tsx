import React from 'react';
import { Shield, Lock, EyeOff, Share2, Check, CheckCircle2 } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Banner / Heading */}
      <div className="relative overflow-hidden rounded-3xl liquid-glass p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Privacy Policy
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              Your privacy is important to us.
            </p>
          </div>

          {/* Red Neon Lock Badge Graphic */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-red-500/80 liquid-glass-sub shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center justify-center">
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Numbered Steps Card */}
      <div className="p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-hover shadow-lg space-y-6">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-red-600/20">
            1
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Information We Collect
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We do not collect any personal information from you. All processing is done in your browser. We only access the files you upload for the purpose of providing the requested service (e.g., passport photo printing, PDF editing, image conversion).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-red-600/20">
            2
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              How We Use Your Information
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your files are not stored on our servers. We do not share, sell or distribute your data to any third party. Everything stays on your device.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-red-600/20">
            3
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Cookies
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We may use minimal local storage to improve your experience and keep preferences like your theme or Client Khata ledger records working properly. These do not collect personal telemetry.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-red-600/20">
            4
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Your Rights
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Since we do not store your data, you remain in full control. You can clear your browser data at any time to remove any local information.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Respect Your Privacy Card */}
      <div className="p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-hover shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              We Respect Your Privacy
            </h2>
            <p className="text-xs text-red-400 font-semibold">
              Your files. Your device. Your control.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
            <Lock className="w-4 h-4 text-red-500 shrink-0" />
            <span>No data storage</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
            <Share2 className="w-4 h-4 text-red-500 shrink-0" />
            <span>No third party sharing</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
            <EyeOff className="w-4 h-4 text-red-500 shrink-0" />
            <span>No tracking</span>
          </div>
        </div>

        <div className="pt-3">
          <div className="p-3 liquid-glass-sub rounded-xl flex items-center gap-2.5 text-xs text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Client-side WebAssembly & HTML5 Canvas processing verified.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
