import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { PdfToolsView } from './views/PdfToolsView';
import { ImageToolsView } from './views/ImageToolsView';
import { SpecialToolsView } from './views/SpecialToolsView';
import { KhataDiary } from './components/KhataDiary';
import { PanMasterHub } from './components/PanMasterHub';
import { GovernmentPortals } from './components/GovernmentPortals';
import { ToolRunnerModal } from './components/ToolRunnerModal';
import { SearchModal } from './components/SearchModal';
import { PrivacyModal, FreePolicyModal } from './components/PolicyModals';
import { ToolItem } from './types';
import { PDF_TOOLS } from './data/pdfTools';
import { IMAGE_TOOLS } from './data/imageTools';
import { SPECIAL_TOOLS } from './data/specialTools';
import { LanguageCode, TemplateId, DESIGN_TEMPLATES } from './utils/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isFreePolicyOpen, setIsFreePolicyOpen] = useState<boolean>(false);

  // 4 Design Templates: Template 1 (Red & Black), Template 2 (Blue & White), Template 3 (Purple), Template 4 (Minimal Slate)
  const [templateId, setTemplateId] = useState<TemplateId>(() => {
    try {
      const saved = localStorage.getItem('aos_template') as TemplateId;
      if (saved && ['template-1', 'template-2', 'template-3', 'template-4'].includes(saved)) {
        return saved;
      }
      return 'template-3';
    } catch {
      return 'template-3';
    }
  });

  // Multi-Language state (6 languages: en, hi, ta, te, mr, hinglish)
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('aos_lang') as LanguageCode;
      if (saved && ['en', 'hi', 'ta', 'te', 'mr', 'hinglish'].includes(saved)) {
        return saved;
      }
      return 'en';
    } catch {
      return 'en';
    }
  });

  // Smooth Dark / Light Mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aos_theme');
      if (saved) return saved === 'dark';
      return true; // Default dark appearance
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('aos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('aos_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-template', templateId);
    localStorage.setItem('aos_template', templateId);
  }, [templateId]);

  useEffect(() => {
    localStorage.setItem('aos_lang', lang);
  }, [lang]);

  const handleSelectTemplate = (id: TemplateId) => {
    setTemplateId(id);
  };

  // Mobile browser back-button & history navigation handler (handles back-press without closing app)
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ tab: 'home', toolId: null }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.toolId) {
          const allTools = [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS];
          const found = allTools.find((t) => t.id === state.toolId);
          setSelectedTool(found || null);
        } else {
          setSelectedTool(null);
        }
        if (state.tab) {
          setActiveTab(state.tab);
        }
        setIsSearchOpen(false);
        setIsPrivacyOpen(false);
        setIsFreePolicyOpen(false);
      } else {
        setSelectedTool(null);
        setIsSearchOpen(false);
        setIsPrivacyOpen(false);
        setIsFreePolicyOpen(false);
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    window.history.pushState({ tab, toolId: null }, '');
  };

  const handleSelectTool = (tool: ToolItem) => {
    if (tool.id === 'khata-diary') {
      handleNavigateTab('khata');
      return;
    }
    setSelectedTool(tool);
    window.history.pushState({ tab: activeTab, toolId: tool.id }, '');
  };

  const handleCloseTool = () => {
    setSelectedTool(null);
    if (window.history.state?.toolId) {
      window.history.back();
    }
  };

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLaunchPhotoResizer = () => {
    const photoTool = IMAGE_TOOLS.find((t) => t.id === 'photo-signature-resize');
    if (photoTool) {
      handleSelectTool(photoTool);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      
      {/* Responsive Header with Template Switcher, Dark/Light Mode & Language Selector */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        templateId={templateId}
        setTemplateId={handleSelectTemplate}
        lang={lang}
        setLang={setLang}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0">
        {activeTab === 'home' && (
          <HomeView
            onSelectTool={handleSelectTool}
            setActiveTab={handleNavigateTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            templateId={templateId}
            lang={lang}
          />
        )}

        {activeTab === 'pdf' && (
          <PdfToolsView onSelectTool={handleSelectTool} lang={lang} />
        )}

        {activeTab === 'image' && (
          <ImageToolsView onSelectTool={handleSelectTool} lang={lang} />
        )}

        {activeTab === 'special' && (
          <SpecialToolsView onSelectTool={handleSelectTool} lang={lang} />
        )}

        {activeTab === 'khata' && <KhataDiary />}

        {activeTab === 'pan' && (
          <PanMasterHub onLaunchImageResize={handleLaunchPhotoResizer} />
        )}

        {activeTab === 'portals' && <GovernmentPortals />}
      </main>

      {/* Clean Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenFreePolicy={() => setIsFreePolicyOpen(true)}
        setActiveTab={handleNavigateTab}
      />

      {/* Execution Modal */}
      {selectedTool && (
        <ToolRunnerModal
          tool={selectedTool}
          onClose={handleCloseTool}
          onOpenKhataTab={() => {
            handleCloseTool();
            handleNavigateTab('khata');
          }}
        />
      )}

      {/* Search Palette Modal */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectTool={handleSelectTool}
        />
      )}

      {/* Policy Modals */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <FreePolicyModal
        isOpen={isFreePolicyOpen}
        onClose={() => setIsFreePolicyOpen(false)}
      />

    </div>
  );
}
