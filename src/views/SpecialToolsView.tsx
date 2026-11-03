import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { ToolItem } from '../types';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { ToolCard } from '../components/ToolCard';
import { LanguageCode, TRANSLATIONS } from '../utils/translations';

interface SpecialToolsViewProps {
  onSelectTool: (tool: ToolItem) => void;
  lang?: LanguageCode;
}

export const SpecialToolsView: React.FC<SpecialToolsViewProps> = ({ onSelectTool, lang = 'en' }) => {
  const s = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-red-500" />
            <span>{s.special} ({SPECIAL_TOOLS.length} Core Utilities)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Essential productivity utilities: Barcode/QR generation, cryptographic password creation, color eyedropper, ZIP extraction, and HTML sandboxing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 liquid-glass-sub px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Local Memory &amp; Canvas APIs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPECIAL_TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
        ))}
      </div>
    </div>
  );
};
