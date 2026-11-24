import React, { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  ShieldCheck,
  Globe,
  Search,
  ExternalLink,
  Landmark,
  MapPin,
  Cpu,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowUpDown,
  Route,
  X,
  Mic,
  MicOff,
} from 'lucide-react';
import { GOVERNMENT_PORTALS } from '../data/governmentPortals';
import { GovernmentPortal, PortalHubCategory } from '../types';
import { resolvePortalRoute } from '../utils/portalRedirectRegistry';
import { matchesMultilingualQuery } from '../utils/multilingualSearch';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

type HubTab = 'All' | PortalHubCategory;

const CATEGORY_TABS: {
  id: HubTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'All', label: 'All Portals', icon: Layers },
  { id: 'Central', label: 'Central', icon: Building2 },
  { id: 'State', label: 'State', icon: MapPin },
  { id: 'Banking', label: 'Banking', icon: Landmark },
  { id: 'Utility', label: 'Utility', icon: Cpu },
];

interface PortalCardProps {
  portal: GovernmentPortal;
  debouncedQuery: string;
  isExpanded: boolean;
  isCopied: boolean;
  onToggleExpand: (id: string) => void;
  onCopyUrl: (id: string, url: string) => void;
}

const PortalCard: React.FC<PortalCardProps> = React.memo(
  ({ portal, debouncedQuery, isExpanded, isCopied, onToggleExpand, onCopyUrl }) => {
    const route = resolvePortalRoute(portal, debouncedQuery);

    return (
      <article className="aos-card-perf theme-card group flex flex-col justify-between p-5 rounded-[20px] bg-white dark:bg-[#0B192C]/94 transition-all">
        <div className="space-y-2.5">
          {/* Quiet Unboxed Typography Metadata (Zero-Pill Rule) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-sky-200/80">
            <span className="text-[#0284c7] dark:text-sky-300 font-semibold">
              {portal.hubGroup}
            </span>
            <span aria-hidden="true">·</span>
            <span>{portal.category}</span>
            {portal.state && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-800 dark:text-white font-semibold">
                  {portal.state}
                </span>
              </>
            )}
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors leading-snug">
              {portal.name}
            </h3>
            <div className="text-[11px] font-mono text-slate-500 dark:text-sky-300/90 mt-0.5 truncate">
              {portal.officialDomain}
            </div>
          </div>

          {route.wasLegacyRedirect && route.legacySourceMatched && (
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Auto-routed from {route.legacySourceMatched}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-200 leading-relaxed">
            {portal.description}
          </p>
        </div>

        <div className="pt-4 mt-5 border-t border-slate-200 dark:border-sky-500/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onToggleExpand(portal.id)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-sky-200/85 hover:text-[#0284c7] dark:hover:text-sky-300 cursor-pointer whitespace-nowrap"
              title="View permanent root & backup gateway links"
            >
              <Route className="w-3.5 h-3.5 shrink-0" />
              <span>Fallback Gateways</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onCopyUrl(portal.id, route.primaryUrl)}
                aria-label={`Copy official URL for ${portal.name}`}
                title="Copy verified portal URL"
                className="aos-btn-icon w-9 h-9 cursor-pointer"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <a
                href={route.primaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aos-btn-primary inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] text-xs font-bold whitespace-nowrap shrink-0"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Permanent & Fallback Gateway Drawer */}
          {isExpanded && (
            <div className="pt-2.5 border-t border-slate-200 dark:border-sky-500/15 space-y-1.5 text-[11px]">
              <div className="font-semibold text-slate-700 dark:text-sky-200">
                Verified Root &amp; Fallback Gateways
              </div>
              {route.fallbackUrls.map((fbUrl) => (
                <a
                  key={fbUrl}
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#071322] hover:bg-sky-50 dark:hover:bg-sky-900/30 border border-slate-200 dark:border-sky-500/20 text-[#0284c7] dark:text-sky-300 transition-colors"
                >
                  <span className="font-mono truncate">{fbUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }
);

PortalCard.displayName = 'PortalCard';

export const GovernmentPortals: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 160);
  const [activeCategory, setActiveCategory] = useState<HubTab>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'name'>('featured');
  const [expandedRoutesId, setExpandedRoutesId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isSupported: voiceSupported, isListening, voiceError, startListening } = useVoiceSearch(
    'en',
    (transcript) => setQuery(transcript)
  );

  const availableStates = useMemo(() => {
    const states = new Set<string>();
    GOVERNMENT_PORTALS.forEach((p) => {
      if (p.state) states.add(p.state);
    });
    return ['All', ...Array.from(states).sort()];
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<HubTab, number> = {
      All: GOVERNMENT_PORTALS.length,
      Central: 0,
      State: 0,
      Banking: 0,
      Utility: 0,
    };
    for (const p of GOVERNMENT_PORTALS) {
      counts[p.hubGroup]++;
    }
    return counts;
  }, []);

  const utiitslPortal = useMemo(
    () => GOVERNMENT_PORTALS.find((p) => p.id === 'utiitsl-pan'),
    []
  );
  const utiitslRoute = useMemo(
    () => (utiitslPortal ? resolvePortalRoute(utiitslPortal, debouncedQuery) : null),
    [utiitslPortal, debouncedQuery]
  );

  const filteredPortals = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const list = GOVERNMENT_PORTALS.filter((portal) => {
      const matchesCat = activeCategory === 'All' || portal.hubGroup === activeCategory;
      const matchesState =
        selectedState === 'All' || portal.state === selectedState;

      if (!q) return matchesCat && matchesState;

      const matchesSearch = matchesMultilingualQuery(q, [
        portal.name,
        portal.description,
        portal.category,
        portal.officialDomain,
        portal.portalUrl,
        portal.state,
        ...(portal.legacyAliases || []),
      ]);

      return matchesCat && matchesState && matchesSearch;
    });

    if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [debouncedQuery, activeCategory, selectedState, sortBy]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRoutesId((cur) => (cur === id ? null : id));
  }, []);

  const handleCopyUrl = useCallback(async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      // Clipboard blocked in restricted context; ignore silently
    }
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setActiveCategory('All');
    setSelectedState('All');
  }, []);

  const showUtiitslSpotlight =
    Boolean(utiitslPortal && utiitslRoute) &&
    !debouncedQuery.trim() &&
    (activeCategory === 'All' || activeCategory === 'Central') &&
    selectedState === 'All';

  return (
    <div className="space-y-6 pb-14">
      {/* Futuristic Deep Blue Hub Header */}
      <section className="guide-banner-dark relative overflow-hidden rounded-2xl bg-[#0B192C] text-white border border-sky-400/25 shadow-xl p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="hidden md:block pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#0284c7]/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 tracking-wide">
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
              <span className="guide-tag-sky">AOS Tools · Official Citizen Directory</span>
            </div>
            <h1 className="guide-banner-title text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Government Portals Hub
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              Verified gateways across Central Ministries, State e-Governance, Banking &amp; DBT, and Essential Citizen Utilities with permanent fallback URL routing.
            </p>
          </div>

          {/* Quantitative Summary Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-sky-400/20">
              <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">
                {GOVERNMENT_PORTALS.length}
              </div>
              <div className="text-[11px] text-sky-200/85 font-medium">Verified Portals</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-sky-400/20">
              <div className="text-xl sm:text-2xl font-extrabold text-sky-300 tabular-nums">4</div>
              <div className="text-[11px] text-sky-200/85 font-medium">Service Sectors</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-sky-400/20">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 tabular-nums">
                {filteredPortals.length}
              </div>
              <div className="text-[11px] text-sky-200/85 font-medium">Showing Now</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search, Category Tabs & State Filter Controls */}
      <section className="aos-reveal rounded-[20px] liquid-glass p-4 sm:p-6 space-y-4">
        {/* Category Tabs Row — Crisp Rounded-2xl Multi-Row Safe Track (Fixes mobile bloated oval bug) */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          <div
            role="tablist"
            aria-label="Portal service categories"
            className="aos-segmented-track aos-track-multi rounded-2xl grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 w-full lg:w-auto"
          >
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 min-h-[42px] text-xs font-bold whitespace-nowrap cursor-pointer ${
                    tab.id === 'All' ? 'col-span-2 sm:col-span-1' : ''
                  } ${isActive ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      isActive ? 'text-sky-100' : 'text-slate-500 dark:text-sky-300/75'
                    }`}
                  >
                    ({categoryCounts[tab.id]})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & State Controls — Clean balanced row on mobile & desktop */}
          <div className="grid grid-cols-1 sm:flex sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            <select
              aria-label="Filter by state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold bg-white dark:bg-[#071322] rounded-full text-slate-900 dark:text-white border border-slate-300 dark:border-sky-500/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              {availableStates.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-[#0B192C]">
                  {st === 'All' ? 'Region: All India & States' : `State: ${st}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSortBy((s) => (s === 'featured' ? 'name' : 'featured'))}
              className="aos-btn-soft inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#2563eb] dark:text-sky-300 shrink-0" />
              <span>{sortBy === 'featured' ? 'Sort: Featured' : 'Sort: A–Z'}</span>
            </button>
          </div>
        </div>

        {/* Live Multilingual & Voice Search Input — Animated Pill Bar */}
        <div className="space-y-1.5">
          <div className="aos-search-pill-wrap">
            <div className="aos-search-pill-inner">
              <Search className="ml-4 w-4 h-4 text-[#2563eb] dark:text-sky-400 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in English, हिंदी, தமிழ், తెలుగు, मराठी or speak (e.g., राशन, TNPDS, Smart Card, पैन, RBI)..."
                aria-label="Search verified government portals"
                className="aos-search-pill-input w-full pl-3 pr-24 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search query"
                    className="aos-btn-icon w-9 h-9 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                    title={isListening ? 'Listening... tap to stop' : 'Voice Search (Multi-language)'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'aos-btn-icon text-[#2563eb] dark:text-sky-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
          {voiceError && (
            <p className="text-xs text-amber-600 dark:text-amber-300">{voiceError}</p>
          )}
        </div>
      </section>

      {/* Featured UTIITSL PAN Services Portal Banner */}
      {showUtiitslSpotlight && utiitslPortal && utiitslRoute && (
        <section className="guide-banner-dark rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#0e2440] to-[#072642] text-white border border-sky-400/35 p-5 sm:p-6 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-sky-300 font-semibold">
              <span className="guide-tag-sky">{utiitslPortal.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-sky-200">{utiitslPortal.officialDomain}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-300">Permanent Official Route</span>
            </div>
            <h2 className="guide-banner-title text-lg sm:text-xl font-extrabold text-white">
              {utiitslPortal.name}
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              {utiitslPortal.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={utiitslRoute.primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="aos-btn-primary inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] text-xs font-bold whitespace-nowrap shrink-0"
            >
              <span>Open UTIITSL Portal</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
            <a
              href="https://www.pan.utiitsl.com/PAN/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] text-xs font-bold text-sky-100 bg-white/10 hover:bg-white/20 border border-sky-300/35 rounded-full whitespace-nowrap shrink-0 transition-all shadow-sm"
            >
              <Route className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span>PAN Online (/PAN/)</span>
            </a>
          </div>
        </section>
      )}

      {/* High-Performance Portals Directory Grid */}
      {filteredPortals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortals.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              debouncedQuery={debouncedQuery}
              isExpanded={expandedRoutesId === portal.id}
              isCopied={copiedId === portal.id}
              onToggleExpand={handleToggleExpand}
              onCopyUrl={handleCopyUrl}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0B192C]/92 border border-slate-200 dark:border-sky-400/20 space-y-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            No portals match &ldquo;{debouncedQuery}&rdquo; in the current filter.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Try switching to All Portals or clearing the active state filter.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="aos-btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[40px] text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      {/* Permanent Routing Notice Footer */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0B192C]/80 border border-slate-200 dark:border-sky-500/20 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-3">
        <Globe className="w-4 h-4 text-[#0284c7] dark:text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-bold">
            Permanent Official Routing Policy:
          </strong>{' '}
          All portal destinations resolve through verified primary `.gov.in`, `.nic.in`, `.org.in`, or official statutory root gateways with alternate backup URLs if any department temporarily rotates sub-paths. AOS Tools processes all utilities locally on your device while official citizen submissions execute strictly on authorized government infrastructure.
        </p>
      </div>
    </div>
  );
};
