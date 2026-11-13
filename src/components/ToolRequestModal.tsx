import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { ToolRequestSection } from './ToolRequestSection';

interface ToolRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolRequestModal: React.FC<ToolRequestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#03182b] rounded-3xl shadow-2xl border border-slate-200 dark:border-sky-500/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close Request Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-2 sm:p-4">
          <ToolRequestSection showHeader={true} />
        </div>
      </div>
    </div>
  );
};
