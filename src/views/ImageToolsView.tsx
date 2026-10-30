import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, ShieldCheck, Search } from 'lucide-react';
import { ToolItem } from '../types';
import { IMAGE_TOOLS } from '../data/imageTools';
import { ToolCard } from '../components/ToolCard';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';

interface ImageToolsViewProps {
  onSelectTool: (tool: ToolItem) => void;
  lang?: LanguageCode;
}

export const ImageToolsView: React.FC<ImageToolsViewProps> = ({ onSelectTool, lang = 'en' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const s = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const categories = [
    'All',
    'Compress & Convert',
    'Crop & Dimensions',
    'Government & Studio',
  ];

  const filteredTools = useMemo(() => {
    return IMAGE_TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === 'All') return true;
      if (activeCategory === 'Compress & Convert') {
        return ['compress-image', 'image-to-jpg', 'image-to-png', 'image-to-webp'].includes(tool.id);
      }
      if (activeCategory === 'Crop & Dimensions') {
        return ['crop-image', 'crop-circle-image', 'resize-image', 'rotate-image', 'image-merge'].includes(tool.id);
      }
      if (activeCategory === 'Government & Studio') {
        return ['photo-signature-resize', 'passport-photo-sheet', 'image-quality-enhancer'].includes(tool.id);
      }
      return false;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-200/60 dark:border-purple-900/40">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>{s.image} ({IMAGE_TOOLS.length} Working Engines)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-purple-200/70 mt-1">
            Browser-based graphics and photograph utilities. Quality compression, aspect ratio cropping, 4x6 passport sheets, and government specifications.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{s.zeroUploads}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white/80 dark:bg-purple-950/40 text-slate-600 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/40 hover:bg-purple-50 dark:hover:bg-purple-900/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${s.search} Image tools...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/90 dark:bg-[#150a2e]/90 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-purple-300/60 text-xs">
          No image tools matched your search query.
        </div>
      )}
    </div>
  );
};
