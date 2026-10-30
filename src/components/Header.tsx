import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  Search,
  Globe,
  Check,
  ChevronDown,
  LayoutGrid,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  BookMarked,
  ShieldAlert,
  Building2,
  Layers
} from 'lucide-react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  TemplateId,
  DESIGN_TEMPLATES,
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
  templateId,
  setTemplateId,
  lang,
  setLang,
  onOpenSearch,
}) => {
  const [isLangOpen, setIsLangOpen] = useState<boolean>(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState<boolean>(false);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target as Node)) {
        setIsTemplateOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const currentTemplateObj =
    DESIGN_TEMPLATES.find((tpl) => tpl.id === templateId) || DESIGN_TEMPLATES[2];

  const navItems = [
    { id: 'home', label: t.home },
    { id: 'all-tools', label: t.allTools, isAction: true, onClick: onOpenSearch },
    { id: 'pdf', label: t.pdf },
    { id: 'image', label: t.image },
  ];

  const moreItems = [
    { id: 'special', label: t.special, icon: Sparkles, count: '9' },
    { id: 'khata', label: t.khata, icon: BookMarked, count: 'Live' },
    { id: 'pan', label: t.pan, icon: ShieldAlert, count: 'Official' },
    { id: 'portals', label: t.portals, icon: Building2, count: '50' },
  ];

  // Template-specific logo styles
  const getLogoStyle = () => {
    switch (templateId) {
      case 'template-1':
        return {
          container: 'bg-red-600 shadow-md shadow-red-600/40 text-white',
          inner: 'bg-[#180a0d]',
          iconText: 'text-red-500',
        };
      case 'template-2':
        return {
          container: 'bg-blue-600 shadow-md shadow-blue-600/30 text-white',
          inner: 'bg-white',
          iconText: 'text-blue-600',
        };
      case 'template-4':
        return {
          container: 'bg-slate-900 shadow-sm text-white',
          inner: 'bg-white dark:bg-slate-900',
          iconText: 'text-slate-900 dark:text-white',
        };
      case 'template-3':
      default:
        return {
          container: 'bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 shadow-md shadow-purple-500/40 text-white',
          inner: 'bg-white dark:bg-[#12062b]',
          iconText: 'text-purple-600 dark:text-purple-300',
        };
    }
  };

  const logoStyle = getLogoStyle();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0c051f]/85 backdrop-blur-xl shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('home');
              setIsMobileMenuOpen(false);
            }}
            className="group flex items-center gap-2.5 cursor-pointer focus:outline-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Stylish Bold Letter 'A' Logo Emblem */}
            <div className={`relative w-8 h-8 rounded-xl p-[2px] transition-all flex items-center justify-center shrink-0 ${logoStyle.container}`}>
              <div className={`w-full h-full rounded-[9px] flex items-center justify-center select-none ${logoStyle.inner}`}>
                <span className={`font-black text-sm leading-none font-sans tracking-tighter ${logoStyle.iconText} drop-shadow-xs`}>
                  A
                </span>
              </div>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-white uppercase drop-shadow-2xs flex items-center gap-1.5">
                AOS TOOLS
              </span>
              <span className="text-[9px] font-semibold text-slate-500 dark:text-purple-300/80 uppercase tracking-widest hidden sm:block">
                {currentTemplateObj.tagline}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`relative px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'theme-nav-active font-bold shadow-xs'
                    : 'text-slate-600 dark:text-purple-200/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-1 left-3.5 right-3.5 h-[2px] rounded-full"
                    style={{ backgroundColor: 'var(--accent-500)' }}
                  />
                )}
              </button>
            );
          })}

          {/* More Dropdown (Special Tools, Khata Diary, PAN Hub, Govt Portals) */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                ['special', 'khata', 'pan', 'portals'].includes(activeTab)
                  ? 'theme-nav-active font-bold shadow-xs'
                  : 'text-slate-600 dark:text-purple-200/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <span>{t.more}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-purple-300 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-[#12072b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-300/70 border-b border-slate-100 dark:border-white/10 mb-1.5">
                  {t.quickCategories || 'Quick Categories'}
                </div>
                <div className="space-y-1">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'theme-nav-active font-bold'
                            : 'text-slate-700 dark:text-purple-200 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-purple-400" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-purple-300 font-semibold">
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Controls: Search, 4-Template Switcher, Language, Theme, Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 dark:text-purple-200 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            title={`${t.search} (/)`}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-purple-300" />
            <span className="hidden xl:inline text-[11px] font-semibold">{t.search}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-purple-300/70 bg-white dark:bg-black/40 rounded border border-slate-200 dark:border-white/10 shadow-2xs">
              /
            </kbd>
          </button>

          {/* =========================================================================
              CLEAN 4-TEMPLATE SWITCHER (Replaces manual custom color picker palette)
              ========================================================================= */}
          <div className="relative" ref={templateDropdownRef}>
            <button
              onClick={() => {
                setIsTemplateOpen(!isTemplateOpen);
                setIsLangOpen(false);
                setIsMoreOpen(false);
              }}
              aria-label={t.selectTemplate}
              title={t.selectTemplate}
              className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-white bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-700 dark:text-purple-300" />
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/30 shrink-0"
                style={{ backgroundColor: currentTemplateObj.previewColor }}
              />
              <span className="hidden sm:inline text-[11px] font-bold">
                {currentTemplateObj.shortName}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isTemplateOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Template Options Popover Box */}
            {isTemplateOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#12072b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-300/80 border-b border-slate-100 dark:border-white/10 mb-2 flex items-center justify-between">
                  <span>{t.selectTemplate}</span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    4 Distinct Styles
                  </span>
                </div>

                <div className="space-y-1.5">
                  {DESIGN_TEMPLATES.map((tpl) => {
                    const isSelected = templateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => {
                          setTemplateId(tpl.id);
                          setIsTemplateOpen(false);
                        }}
                        className={`w-full flex items-start justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-white/15 border border-slate-300 dark:border-white/20 shadow-xs'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full mt-0.5 shrink-0 shadow-xs ring-2 ring-black/5 dark:ring-white/20"
                            style={{ backgroundColor: tpl.previewColor }}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{tpl.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-purple-300/70 leading-relaxed mt-0.5">
                              {tpl.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5"
                            style={{ backgroundColor: tpl.previewColor }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Multi-Language Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                setIsTemplateOpen(false);
                setIsMoreOpen(false);
              }}
              aria-label={t.langTitle}
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-semibold text-slate-700 dark:text-purple-200 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-purple-300" />
              <span className="hidden sm:inline text-[11px]">{currentLangObj.nativeName}</span>
              <span className="sm:hidden text-[10px] uppercase font-bold">{currentLangObj.code.slice(0, 2)}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-purple-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#12072b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-300/80 border-b border-slate-100 dark:border-white/10 mb-1">
                  {t.langTitle}
                </div>
                {SUPPORTED_LANGUAGES.map((langItem) => {
                  const isCurrent = lang === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => {
                        setLang(langItem.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                        isCurrent
                          ? 'bg-slate-100 dark:bg-white/10 font-bold text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-purple-200 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{langItem.nativeName}</span>
                        <span className="text-[10px] text-slate-500 dark:text-purple-300/70">{langItem.label}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>


            {/* Smooth Dark / Light Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-700 dark:text-purple-200 hover:text-slate-900 dark:hover:text-white bg-slate-100/90 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-slate-700 dark:text-purple-200 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0e0524]/98 p-4 space-y-3 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Template Selector Bar */}
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-purple-300/80">
              {t.selectTemplate} (4 Designs)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DESIGN_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setTemplateId(tpl.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold cursor-pointer ${
                    templateId === tpl.id
                      ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-purple-200 hover:bg-white/50'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/20"
                    style={{ backgroundColor: tpl.previewColor }}
                  />
                  <span className="truncate">{tpl.badge}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { id: 'home', label: t.home, icon: Layers },
              { id: 'pdf', label: `${t.pdf} (19)`, icon: FileText },
              { id: 'image', label: `${t.image} (12)`, icon: ImageIcon },
              { id: 'special', label: `${t.special} (9)`, icon: Sparkles },
              { id: 'khata', label: t.khata, icon: BookMarked },
              { id: 'pan', label: t.pan, icon: ShieldAlert },
              { id: 'portals', label: t.portals, icon: Building2 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'theme-nav-active font-bold shadow-xs'
                      : 'text-slate-700 dark:text-purple-200 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-purple-300 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
              <span className="font-semibold text-slate-700 dark:text-purple-200">
                Mode
              </span>
              <button
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-800 dark:text-white font-semibold shadow-2xs border border-slate-200/70 dark:border-white/10 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                onOpenSearch();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-purple-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.search} ({t.allTools})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
