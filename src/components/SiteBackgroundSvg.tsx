import React from 'react';

interface SiteBackgroundSvgProps {
  className?: string;
}

export const SiteBackgroundSvg: React.FC<SiteBackgroundSvgProps> = ({
  className = 'fixed inset-0 w-full h-full pointer-events-none -z-10',
}) => {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full object-cover"
      >
        <defs>
          {/* Deep Dark Crimson Ambient Gradient */}
          <radialGradient id="siteBgGrad" cx="50%" cy="30%" r="90%">
            <stop offset="0%" stopColor="#4A050A" />
            <stop offset="35%" stopColor="#280307" />
            <stop offset="70%" stopColor="#120103" />
            <stop offset="100%" stopColor="#050001" />
          </radialGradient>

          {/* Center Apple & Hand Spotlight */}
          <radialGradient id="siteCenterGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#7F1D1D" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#050001" stopOpacity="0" />
          </radialGradient>

          {/* Smooth Fade Edge Mask */}
          <radialGradient id="siteFadeMask" cx="50%" cy="45%" r="48%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <mask id="siteArtworkMask">
            <rect width="1920" height="1080" fill="url(#siteFadeMask)" />
          </mask>

          {/* Text-safe Vignette */}
          <radialGradient id="siteVignette" cx="50%" cy="50%" r="70%">
            <stop offset="45%" stopColor="#000000" stopOpacity="0" />
            <stop offset="85%" stopColor="#050001" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#050001" stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* 1. Base Crimson Canvas */}
        <rect width="1920" height="1080" fill="url(#siteBgGrad)" />

        {/* 2. Apple Spotlight Accent */}
        <rect width="1920" height="1080" fill="url(#siteCenterGlow)" />

        {/* 3. The Sculptural Hand with Red Apple & Coiled Serpent (from user upload) */}
        <g mask="url(#siteArtworkMask)" opacity="0.36" style={{ mixBlendMode: 'screen' }}>
          <image
            href="/assets/aistudio/6b8f1aae66eb7c30810ff21448c005f9_668e13e2.jpg"
            x="560"
            y="-40"
            width="800"
            height="1160"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>

        {/* 4. Left and Right Ambient Warmth */}
        <g opacity="0.15">
          <circle cx="240" cy="320" r="300" fill="#EF4444" filter="blur(60px)" />
          <circle cx="1680" cy="380" r="320" fill="#B91C1C" filter="blur(60px)" />
        </g>

        {/* 5. Vignette Overlay for Ultra-Legible Content */}
        <rect width="1920" height="1080" fill="url(#siteVignette)" />
      </svg>
    </div>
  );
};
