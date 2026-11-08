import React from 'react';
import { Shield, Lock, EyeOff, Share2, Check, CheckCircle2 } from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';

interface PrivacyViewProps {
  lang?: LanguageCode;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ lang = 'en' }) => {
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
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.privacy || 'Privacy Policy'}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              {t.privacyHeadline || 'Your privacy is important to us. 100% In-Browser Local Processing.'}
            </p>
          </div>

          {/* Sapphire Neon Lock Badge Graphic */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-[#0284c7] liquid-glass-sub shadow-[0_0_30px_rgba(2,132,199,0.3)] flex items-center justify-center">
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-[#0284c7] dark:text-sky-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Numbered Steps Card */}
      <div className="p-6 sm:p-8 rounded-2xl liquid-glass liquid-glass-hover shadow-lg space-y-6 border border-slate-200 dark:border-sky-500/20">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-sky-500/20">
            1
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Information We Collect
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We do not collect any personal information from you. All processing is done in your browser. We only access the files you upload for the purpose of providing the requested service (e.g., passport photo printing, PDF editing, image conversion).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-sky-500/20">
            2
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              How We Use Your Information
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We do not store or share your files on any remote server. Your files are processed in real-time in your browser memory and are discarded as soon as the operation completes or when you close the tab.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-sky-500/20">
            3
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Third-Party Services
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We do not use any third-party services that collect personal information. We do not use third-party analytics trackers, telemetry scripts, or ad networks.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex items-start gap-4">
          <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-sky-500/20">
            4
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Changes to This Policy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
