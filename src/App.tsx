import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
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
import { readSessionDraft, writeSessionDraft } from './utils/sessionDraftStorage';

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
const DocumentChecklistHubView = lazy(() =>
  import('./views/DocumentChecklistHubView').then((m) => ({
    default: m.DocumentChecklistHubView,
  }))
);
const UtilityToolStudioView = lazy(() =>
  import('./views/UtilityToolStudioView').then((m) => ({
    default: m.UtilityToolStudioView,
  }))
);
const UTILITY_STUDIO_IDS = new Set<string>([
  'typing-test',
  'todo-list',
  'notes-app',
  'stopwatch',
  'password-generator',
  'url-encoder-decoder',
]);
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

const NAV_SESSION_KEY = 'aos_nav_state_v1';

const VALID_TABS = new Set<string>([
  'home',
  'tools',
  'portals',
  'checklists',
  'khata',
  'pan',
  'about',
  'privacy',
  'pdf',
  'image',
  'special',
  'card',
]);

interface NavSnapshot {
  tab: string;
  toolId: string | null;
  checklistId: string | null;
}

interface NavHistoryState extends NavSnapshot {
  aosNav: true;
}

const ALL_TOOLS_LIST: ToolItem[] = [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS];

function findToolById(toolId: string | null): ToolItem | null {
  if (!toolId) return null;
  return ALL_TOOLS_LIST.find((t) => t.id === toolId) || null;
}

function normalizeTab(raw: unknown): string {
  return typeof raw === 'string' && VALID_TABS.has(raw) ? raw : 'home';
}

function buildNavUrl(tab: string, toolId: string | null, checklistId: string | null): string {
  if (tab === 'card' && !toolId) {
    return '/card';
  }
  const params = new URLSearchParams();
  if (tab && tab !== 'home') {
    params.set('view', tab);
  }
  if (toolId) {
    params.set('tool', toolId);
  }
  if (tab === 'checklists' && checklistId) {
    params.set('guide', checklistId);
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

function parseNavFromUrl(): { hasExplicitUrl: boolean } & NavSnapshot {
  if (typeof window === 'undefined') {
    return { hasExplicitUrl: false, tab: 'home', toolId: null, checklistId: null };
  }
  const cleanPath = window.location.pathname.replace(/\/+$/, '');
  if (cleanPath === '/card') {
    return { hasExplicitUrl: true, tab: 'card', toolId: null, checklistId: null };
  }
  const params = new URLSearchParams(window.location.search);
  const rawView = params.get('view');
  const rawTool = params.get('tool');
  const rawGuide = params.get('guide');

  const validView = rawView && VALID_TABS.has(rawView) ? rawView : null;
  const validTool = rawTool && findToolById(rawTool) ? rawTool : null;
  const validGuide = rawGuide && rawGuide.trim() ? rawGuide.trim() : null;

  if (validView || validTool || validGuide) {
    return {
      hasExplicitUrl: true,
      tab: validView || (validGuide ? 'checklists' : 'home'),
      toolId: validTool,
      checklistId: (validView || (validGuide ? 'checklists' : 'home')) === 'checklists' ? validGuide : null,
    };
  }
  return { hasExplicitUrl: false, tab: 'home', toolId: null, checklistId: null };
}

function getInitialNavState(): NavSnapshot {
  if (typeof window === 'undefined') {
    return { tab: 'home', toolId: null, checklistId: null };
  }

  // 1. Explicit URL (?view=...&tool=... or /card) takes top priority
  const parsedUrl = parseNavFromUrl();
  if (parsedUrl.hasExplicitUrl) {
    return {
      tab: parsedUrl.tab,
      toolId: parsedUrl.toolId,
      checklistId: parsedUrl.checklistId,
    };
  }

  // 2. Existing history state (e.g. mobile BFCache or reload)
  const histState = window.history.state as Partial<NavHistoryState> | null;
  if (histState?.aosNav && typeof histState.tab === 'string' && VALID_TABS.has(histState.tab)) {
    const validTool = histState.toolId && findToolById(histState.toolId) ? histState.toolId : null;
    return {
      tab: histState.tab,
      toolId: validTool,
      checklistId:
        histState.tab === 'checklists' && typeof histState.checklistId === 'string'
          ? histState.checklistId
          : null,
    };
  }

  // 3. Session draft fallback (survives mobile memory-pressure reload after screenshot/camera)
  const saved = readSessionDraft<NavSnapshot | null>(NAV_SESSION_KEY, null);
  if (saved && typeof saved.tab === 'string' && VALID_TABS.has(saved.tab)) {
    const validTool = saved.toolId && findToolById(saved.toolId) ? saved.toolId : null;
    return {
      tab: saved.tab,
      toolId: validTool,
      checklistId:
        saved.tab === 'checklists' && typeof saved.checklistId === 'string'
          ? saved.checklistId
          : null,
    };
  }

  return { tab: 'home', toolId: null, checklistId: null };
}

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
  // Multi-Language state (initialized first so restored tools localize cleanly)
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

  // Resolve initial navigation snapshot once per mount
  const initialNavRef = useRef<NavSnapshot | null>(null);
  if (initialNavRef.current === null) {
    initialNavRef.current = getInitialNavState();
  }
  const initialNav = initialNavRef.current;

  const [activeTab, setActiveTab] = useState<string>(initialNav.tab);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(
    initialNav.checklistId
  );
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(() => {
    const found = findToolById(initialNav.toolId);
    return found ? getTranslatedTool(found, lang) : null;
  });
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

  // Stable refs for single-mount popstate listener (never churns on lang/auth updates)
  const langRef = useRef<LanguageCode>(lang);
  langRef.current = lang;
  const isToolLockedRef = useRef(isToolCurrentlyLocked);
  isToolLockedRef.current = isToolCurrentlyLocked;
  const activeTabRef = useRef<string>(activeTab);
  activeTabRef.current = activeTab;
  const selectedToolRef = useRef<ToolItem | null>(selectedTool);
  selectedToolRef.current = selectedTool;
  const selectedChecklistIdRef = useRef<string | null>(selectedChecklistId);
  selectedChecklistIdRef.current = selectedChecklistId;
  const pushedDepthRef = useRef<number>(0);

  // Persist current route snapshot to sessionStorage so mobile screenshot/camera/resize reloads never reset user location
  useEffect(() => {
    writeSessionDraft<NavSnapshot>(NAV_SESSION_KEY, {
      tab: activeTab,
      toolId: selectedTool?.id || null,
      checklistId: activeTab === 'checklists' ? selectedChecklistId : null,
    });
  }, [activeTab, selectedTool?.id, selectedChecklistId]);

  // Keep open tool label localized when language switches (without closing or resetting it)
  useEffect(() => {
    setSelectedTool((prev) => {
      if (!prev) return null;
      const base = findToolById(prev.id);
      return base ? getTranslatedTool(base, lang) : prev;
    });
  }, [lang]);

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

  // Single-mount mobile browser Back-button & history navigation handler
  useEffect(() => {
    const initState: NavHistoryState = {
      aosNav: true,
      tab: initialNav.tab,
      toolId: initialNav.toolId,
      checklistId: initialNav.checklistId,
    };
    window.history.replaceState(
      initState,
      '',
      buildNavUrl(initState.tab, initState.toolId, initState.checklistId)
    );

    const applyNavTarget = (target: NavSnapshot) => {
      const currentLang = langRef.current;
      const checkLocked = isToolLockedRef.current;
      const nextTab = normalizeTab(target.tab);

      if (target.toolId) {
        const found = findToolById(target.toolId);
        if (found && checkLocked(found.id)) {
          setSelectedTool(null);
          setPendingGate({ kind: 'tool', tool: getTranslatedTool(found, currentLang) });
        } else {
          setSelectedTool(found ? getTranslatedTool(found, currentLang) : null);
        }
      } else {
        setSelectedTool(null);
      }

      const tabGate = getGateToolForTab(nextTab);
      if (tabGate && checkLocked(tabGate.id)) {
        setActiveTab('home');
        setSelectedChecklistId(null);
        setPendingGate({
          kind: 'tab',
          tab: nextTab,
          tool: getTranslatedTool(tabGate, currentLang),
        });
      } else {
        setActiveTab(nextTab);
        setSelectedChecklistId(nextTab === 'checklists' ? target.checklistId : null);
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      setIsSearchOpen(false);
      setIsPrivacyOpen(false);
      setIsFreePolicyOpen(false);
      setIsRequestModalOpen(false);
      pushedDepthRef.current = Math.max(0, pushedDepthRef.current - 1);

      const state = event.state as Partial<NavHistoryState> | null;
      if (state?.aosNav) {
        applyNavTarget({
          tab: normalizeTab(state.tab),
          toolId: typeof state.toolId === 'string' ? state.toolId : null,
          checklistId: typeof state.checklistId === 'string' ? state.checklistId : null,
        });
        return;
      }

      // Non-AOS or null history state: inspect URL first so we never blindly dump users to Home
      const parsed = parseNavFromUrl();
      if (parsed.hasExplicitUrl) {
        const normalized: NavHistoryState = {
          aosNav: true,
          tab: parsed.tab,
          toolId: parsed.toolId,
          checklistId: parsed.checklistId,
        };
        window.history.replaceState(
          normalized,
          '',
          buildNavUrl(normalized.tab, normalized.toolId, normalized.checklistId)
        );
        applyNavTarget(normalized);
        return;
      }

      // If a tool was open and history fell back to a stateless entry, close only the tool and stay on active tab
      if (selectedToolRef.current) {
        const stayTab = activeTabRef.current;
        const stayChecklist = stayTab === 'checklists' ? selectedChecklistIdRef.current : null;
        setSelectedTool(null);
        window.history.replaceState(
          {
            aosNav: true,
            tab: stayTab,
            toolId: null,
            checklistId: stayChecklist,
          } satisfies NavHistoryState,
          '',
          buildNavUrl(stayTab, null, stayChecklist)
        );
        return;
      }

      setActiveTab('home');
      setSelectedChecklistId(null);
      setSelectedTool(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard active gated tabs & restored gated tools if user signs out or session locks while viewing them
  useEffect(() => {
    if (!authReady) return;
    if (selectedTool && isToolCurrentlyLocked(selectedTool.id)) {
      const lockedTool = selectedTool;
      setSelectedTool(null);
      setPendingGate({
        kind: 'tool',
        tool: getTranslatedTool(lockedTool, lang),
      });
      return;
    }
    const tabGate = getGateToolForTab(activeTab);
    if (tabGate && isToolCurrentlyLocked(tabGate.id)) {
      setActiveTab('home');
      setPendingGate({
        kind: 'tab',
        tab: activeTab,
        tool: getTranslatedTool(tabGate, lang),
      });
    }
  }, [authReady, activeTab, selectedTool, lang, isToolCurrentlyLocked]);

  const navigateTabDirectly = useCallback((rawTab: string) => {
    const [parsedTab, subId] = rawTab.includes(':') ? rawTab.split(':', 2) : [rawTab, null];
    const tab = normalizeTab(parsedTab);
    const nextChecklistId = tab === 'checklists' ? subId : null;
    const isSameLocation =
      !selectedToolRef.current &&
      activeTabRef.current === tab &&
      selectedChecklistIdRef.current === nextChecklistId;

    setSelectedTool(null);
    setActiveTab(tab);
    setSelectedChecklistId(nextChecklistId);

    const nextState: NavHistoryState = {
      aosNav: true,
      tab,
      toolId: null,
      checklistId: nextChecklistId,
    };
    const nextUrl = buildNavUrl(tab, null, nextChecklistId);
    const cur = window.history.state as Partial<NavHistoryState> | null;
    const matchesCurrentHistory =
      cur?.aosNav === true &&
      cur.tab === tab &&
      !cur.toolId &&
      (cur.checklistId || null) === nextChecklistId;

    if (isSameLocation || matchesCurrentHistory) {
      window.history.replaceState(nextState, '', nextUrl);
    } else {
      window.history.pushState(nextState, '', nextUrl);
      pushedDepthRef.current += 1;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleNavigateTab = useCallback(
    (rawTab: string) => {
      const baseTab = rawTab.includes(':') ? rawTab.split(':', 2)[0] : rawTab;
      if (baseTab !== 'home') {
        notifyPwaInteraction();
      }
      const tabGate = getGateToolForTab(baseTab);
      if (tabGate && isToolCurrentlyLocked(tabGate.id)) {
        setPendingGate({
          kind: 'tab',
          tab: baseTab,
          tool: getTranslatedTool(tabGate, lang),
        });
        return;
      }
      navigateTabDirectly(rawTab);
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

      const parentTab = activeTabRef.current;
      const parentChecklist = parentTab === 'checklists' ? selectedChecklistIdRef.current : null;
      const nextState: NavHistoryState = {
        aosNav: true,
        tab: parentTab,
        toolId: tool.id,
        checklistId: parentChecklist,
      };
      const nextUrl = buildNavUrl(parentTab, tool.id, parentChecklist);
      const cur = window.history.state as Partial<NavHistoryState> | null;

      if (cur?.aosNav === true && cur.toolId === tool.id && cur.tab === parentTab) {
        window.history.replaceState(nextState, '', nextUrl);
      } else {
        window.history.pushState(nextState, '', nextUrl);
        pushedDepthRef.current += 1;
      }
    },
    [lang, navigateTabDirectly]
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
    const cur = window.history.state as Partial<NavHistoryState> | null;
    if (cur?.aosNav === true && cur.toolId && pushedDepthRef.current > 0) {
      // Return cleanly to the exact previous view in browser history
      window.history.back();
      return;
    }

    // Restored/deep-linked session with no prior in-app history entry:
    // keep user in the active category/Tools view rather than jumping unexpectedly to Home
    const fallbackTab = activeTabRef.current === 'home' ? 'tools' : activeTabRef.current;
    const fallbackChecklist = fallbackTab === 'checklists' ? selectedChecklistIdRef.current : null;
    setSelectedTool(null);
    setActiveTab(fallbackTab);
    const nextState: NavHistoryState = {
      aosNav: true,
      tab: fallbackTab,
      toolId: null,
      checklistId: fallbackChecklist,
    };
    window.history.replaceState(
      nextState,
      '',
      buildNavUrl(fallbackTab, null, fallbackChecklist)
    );
  }, []);

  const handleOpenSearchModal = useCallback(() => {
    notifyPwaInteraction();
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearchModal = useCallback(() => {
    setIsSearchOpen(false);
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
            ) : UTILITY_STUDIO_IDS.has(selectedTool.id) ? (
              <UtilityToolStudioView tool={selectedTool} onBack={handleCloseTool} />
            ) : (
              <ToolRunnerModal
                tool={selectedTool}
                onClose={handleCloseTool}
                onOpenKhataTab={() => handleNavigateTab('khata')}
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

            {activeTab === 'checklists' && (
              <DocumentChecklistHubView
                initialGuideId={selectedChecklistId}
                onSelectTool={handleSelectTool}
                onNavigateTab={handleNavigateTab}
                lang={lang}
              />
            )}

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
