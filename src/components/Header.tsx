import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Shield,
  Lock,
  LogIn,
  CreditCard,
  Mic,
  MicOff,
  Home,
  LayoutGrid,
  Landmark,
  Info,
  ShieldCheck,
  ChevronRight,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerQuery, setHeaderQuery] = useState('');
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const [headerKindFilter, setHeaderKindFilter] = useState<'all' | UniversalResultKind>('all');
  const [headerActiveIndex, setHeaderActiveIndex] = useState(0);

  const debouncedHeaderQuery = useDebouncedValue(headerQuery, 140);
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

  // Close desktop search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (headerSearchRef.current && !headerSearchRef.current.contains(targetNode)) {
        setIsHeaderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock background scroll & handle Escape key when slide-out drawer is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const primaryNavItems = [
    { id: 'home', label: t.home || 'Home', mobileLabel: t.home || 'Home', icon: Home },
    { id: 'tools', label: t.allTools || 'Tools', mobileLabel: t.allTools || 'All Tools', icon: LayoutGrid },
    {
      id: 'portals',
      label: 'Portals Hub',
      mobileLabel: 'Government Portals Hub',
      icon: Landmark,
    },
    { id: 'about', label: t.about || 'About', mobileLabel: t.about || 'About', icon: Info },
    { id: 'privacy', label: t.privacy || 'Privacy', mobileLabel: t.privacy || 'Privacy', icon: ShieldCheck },
  ];

  const hasLocksConfigured =
    securityConfig.pinEnabled ||
    securityConfig.requireAuthForProTools ||
    securityConfig.lockedToolIds.length > 0;

  return (
    <>
      <header className="sticky top-0 z-40 w-full md:backdrop-blur-xl bg-white/95 dark:bg-[#0B192C]/96 border-b border-slate-200 dark:border-sky-500/20 transition-colors shadow-sm dark:shadow-lg dark:shadow-black/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between gap-3 lg:gap-4 h-16 min-w-0">
            {/* Left: Official AOS TOOLS Brand Mark */}
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
                <span className="text-[16px] sm:text-xl font-black text-slate-900 dark:text-white">
                  AOS
                </span>
                <span className="text-[16px] sm:text-xl font-black text-[#0284c7] ml-1">
                  TOOLS
                </span>
              </div>
            </div>

            {/* Center: Desktop Soft-UI Segmented Nav Bar */}
            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center gap-1 p-1 aos-segmented-track shrink-0"
            >
              {primaryNavItems.map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={item.mobileLabel}
                    className={`px-3 xl:px-3.5 h-8 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 flex items-center ${
                      isSelected ? 'aos-btn-soft-active font-bold' : 'aos-btn-soft-tab'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right: Minimal Mobile Quick Actions (Search, Account, Hamburger) + Desktop Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop PWA App Install Button (moved inside drawer on mobile/tablet) */}
              <div className="hidden lg:flex shrink-0">
                <PWAInstallButton compact />
              </div>

              {/* Universal Search: Compact Icon (<xl) + Live Desktop Input (xl+) */}
              <div className="relative shrink-0" ref={headerSearchRef}>
                <button
                  type="button"
                  onClick={onOpenSearch}
                  aria-label="Search tools, portals, and records"
                  title="Universal Search (/ or Ctrl+K)"
                  className="xl:hidden aos-btn-icon h-9 w-9 cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                </button>

                {/* Desktop Live Type-Ahead Universal Search Bar */}
                <div className="hidden xl:flex items-center relative w-52 2xl:w-60">
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

              {/* Desktop Dark / Light Mode Switch (moved inside drawer on mobile/tablet) */}
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={
                  isDark
                    ? t.themeToggleLight || 'Switch to Light Mode'
                    : t.themeToggleDark || 'Switch to Dark Mode'
                }
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="hidden lg:inline-flex aos-btn-icon h-9 w-9 cursor-pointer shrink-0"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* Desktop Security Lock Shield (moved inside drawer on mobile/tablet) */}
              <button
                type="button"
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
                className={`hidden lg:inline-flex h-9 w-9 rounded-full transition-all cursor-pointer items-center justify-center shrink-0 ${
                  isSessionLocked
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                    : hasLocksConfigured
                    ? 'aos-btn-soft text-[#0284c7] dark:text-sky-300'
                    : 'aos-btn-icon'
                }`}
              >
                {isSessionLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </button>

              {/* Google Account Avatar / Sign In Button (always cleanly visible, icon/avatar on mobile) */}
              <button
                type="button"
                onClick={() => openAuthModal('account')}
                aria-label={user ? `Account: ${user.displayName}` : 'Sign in with Google'}
                title={user ? `${user.displayName} (${user.role})` : 'Google Sign-In & Session'}
                className={`h-9 ${
                  user
                    ? 'w-9 xl:w-auto xl:px-3 aos-btn-soft'
                    : 'w-9 xl:w-auto xl:px-3.5 aos-btn-primary'
                } cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0`}
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
                      <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white text-[11px] font-black inline-flex items-center justify-center shrink-0">
                        {(user.displayName || 'A').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="hidden xl:inline text-[11px] font-bold max-w-[88px] truncate">
                      {user.displayName.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-[11px] font-bold whitespace-nowrap">
                      Sign In
                    </span>
                  </>
                )}
              </button>

              {/* Mobile & Tablet Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="aos-mobile-drawer"
                className="lg:hidden aos-btn-icon h-9 w-9 cursor-pointer shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Off-Canvas Slide-Out "More" Drawer (Mobile & Tablet < lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Dimmed Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
          />

          {/* Deep Blue (#0B192C) Soft-UI Slide-Out Panel */}
          <aside
            id="aos-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="AOS Tools Navigation Menu"
            className="relative z-10 w-[86vw] max-w-[332px] h-full bg-white dark:bg-[#0B192C] border-l border-slate-200 dark:border-sky-400/25 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="px-4 h-16 border-b border-slate-200 dark:border-sky-500/20 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-[#0284c7] flex items-center justify-center p-0.5 shrink-0 aspect-square">
                  <AosLogoSvg className="w-full h-full aspect-square object-contain shrink-0" />
                </div>
                <div className="leading-tight">
                  <div className="flex items-baseline text-sm font-black tracking-tight">
                    <span className="text-slate-900 dark:text-white">AOS</span>
                    <span className="text-[#0284c7] ml-1">TOOLS</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-sky-300/75">
                    Navigation &amp; Preferences
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="aos-btn-icon h-9 w-9 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Section 1: Main Navigation */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-sky-300/75">
                  Explore Ecosystem
                </p>
                <nav aria-label="Drawer navigation" className="space-y-2">
                  {primaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full min-h-[42px] px-4 py-2 text-xs font-bold inline-flex items-center justify-between gap-2.5 cursor-pointer text-left ${
                          isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-white' : 'text-[#0284c7] dark:text-sky-300'
                            }`}
                          />
                          <span className="truncate">{item.mobileLabel}</span>
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-white/90' : 'text-slate-400 dark:text-sky-300/60'
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Section 2: Quick Utilities, Security & App Controls */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-sky-300/75">
                  Quick Controls &amp; App
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('card');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full min-h-[42px] px-4 py-2 text-xs font-bold inline-flex items-center justify-between gap-2.5 cursor-pointer ${
                      activeTab === 'card' ? 'aos-btn-soft-active' : 'aos-btn-soft'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <CreditCard
                        className={`w-4 h-4 shrink-0 ${
                          activeTab === 'card'
                            ? 'text-white'
                            : 'text-[#0284c7] dark:text-sky-300'
                        }`}
                      />
                      <span>Digital Card</span>
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        activeTab === 'card'
                          ? 'text-white/90'
                          : 'text-slate-400 dark:text-sky-300/60'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('locks');
                    }}
                    className="aos-btn-soft w-full min-h-[42px] px-4 py-2 text-xs font-bold inline-flex items-center justify-between gap-2.5 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      {isSessionLocked ? (
                        <Lock className="w-4 h-4 text-amber-500 dark:text-amber-300 shrink-0" />
                      ) : (
                        <Shield className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                      )}
                      <span>Tool Locks &amp; PIN</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSessionLocked
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                          : hasLocksConfigured
                          ? 'bg-sky-500/15 text-[#0284c7] dark:text-sky-300'
                          : 'text-slate-400 dark:text-sky-300/60'
                      }`}
                    >
                      {isSessionLocked ? 'Locked' : hasLocksConfigured ? 'Active' : 'Setup'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="aos-btn-soft w-full min-h-[42px] px-4 py-2 text-xs font-bold inline-flex items-center justify-between gap-2.5 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2.5">
                      {isDark ? (
                        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#0284c7] shrink-0" />
                      )}
                      <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-sky-300/80">
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  <PWAInstallButton
                    fullWidth
                    onActionComplete={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>

              {/* Section 3: Compact Soft-UI Language Switcher */}
              <div className="pt-3 border-t border-slate-200 dark:border-sky-500/20 space-y-2.5">
                <div className="px-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-sky-300/75">
                    <Globe className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300" />
                    <span>{t.langTitle || 'Language'}</span>
                  </span>
                </div>
                <div className="aos-segmented-track rounded-2xl p-2 grid grid-cols-2 gap-2 overflow-hidden">
                  {SUPPORTED_LANGUAGES.map((langItem) => {
                    const isCurrent = lang === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => setLang(langItem.code as LanguageCode)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-[11px] font-semibold inline-flex items-center justify-center cursor-pointer whitespace-nowrap ${
                          isCurrent ? 'aos-btn-soft-active font-bold' : 'aos-btn-soft-tab'
                        }`}
                      >
                        {langItem.nativeName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer: Account / Google Sign-In Card */}
            <div className="p-4 border-t border-slate-200 dark:border-sky-500/20 bg-slate-50 dark:bg-[#061324] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('account');
                }}
                className={`w-full min-h-[44px] px-4 py-2 text-xs font-bold inline-flex items-center justify-between gap-2.5 cursor-pointer ${
                  user ? 'aos-btn-soft' : 'aos-btn-primary'
                }`}
              >
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  {user ? (
                    user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-sky-400 shrink-0"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white text-[11px] font-black inline-flex items-center justify-center shrink-0">
                        {(user.displayName || 'A').charAt(0).toUpperCase()}
                      </span>
                    )
                  ) : (
                    <LogIn className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {user ? user.displayName : 'Sign In with Google'}
                  </span>
                </span>
                <span className="text-[10px] opacity-80 shrink-0">
                  {user ? user.role : 'Account'}
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
