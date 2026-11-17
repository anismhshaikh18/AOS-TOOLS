import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, Lightbulb, Globe, ChevronUp, Check } from 'lucide-react';
import { AosLogoSvg } from './AosLogoSvg';
import { LanguageCode, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../utils/translations';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenFreePolicy: () => void;
  onOpenRequestModal?: () => void;
  setActiveTab: (tab: string) => void;
  lang?: LanguageCode;
  setLang?: (lang: LanguageCode) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenFreePolicy,
  onOpenRequestModal,
  setActiveTab,
  lang = 'en',
  setLang,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isLangOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isLangOpen]);

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
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
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

        {/* Secondary Navigation Links + Compact Language Switcher */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2.5 sm:gap-x-6">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {t.home || 'Home'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {t.allTools || 'All Tools'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('portals')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Government Portals Hub
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[#0284c7] dark:text-sky-300 whitespace-nowrap"
            >
              Digital Card (/card)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {t.about || 'About Us'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {t.privacy || 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={onOpenFreePolicy}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Strict ₹0-Cost Policy
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            {setLang && (
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen((prev) => !prev)}
                  aria-label="Select Language"
                  aria-expanded={isLangOpen}
                  className="aos-btn-soft inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Globe className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300 shrink-0" />
                  <span>{currentLang.nativeName}</span>
                  <ChevronUp
                    className={`w-3.5 h-3.5 transition-transform shrink-0 ${
                      isLangOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/30 shadow-2xl p-1.5 z-50">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/10 mb-1">
                      {t.langTitle || 'Select Language'}
                    </div>
                    <div className="space-y-1">
                      {SUPPORTED_LANGUAGES.map((langItem) => {
                        const isCurrent = lang === langItem.code;
                        return (
                          <button
                            key={langItem.code}
                            type="button"
                            onClick={() => {
                              setLang(langItem.code as LanguageCode);
                              setIsLangOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer text-left ${
                              isCurrent
                                ? 'aos-btn-soft-active font-bold'
                                : 'aos-btn-soft-tab'
                            }`}
                          >
                            <span>{langItem.nativeName}</span>
                            {isCurrent && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onOpenRequestModal && (
              <button
                type="button"
                onClick={onOpenRequestModal}
                className="aos-btn-soft inline-flex items-center justify-center gap-1.5 min-h-[36px] px-4 py-1.5 text-xs font-bold text-[#0284c7] dark:text-sky-300 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>Request a Tool</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

