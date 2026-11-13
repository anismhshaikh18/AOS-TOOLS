import React from 'react';
import { ShieldCheck, ExternalLink, Lightbulb } from 'lucide-react';
import { AosLogoSvg } from './AosLogoSvg';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenFreePolicy: () => void;
  onOpenRequestModal?: () => void;
  setActiveTab: (tab: string) => void;
  lang?: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenFreePolicy,
  onOpenRequestModal,
  setActiveTab,
  lang = 'en',
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-sky-500/20 bg-white dark:bg-[#03182b]/90 py-8 text-slate-600 dark:text-slate-300 transition-colors shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('home')}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-[#0284c7] flex items-center justify-center shadow-md shrink-0 p-0.5 group-hover:scale-105 transition-transform aspect-square">
              <AosLogoSvg className="w-full h-full aspect-square object-contain shrink-0" />
            </div>
            <div className="flex items-baseline font-black tracking-tight text-sm">
              <span className="text-slate-900 dark:text-white">AOS</span>
              <span className="text-[#0284c7] ml-1">TOOLS</span>
            </div>
          </div>

          {/* Copyright text */}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} AOS TOOLS • Anis Online Services Ecosystem. All rights reserved.
          </p>

          <a
            href="https://anis-online-services.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0284c7] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Anis Online Services</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Secondary Navigation Links */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('home')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {t.home || 'Home'}
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {t.allTools || 'All Tools'}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {t.about || 'About Us'}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {t.privacy || 'Privacy Policy'}
          </button>
          <button
            onClick={onOpenFreePolicy}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Strict ₹0-Cost Policy
          </button>
          {onOpenRequestModal && (
            <button
              onClick={onOpenRequestModal}
              className="hover:text-[#0284c7] dark:hover:text-sky-300 font-bold text-[#0284c7] dark:text-sky-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Request a Tool</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
