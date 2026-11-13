import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  FileText,
  User,
  Tag
} from 'lucide-react';

export interface ToolRequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  author: string;
  priority: 'high' | 'medium' | 'normal';
  createdAt: string;
  status: 'under_review' | 'in_development' | 'planned';
}

interface ToolRequestSectionProps {
  className?: string;
  showHeader?: boolean;
}

export const ToolRequestSection: React.FC<ToolRequestSectionProps> = ({
  className = '',
  showHeader = true,
}) => {
  // Real requests only - purge any legacy mock seeds from localStorage
  const [requests, setRequests] = useState<ToolRequestItem[]>(() => {
    try {
      // Force remove any legacy mock upvotes and dummy request keys
      localStorage.removeItem('aos_tool_upvotes');
      localStorage.removeItem('aos_community_requests');
      localStorage.removeItem('community_requests');
      localStorage.removeItem('tool_requests');

      const saved = localStorage.getItem('aos_tool_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strictly whitelist real submissions: MUST have user-req- prefix
          // and reject all dummy data (req-1, req-2, req-3, Aadhaar Masking, Jan Seva, etc.)
          const realOnly = parsed.filter(
            (r: any) =>
              r &&
              typeof r.id === 'string' &&
              r.id.startsWith('user-req-') &&
              !r.id.startsWith('req-') &&
              !r.title?.toLowerCase().includes('aadhaar masking') &&
              !r.title?.toLowerCase().includes('jan seva token') &&
              !r.title?.toLowerCase().includes('multiple certificate') &&
              !['Sunil CSC Center', 'Anis Cyber Point', 'Rajesh Jan Seva'].includes(r.author)
          );
          if (realOnly.length > 0) {
            localStorage.setItem('aos_tool_requests', JSON.stringify(realOnly));
            return realOnly;
          }
        }
      }
      localStorage.removeItem('aos_tool_requests');
    } catch {
      // Ignore read error
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'form' | 'my_requests'>('form');

  // Form Fields
  const [toolTitle, setToolTitle] = useState('');
  const [category, setCategory] = useState('Govt & CSC Portal');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'normal'>('high');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync real user requests with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aos_tool_requests', JSON.stringify(requests));
    } catch {
      // Ignore write error
    }
  }, [requests]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolTitle.trim()) {
      setFormError('Please enter a tool title or idea name.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Please describe the tool in at least 10 characters.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const newReq: ToolRequestItem = {
        id: `user-req-${Date.now()}`,
        title: toolTitle.trim(),
        category,
        description: description.trim(),
        author: authorName.trim() || 'Anonymous User',
        priority,
        createdAt: new Date().toISOString(),
        status: 'under_review',
      };

      setRequests((prev) => [newReq, ...prev]);
      setIsSubmitting(false);
      setSuccessMessage('Thank you! Your tool request has been submitted to the AOS Tools development team.');

      // Reset form fields
      setToolTitle('');
      setDescription('');
      setAuthorName('');

      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('my_requests');
      }, 2000);
    }, 500);
  };

  const getStatusBadge = (status: ToolRequestItem['status']) => {
    switch (status) {
      case 'in_development':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            In Development
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
            Planned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5 text-amber-500" />
            Under Review
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-3xl liquid-glass p-6 sm:p-8 border border-slate-200 dark:border-sky-500/20 shadow-xl space-y-6 ${className}`}
      id="request-tool-section"
    >
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-sub text-[#0284c7] dark:text-sky-300 text-[11px] font-bold tracking-wide uppercase shadow-xs">
              <Lightbulb className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
              <span>TOOL REQUEST &amp; FEEDBACK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Request a New Tool for AOS Tools
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              Are you a Jan Seva Kendra operator, cyber cafe owner, or professional needing a custom utility? Tell us what you need, and we will build it for free.
            </p>
          </div>

          {/* Tab Switcher - Only shown if user has actually submitted a request */}
          {requests.length > 0 && (
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#072642] border border-slate-200 dark:border-sky-900/40 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-[#0284c7] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my_requests')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'my_requests'
                    ? 'bg-[#0284c7] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>My Requests</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-200 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
                  {requests.length}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* FORM: CLEAN SUBMISSION INTERFACE */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tool Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Tool Idea / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={toolTitle}
                onChange={(e) => setToolTitle(e.target.value)}
                placeholder="e.g. Aadhaar Photo & Signature Extractor"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              >
                <option value="Govt & CSC Portal">Govt &amp; Jan Seva Kendra / CSC Helper</option>
                <option value="PDF Tools">PDF Suite &amp; Converter</option>
                <option value="Image & Photo Tools">Passport Photo &amp; Image Studio</option>
                <option value="Financial & Ledger">Khata Diary, Invoicing &amp; Calculations</option>
                <option value="Barcode & QR Suite">Barcode, UPI &amp; Scanner</option>
                <option value="Developer & Utility">Data, Text &amp; Developer Utility</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Detailed Description &amp; Use Case <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how the tool should work, what inputs it takes, and why it is useful for your daily work..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Author / Cyber Cafe Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Your Name or Center Name (Optional)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Ramesh Seva Kendra"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            {/* Urgency */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Priority / Work Impact
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                {(['high', 'medium', 'normal'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer border ${
                      priority === lvl
                        ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                        : 'bg-white dark:bg-[#072642] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-sky-800/40 hover:bg-slate-50'
                    }`}
                  >
                    {lvl === 'high' ? '🔥 High Priority' : lvl === 'medium' ? '⚡ Medium' : 'Standard'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              🔒 Submissions are evaluated directly by the AOS Tools engineering team.
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Tool Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* MY SUBMITTED REQUESTS: Real User Submissions Only */}
      {activeTab === 'my_requests' && requests.length > 0 && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Your Submitted Tool Requests ({requests.length}):</span>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className="text-[#0284c7] dark:text-sky-400 font-bold hover:underline cursor-pointer"
            >
              + Submit Another Request
            </button>
          </div>

          <div className="space-y-3">
            {requests.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-white/10 hover:border-[#0284c7]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border border-[#0284c7]/30">
                      {item.category}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>Submitted on: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
