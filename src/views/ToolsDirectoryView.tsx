import React, { useState, useMemo } from 'react';
import {
  Search,
  Camera,
  FileText,
  ImageIcon,
  Sparkles,
  Layers,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookMarked,
  ShieldAlert,
} from 'lucide-react';
import { ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { DynamicIcon } from '../components/DynamicIcon';
import { LanguageCode, TRANSLATIONS, getTranslatedTool } from '../utils/translations';

interface ToolsDirectoryViewProps {
  onSelectTool: (tool: ToolItem) => void;
  setActiveTab: (tab: string) => void;
  lang?: LanguageCode;
}

export const ToolsDirectoryView: React.FC<ToolsDirectoryViewProps> = ({
  onSelectTool,
  setActiveTab,
  lang = 'en',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Tools');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Specific highlighted tools matching the directory and all tools, localized
  const rawAllTools: ToolItem[] = useMemo(() => {
    return [
      {
        id: 'passport-photo-sheet',
        name: 'Passport Photo Maker',
        shortDesc: 'Create 4×6 and A4 passport photo sheets (35×45mm, 2×2") with client-side photo arrangement & direct print PDF.',
        category: 'image',
        iconName: 'Camera',
        badge: 'POPULAR',
        status: 'fully-supported',
      },
      {
        id: 'photo-signature-resize',
        name: 'Photo Resizer (Exact KB)',
        shortDesc: 'Iterative binary-search compression to match 20KB, 50KB or 100KB for SSC, UPSC, IBPS and online recruitment portals.',
        category: 'image',
        iconName: 'Maximize2',
        badge: 'EXACT KB',
        status: 'fully-supported',
      },
      {
        id: 'sign-pdf',
        name: 'Signature Resizer & Whitener',
        shortDesc: 'Whitewash yellow paper shadows, enhance pen ink contrast and compress to official 10–20 KB for exam applications.',
        category: 'pdf',
        iconName: 'PenTool',
        badge: 'NEW',
        status: 'fully-supported',
      },
      {
        id: 'merge-pdf',
        name: 'PDF Merge & Combine',
        shortDesc: 'Combine multiple PDF files into one clean document with custom page sequence.',
        category: 'pdf',
        iconName: 'Layers',
        badge: 'CORE',
        status: 'fully-supported',
      },
      {
        id: 'compress-pdf',
        name: 'PDF Size Reducer (<300 KB)',
        shortDesc: 'Shrink supporting identity & address proof documents strictly under 300 KB for UTIITSL and Protean portals.',
        category: 'pdf',
        iconName: 'Minimize2',
        badge: 'GOVT SPEC',
        status: 'fully-supported',
      },
      {
        id: 'protect-pdf',
        name: 'PDF Password Protector',
        shortDesc: 'Apply standard 128-bit AES password encryption to prevent unauthorized viewing of client documents.',
        category: 'pdf',
        iconName: 'Lock',
        badge: 'ENCRYPTION',
        status: 'fully-supported',
      },
      {
        id: 'unlock-pdf',
        name: 'PDF Security Unlocker',
        shortDesc: 'Strip owner restrictions, printing limitations, and known passwords with 100% in-browser decryption.',
        category: 'pdf',
        iconName: 'Unlock',
        badge: 'OFFLINE',
        status: 'fully-supported',
      },
      {
        id: 'crop-image',
        name: 'Document & Photo Cropper',
        shortDesc: 'Precise crop box with passport, PAN card, and Aadhaar card aspect ratio locks.',
        category: 'image',
        iconName: 'Crop',
        badge: 'PRECISE',
        status: 'fully-supported',
      },
      {
        id: 'qr-code-generator',
        name: 'QR Code Generator',
        shortDesc: 'Create high-resolution QR codes for URLs, WiFi credentials, UPI payments, and text with PNG/SVG download.',
        category: 'special',
        iconName: 'QrCode',
        badge: 'SVG / PNG',
        status: 'fully-supported',
      },
      {
        id: 'barcode-generator',
        name: 'Barcode Generator',
        shortDesc: 'Generate Code-128, EAN-13, UPC, and Code-39 standard barcodes with instant SVG/PNG export.',
        category: 'special',
        iconName: 'Barcode',
        badge: 'CODE-128 / EAN',
        status: 'fully-supported',
      },
      {
        id: 'khata-diary',
        name: 'Client Khata Ledger',
        shortDesc: 'Daily customer registration, government fee tracking, token balance calculation, and print-ready reports.',
        category: 'special',
        iconName: 'BookMarked',
        badge: 'OFFLINE LEDGER',
        status: 'fully-supported',
      },
      ...PDF_TOOLS.filter(
        (tool) =>
          !['merge-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf', 'sign-pdf'].includes(tool.id)
      ),
      ...IMAGE_TOOLS.filter(
        (tool) => !['passport-photo-sheet', 'photo-signature-resize'].includes(tool.id)
      ),
      ...SPECIAL_TOOLS.filter((tool) => !['barcode-generator', 'qr-code-generator', 'khata-diary'].includes(tool.id)),
    ];
  }, []);

  const allTools = useMemo(() => {
    return rawAllTools.map((tool) => getTranslatedTool(tool, lang));
  }, [rawAllTools, lang]);

  const filteredTools = useMemo(() => {
    return allTools.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.badge && t.badge.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedFilter === 'All Tools') return true;
      if (selectedFilter === 'Passport & ID') {
        return ['passport-photo-sheet', 'passport-photo-studio', 'photo-signature-resize', 'crop-image', 'smart-id-card-studio'].includes(t.id);
      }
      if (selectedFilter === 'PDF Suite') return t.category === 'pdf';
      if (selectedFilter === 'Image Tools') return t.category === 'image';
      if (selectedFilter === 'AOS Pro Tools' || selectedFilter === 'Special Tools') return t.category === 'special';
      return true;
    });
  }, [allTools, searchQuery, selectedFilter]);

  const categories = [
    {
      id: 'passport',
      title: t.passportCategoryTab || 'Passport & ID Tools',
      subtitle: '2 real tools: 35×45mm / 2×2" sheets & CR80 ID cards',
      icon: Camera,
      color: 'bg-gradient-to-r from-[#0284c7] to-[#0d4775]',
      action: () => {
        const tool = allTools.find((t) => t.id === 'passport-photo-sheet' || t.id === 'passport-photo-studio');
        if (tool) onSelectTool(tool);
      },
    },
    {
      id: 'pdf',
      title: t.pdfCategoryTab || 'PDF Tools Suite',
      subtitle: '19 client-side tools: Merge, Split, Rotate, Compress & more',
      icon: FileText,
      color: 'bg-gradient-to-r from-[#0284c7] to-[#0369a1]',
      action: () => setActiveTab('pdf'),
    },
    {
      id: 'image',
      title: t.imageCategoryTab || 'Image & Photo Resizers',
      subtitle: '12 real tools: Exact KB compressor, Signature & Document cleaner',
      icon: ImageIcon,
      color: 'bg-gradient-to-r from-cyan-600 to-teal-700',
      action: () => setActiveTab('image'),
    },
    {
      id: 'pan',
      title: t.pan || 'PAN Master Hub',
      subtitle: 'UTIITSL & Protean official guides, specs & verification tracking',
      icon: ShieldAlert,
      color: 'bg-gradient-to-r from-[#0d4775] to-[#1e3a8a]',
      action: () => setActiveTab('pan'),
    },
    {
      id: 'khata',
      title: t.khata || 'Client Khata Diary',
      subtitle: 'Compliant offline token registry & fee calculation ledger',
      icon: BookMarked,
      color: 'bg-gradient-to-r from-emerald-600 to-teal-800',
      action: () => setActiveTab('khata'),
    },
    {
      id: 'portals',
      title: t.portals || 'Government Portals',
      subtitle: '50 official portals: Aadhaar, PAN, Voter, Passport, Parivahan',
      icon: Building,
      color: 'bg-gradient-to-r from-blue-700 to-indigo-900',
      action: () => setActiveTab('portals'),
    },
  ];

  const filterTabs = [
    { id: 'All Tools', label: t.allCategoryTab || 'All Tools' },
    { id: 'Passport & ID', label: t.passportCategoryTab || 'Passport & ID' },
    { id: 'PDF Suite', label: t.pdfCategoryTab || 'PDF Suite' },
    { id: 'Image Tools', label: t.imageCategoryTab || 'Image Tools' },
    { id: 'AOS Pro Tools', label: t.specialCategoryTab || 'AOS Pro Tools' },
  ];

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Hero Banner matching Anis Online Services corporate styling */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-sub text-[#0284c7] dark:text-sky-300 border border-slate-200 dark:border-sky-500/30 text-[11px] font-bold tracking-wider uppercase shadow-xs">
          <span>{t.realProcessingTag || '100% REAL PROCESSING • ZERO FAKE TOOLS • ZERO RUPEE POLICY'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          AOS TOOLS <span className="text-[#0284c7]">{t.directoryTitle || 'Working Tools'}</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t.directoryDesc || 'Every tool below contains actual client-side processing code. No fake buttons, no subscriptions, and your files stay private in your browser.'}
        </p>

        {/* Pill Search Bar */}
        <div className="max-w-xl mx-auto relative pt-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchBarPlaceholder || 'Search tools (e.g. passport, id card, pdf, resize, signature)...'}
              className="w-full pl-11 pr-4 py-3 rounded-full liquid-glass-sub text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/50 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Tool Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {t.toolCategories || 'Tool Categories'}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t.realCategories || '6 Real Categories'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={cat.action}
                role="button"
                tabIndex={0}
                className="p-4 rounded-2xl liquid-glass liquid-glass-hover transition-all cursor-pointer flex items-center justify-between group border border-slate-200 dark:border-sky-500/20"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-white shrink-0 shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284c7] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Tools Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {t.availableTools || 'Available Tools'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0284c7]/15 border border-[#0284c7]/30 text-xs font-bold text-[#0284c7] dark:text-sky-300">
              ({filteredTools.length})
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0284c7] to-[#0d4775] text-white shadow-md shadow-sky-500/20'
                      : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#0284c7]/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool)}
              role="button"
              tabIndex={0}
              className="p-5 rounded-2xl liquid-glass liquid-glass-hover transition-all cursor-pointer text-left flex flex-col justify-between group border border-slate-200 dark:border-sky-500/20"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0284c7]/15 dark:bg-[#0d4775]/40 text-[#0284c7] dark:text-sky-300 flex items-center justify-center shrink-0 shadow-xs">
                    <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/30 text-[10px] font-bold font-mono uppercase">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0284c7] dark:group-hover:text-sky-300 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                  {tool.shortDesc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0284c7] dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>{t.openTool || 'Open Tool'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.freeBadge || '100% Free'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 liquid-glass rounded-2xl border border-slate-200 dark:border-white/10">
            <p className="text-sm font-medium">No tools matched your search for "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('All Tools');
              }}
              className="mt-3 text-xs font-bold text-[#0284c7] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
