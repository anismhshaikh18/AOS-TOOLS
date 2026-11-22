import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { ToolItem } from './types';
import { PDF_TOOLS } from './data/pdfTools';
import { IMAGE_TOOLS } from './data/imageTools';
import { SPECIAL_TOOLS } from './data/specialTools';
import { LanguageCode, TemplateId, getTranslatedTool } from './utils/translations';
import { SiteBackgroundSvg } from './components/SiteBackgroundSvg';
import { OfflineSyncIndicator } from './components/OfflineSyncIndicator';
import { notifyPwaInteraction } from './hooks/usePWAInstall';
import { useAuthSecurity, getGateToolForTab } from './context/AuthSecurityContext';
import {
  CloudBackupPayload,
  flushPendingCloudSync,
  uploadCloudBackup,
} from './services/cloudBackupService';

// Code-split secondary views, studios, protected hubs, and heavy modals
const ToolsDirectoryView = lazy(() =>
  import('./views/ToolsDirectoryView').then((m) => ({ default: m.ToolsDirectoryView }))
);
const AboutView = lazy(() =>
  import('./views/AboutView').then((m) => ({ default: m.AboutView }))
);
const PrivacyView = lazy(() =>
  import('./views/PrivacyView').then((m) => ({ default: m.PrivacyView }))
);
const PdfToolsView = lazy(() =>
  import('./views/PdfToolsView').then((m) => ({ default: m.PdfToolsView }))
);
const ImageToolsView = lazy(() =>
  import('./views/ImageToolsView').then((m) => ({ default: m.ImageToolsView }))
);
const SpecialToolsView = lazy(() =>
  import('./views/SpecialToolsView').then((m) => ({ default: m.SpecialToolsView }))
);
const PassportPhotoStudioPage = lazy(() =>
  import('./views/PassportPhotoStudioPage').then((m) => ({ default: m.PassportPhotoStudioPage }))
);
const SmartIdCardStudioPage = lazy(() =>
  import('./views/SmartIdCardStudioPage').then((m) => ({ default: m.SmartIdCardStudioPage }))
);
const DigitalBusinessCardView = lazy(() =>
  import('./views/DigitalBusinessCardView').then((m) => ({ default: m.DigitalBusinessCardView }))
);
const KhataDiary = lazy(() =>
  import('./components/KhataDiary').then((m) => ({ default: m.KhataDiary }))
);
const PanMasterHub = lazy(() =>
  import('./components/PanMasterHub').then((m) => ({ default: m.PanMasterHub }))
);
const GovernmentPortals = lazy(() =>
  import('./components/GovernmentPortals').then((m) => ({ default: m.GovernmentPortals }))
);
const ToolRunnerModal = lazy(() =>
  import('./components/ToolRunnerModal').then((m) => ({ default: m.ToolRunnerModal }))
);
const ToolGuideSection = lazy(() =>
  import('./components/ToolGuideSection').then((m) => ({ default: m.ToolGuideSection }))
);
const StarRatingWidget = lazy(() =>
  import('./components/StarRatingWidget').then((m) => ({ default: m.StarRatingWidget }))
);
const SearchModal = lazy(() =>
  import('./components/SearchModal').then((m) => ({ default: m.SearchModal }))
);
const PrivacyModal = lazy(() =>
  import('./components/PolicyModals').then((m) => ({ default: m.PrivacyModal }))
);
const FreePolicyModal = lazy(() =>
  import('./components/PolicyModals').then((m) => ({ default: m.FreePolicyModal }))
);
const ToolRequestModal = lazy(() =>
  import('./components/ToolRequestModal').then((m) => ({ default: m.ToolRequestModal }))
);
const AuthSecurityModal = lazy(() =>
  import('./components/AuthSecurityModal').then((m) => ({ default: m.AuthSecurityModal }))
);
const ToolLockGateModal = lazy(() =>
  import('./components/ToolLockGateModal').then((m) => ({ default: m.ToolLockGateModal }))
);
const WhatsAppConsultationWidget = lazy(() =>
  import('./components/WhatsAppConsultationWidget').then((m) => ({
    default: m.WhatsAppConsultationWidget,
  }))
);
const PWAInstallPromptBanner = lazy(() =>
  import('./components/PWAInstallPromptBanner').then((m) => ({
    default: m.PWAInstallPromptBanner,
  }))
);

const CLIENT_DIARY_TOOL_ITEM: ToolItem = {
  id: 'khata-diary',
  name: 'Client Diary',
  shortDesc:
    'Digital customer ledger, transaction diary, and balance tracking for CSCs, cyber cafes, and businesses.',
  category: 'special',
  iconName: 'BookMarked',
};

const ViewLoadingFallback: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto py-16 px-4">
    <div className="rounded-2xl liquid-glass border border-slate-200 dark:border-sky-500/20 p-8 text-center space-y-3">
      <div className="w-8 h-8 mx-auto rounded-full border-2 border-[#0284c7] border-t-transparent animate-spin" />
      <p className="text-xs font-semibold text-slate-600 dark:text-sky-200">
        Loading AOS workspace...
      </p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.replace(/\/+$/, '') === '/card') {
        return 'card';
      }
      const viewParam = new URLSearchParams(window.location.search).get('view');
      if (
        viewParam &&
        ['tools', 'portals', 'khata', 'pan', 'about', 'privacy', 'pdf', 'image', 'special'].includes(
          viewParam
        )
      ) {
        return viewParam;
      }
    }
    return 'home';
  });
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isFreePolicyOpen, setIsFreePolicyOpen] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [pendingGate, setPendingGate] = useState<{
    kind: 'tool' | 'tab';
    tab?: string;
    tool: ToolItem;
  } | null>(null);

  const { user, authReady, isToolCurrentlyLocked, isAuthModalOpen } = useAuthSecurity();

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

  // Listen for restored preferences from Cloud Backup
  useEffect(() => {
    const handleApplyCloudPrefs = (event: Event) => {
      const prefs = (event as CustomEvent<CloudBackupPayload['preferences']>).detail;
      if (!prefs) return;
      setIsDark(prefs.theme !== 'light');
      setLang(prefs.lang);
      setTemplateId(prefs.templateId);
    };
    window.addEventListener('aos-apply-cloud-preferences', handleApplyCloudPrefs);
    return () => window.removeEventListener('aos-apply-cloud-preferences', handleApplyCloudPrefs);
  }, []);

  // Debounced auto-sync for user preferences & pending queue when authenticated
  useEffect(() => {
    if (!authReady || !user?.uid) return;
    const timer = window.setTimeout(() => {
      void flushPendingCloudSync().then((flushed) => {
        if (!flushed) {
          void uploadCloudBackup(user.uid);
        }
      });
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [authReady, user?.uid, isDark, lang, templateId]);

  // Mobile browser back-button & history navigation handler
  useEffect(() => {
    const initialTab =
      window.location.pathname.replace(/\/+$/, '') === '/card' ? 'card' : 'home';
    if (!window.history.state) {
      window.history.replaceState({ tab: initialTab, toolId: null }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.toolId) {
          const allTools = [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS];
          const found = allTools.find((t) => t.id === state.toolId);
          if (found && isToolCurrentlyLocked(found.id)) {
            setSelectedTool(null);
            setPendingGate({ kind: 'tool', tool: getTranslatedTool(found, lang) });
          } else {
            setSelectedTool(found ? getTranslatedTool(found, lang) : null);
          }
        } else {
          setSelectedTool(null);
        }
        if (state.tab) {
          const tabGate = getGateToolForTab(state.tab);
          if (tabGate && isToolCurrentlyLocked(tabGate.id)) {
            setActiveTab('home');
            setPendingGate({
              kind: 'tab',
              tab: state.tab,
              tool: getTranslatedTool(tabGate, lang),
            });
          } else {
            setActiveTab(state.tab);
          }
        }
        setIsSearchOpen(false);
        setIsPrivacyOpen(false);
        setIsFreePolicyOpen(false);
      } else {
        const isCardPath = window.location.pathname.replace(/\/+$/, '') === '/card';
        setSelectedTool(null);
        setIsSearchOpen(false);
        setIsPrivacyOpen(false);
        setIsFreePolicyOpen(false);
        setActiveTab(isCardPath ? 'card' : 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang, isToolCurrentlyLocked]);

  // Guard active gated tabs if user signs out or session locks while viewing them
  useEffect(() => {
    if (!authReady) return;
    const tabGate = getGateToolForTab(activeTab);
    if (tabGate && isToolCurrentlyLocked(tabGate.id)) {
      setActiveTab('home');
      setPendingGate({
        kind: 'tab',
        tab: activeTab,
        tool: getTranslatedTool(tabGate, lang),
      });
    }
  }, [authReady, activeTab, lang, isToolCurrentlyLocked]);

  const navigateTabDirectly = useCallback((tab: string) => {
    setSelectedTool(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const nextUrl = tab === 'card' ? '/card' : '/';
    window.history.pushState({ tab, toolId: null }, '', nextUrl);
  }, []);

  const handleNavigateTab = useCallback(
    (tab: string) => {
      if (tab !== 'home') {
        notifyPwaInteraction();
      }
      const tabGate = getGateToolForTab(tab);
      if (tabGate && isToolCurrentlyLocked(tabGate.id)) {
        setPendingGate({
          kind: 'tab',
          tab,
          tool: getTranslatedTool(tabGate, lang),
        });
        return;
      }
      navigateTabDirectly(tab);
    },
    [isToolCurrentlyLocked, lang, navigateTabDirectly]
  );

  const launchToolDirectly = useCallback(
    (tool: ToolItem) => {
      notifyPwaInteraction();
      if (tool.id === 'khata-diary') {
        navigateTabDirectly('khata');
        return;
      }
      const localizedTool = getTranslatedTool(tool, lang);
      setSelectedTool(localizedTool);
      window.history.pushState({ tab: activeTab, toolId: tool.id }, '');
    },
    [activeTab, lang, navigateTabDirectly]
  );

  const handleSelectTool = useCallback(
    (tool: ToolItem) => {
      if (tool.id === 'khata-diary') {
        handleNavigateTab('khata');
        return;
      }
      if (isToolCurrentlyLocked(tool.id)) {
        setPendingGate({ kind: 'tool', tool: getTranslatedTool(tool, lang) });
        return;
      }
      launchToolDirectly(tool);
    },
    [handleNavigateTab, isToolCurrentlyLocked, lang, launchToolDirectly]
  );

  const handleCloseTool = useCallback(() => {
    setSelectedTool(null);
    if (window.history.state?.toolId) {
      window.history.back();
    }
  }, []);

  const handleOpenSearchModal = useCallback(() => {
    notifyPwaInteraction();
    setIsSearchOpen(true);
    window.history.pushState({ tab: activeTab, isSearchModal: true }, '');
  }, [activeTab]);

  const handleCloseSearchModal = useCallback(() => {
    setIsSearchOpen(false);
    if (window.history.state?.isSearchModal) {
      window.history.back();
    }
  }, []);

  // Global keyboard shortcut for Universal Search (/ or Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenSearchModal();
        return;
      }
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
  }, [handleOpenSearchModal]);

  const handleLaunchPhotoResizer = useCallback(() => {
    const photoTool = IMAGE_TOOLS.find((t) => t.id === 'photo-signature-resize');
    if (photoTool) {
      handleSelectTool(photoTool);
    }
  }, [handleSelectTool]);

  const handleToggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-200 w-full max-w-full overflow-x-hidden relative">
      {/* Hardware-Accelerated Deep Blue (#0B192C) Background */}
      <SiteBackgroundSvg isDark={isDark} />

      {/* Responsive Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onSelectTool={handleSelectTool}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        templateId={templateId}
        setTemplateId={setTemplateId}
        lang={lang}
        setLang={setLang}
        onOpenSearch={handleOpenSearchModal}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0">
        {selectedTool ? (
          <Suspense fallback={<ViewLoadingFallback />}>
            {selectedTool.id === 'passport-photo-studio' ||
            selectedTool.id === 'passport-photo-sheet' ? (
              <div className="pb-12">
                <PassportPhotoStudioPage onBack={handleCloseTool} />
              </div>
            ) : selectedTool.id === 'smart-id-card-studio' ||
              selectedTool.id === 'id-card-maker' ? (
              <div className="space-y-8 pb-12">
                <SmartIdCardStudioPage onBack={handleCloseTool} />
                <ToolGuideSection tool={selectedTool} />
              </div>
            ) : (
              <ToolRunnerModal
                tool={selectedTool}
                onClose={handleCloseTool}
                onOpenKhataTab={() => {
                  handleCloseTool();
                  handleNavigateTab('khata');
                }}
              />
            )}
          </Suspense>
        ) : activeTab === 'home' ? (
          <HomeView
            onSelectTool={handleSelectTool}
            setActiveTab={handleNavigateTab}
            onOpenSearch={handleOpenSearchModal}
            templateId={templateId}
            lang={lang}
          />
        ) : (
          <Suspense fallback={<ViewLoadingFallback />}>
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

            {/* Client Diary Workspace (Google Auth Gated - Untouched) */}
            {activeTab === 'khata' && (
              <div className="space-y-6 pb-12">
                <div className="p-3.5 rounded-2xl liquid-glass border border-slate-200 dark:border-sky-500/20 shadow-md flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Client Diary
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Rate this digital accounting utility or share citizen feedback:
                    </p>
                  </div>
                  <StarRatingWidget toolId="khata-diary" toolName="Client Diary" />
                </div>
                <KhataDiary />
                <ToolGuideSection tool={CLIENT_DIARY_TOOL_ITEM} />
              </div>
            )}

            {/* PAN Master Hub (Google Auth Gated - Untouched) */}
            {activeTab === 'pan' && (
              <PanMasterHub onLaunchImageResize={handleLaunchPhotoResizer} />
            )}

            {activeTab === 'portals' && <GovernmentPortals />}

            {activeTab === 'card' && (
              <DigitalBusinessCardView onBackHome={() => handleNavigateTab('home')} />
            )}
          </Suspense>
        )}
      </main>

      {/* Clean Footer */}
      <Footer
        onOpenPrivacy={() => handleNavigateTab('privacy')}
        onOpenFreePolicy={() => setIsFreePolicyOpen(true)}
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
        setActiveTab={handleNavigateTab}
        lang={lang}
        setLang={setLang}
      />

      {/* Lazy Search Palette Modal */}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchModal
            isOpen={isSearchOpen}
            onClose={handleCloseSearchModal}
            onSelectTool={handleSelectTool}
            onNavigateTab={handleNavigateTab}
            lang={lang}
          />
        </Suspense>
      )}

      {/* Lazy Policy Modals */}
      {isPrivacyOpen && (
        <Suspense fallback={null}>
          <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        </Suspense>
      )}

      {isFreePolicyOpen && (
        <Suspense fallback={null}>
          <FreePolicyModal
            isOpen={isFreePolicyOpen}
            onClose={() => setIsFreePolicyOpen(false)}
          />
        </Suspense>
      )}

      {/* Lazy Community Tool Request Modal */}
      {isRequestModalOpen && (
        <Suspense fallback={null}>
          <ToolRequestModal
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Google Auth & Tool Access Control Modals (Only loaded when opened) */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthSecurityModal />
        </Suspense>
      )}

      {pendingGate && (
        <Suspense fallback={null}>
          <ToolLockGateModal
            tool={pendingGate.tool}
            onClose={() => setPendingGate(null)}
            onUnlocked={(unlockedTool) => {
              const gate = pendingGate;
              setPendingGate(null);
              if (gate?.kind === 'tab' && gate.tab) {
                navigateTabDirectly(gate.tab);
              } else {
                launchToolDirectly(unlockedTool);
              }
            }}
          />
        </Suspense>
      )}

      {/* Offline Status & Cloud Sync Queue Indicator */}
      <OfflineSyncIndicator />

      {/* Post-Interaction Floating PWA Install Prompt */}
      <Suspense fallback={null}>
        <PWAInstallPromptBanner />
      </Suspense>

      {/* Lazy Direct WhatsApp Consultation Floating Widget */}
      <Suspense fallback={null}>
        <WhatsAppConsultationWidget onOpenDigitalCard={() => handleNavigateTab('card')} />
      </Suspense>
    </div>
  );
}
