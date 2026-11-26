import React from 'react';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { AosLogoSvg } from './AosLogoSvg';

interface AosPromoBannerProps {
  onOpenPortals: () => void;
  onOpenDiary: () => void;
  onOpenUtilities: () => void;
  isPortalsLocked?: boolean;
  isDiaryLocked?: boolean;
}

const GovtPortalsEmblem: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-9 h-9 shrink-0"
    aria-hidden="true"
  >
    {/* Subtle India Map silhouette backdrop */}
    <path
      d="M20 12L25 9L29 14L27 21L33 25L31 32L25 38L21 48L18 40L13 33L16 26L13 21L18 17L20 12Z"
      fill="rgba(56, 189, 248, 0.2)"
      stroke="#7dd3fc"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* South Indian Temple Tower (Gopuram) Silhouette */}
    <path
      d="M41 13L43 13V16H45V20H47V25H49V31H51V50H31V31H33V25H35V20H37V16H39V13H41Z"
      fill="rgba(129, 140, 248, 0.25)"
      stroke="#e0f2fe"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    {/* Tier lines */}
    <path d="M35 25H47M33 31H49M32 38H50" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" />
    {/* Temple gateway arch */}
    <path
      d="M38 50V42C38 40.343 39.343 39 41 39C42.657 39 44 40.343 44 42V50"
      stroke="#bae6fd"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Kalasam finials */}
    <circle cx="38" cy="11.5" r="1.1" fill="#38bdf8" />
    <circle cx="41" cy="10.5" r="1.3" fill="#e0f2fe" />
    <circle cx="44" cy="11.5" r="1.1" fill="#38bdf8" />
  </svg>
);

const LedgerRupeeEmblem: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-9 h-9 shrink-0"
    aria-hidden="true"
  >
    {/* Spine & Cover of Account Book */}
    <rect
      x="13"
      y="11"
      width="32"
      height="42"
      rx="5"
      fill="rgba(56, 189, 248, 0.16)"
      stroke="#bae6fd"
      strokeWidth="1.8"
    />
    <path d="M21 11V53" stroke="#38bdf8" strokeWidth="1.6" />
    {/* Book Tab Markers */}
    <path
      d="M45 19H49V25H45M45 29H49V35H45"
      stroke="#818cf8"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Ledger lines inside page */}
    <path
      d="M25 22H39M25 28H35"
      stroke="#7dd3fc"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* Soft-UI Rupee Coin Badge */}
    <circle cx="43" cy="41" r="12" fill="#0B192C" stroke="#38bdf8" strokeWidth="1.8" />
    <path
      d="M39 36H47M39 39.5H47M42 36C44.2 36 45.2 37.3 45.2 39C45.2 41 43.6 42.3 40.5 42.3L45.5 47"
      stroke="#e0f2fe"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SmartUtilitiesEmblem: React.FC = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-9 h-9 shrink-0"
    aria-hidden="true"
  >
    {/* Passport Photo Card */}
    <rect
      x="10"
      y="11"
      width="25"
      height="32"
      rx="4"
      fill="rgba(129, 140, 248, 0.22)"
      stroke="#bae6fd"
      strokeWidth="1.8"
    />
    <circle cx="22.5" cy="21.5" r="4.2" fill="#e0f2fe" />
    <path
      d="M15.5 34.5C16.5 30.5 19 28.5 22.5 28.5C26 28.5 28.5 30.5 29.5 34.5"
      stroke="#38bdf8"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Crisp QR Code Card */}
    <rect x="29" y="28" width="24" height="24" rx="4" fill="#0B192C" stroke="#818cf8" strokeWidth="1.8" />
    {/* QR Finder Squares */}
    <rect x="33" y="32" width="6" height="6" rx="1" stroke="#38bdf8" strokeWidth="1.5" />
    <rect x="43" y="32" width="6" height="6" rx="1" stroke="#38bdf8" strokeWidth="1.5" />
    <rect x="33" y="42" width="6" height="6" rx="1" stroke="#38bdf8" strokeWidth="1.5" />
    {/* QR Data Modules */}
    <path d="M43 42H45.5V44.5H43V42ZM47 45H49V48.5H45.5V46.5" fill="#e0f2fe" />
  </svg>
);

export const AosPromoBanner: React.FC<AosPromoBannerProps> = ({
  onOpenPortals,
  onOpenDiary,
  onOpenUtilities,
  isPortalsLocked = false,
  isDiaryLocked = false,
}) => {
  return (
    <section
      aria-label="AOS Tools Digital Documentation Ecosystem"
      className="guide-banner-dark relative overflow-hidden rounded-[20px] border border-indigo-400/30 bg-[linear-gradient(135deg,#071326_0%,#0f2347_42%,#1e1b52_76%,#091830_100%)] shadow-[0_26px_54px_-18px_rgba(7,16,32,0.82),0_0_48px_-12px_rgba(99,102,241,0.38)]"
    >
      {/* Clean SVG Tech Grid Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="aos-promo-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="rgba(129, 140, 248, 0.26)"
              strokeWidth="0.75"
            />
            <circle cx="0" cy="0" r="1.2" fill="rgba(56, 189, 248, 0.35)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#aos-promo-grid)" />
      </svg>

      {/* Subtle Corner Radial Highlights */}
      <div className="hidden sm:block absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(99,102,241,0.24)_0%,transparent_70%)]" />
      <div className="hidden sm:block absolute -bottom-24 -left-16 w-72 h-72 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(14,165,233,0.2)_0%,transparent_70%)]" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-7">
        {/* Top Branding & Futuristic Headline */}
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-[0_10px_28px_-6px_rgba(56,189,248,0.45),0_0_0_3px_rgba(129,140,248,0.32)]">
            <AosLogoSvg className="w-full h-full object-contain" />
          </div>

          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-300">
              <span>Official Digital Citizen Suite</span>
              <span aria-hidden="true" className="text-indigo-300/60">
                ·
              </span>
              <span className="text-indigo-200">Desktop &amp; Mobile Optimized</span>
            </div>

            <h2 className="guide-banner-title font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold tracking-tight leading-tight text-white text-balance">
              AOS Tools: Your Digital Documentation Ecosystem
            </h2>

            <p className="text-xs sm:text-sm font-medium text-sky-100/90">
              Powered by Anis Online Services <span className="text-sky-400 mx-1">·</span> Secure,
              Fast, and Free.
            </p>
          </div>
        </div>

        {/* 3 Distinct Interactive Soft-UI Key Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Government Portals Hub */}
          <button
            type="button"
            onClick={onOpenPortals}
            className="group text-left rounded-[20px] p-5 transition-all duration-250 cursor-pointer flex items-start lg:flex-col xl:flex-row gap-4 border border-sky-400/25 hover:border-sky-400/70 hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-sky-400 bg-[linear-gradient(145deg,rgba(18,43,76,0.94)_0%,rgba(11,25,44,0.98)_65%,rgba(28,32,74,0.95)_100%)] shadow-[0_12px_26px_-10px_rgba(2,6,23,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_18px_36px_-10px_rgba(56,189,248,0.34),0_0_0_1px_rgba(56,189,248,0.32)]"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-sky-400/25 group-hover:scale-105 transition-transform bg-[linear-gradient(145deg,rgba(14,165,233,0.22)_0%,rgba(79,70,229,0.24)_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_6px_14px_-4px_rgba(14,165,233,0.3)]">
              <GovtPortalsEmblem />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Government Portals Hub
                </h3>
                {isPortalsLocked ? (
                  <Lock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-sky-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
              <p className="text-[11px] font-bold tracking-wide text-sky-300 uppercase">
                ACCESS 50+ GOVT PORTALS | TNPDS &amp; More
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Central Ministries, State Services, Banking &amp; Utility gateways with permanent
                root routes.
              </p>
            </div>
          </button>

          {/* Card 2: Client Diary & Ledger */}
          <button
            type="button"
            onClick={onOpenDiary}
            className="group text-left rounded-[20px] p-5 transition-all duration-250 cursor-pointer flex items-start lg:flex-col xl:flex-row gap-4 border border-indigo-400/25 hover:border-indigo-400/75 hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-sky-400 bg-[linear-gradient(145deg,rgba(18,43,76,0.94)_0%,rgba(11,25,44,0.98)_65%,rgba(28,32,74,0.95)_100%)] shadow-[0_12px_26px_-10px_rgba(2,6,23,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_18px_36px_-10px_rgba(129,140,248,0.36),0_0_0_1px_rgba(129,140,248,0.34)]"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-400/25 group-hover:scale-105 transition-transform bg-[linear-gradient(145deg,rgba(56,189,248,0.2)_0%,rgba(99,102,241,0.26)_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_6px_14px_-4px_rgba(99,102,241,0.32)]">
              <LedgerRupeeEmblem />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Client Diary &amp; Ledger
                </h3>
                {isDiaryLocked ? (
                  <Lock className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-indigo-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
              <p className="text-[11px] font-bold tracking-wide text-indigo-300 uppercase">
                MANAGE DAILY LEDGER | Cloud Sync
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track daily customer tokens, ₹ balances, receipts, and encrypted cloud backups.
              </p>
            </div>
          </button>

          {/* Card 3: Smart Utilities */}
          <button
            type="button"
            onClick={onOpenUtilities}
            className="group text-left rounded-[20px] p-5 transition-all duration-250 cursor-pointer flex items-start lg:flex-col xl:flex-row gap-4 border border-cyan-400/25 hover:border-cyan-400/75 hover:-translate-y-1 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-sky-400 bg-[linear-gradient(145deg,rgba(18,43,76,0.94)_0%,rgba(11,25,44,0.98)_65%,rgba(28,32,74,0.95)_100%)] shadow-[0_12px_26px_-10px_rgba(2,6,23,0.85),inset_0_1px_0_rgba(255,255,255,0.16)] hover:shadow-[0_18px_36px_-10px_rgba(34,211,238,0.34),0_0_0_1px_rgba(34,211,238,0.32)]"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-400/25 group-hover:scale-105 transition-transform bg-[linear-gradient(145deg,rgba(6,182,212,0.22)_0%,rgba(79,70,229,0.24)_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_6px_14px_-4px_rgba(6,182,212,0.3)]">
              <SmartUtilitiesEmblem />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  Smart Utilities
                </h3>
                <ArrowRight className="w-4 h-4 text-cyan-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] font-bold tracking-wide text-cyan-300 uppercase">
                PDF TRANSLATOR | RESIZER | QR GEN
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Passport photo studio, PVC ID cards, 19+ PDF processors, and instant QR generator.
              </p>
            </div>
          </button>
        </div>

        {/* Bottom Value Proposition Stripe */}
        <div className="rounded-2xl px-4 py-3 border border-indigo-300/20 bg-[#060f1d]/75 shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)] flex flex-wrap items-center justify-center gap-2.5 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-white">
            Strict ₹0-Cost Policy <span className="text-sky-400 mx-1.5">|</span> Zero-Server
            Upload Privacy
          </span>
        </div>
      </div>
    </section>
  );
};
