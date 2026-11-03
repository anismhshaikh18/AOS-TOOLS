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
} from 'lucide-react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  TemplateId,
  TRANSLATIONS,
} from '../utils/translations';

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
    { id: 'about', label: 'About' },
    { id: 'privacy', label: 'Privacy' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#03182b]/90 border-b border-[#0d4775]/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo with proper circular shape and high quality */}
          <div
            onClick={() => setActiveTab('home')}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white ring-2 ring-[#0d4775] hover:ring-red-500 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-105 transition-all p-0.5 shrink-0">
              <img
                src="/assets/aistudio/AOS_Logo_783714c3.png"
                alt="AOS Logo"
                className="w-full h-full object-contain rounded-full"
                loading="eager"
              />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-lg sm:text-xl font-black text-white">
                AOS
              </span>
              <span className="text-lg sm:text-xl font-black text-red-500 ml-1">
                TOOLS
              </span>
            </div>
          </div>

          {/* Desktop Nav Pills (Matching Screenshot navigation!) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#021526]/80 border border-[#0d4775]/50 shadow-inner">
            {primaryNavItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Search, Theme Toggle, Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={onOpenSearch}
              aria-label="Search tools"
              className="p-2 text-slate-300 hover:text-white bg-[#072642] hover:bg-[#0a355c] border border-[#0d4775] rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.2 bg-[#021526] rounded text-slate-400">
                /
              </kbd>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select language"
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#072642] hover:bg-[#0a355c] border border-[#0d4775] rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline text-[11px] font-medium">
                  {currentLangObj.nativeName}
                </span>
                <span className="sm:hidden text-[10px] font-bold uppercase">
                  {currentLangObj.code.slice(0, 2)}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#072642] border border-[#0d4775] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                    Language
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
                            ? 'bg-red-600 text-white font-bold'
                            : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <span>{langItem.nativeName}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle Pill Button */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              className="p-2 text-slate-300 hover:text-white bg-[#072642] hover:bg-[#0a355c] border border-[#0d4775] rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-400" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white bg-[#072642] border border-[#0d4775] rounded-full cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#0d4775] space-y-2 animate-in fade-in duration-150">
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
                      ? 'bg-red-600 text-white'
                      : 'bg-[#072642] text-slate-200 hover:bg-[#093256]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
