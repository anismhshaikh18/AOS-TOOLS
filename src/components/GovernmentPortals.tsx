import React, { useState, useMemo } from 'react';
import { Building, ShieldCheck, Globe, Search, ArrowUpDown, CheckCircle, ExternalLink } from 'lucide-react';
import { GOVERNMENT_PORTALS } from '../data/governmentPortals';

export const GovernmentPortals: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');

  const categories = useMemo(() => {
    const set = new Set<string>();
    GOVERNMENT_PORTALS.forEach((portal) => set.add(portal.category));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const filteredPortals = useMemo(() => {
    return GOVERNMENT_PORTALS.filter((portal) => {
      const q = query.toLowerCase();
      const matchesSearch =
        portal.name.toLowerCase().includes(q) ||
        portal.description.toLowerCase().includes(q) ||
        portal.officialDomain.toLowerCase().includes(q) ||
        (portal.state && portal.state.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || portal.category === selectedCategory;
      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });
  }, [query, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building className="w-6 h-6 text-blue-600" />
            <span>Government & Public-Service Portal Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directory of 50 verified official Indian central, state, and statutory public portals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>50 Official Domains Verified (.gov.in / .nic.in / .org.in)</span>
        </div>
      </div>

      {/* Redirection Notice */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2.5">
        <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official External Redirection Notice:</strong> These links open the authentic, official government portals in a new tab. All tools branded under AOS Tools run entirely inside your browser, whereas official registrations, Aadhaar e-KYC, and tax filings occur on authorized government infrastructure.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 50 government portals by name, keyword, or domain..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortBy(sortBy === 'name' ? 'category' : 'name')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer shadow-xs"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="capitalize">{sortBy}</span>
          </button>
        </div>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPortals.map((portal) => (
          <div
            key={portal.id}
            className="group flex flex-col justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-sm transition-all text-left"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
                <span>{portal.category}</span>
                {portal.state && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-blue-600 dark:text-blue-400">{portal.state}</span>
                  </>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {portal.name}
              </h3>
              <span className="inline-block mt-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                {portal.officialDomain}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {portal.description}
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified Portal
              </span>
              <a
                href={portal.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer group-hover:underline"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredPortals.length === 0 && (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium">No government portals match your search criteria.</p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
