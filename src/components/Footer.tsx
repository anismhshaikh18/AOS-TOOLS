import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { AosLogoSvg } from './AosLogoSvg';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenFreePolicy: () => void;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenFreePolicy,
  setActiveTab,
}) => {
  return (
    <footer className="mt-20 border-t border-white/10 liquid-glass py-8 text-slate-300 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('home')}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-[#0d4775] flex items-center justify-center shadow-md shrink-0 p-0.5 group-hover:scale-105 transition-transform">
              <AosLogoSvg className="w-full h-full object-contain" />
            </div>
            <div className="flex items-baseline font-black tracking-tight text-sm">
              <span className="text-white">AOS</span>
              <span className="text-red-500 ml-1">TOOLS</span>
            </div>
          </div>

          {/* Copyright text matching screenshot */}
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} AOS TOOLS. All rights reserved.
          </p>


        </div>

        {/* Secondary Navigation Links */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-400">
          <button
            onClick={() => setActiveTab('home')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            All Tools
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            About Us
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={onOpenFreePolicy}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Strict ₹0-Cost Policy
          </button>
        </div>
      </div>
    </footer>
  );
};
