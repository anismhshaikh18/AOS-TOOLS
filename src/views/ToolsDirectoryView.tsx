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

interface ToolsDirectoryViewProps {
  onSelectTool: (tool: ToolItem) => void;
  setActiveTab: (tab: string) => void;
}

export const ToolsDirectoryView: React.FC<ToolsDirectoryViewProps> = ({
  onSelectTool,
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Tools');

  // Specific highlighted tools matching the screenshot and all tools
  const allTools: ToolItem[] = useMemo(() => {
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
        badge: 'HIGH CONTRAST',
        status: 'fully-supported',
      },
      {
        id: 'merge-pdf',
        name: 'Merge PDF Suite',
        shortDesc: 'Comprehensive client-side PDF tool: Merge multiple PDFs, split page ranges, rotate, compress, and lock files.',
        category: 'pdf',
        iconName: 'Layers',
        badge: '8 TOOLS IN 1',
        status: 'fully-supported',
      },
      {
        id: 'compress-pdf',
        name: 'Compress PDF (<300 KB)',
        shortDesc: 'Reduce PDF file size to under 300 KB for state government, university, and judicial portal uploads.',
        category: 'pdf',
        iconName: 'Minimize2',
        badge: 'GOVT SPEC',
        status: 'fully-supported',
      },
      {
        id: 'protect-pdf',
        name: 'PDF Password Encryptor',
        shortDesc: 'Add genuine 128-bit AES encryption to lock sensitive financial statements and Aadhaar documents.',
        category: 'pdf',
        iconName: 'Lock',
        badge: 'SECURITY',
        status: 'fully-supported',
      },
      {
        id: 'unlock-pdf',
        name: 'PDF Security Unlocker',
        shortDesc: 'Decrypt and remove view passwords and printing restrictions directly in your browser with password.',
        category: 'pdf',
        iconName: 'Unlock',
        badge: 'INSTANT',
        status: 'fully-supported',
      },
      {
        id: 'barcode-generator',
        name: 'Barcode & QR Studio',
        shortDesc: 'Generate Code-128, EAN-13, and professional QR standee posters (Scan & Pay, UPI, Wifi) with PNG download.',
        category: 'special',
        iconName: 'QrCode',
        badge: 'POSTER READY',
        status: 'fully-supported',
      },
      {
        id: 'khata-diary',
        name: 'Client Khata Ledger Diary',
        shortDesc: 'Full client ledger diary with token numbers, government fee tracking, work charges, and CSV export.',
        category: 'special',
        iconName: 'BookMarked',
        badge: 'OFFLINE LEDGER',
        status: 'fully-supported',
      },
      ...PDF_TOOLS.filter(
        (t) =>
          !['merge-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf', 'sign-pdf'].includes(t.id)
      ),
      ...IMAGE_TOOLS.filter(
        (t) => !['passport-photo-sheet', 'photo-signature-resize'].includes(t.id)
      ),
      ...SPECIAL_TOOLS.filter((t) => !['barcode-generator', 'khata-diary'].includes(t.id)),
    ];
  }, []);

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
        return ['passport-photo-sheet', 'photo-signature-resize', 'crop-image'].includes(t.id);
      }
      if (selectedFilter === 'PDF Suite') return t.category === 'pdf';
      if (selectedFilter === 'Image Tools') return t.category === 'image';
      if (selectedFilter === 'Special Tools') return t.category === 'special';
      return true;
    });
  }, [allTools, searchQuery, selectedFilter]);

  const categories = [
    {
      id: 'passport',
      title: 'Passport & ID Tools',
      subtitle: '2 real tools: 35×45mm / 2×2" sheets & CR80 ID cards',
      icon: Camera,
      color: 'bg-red-600',
      action: () => {
        const tool = allTools.find((t) => t.id === 'passport-photo-sheet');
        if (tool) onSelectTool(tool);
      },
    },
    {
      id: 'pdf',
      title: 'PDF Tools Suite',
      subtitle: '19 client-side tools: Merge, Split, Rotate, Compress & more',
      icon: FileText,
      color: 'bg-blue-600',
      action: () => setActiveTab('pdf'),
    },
    {
      id: 'image',
      title: 'Image & Photo Resizers',
      subtitle: '12 real tools: Exact KB compressor, Signature & Document cleaner',
      icon: ImageIcon,
      color: 'bg-emerald-600',
      action: () => setActiveTab('image'),
    },
    {
      id: 'pan',
      title: 'PAN Master Hub',
      subtitle: 'UTIITSL & Protean official guides, specs & verification tracking',
      icon: ShieldAlert,
      color: 'bg-purple-600',
      action: () => setActiveTab('pan'),
    },
    {
      id: 'khata',
      title: 'Client Khata Diary',
      subtitle: 'Compliant offline token registry & fee calculation ledger',
      icon: BookMarked,
      color: 'bg-amber-600',
      action: () => setActiveTab('khata'),
    },
    {
      id: 'portals',
      title: 'Government Portals',
      subtitle: '50 official portals: Aadhaar, PAN, Voter, Passport, Parivahan',
      icon: Building,
      color: 'bg-teal-600',
      action: () => setActiveTab('portals'),
    },
  ];

  const filterTabs = [
    'All Tools',
    'Passport & ID',
    'PDF Suite',
    'Image Tools',
    'Special Tools',
  ];

  return (
    <div className="space-y-10 w-full max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Hero Banner matching Screenshot */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-bold text-red-400 tracking-wider uppercase shadow-[0_0_15px_rgba(239,68,68,0.25)]">
          <span>100% REAL PROCESSING • ZERO FAKE TOOLS • ZERO RUPEE POLICY</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          AOS TOOLS <span className="text-red-500">Working Tools</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Every tool below contains actual client-side processing code. No fake buttons, no subscriptions, and your files stay private in your browser.
        </p>

        {/* Pill Search Bar matching Screenshot */}
        <div className="max-w-xl mx-auto relative pt-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. passport, id card, pdf, resize, signature)..."
              className="w-full pl-11 pr-4 py-3 rounded-full liquid-glass-sub text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Tool Categories Section matching Screenshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Tool Categories
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            6 Real Categories
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
                className="p-4 rounded-2xl liquid-glass liquid-glass-hover transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-white shrink-0 shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Tools Section matching Screenshot */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Available Tools
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/30 text-xs font-bold text-red-400">
              ({filteredTools.length})
            </span>
          </div>

          {/* Filter Pills matching Screenshot */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const isSelected = selectedFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'liquid-glass-sub text-slate-300 hover:text-white hover:border-red-500/40'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="p-5 rounded-2xl liquid-glass liquid-glass-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl liquid-glass-sub flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
                    <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                  </div>
                  {tool.badge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider bg-red-950/60 border border-red-500/30 text-red-400">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors mb-1.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {tool.shortDesc}
                </p>
              </div>

              <button
                onClick={() => onSelectTool(tool)}
                className="w-full py-2.5 px-4 rounded-xl liquid-glass-sub hover:border-red-500/60 hover:bg-red-600 hover:text-white text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
