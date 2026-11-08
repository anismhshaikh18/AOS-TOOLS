import React from 'react';

interface SiteBackgroundSvgProps {
  className?: string;
  isDark?: boolean;
}

export const SiteBackgroundSvg: React.FC<SiteBackgroundSvgProps> = ({
  className = 'fixed inset-0 w-full h-full pointer-events-none -z-10',
  isDark = true,
}) => {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover transition-opacity duration-300"
      >
        <defs>
          {/* Anis Online Services Deep Navy Gradients */}
          <linearGradient id="aosDarkBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#03182b" />
            <stop offset="40%" stopColor="#072642" />
            <stop offset="80%" stopColor="#0b233a" />
            <stop offset="100%" stopColor="#020e1a" />
          </linearGradient>

          <linearGradient id="aosLightBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f4f8fc" />
            <stop offset="50%" stopColor="#ebf3fa" />
            <stop offset="100%" stopColor="#e2eef8" />
          </linearGradient>

          {/* Sapphire & Cyan Ambient Spotlights */}
          <radialGradient id="navyGlow1" cx="20%" cy="15%" r="45%">
            <stop offset="0%" stopColor="#0d4775" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#072642" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#03182b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="navyGlow2" cx="85%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#0d4775" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#03182b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="navyGlow3" cx="50%" cy="85%" r="40%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#03182b" stopOpacity="0" />
          </radialGradient>

          {/* Light Mode Glows */}
          <radialGradient id="lightGlow1" cx="15%" cy="15%" r="40%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f4f8fc" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lightGlow2" cx="85%" cy="25%" r="45%">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f4f8fc" stopOpacity="0" />
          </radialGradient>

          {/* Subtle Corporate Grid Pattern */}
          <pattern id="aosGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke={isDark ? 'rgba(56, 189, 248, 0.04)' : 'rgba(14, 116, 144, 0.05)'}
              strokeWidth="1"
            />
            <circle
              cx="0"
              cy="0"
              r="1"
              fill={isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(14, 116, 144, 0.12)'}
            />
          </pattern>
        </defs>

        {/* Base Canvas */}
        <rect
          width="1920"
          height="1080"
          fill={isDark ? 'url(#aosDarkBg)' : 'url(#aosLightBg)'}
        />

        {/* Ambient Lights */}
        {isDark ? (
          <>
            <rect width="1920" height="1080" fill="url(#navyGlow1)" />
            <rect width="1920" height="1080" fill="url(#navyGlow2)" />
            <rect width="1920" height="1080" fill="url(#navyGlow3)" />
          </>
        ) : (
          <>
            <rect width="1920" height="1080" fill="url(#lightGlow1)" />
            <rect width="1920" height="1080" fill="url(#lightGlow2)" />
          </>
        )}

        {/* Precision Corporate Digital Grid */}
        <rect width="1920" height="1080" fill="url(#aosGrid)" />

        {/* Elegant Geometric Architectural Flow Lines (Anis Online Services Corporate Identity) */}
        <g opacity={isDark ? '0.18' : '0.12'} stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1.5">
          <path d="M-100 200 C 400 120, 800 350, 1300 180 C 1600 80, 1850 250, 2100 200" fill="none" />
          <path d="M-100 450 C 450 380, 900 600, 1450 420 C 1750 320, 1950 480, 2100 450" fill="none" />
          <path d="M-100 750 C 350 700, 750 900, 1250 780 C 1650 680, 1900 820, 2100 800" fill="none" strokeDasharray="6 6" />
        </g>
      </svg>
    </div>
  );
};
