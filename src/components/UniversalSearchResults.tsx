import React from 'react';
import { ArrowRight, ExternalLink, Lock, Route } from 'lucide-react';
import { ToolItem } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { HighlightMatch } from './HighlightMatch';
import { ScoredSearchResult, UniversalResultKind } from '../utils/universalSearchIndex';

interface UniversalSearchResultsProps {
  results: ScoredSearchResult[];
  query: string;
  activeFilter: 'all' | UniversalResultKind;
  onChangeFilter: (filter: 'all' | UniversalResultKind) => void;
  counts: Record<'all' | UniversalResultKind, number>;
  activeIndex?: number;
  onSelectTool: (tool: ToolItem) => void;
  onNavigateTab: (tab: string) => void;
  onAfterSelect?: () => void;
  maxHeightClass?: string;
  showDiaryTab?: boolean;
}

const FILTER_TABS: Array<{ id: 'all' | UniversalResultKind; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'tool', label: 'Tools' },
  { id: 'portal', label: 'Portals' },
  { id: 'utility', label: 'Utilities' },
  { id: 'diary', label: 'Client Diary' },
];

export const UniversalSearchResults: React.FC<UniversalSearchResultsProps> = React.memo(
  ({
    results,
    query,
    activeFilter,
    onChangeFilter,
    counts,
    activeIndex = -1,
    onSelectTool,
    onNavigateTab,
    onAfterSelect,
    maxHeightClass = 'max-h-96',
    showDiaryTab = true,
  }) => {
    const visibleTabs = showDiaryTab
      ? FILTER_TABS
      : FILTER_TABS.filter((tab) => tab.id !== 'diary');

    const handleTriggerItem = (res: ScoredSearchResult) => {
      const { item } = res;
      if (item.kind === 'tool' && item.tool) {
        onSelectTool(item.tool);
        onAfterSelect?.();
        return;
      }
      if (item.kind === 'portal') {
        if (item.isLocked && item.targetTab) {
          onNavigateTab(item.targetTab);
          onAfterSelect?.();
        }
        return;
      }
      if (item.kind === 'utility') {
        if (item.tool) {
          onSelectTool(item.tool);
        } else if (item.targetTab) {
          onNavigateTab(item.targetTab);
        }
        onAfterSelect?.();
        return;
      }
      if (item.kind === 'diary' && item.targetTab) {
        onNavigateTab(item.targetTab);
        onAfterSelect?.();
      }
    };

    return (
      <div className="flex flex-col min-w-0">
        {/* Segmented Soft-UI Filter Tabs */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-sky-500/20 bg-slate-50/90 dark:bg-[#071322]/90 overflow-x-auto scrollbar-none">
          <div
            role="tablist"
            aria-label="Universal search category filter"
            className="aos-segmented-track inline-flex items-center gap-1 p-1 min-w-max"
          >
            {visibleTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              const count = counts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChangeFilter(tab.id)}
                  className={`px-3 py-1.5 min-h-[32px] text-[11px] font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isActive ? 'text-sky-100' : 'text-slate-400 dark:text-sky-300/70'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Feed */}
        <div
          className={`${maxHeightClass} overflow-y-auto p-2 space-y-1.5 divide-y divide-transparent`}
        >
          {results.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-1.5">
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                No matches found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Try searching &ldquo;Passport&rdquo;, &ldquo;TNPDS&rdquo;, &ldquo;UTIITSL&rdquo;,
                &ldquo;Age Calculator&rdquo;, &ldquo;PDF&rdquo;, or regional keywords.
              </p>
            </div>
          ) : (
            results.map((res, idx) => {
              const { item, resolvedPortalUrl, wasLegacyRedirect, legacySourceMatched } = res;
              const isHighlighted = idx === activeIndex;
              const rowClasses = `aos-card-perf w-full flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl text-left transition-colors cursor-pointer group border ${
                isHighlighted
                  ? 'bg-[#0284c7]/12 dark:bg-[#0284c7]/25 border-[#0284c7]/50'
                  : 'bg-white/80 dark:bg-[#072642]/55 border-slate-200/80 dark:border-sky-500/15 hover:bg-sky-50/80 dark:hover:bg-[#0d4775]/45 hover:border-[#0284c7]/45'
              }`;

              // Unlocked Government Portal items render as direct accessible <a> links
              if (item.kind === 'portal' && !item.isLocked && resolvedPortalUrl) {
                return (
                  <div key={item.key} className={rowClasses}>
                    <a
                      href={resolvedPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onAfterSelect?.()}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#0284c7]/15 dark:bg-[#0B192C] border border-[#0284c7]/25 text-[#0284c7] dark:text-sky-300 flex items-center justify-center shrink-0">
                        <DynamicIcon name={item.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-sky-300/80 truncate">
                          <span className="truncate">{item.metaLeft}</span>
                          {item.metaRight && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono truncate">{item.metaRight}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 truncate">
                          <HighlightMatch text={item.title} query={query} />
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                          <HighlightMatch text={item.subtitle} query={query} />
                        </div>
                        {wasLegacyRedirect && legacySourceMatched && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-300 font-medium inline-flex items-center gap-1">
                            <Route className="w-3 h-3 shrink-0" />
                            <span>Auto-routed from {legacySourceMatched}</span>
                          </div>
                        )}
                      </div>
                    </a>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateTab('portals');
                          onAfterSelect?.();
                        }}
                        className="aos-btn-soft px-3 py-1.5 text-[10px] font-bold cursor-pointer whitespace-nowrap hidden sm:inline-flex"
                      >
                        In Hub
                      </button>
                      <a
                        href={resolvedPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onAfterSelect?.()}
                        aria-label={`Open ${item.title}`}
                        className="aos-btn-primary w-8 h-8 shrink-0 inline-flex items-center justify-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleTriggerItem(res)}
                  className={rowClasses}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[#0284c7]/15 dark:bg-[#0B192C] border border-[#0284c7]/25 text-[#0284c7] dark:text-sky-300 flex items-center justify-center shrink-0">
                      <DynamicIcon name={item.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-sky-300/80 truncate">
                        <span className="truncate">{item.metaLeft}</span>
                        {item.metaRight && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono truncate">{item.metaRight}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 truncate flex items-center gap-1.5">
                        <HighlightMatch text={item.title} query={query} className="truncate" />
                        {item.isLocked && (
                          <Lock className="w-3 h-3 text-amber-500 dark:text-amber-300 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                        <HighlightMatch text={item.subtitle} query={query} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-[#0284c7] dark:text-sky-300 hidden sm:inline">
                      {item.isLocked ? 'Unlock' : 'Open'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }
);

UniversalSearchResults.displayName = 'UniversalSearchResults';
