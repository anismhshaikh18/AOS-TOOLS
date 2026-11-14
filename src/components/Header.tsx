import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  Menu,
  X,
  Check,
  Shield,
  Lock,
  LogIn,
} from 'lucide-react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  TemplateId,
  TRANSLATIONS,
} from '../utils/translations';
import { useAuthSecurity } from '../context/AuthSecurityContext';

import { AosLogoSvg } from './AosLogoSvg';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  templateId: TemplateId;
  setTemplateId: (id: TemplateId) => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  onToggleTheme,
  lang,
  setLang,
  onOpenSearch,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const {
    user,
    securityConfig,
    isSessionLocked,
    lockSessionNow,
    openAuthModal,
  } = useAuthSecurity();

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const primaryNavItems = [
    { id: 'home', label: t.home || 'Home' },
    { id: 'tools', label: t.allTools || 'Tools' },
    { id: 'about', label: t.about || 'About' },
    { id: 'privacy', label: t.privacy || 'Privacy' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/95 dark:bg-[#072642]/90 border-b border-slate-200 dark:border-sky-500/20 transition-colors shadow-sm dark:shadow-lg dark:shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo with proper circular shape and high quality */}
          <div
            onClick={() => setActiveTab('home')}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white ring-2 ring-[#0284c7] hover:ring-sky-400 flex items-center justify-center shadow-md dark:shadow-black/50 group-hover:scale-105 transition-all p-0.5 shrink-0 aspect-square">
              <AosLogoSvg className="w-full h-full aspect-square object-contain shrink-0" />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                AOS
              </span>
              <span className="text-lg sm:text-xl font-black text-[#0284c7] ml-1">
                TOOLS
              </span>
            </div>
          </div>

          {/* Desktop Nav Pills (Anis Online Services corporate sapphire styling) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-100/90 dark:bg-[#03182b]/80 border border-slate-200 dark:border-sky-500/20">
            {primaryNavItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Search, Theme Toggle, Language */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Shortcut */}
            <button
              onClick={onOpenSearch}
              aria-label="Search tools"
              title="Search tools (/)"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/40 hover:bg-slate-200 dark:hover:bg-[#0d4775]/70 border border-slate-200 dark:border-sky-500/25 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.2 bg-white dark:bg-black/40 rounded border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                /
              </kbd>
            </button>

            {/* Dark / Light Mode Switch (Anis Online Services Contrast Engine) */}
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? t.themeToggleLight || 'Switch to Light Mode' : t.themeToggleDark || 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-sky-300 bg-slate-100 dark:bg-[#0d4775]/40 hover:bg-slate-200 dark:hover:bg-[#0d4775]/70 border border-slate-200 dark:border-sky-500/25 rounded-full transition-all cursor-pointer shadow-xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select language"
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/40 hover:bg-slate-200 dark:hover:bg-[#0d4775]/70 border border-slate-200 dark:border-sky-500/25 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-[#0284c7]" />
                <span className="hidden sm:inline text-[11px] font-medium">
                  {currentLangObj.nativeName}
                </span>
                <span className="sm:hidden text-[10px] font-bold uppercase">
                  {currentLangObj.code.slice(0, 2)}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-500/30 rounded-2xl shadow-xl dark:shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-white/10 mb-1">
                    {t.langTitle || 'Select Language'}
                  </div>
                  {SUPPORTED_LANGUAGES.map((langItem) => {
                    const isCurrent = lang === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        onClick={() => {
                          setLang(langItem.code as LanguageCode);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white font-bold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{langItem.nativeName}</span>
                          <span className="text-[10px] opacity-75">{langItem.label}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tool Lock / Quick Lock Shield Button */}
            <button
              onClick={() => {
                if (securityConfig.pinEnabled && !isSessionLocked) {
                  lockSessionNow();
                } else {
                  openAuthModal('locks');
                }
              }}
              aria-label={
                securityConfig.pinEnabled && !isSessionLocked
                  ? 'Lock session now'
                  : 'Tool Lock & Security Controls'
              }
              title={
                securityConfig.pinEnabled && !isSessionLocked
                  ? 'Lock active session now'
                  : 'Tool Locks & PIN Security'
              }
              className={`hidden sm:flex p-2 rounded-full border transition-all cursor-pointer items-center gap-1 shadow-xs ${
                isSessionLocked
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35'
                  : securityConfig.pinEnabled ||
                    securityConfig.requireAuthForProTools ||
                    securityConfig.lockedToolIds.length > 0
                  ? 'bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border-[#0284c7]/35'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/40 border-slate-200 dark:border-sky-500/25'
              }`}
            >
              {isSessionLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </button>

            {/* Google Account / Sign In Trigger */}
            <button
              onClick={() => openAuthModal('account')}
              aria-label={user ? `Account: ${user.displayName}` : 'Sign in with Google'}
              title={user ? `${user.displayName} (${user.role})` : 'Google Sign-In & Session'}
              className={`px-2 sm:px-2.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                user
                  ? 'bg-[#0284c7]/15 dark:bg-[#0d4775]/60 border-[#0284c7]/40 text-slate-900 dark:text-white hover:bg-[#0284c7]/25'
                  : 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] border-sky-400/40 text-white hover:brightness-110'
              }`}
            >
              {user ? (
                <>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-sky-400 shrink-0"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {(user.displayName || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden lg:inline text-[11px] font-bold max-w-[96px] truncate">
                    {user.displayName.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold whitespace-nowrap">
                    Sign In
                  </span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/40 border border-slate-200 dark:border-sky-500/25 rounded-full cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-sky-500/20 space-y-2.5 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2">
              {primaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-[#03182b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-500/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('account');
                }}
                className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#0284c7]/15 dark:bg-[#0284c7]/25 text-[#0284c7] dark:text-sky-200 border border-[#0284c7]/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{user ? 'Operator Profile' : 'Google Sign-In'}</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('locks');
                }}
                className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#03182b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-500/20"
              >
                <Shield className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Tool Locks & PIN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
