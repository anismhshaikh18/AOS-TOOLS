import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';

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
    <footer className="mt-20 border-t border-purple-200/70 dark:border-purple-500/25 bg-gradient-to-b from-white/90 via-purple-50/40 to-white/95 dark:from-[#0c051f]/95 dark:via-[#0e0524]/95 dark:to-[#080214]/98 text-slate-700 dark:text-white backdrop-blur-2xl py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                A
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 dark:from-purple-300 dark:via-pink-300 dark:to-indigo-300 bg-clip-text text-transparent">
                AOS Tools
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-purple-200/70 leading-relaxed">
              100% Client-side utility suite for citizen services, documents, and business ledgers. Zero server uploads, absolute private security.
            </p>
          </div>

          {/* Tool Suites */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Tool Suites
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-purple-200/80">
              <li>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  {PDF_TOOLS.length} PDF Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('image')}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  {IMAGE_TOOLS.length} Image Processors
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('special')}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  {SPECIAL_TOOLS.length} Special Utilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('khata')}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  Client Ledger Diary (Khata)
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Policies */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-purple-200/80">
              <li>
                <button
                  onClick={() => setActiveTab('pan')}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  PAN Master Hub (UTIITSL / Protean)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('portals')}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  50 Verified Government Portals
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenFreePolicy}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  Strict ₹0-Cost Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacy}
                  className="hover:text-purple-600 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy & Data Security
                </button>
              </li>
            </ul>
          </div>

          {/* Partner & Canva Site */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Official Partner
            </h4>
            <p className="text-xs text-slate-500 dark:text-purple-200/70 leading-relaxed">
              Powered in collaboration with{' '}
              <a
                href="https://anisonlineservices.my.canva.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-purple-600 dark:text-purple-300 hover:underline inline-flex items-center gap-1"
              >
                Anis Online Services <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              for verified Aadhaar, PAN card, and administrative citizen documentation.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-purple-400/60">
              AOS Tools provides client-side zero-knowledge document processing.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-purple-200/70 dark:border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-purple-300/70">
          <p>© {new Date().getFullYear()} AOS Tools. Open-source architecture for citizen empowerment.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-purple-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-purple-400 dark:text-purple-600">
              ·
            </span>
            <button
              onClick={onOpenFreePolicy}
              className="hover:text-purple-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              Zero-Cost Manifesto
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
