import React from 'react';

// 1. Passport Studio Vector Illustration
export const PassportIllustrationSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="passGrad" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>
    <rect x="15" y="10" width="70" height="90" rx="8" fill="#FFFFFF" stroke="#0D4775" strokeWidth="2.5" />
    <rect x="22" y="18" width="56" height="54" rx="4" fill="#072642" />
    {/* Head avatar */}
    <circle cx="50" cy="38" r="14" fill="#F87171" />
    <path d="M 32 68 C 32 54 68 54 68 68 Z" fill="#EF4444" />
    {/* Name strip on photo */}
    <rect x="22" y="74" width="56" height="14" fill="#E2E8F0" rx="2" />
    <rect x="26" y="78" width="30" height="2" fill="#0F172A" />
    <rect x="26" y="83" width="22" height="2" fill="#64748B" />
    {/* 4x6 Sheet backdrop */}
    <rect x="45" y="35" width="60" height="75" rx="8" fill="url(#passGrad)" stroke="#FFFFFF" strokeWidth="2" opacity="0.95" />
    <path d="M 60 70 L 72 82 L 92 58" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 2. Smart ID Card Studio Vector Illustration
export const IdCardIllustrationSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="idGrad" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
    </defs>
    {/* Lanyard Strap */}
    <path d="M 60 0 L 60 16" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
    <rect x="52" y="12" width="16" height="8" rx="2" fill="#94A3B8" />
    {/* CR80 Badge */}
    <rect x="12" y="24" width="96" height="66" rx="8" fill="url(#idGrad)" stroke="#60A5FA" strokeWidth="2" />
    {/* Header banner */}
    <rect x="12" y="24" width="96" height="18" rx="6" fill="#0F172A" />
    <circle cx="24" cy="33" r="4" fill="#38BDF8" />
    <rect x="34" y="31" width="40" height="4" rx="2" fill="#FFFFFF" />
    {/* Photo on card */}
    <rect x="22" y="48" width="24" height="30" rx="3" fill="#FFFFFF" />
    <circle cx="34" cy="58" r="6" fill="#0284C7" />
    {/* Text lines */}
    <rect x="52" y="50" width="46" height="5" rx="2" fill="#FFFFFF" />
    <rect x="52" y="60" width="34" height="4" rx="2" fill="#93C5FD" />
    <rect x="52" y="68" width="28" height="3" rx="1.5" fill="#38BDF8" />
    {/* QR Stamp */}
    <rect x="86" y="66" width="14" height="14" rx="2" fill="#FFFFFF" />
    <rect x="89" y="69" width="3" height="3" fill="#0F172A" />
    <rect x="94" y="74" width="3" height="3" fill="#0F172A" />
  </svg>
);

// 3. PDF Suite Vector Illustration
export const PdfSuiteIllustrationSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="pdfGrad" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
    </defs>
    {/* Back Page */}
    <rect x="30" y="14" width="65" height="82" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="2" />
    {/* Front Page */}
    <rect x="20" y="24" width="65" height="82" rx="6" fill="url(#pdfGrad)" stroke="#F87171" strokeWidth="2" />
    {/* PDF emblem */}
    <rect x="32" y="40" width="40" height="18" rx="4" fill="#FFFFFF" />
    <text x="52" y="53" fill="#DC2626" fontSize="11" fontWeight="900" textAnchor="middle">PDF</text>
    {/* Lock icon */}
    <circle cx="78" cy="85" r="14" fill="#10B981" />
    <path d="M 74 85 L 77 88 L 83 82" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 4. Contact & Verified Support Vector Illustration
export const SupportHelpIllustrationSvg: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="helpGrad" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#052F52" />
        <stop offset="100%" stopColor="#07365E" />
      </linearGradient>
    </defs>
    {/* Ambient Glow */}
    <circle cx="60" cy="60" r="48" fill="url(#helpGrad)" stroke="#135994" strokeWidth="2.5" />
    {/* Headset Arc */}
    <path d="M 32 60 C 32 40 88 40 88 60" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" fill="none" />
    {/* Earpieces */}
    <rect x="28" y="54" width="10" height="20" rx="4" fill="#38BDF8" />
    <rect x="82" y="54" width="10" height="20" rx="4" fill="#38BDF8" />
    {/* Mic Boom */}
    <path d="M 86 68 C 86 82 72 84 62 84" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="60" cy="84" r="4" fill="#EF4444" />
    {/* Verified Star Badge */}
    <circle cx="86" cy="34" r="12" fill="#22C55E" />
    <path d="M 82 34 L 85 37 L 91 31" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
