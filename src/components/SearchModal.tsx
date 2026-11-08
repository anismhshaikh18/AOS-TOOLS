import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { DynamicIcon } from './DynamicIcon';
import { LanguageCode, TRANSLATIONS, getTranslatedTool } from '../utils/translations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolItem) => void;
  lang?: LanguageCode;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  lang = 'en',
}) => {
  const [query, setQuery] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const rawTools = useMemo(() => {
    return [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS];
  }, []);

  const allTools = useMemo(() => {
    return rawTools.map((tool) => getTranslatedTool(tool, lang));
  }, [rawTools, lang]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? allTools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : allTools.slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-start justify-center p-4 sm:pt-20">
      <div className="relative w-full max-w-xl liquid-glass rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-sky-500/30">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10 liquid-glass-sub">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchBarPlaceholder || `Search across all ${allTools.length} working tools...`}
            className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white mr-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-black/40 rounded border border-slate-200 dark:border-white/10">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching tools found for "{query}". Try "Merge", "Compress", "Signature", or "Passport".
            </div>
          ) : (
            filtered.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool);
                  onClose();
                }}
                className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg liquid-glass-sub text-[#0284c7] dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <DynamicIcon name={tool.iconName} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors">
                      {tool.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      {tool.shortDesc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {tool.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] dark:group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 liquid-glass-sub border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
          <span>{allTools.length} {t.allTools || 'Total Working Tools'}</span>
          <span>100% In-browser local execution</span>
        </div>
      </div>
    </div>
  );
};
