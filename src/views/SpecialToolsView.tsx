import React, { useMemo } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { ToolItem } from '../types';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { ToolCard } from '../components/ToolCard';
import { LanguageCode, TRANSLATIONS, getTranslatedTool } from '../utils/translations';

interface SpecialToolsViewProps {
  onSelectTool: (tool: ToolItem) => void;
  lang?: LanguageCode;
}

export const SpecialToolsView: React.FC<SpecialToolsViewProps> = ({ onSelectTool, lang = 'en' }) => {
  const s = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const translatedTools = useMemo(() => {
    return SPECIAL_TOOLS.map((tool) => getTranslatedTool(tool, lang));
  }, [lang]);

  const sections = useMemo(() => {
    const productivity = translatedTools.filter((t) => t.utilityGroup === 'productivity');
    const security = translatedTools.filter((t) => t.utilityGroup === 'security');
    const studios = translatedTools.filter(
      (t) => t.utilityGroup !== 'productivity' && t.utilityGroup !== 'security'
    );
    return [
      {
        id: 'productivity',
        title: 'Productivity Utilities',
        subtitle: 'Typing Test, Todo List, Local Notes App, Stopwatch & Calculators',
        items: productivity,
      },
      {
        id: 'security',
        title: 'Security & Web Utilities',
        subtitle: 'CSPRNG Password Generator, URL Encoder/Decoder, Base64 & Live Sandbox',
        items: security,
      },
      {
        id: 'studios',
        title: 'Citizen & Counter Studios',
        subtitle: 'Smart ID Card Studio, QR/Barcode Engines, Color Tools & Client Diary',
        items: studios,
      },
    ];
  }, [translatedTools]);

  return (
    <div className="space-y-8 w-full max-w-full pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-sky-500/20">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#0284c7]" />
            <span>{s.special || 'AOS Pro Tools'} ({SPECIAL_TOOLS.length} Core Utilities)</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Fast client-side productivity, security, and studio utilities with zero external APIs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 shrink-0">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Local Memory &amp; Canvas APIs</span>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="space-y-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-sky-200/75">{section.subtitle}</p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {section.items.length} tools
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
