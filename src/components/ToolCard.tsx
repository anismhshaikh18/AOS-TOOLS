import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { ToolItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface ToolCardProps {
  tool: ToolItem;
  onSelect: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'pdf':
        return 'PDF Utility';
      case 'image':
        return 'Image Processing';
      case 'special':
        return 'Core Utility';
      default:
        return 'Tool';
    }
  };

  const getGradientClass = (category: string) => {
    switch (category) {
      case 'pdf':
        return 'from-[#0284c7] to-[#0d4775] text-sky-200';
      case 'image':
        return 'from-cyan-500 to-blue-600 text-cyan-200';
      case 'special':
        return 'from-[#0d4775] to-teal-600 text-teal-200';
      default:
        return 'from-[#0284c7] to-[#03182b] text-sky-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(tool);
        }
      }}
      className="theme-card group relative flex flex-col justify-between p-5 rounded-2xl cursor-pointer text-left focus:outline-none focus-visible:ring-2 active:scale-[0.99] text-slate-900 dark:text-white"
    >
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-sky-200/70 mb-3.5 gap-2">
          <div className="flex items-center gap-1.5 font-medium text-[11px] min-w-0">
            <span className="font-semibold text-slate-700 dark:text-sky-200 whitespace-nowrap">
              {getCategoryLabel(tool.category)}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-sky-400/40">
              ·
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
              100% Client-Side
            </span>
          </div>
          {tool.badge && (
            <span className="px-2 py-0.5 rounded-md bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/30 text-[10px] font-bold font-mono uppercase whitespace-nowrap shrink-0 inline-flex items-center">
              {tool.badge}
            </span>
          )}
          {tool.status === 'alternate-workflow' && !tool.badge && (
            <span className="text-amber-600 dark:text-amber-300 text-[11px] font-medium flex items-center gap-1 whitespace-nowrap shrink-0">
              <Info className="w-3 h-3" /> Alternate
            </span>
          )}
        </div>

        <div className="flex items-start gap-3.5 mb-2.5">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getGradientClass(
              tool.category
            )} p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 group-hover:rotate-[-2deg] transition-transform shrink-0`}
          >
            <div className="w-full h-full bg-white dark:bg-[#072642] rounded-[10px] flex items-center justify-center">
              <DynamicIcon name={tool.iconName} className="w-5 h-5 text-[#0284c7] dark:text-sky-300" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors tracking-tight truncate">
              {tool.name}
            </h3>
            {tool.acceptedFormats && (
              <span className="text-[11px] text-slate-400 dark:text-sky-300/60 font-mono">
                {tool.acceptedFormats}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-2">
          {tool.shortDesc}
        </p>
      </div>

      <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
        <span className="text-xs font-bold text-[#0284c7] dark:text-sky-400 group-hover:translate-x-1 transition-all duration-150 flex items-center gap-1.5">
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
        </span>
        <span className="theme-badge text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md">
          ₹0 Free
        </span>
      </div>
    </div>
  );
};
