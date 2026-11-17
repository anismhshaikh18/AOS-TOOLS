import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  CreditCard,
  Mic,
  MicOff,
} from 'lucide-react';
import { ToolItem } from '../types';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  TemplateId,
  TRANSLATIONS,
} from '../utils/translations';
import { useAuthSecurity } from '../context/AuthSecurityContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import {
  buildUniversalIndex,
  getUniversalKindCounts,
  searchUniversalIndex,
  UniversalResultKind,
} from '../utils/universalSearchIndex';
import { UniversalSearchResults } from './UniversalSearchResults';

import { AosLogoSvg } from './AosLogoSvg';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectTool?: (tool: ToolItem) => void;
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
  onSelectTool,
  isDark,
  onToggleTheme,
  lang,
  setLang,
  onOpenSearch,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerQuery, setHeaderQuery] = useState('');
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const [headerKindFilter, setHeaderKindFilter] = useState<'all' | UniversalResultKind>('all');
  const [headerActiveIndex, setHeaderActiveIndex] = useState(0);

  const debouncedHeaderQuery = useDebouncedValue(headerQuery, 140);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const headerSearchRef = useRef<HTMLDivElement>(null);
  const {
    user,
    securityConfig,
    isSessionLocked,
    lockSessionNow,
    openAuthModal,
    isToolCurrentlyLocked,
  } = useAuthSecurity();

  const isDiaryLocked = isToolCurrentlyLocked('khata-diary');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const { isSupported: voiceSupported, isListening, startListening } = useVoiceSearch(
    lang,
    (transcript) => {
      setHeaderQuery(transcript);
      setIsHeaderDropdownOpen(true);
    }
  );

  const universalIndex = useMemo(
    () =>
      isHeaderDropdownOpen
        ? buildUniversalIndex({
            lang,
            userId: user?.uid || null,
            isToolLocked: isToolCurrentlyLocked,
          })
        : [],
    [isHeaderDropdownOpen, lang, user?.uid, isToolCurrentlyLocked]
  );

  const headerCounts = useMemo(
    () => getUniversalKindCounts(universalIndex, debouncedHeaderQuery),
    [universalIndex, debouncedHeaderQuery]
  );

  const headerResults = useMemo(
    () => searchUniversalIndex(universalIndex, debouncedHeaderQuery, headerKindFilter, 18),
    [universalIndex, debouncedHeaderQuery, headerKindFilter]
  );

  useEffect(() => {
    setHeaderActiveIndex(0);
  }, [debouncedHeaderQuery, headerKindFilter]);

  const closeHeaderDropdown = useCallback(() => {
    setIsHeaderDropdownOpen(false);
  }, []);

  const handleHeaderSelectTool = useCallback(
    (tool: ToolItem) => {
      if (onSelectTool) {
        onSelectTool(tool);
      } else {
        onOpenSearch();
      }
      setHeaderQuery('');
      setIsHeaderDropdownOpen(false);
    },
    [onSelectTool, onOpenSearch]
  );

  const triggerHeaderActiveItem = useCallback(() => {
    const selected = headerResults[headerActiveIndex];
    if (!selected) return;
    const { item, resolvedPortalUrl } = selected;
    if (item.kind === 'tool' && item.tool) {
      handleHeaderSelectTool(item.tool);
      return;
    }
    if (item.kind === 'portal') {
      if (item.isLocked && item.targetTab) {
        setActiveTab(item.targetTab);
      } else if (resolvedPortalUrl) {
        const anchor = document.createElement('a');
        anchor.href = resolvedPortalUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
      }
      setHeaderQuery('');
      setIsHeaderDropdownOpen(false);
      return;
    }
    if (item.kind === 'utility') {
      if (item.tool) handleHeaderSelectTool(item.tool);
      else if (item.targetTab) setActiveTab(item.targetTab);
      setHeaderQuery('');
      setIsHeaderDropdownOpen(false);
      return;
    }
    if (item.kind === 'diary' && item.targetTab) {
      setActiveTab(item.targetTab);
      setHeaderQuery('');
      setIsHeaderDropdownOpen(false);
    }
  }, [headerResults, headerActiveIndex, handleHeaderSelectTool, setActiveTab]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(targetNode)) {
        setIsLangOpen(false);
      }
      if (headerSearchRef.current && !headerSearchRef.current.contains(targetNode)) {
        setIsHeaderDropdownOpen(false);
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
    { id: 'portals', label: 'Government Portals Hub' },
    { id: 'about', label: t.about || 'About' },
    { id: 'privacy', label: t.privacy || 'Privacy' },
  ];

  const hasLocksConfigured =
    securityConfig.pinEnabled ||
    securityConfig.requireAuthForProTools ||
    securityConfig.lockedToolIds.length > 0;

  return (
    <header className="sticky top-0 z-40 w-full md:backdrop-blur-xl bg-white/95 dark:bg-[#0B192C]/96 border-b border-slate-200 dark:border-sky-500/20 transition-colors shadow-sm dark:shadow-lg dark:shadow-black/30">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 sm:h-[68px]">
          {/* Left: Balanced Brand Mark */}
          <div
            onClick={() => {
              setActiveTab('home');
              setIsMobileMenuOpen(false);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('home');
                setIsMobileMenuOpen(false);
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white ring-2 ring-[#0284c7] group-hover:ring-sky-400 flex items-center justify-center shadow-md dark:shadow-black/40 group-hover:scale-105 transition-all p-0.5 shrink-0 aspect-square">
              <AosLogoSvg className="w-full h-full aspect-square object-contain shrink-0" />
            </div>
            <div className="flex items-baseline tracking-tight whitespace-nowrap">
              <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                AOS
              </span>
              <span className="text-base sm:text-xl font-black text-[#0284c7] ml-1">
                TOOLS
              </span>
            </div>
          </div>

          {/* Center: Desktop Nav Bar */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-full bg-slate-100/90 dark:bg-[#03182b]/85 border border-slate-200 dark:border-sky-500/20 shrink-0"
          >
            {primaryNavItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 lg:px-3.5 h-8 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 flex items-center ${
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

          {/* Right: Clean Uniform Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA App Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton compact />
            </div>

            {/* Live Universal Header Search Bar (xl+) & Palette Trigger (<xl) */}
            <div className="relative shrink-0" ref={headerSearchRef}>
              {/* Compact Mobile/Tablet Trigger */}
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Search tools, portals, and records"
                title="Universal Search (/ or Ctrl+K)"
                className="xl:hidden h-9 w-9 sm:w-auto sm:px-3 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/45 hover:bg-slate-200 dark:hover:bg-[#0d4775]/75 border border-slate-200 dark:border-sky-500/25 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-sky-200/85">
                  Search...
                </span>
              </button>

              {/* Desktop Live Type-Ahead Universal Search Bar */}
              <div className="hidden xl:flex items-center relative w-56 2xl:w-64">
                <Search className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={headerQuery}
                  onFocus={() => setIsHeaderDropdownOpen(true)}
                  onChange={(e) => {
                    setHeaderQuery(e.target.value);
                    setIsHeaderDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsHeaderDropdownOpen(false);
                      (e.currentTarget as HTMLInputElement).blur();
                    } else if (e.key === 'ArrowDown' && headerResults.length > 0) {
                      e.preventDefault();
                      setIsHeaderDropdownOpen(true);
                      setHeaderActiveIndex((prev) => (prev + 1) % headerResults.length);
                    } else if (e.key === 'ArrowUp' && headerResults.length > 0) {
                      e.preventDefault();
                      setIsHeaderDropdownOpen(true);
                      setHeaderActiveIndex(
                        (prev) => (prev - 1 + headerResults.length) % headerResults.length
                      );
                    } else if (e.key === 'Enter' && headerResults.length > 0) {
                      e.preventDefault();
                      triggerHeaderActiveItem();
                    }
                  }}
                  placeholder="Search tools, portals, diary..."
                  aria-label="Universal site search"
                  className="w-full h-9 pl-8 pr-14 rounded-full text-xs bg-slate-100 dark:bg-[#03182b]/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-sky-200/60 border border-slate-200 dark:border-sky-500/30 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/30 transition-all"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  {headerQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderQuery('');
                        setIsHeaderDropdownOpen(false);
                      }}
                      aria-label="Clear header search"
                      className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : voiceSupported ? (
                    <button
                      type="button"
                      onClick={startListening}
                      aria-label={isListening ? 'Stop voice search' : 'Voice search'}
                      title="Voice Search"
                      className={`p-1 rounded-full cursor-pointer transition-colors ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-[#0284c7] dark:text-sky-300 hover:bg-[#0284c7]/15'
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-3.5 h-3.5" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onOpenSearch}
                    title="Open Full Search Palette (/)"
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-white dark:bg-[#072642] rounded border border-slate-200 dark:border-sky-500/30 text-slate-500 dark:text-sky-200 leading-none cursor-pointer hover:border-[#0284c7]"
                  >
                    /
                  </button>
                </div>
              </div>

              {/* Desktop Deep Blue (#0B192C) Glassmorphism Universal Results Dropdown */}
              {isHeaderDropdownOpen && (
                <div className="hidden xl:block absolute right-0 top-full mt-2 w-[480px] rounded-2xl bg-white dark:bg-[#0B192C]/96 md:backdrop-blur-xl border border-slate-200 dark:border-sky-400/30 shadow-2xl overflow-hidden z-50">
                  <UniversalSearchResults
                    results={headerResults}
                    query={debouncedHeaderQuery}
                    activeFilter={headerKindFilter}
                    onChangeFilter={setHeaderKindFilter}
                    counts={headerCounts}
                    activeIndex={headerActiveIndex}
                    onSelectTool={handleHeaderSelectTool}
                    onNavigateTab={(tab) => {
                      setActiveTab(tab);
                      setHeaderQuery('');
                      closeHeaderDropdown();
                    }}
                    onAfterSelect={() => {
                      setHeaderQuery('');
                      closeHeaderDropdown();
                    }}
                    maxHeightClass="max-h-[420px]"
                    showDiaryTab={!isDiaryLocked}
                  />
                </div>
              )}
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={onToggleTheme}
              aria-label={
                isDark
                  ? t.themeToggleLight || 'Switch to Light Mode'
                  : t.themeToggleDark || 'Switch to Dark Mode'
              }
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-9 w-9 text-slate-600 dark:text-slate-200 hover:text-amber-500 dark:hover:text-sky-300 bg-slate-100 dark:bg-[#0d4775]/45 hover:bg-slate-200 dark:hover:bg-[#0d4775]/75 border border-slate-200 dark:border-sky-500/25 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-xs shrink-0"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Language Selector Dropdown (sm+ in bar; compact inside menu on <sm) */}
            <div className="relative hidden sm:block" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select language"
                className="h-9 px-2.5 lg:px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/45 hover:bg-slate-200 dark:hover:bg-[#0d4775]/75 border border-slate-200 dark:border-sky-500/25 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <span className="hidden lg:inline text-[11px] font-medium whitespace-nowrap">
                  {currentLangObj.nativeName}
                </span>
                <span className="lg:hidden text-[10px] font-bold uppercase">
                  {currentLangObj.code.slice(0, 2)}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform shrink-0 ${
                    isLangOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-500/30 rounded-2xl shadow-xl dark:shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/10 mb-1">
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

            {/* Security Lock Shield (sm+ in bar; inside menu on <sm) */}
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
              className={`hidden sm:flex h-9 w-9 rounded-full border transition-all cursor-pointer items-center justify-center shadow-xs shrink-0 ${
                isSessionLocked
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35'
                  : hasLocksConfigured
                  ? 'bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border-[#0284c7]/35'
                  : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/45 border-slate-200 dark:border-sky-500/25'
              }`}
            >
              {isSessionLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
            </button>

            {/* Google Account / Sign In Button */}
            <button
              onClick={() => openAuthModal('account')}
              aria-label={user ? `Account: ${user.displayName}` : 'Sign in with Google'}
              title={user ? `${user.displayName} (${user.role})` : 'Google Sign-In & Session'}
              className={`h-9 ${
                user ? 'w-9 lg:w-auto lg:px-3' : 'w-9 sm:w-auto sm:px-3'
              } rounded-full border transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0 ${
                user
                  ? 'bg-[#0284c7]/15 dark:bg-[#0d4775]/65 border-[#0284c7]/40 text-slate-900 dark:text-white hover:bg-[#0284c7]/25'
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
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-sky-400 shrink-0"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                      {(user.displayName || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden lg:inline text-[11px] font-bold max-w-[92px] truncate">
                    {user.displayName.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-bold whitespace-nowrap">
                    Sign In
                  </span>
                </>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden h-9 w-9 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-[#0d4775]/45 border border-slate-200 dark:border-sky-500/25 rounded-full cursor-pointer flex items-center justify-center shadow-xs shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-sky-500/20 space-y-3 animate-in fade-in duration-150">
            {/* Navigation */}
            <div className="grid grid-cols-2 gap-2">
              {primaryNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    item.id === 'portals' ? 'col-span-2' : ''
                  } ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-[#03182b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-500/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Auth & Tool Locks */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('account');
                }}
                className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#0284c7]/15 dark:bg-[#0284c7]/25 text-[#0284c7] dark:text-sky-200 border border-[#0284c7]/30 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {user ? user.displayName.split(' ')[0] : 'Google Sign-In'}
                </span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('locks');
                }}
                className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#03182b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-500/20 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                <span>Tool Locks & PIN</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTab('card');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#03182b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-500/20 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                <span>Digital Card</span>
              </button>
              <PWAInstallButton
                fullWidth
                onActionComplete={() => setIsMobileMenuOpen(false)}
              />
            </div>

            {/* Quick Language Bar for <sm phones */}
            <div className="sm:hidden pt-1 border-t border-slate-200 dark:border-sky-500/15 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Globe className="w-3 h-3 text-[#0284c7]" />
                <span>{t.langTitle || 'Language'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {SUPPORTED_LANGUAGES.map((langItem) => {
                  const isCurrent = lang === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLang(langItem.code as LanguageCode);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-colors cursor-pointer truncate ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white font-bold'
                          : 'bg-slate-100 dark:bg-[#03182b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-sky-500/20'
                      }`}
                    >
                      {langItem.nativeName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
