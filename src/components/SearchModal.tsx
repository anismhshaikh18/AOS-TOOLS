import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Mic, MicOff, Sparkles } from 'lucide-react';
import { ToolItem } from '../types';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useAuthSecurity } from '../context/AuthSecurityContext';
import {
  buildUniversalIndex,
  getUniversalKindCounts,
  searchUniversalIndex,
  UniversalResultKind,
} from '../utils/universalSearchIndex';
import { UniversalSearchResults } from './UniversalSearchResults';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
  onNavigateTab?: (tab: string) => void;
  lang?: LanguageCode;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onNavigateTab,
  lang = 'en',
}) => {
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | UniversalResultKind>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 130);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const { user, isToolCurrentlyLocked } = useAuthSecurity();
  const isDiaryLocked = isToolCurrentlyLocked('khata-diary');

  const { isSupported: voiceSupported, isListening, voiceError, startListening } = useVoiceSearch(
    lang,
    (transcript) => setQuery(transcript)
  );

  const universalIndex = useMemo(
    () =>
      buildUniversalIndex({
        lang,
        userId: user?.uid || null,
        isToolLocked: isToolCurrentlyLocked,
      }),
    [lang, user?.uid, isToolCurrentlyLocked]
  );

  const counts = useMemo(
    () => getUniversalKindCounts(universalIndex, debouncedQuery),
    [universalIndex, debouncedQuery]
  );

  const results = useMemo(
    () => searchUniversalIndex(universalIndex, debouncedQuery, kindFilter, 30),
    [universalIndex, debouncedQuery, kindFilter]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, kindFilter, isOpen]);

  const handleNavigateSafe = useCallback(
    (tab: string) => {
      onNavigateTab?.(tab);
    },
    [onNavigateTab]
  );

  const triggerActiveResult = useCallback(() => {
    const selected = results[activeIndex];
    if (!selected) return;
    const { item, resolvedPortalUrl } = selected;
    if (item.kind === 'tool' && item.tool) {
      onSelectTool(item.tool);
      onClose();
      return;
    }
    if (item.kind === 'portal') {
      if (item.isLocked && item.targetTab) {
        handleNavigateSafe(item.targetTab);
        onClose();
      } else if (resolvedPortalUrl) {
        const anchor = document.createElement('a');
        anchor.href = resolvedPortalUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.click();
        onClose();
      }
      return;
    }
    if (item.kind === 'utility') {
      if (item.tool) onSelectTool(item.tool);
      else if (item.targetTab) handleNavigateSafe(item.targetTab);
      onClose();
      return;
    }
    if (item.kind === 'diary' && item.targetTab) {
      handleNavigateSafe(item.targetTab);
      onClose();
    }
  }, [results, activeIndex, onSelectTool, onClose, handleNavigateSafe]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          results.length > 0 ? (prev - 1 + results.length) % results.length : 0
        );
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        triggerActiveResult();
      }
    };
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose, results.length, triggerActiveResult]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 md:backdrop-blur-md flex items-start justify-center p-3 sm:p-4 sm:pt-16 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="AOS Universal Search Palette"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/30 shadow-2xl overflow-hidden">
        {/* Futuristic Deep Blue Search Input Header */}
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-200 dark:border-sky-500/25 bg-slate-50 dark:bg-[#071322]">
          <Search className="w-5 h-5 text-[#0284c7] dark:text-sky-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              t.searchBarPlaceholder ||
              'Search tools, TNPDS, portals, calculators, or Client Diary...'
            }
            className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none min-w-0"
          />
          {voiceSupported && (
            <button
              type="button"
              onClick={startListening}
              aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
              title="Voice Search (Multi-language)"
              className={`min-h-[36px] min-w-[36px] rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'aos-btn-icon text-[#0284c7] dark:text-sky-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="aos-btn-icon min-h-[36px] min-w-[36px] cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="aos-btn-soft px-3 py-1.5 text-[10px] font-mono font-bold cursor-pointer shrink-0"
          >
            ESC
          </button>
        </div>

        {voiceError && (
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-[11px] text-amber-700 dark:text-amber-300 border-b border-amber-200 dark:border-amber-500/25">
            {voiceError}
          </div>
        )}

        {/* Universal Multi-Index Results */}
        <UniversalSearchResults
          results={results}
          query={debouncedQuery}
          activeFilter={kindFilter}
          onChangeFilter={setKindFilter}
          counts={counts}
          activeIndex={activeIndex}
          onSelectTool={onSelectTool}
          onNavigateTab={handleNavigateSafe}
          onAfterSelect={onClose}
          maxHeightClass="max-h-[60vh]"
          showDiaryTab={!isDiaryLocked}
        />

        {/* Crisp Operational Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#071322] border-t border-slate-200 dark:border-sky-500/20 text-[11px] text-slate-500 dark:text-sky-200/75 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 shrink-0" />
            <span className="tabular-nums">
              {universalIndex.length} indexed across Tools, 61 Portals, Guides
              {!isDiaryLocked ? ' & Client Diary' : ''}
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px]">
            ↑↓ Navigate · ↵ Open · / or Ctrl+K
          </span>
        </div>
      </div>
    </div>
  );
};
