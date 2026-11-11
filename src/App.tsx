import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ToolsDirectoryView } from './views/ToolsDirectoryView';
import { AboutView } from './views/AboutView';
import { PrivacyView } from './views/PrivacyView';
import { PdfToolsView } from './views/PdfToolsView';
import { ImageToolsView } from './views/ImageToolsView';
import { SpecialToolsView } from './views/SpecialToolsView';
import { PassportPhotoStudioPage } from './views/PassportPhotoStudioPage';
import { SmartIdCardStudioPage } from './views/SmartIdCardStudioPage';
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
import { LanguageCode, TemplateId, getTranslatedTool } from './utils/translations';
import { SiteBackgroundSvg } from './components/SiteBackgroundSvg';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isFreePolicyOpen, setIsFreePolicyOpen] = useState<boolean>(false);

  // Template Id
  const [templateId, setTemplateId] = useState<TemplateId>(() => {
    try {
      const saved = localStorage.getItem('aos_template') as TemplateId;
      if (saved && ['template-1', 'template-2', 'template-3', 'template-4'].includes(saved)) {
        return saved;
      }
      return 'template-1';
    } catch {
      return 'template-1';
    }
  });

  // Dark / Light theme toggle state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aos_theme');
      if (saved) return saved === 'dark';
      return true; // Default to Anis Online Services deep navy blue
    } catch {
      return true;
    }
  });

  // Multi-Language state
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

  // Synchronize Dark / Light mode class on document
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

  useEffect(() => {
    document.documentElement.setAttribute('data-template', templateId);
    localStorage.setItem('aos_template', templateId);
  }, [templateId]);

  useEffect(() => {
    localStorage.setItem('aos_lang', lang);
  }, [lang]);

  // Mobile browser back-button & history navigation handler
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
          setSelectedTool(found ? getTranslatedTool(found, lang) : null);
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
  }, [lang]);

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ tab, toolId: null }, '');
  };

  const handleSelectTool = (tool: ToolItem) => {
    if (tool.id === 'khata-diary') {
      handleNavigateTab('khata');
      return;
    }
    const localizedTool = getTranslatedTool(tool, lang);
    setSelectedTool(localizedTool);
    window.history.pushState({ tab: activeTab, toolId: tool.id }, '');
  };

  const handleCloseTool = () => {
    setSelectedTool(null);
    if (window.history.state?.toolId) {
      window.history.back();
    }
  };

  const handleOpenSearchModal = () => {
    setIsSearchOpen(true);
    window.history.pushState({ tab: activeTab, isSearchModal: true }, '');
  };

  const handleCloseSearchModal = () => {
    setIsSearchOpen(false);
    if (window.history.state?.isSearchModal) {
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
        handleOpenSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleLaunchPhotoResizer = () => {
    const photoTool = IMAGE_TOOLS.find((t) => t.id === 'photo-signature-resize');
    if (photoTool) {
      handleSelectTool(photoTool);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200 w-full max-w-full overflow-x-hidden relative">
      {/* Full-Website SVG Background (Anis Online Services Deep Navy Grid) */}
      <SiteBackgroundSvg isDark={isDark} />
      
      {/* Responsive Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        templateId={templateId}
        setTemplateId={setTemplateId}
        lang={lang}
        setLang={setLang}
        onOpenSearch={handleOpenSearchModal}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0">
        {selectedTool ? (
          (selectedTool.id === 'passport-photo-studio' || selectedTool.id === 'passport-photo-sheet') ? (
            <PassportPhotoStudioPage onBack={handleCloseTool} />
          ) : (selectedTool.id === 'smart-id-card-studio' || selectedTool.id === 'id-card-maker') ? (
            <SmartIdCardStudioPage onBack={handleCloseTool} />
          ) : (
            <ToolRunnerModal
              tool={selectedTool}
              onClose={handleCloseTool}
              onOpenKhataTab={() => {
                handleCloseTool();
                handleNavigateTab('khata');
              }}
            />
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                onSelectTool={handleSelectTool}
                setActiveTab={handleNavigateTab}
                onOpenSearch={handleOpenSearchModal}
                templateId={templateId}
                lang={lang}
              />
            )}

            {activeTab === 'tools' && (
              <ToolsDirectoryView
                onSelectTool={handleSelectTool}
                setActiveTab={handleNavigateTab}
                lang={lang}
              />
            )}

            {activeTab === 'about' && (
              <AboutView onExploreTools={() => handleNavigateTab('tools')} lang={lang} />
            )}

            {activeTab === 'privacy' && <PrivacyView lang={lang} />}

            {activeTab === 'pdf' && (
              <PdfToolsView onSelectTool={handleSelectTool} lang={lang} />
            )}

            {activeTab === 'image' && (
              <ImageToolsView onSelectTool={handleSelectTool} lang={lang} />
            )}

            {activeTab === 'special' && (
              <SpecialToolsView onSelectTool={handleSelectTool} lang={lang} />
            )}

            {/* Kept 100% untouched and secure */}
            {activeTab === 'khata' && <KhataDiary />}

            {/* Kept 100% untouched and secure */}
            {activeTab === 'pan' && (
              <PanMasterHub onLaunchImageResize={handleLaunchPhotoResizer} />
            )}

            {activeTab === 'portals' && <GovernmentPortals />}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <Footer
        onOpenPrivacy={() => handleNavigateTab('privacy')}
        onOpenFreePolicy={() => setIsFreePolicyOpen(true)}
        setActiveTab={handleNavigateTab}
        lang={lang}
      />

      {/* Search Palette Modal */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={handleCloseSearchModal}
          onSelectTool={handleSelectTool}
          lang={lang}
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
