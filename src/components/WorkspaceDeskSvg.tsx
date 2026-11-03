import React from 'react';

interface WorkspaceDeskSvgProps {
  className?: string;
  onExploreTools?: () => void;
  onOpenPassport?: () => void;
  onOpenIdStudio?: () => void;
}

export const WorkspaceDeskSvg: React.FC<WorkspaceDeskSvgProps> = ({
  className = 'w-full h-auto',
  onExploreTools,
  onOpenPassport,
  onOpenIdStudio,
}) => {
  return (
    <svg
      viewBox="0 0 900 1200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none drop-shadow-2xl`}
    >
      <defs>
        {/* Desk Surface Gradient */}
        <linearGradient id="deskGrad" x1="0" y1="0" x2="900" y2="1200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B233A" />
          <stop offset="40%" stopColor="#051D33" />
          <stop offset="100%" stopColor="#020E1A" />
        </linearGradient>

        {/* Ambient Desk Spotlight */}
        <radialGradient id="deskSpotlight" cx="450" cy="500" r="600" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0E3D66" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#072642" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Paper Surface Gradient */}
        <linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        {/* Gold Spiral Wire Gradient */}
        <linearGradient id="goldWire" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Coffee Gradient */}
        <radialGradient id="coffeeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2E1C14" />
          <stop offset="70%" stopColor="#170D08" />
          <stop offset="100%" stopColor="#0A0503" />
        </radialGradient>

        {/* Laptop Metal Gradient */}
        <linearGradient id="laptopMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Card Shadow */}
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#000000" floodOpacity="0.55" />
        </filter>
        <filter id="itemShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="4" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* 1. Base Desk Background */}
      <rect width="900" height="1200" rx="32" fill="url(#deskGrad)" />
      <rect width="900" height="1200" rx="32" fill="url(#deskSpotlight)" />

      {/* Subtle modern grid overlay */}
      <pattern id="blueprintGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0D4775" strokeWidth="0.75" strokeOpacity="0.25" />
      </pattern>
      <rect width="900" height="1200" rx="32" fill="url(#blueprintGrid)" />

      {/* =========================================================================
          2. COFFEE CUP (Top Center)
          ========================================================================= */}
      <g filter="url(#itemShadow)">
        {/* Ceramic Saucer / Shadow */}
        <ellipse cx="440" cy="180" rx="90" ry="85" fill="#031526" opacity="0.6" />
        {/* White Mug Body */}
        <circle cx="435" cy="175" r="75" fill="#FFFFFF" />
        {/* Mug Handle */}
        <path
          d="M 505 150 C 535 155 540 195 505 200"
          stroke="#FFFFFF"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        {/* Mug Inner Rim */}
        <circle cx="435" cy="175" r="62" fill="#E2E8F0" />
        {/* Fresh Brewed Black Coffee */}
        <circle cx="435" cy="175" r="58" fill="url(#coffeeGrad)" />
        {/* Coffee Crema / Reflection */}
        <ellipse cx="420" cy="160" rx="28" ry="12" fill="#FFFFFF" opacity="0.22" />
        <ellipse cx="450" cy="190" rx="14" ry="6" fill="#D97706" opacity="0.35" />
      </g>

      {/* =========================================================================
          3. SLEEK EXECUTIVE PEN (Center-Right between notebook and laptop)
          ========================================================================= */}
      <g filter="url(#itemShadow)" transform="rotate(22 550 420)">
        {/* Pen Shadow */}
        <rect x="548" y="240" width="16" height="280" rx="8" fill="#000000" opacity="0.4" />
        {/* Pen Barrel (Glossy Black) */}
        <rect x="542" y="235" width="16" height="280" rx="8" fill="#0F172A" />
        {/* Silver Pen Clip */}
        <rect x="548" y="245" width="4" height="90" rx="2" fill="#E2E8F0" />
        {/* Gold Band Accents */}
        <rect x="542" y="340" width="16" height="4" fill="#F59E0B" />
        <rect x="542" y="348" width="16" height="2" fill="#F59E0B" />
        {/* Silver Pen Tip */}
        <path d="M 542 515 L 550 545 L 558 515 Z" fill="#94A3B8" />
        <circle cx="550" cy="545" r="1.5" fill="#000000" />
      </g>

      {/* =========================================================================
          4. MODERN SILVER LAPTOP (Right Edge)
          ========================================================================= */}
      <g filter="url(#itemShadow)">
        {/* Laptop Base chassis */}
        <rect x="680" y="70" width="300" height="660" rx="24" fill="url(#laptopMetal)" />
        {/* Keyboard Well */}
        <rect x="710" y="110" width="240" height="380" rx="14" fill="#0F172A" />
        {/* Individual Key Rows */}
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row} opacity="0.85">
            {[0, 1, 2, 3, 4].map((col) => (
              <rect
                key={col}
                x={725 + col * 42}
                y={125 + row * 58}
                width="34"
                height="46"
                rx="6"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="1"
              />
            ))}
          </g>
        ))}
        {/* Laptop Trackpad */}
        <rect x="740" y="520" width="180" height="170" rx="10" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
      </g>

      {/* =========================================================================
          5. OPEN SPIRAL NOTEBOOK (Main Hero Piece on Left)
             CUSTOMIZED WITH AOS TOOLS SUITE SPECIFICATIONS
          ========================================================================= */}
      <g filter="url(#softShadow)">
        {/* Outer Notebook Cover (Black Edge) */}
        <rect x="60" y="340" width="460" height="580" rx="18" fill="#020813" />

        {/* Paper Surface Pages */}
        <rect x="68" y="348" width="444" height="564" rx="14" fill="url(#paperGrad)" />

        {/* Center fold divider */}
        <line x1="290" y1="348" x2="290" y2="912" stroke="#E2E8F0" strokeWidth="2" />

        {/* Spiral Binding Holes & Rings on Left Edge */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => {
          const y = 370 + i * 40;
          return (
            <g key={i}>
              {/* Hole punch */}
              <circle cx="82" cy={y} r="5" fill="#334155" />
              {/* Golden metallic wire ring */}
              <path
                d={`M 50 ${y - 8} C 36 ${y - 4} 36 ${y + 12} 86 ${y + 6}`}
                stroke="url(#goldWire)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          );
        })}

        {/* -------------------------------------------------------------
            LEFT PAGE: AOS TOOLS SUITE PHILOSOPHY & CAPABILITIES
            ------------------------------------------------------------- */}
        <g transform="translate(100, 375)">
          {/* Header Tag */}
          <rect x="0" y="0" width="165" height="24" rx="6" fill="#052F52" />
          <text x="82" y="16" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="1" textAnchor="middle">
            AOS TOOLS · OFFICIAL
          </text>

          {/* Subtitle */}
          <text x="0" y="44" fill="#0F172A" fontSize="13" fontWeight="800">
            SYSTEM MANIFEST
          </text>
          <text x="0" y="58" fill="#64748B" fontSize="9" fontWeight="600">
            Verified Client-Side Architecture
          </text>

          {/* Ruled guide lines with AOS specifications */}
          <line x1="0" y1="70" x2="175" y2="70" stroke="#E2E8F0" strokeWidth="1" />

          {/* Bullet 1 */}
          <rect x="0" y="82" width="10" height="10" rx="2" fill="#DC2626" />
          <text x="16" y="91" fill="#0F172A" fontSize="9.5" fontWeight="700">100% Free &amp; Private</text>
          <text x="16" y="103" fill="#64748B" fontSize="8">Zero uploads · WebAssembly</text>

          {/* Bullet 2 */}
          <rect x="0" y="120" width="10" height="10" rx="2" fill="#2563eb" />
          <text x="16" y="129" fill="#0F172A" fontSize="9.5" fontWeight="700">Passport Photo Studio</text>
          <text x="16" y="141" fill="#64748B" fontSize="8">35×45mm · SSC/UPSC Ready</text>

          {/* Bullet 3 */}
          <rect x="0" y="158" width="10" height="10" rx="2" fill="#059669" />
          <text x="16" y="167" fill="#0F172A" fontSize="9.5" fontWeight="700">Smart ID Card Studio</text>
          <text x="16" y="179" fill="#64748B" fontSize="8">CR80 Front/Back + QR Code</text>

          {/* Bullet 4 */}
          <rect x="0" y="196" width="10" height="10" rx="2" fill="#7C3AED" />
          <text x="16" y="205" fill="#0F172A" fontSize="9.5" fontWeight="700">19 PDF + 12 Image Tools</text>
          <text x="16" y="217" fill="#64748B" fontSize="8">Merge, Lock, Exact &lt;50KB</text>

          {/* Bullet 5 */}
          <rect x="0" y="234" width="10" height="10" rx="2" fill="#D97706" />
          <text x="16" y="243" fill="#0F172A" fontSize="9.5" fontWeight="700">Client Khata Diary</text>
          <text x="16" y="255" fill="#64748B" fontSize="8">Token Registry &amp; Ledger</text>

          {/* Bottom Stamp Badge */}
          <g transform="translate(0, 310)">
            <rect x="0" y="0" width="175" height="42" rx="8" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
            <circle cx="22" cy="21" r="12" fill="#052F52" />
            <path d="M 18 21 L 21 24 L 27 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <text x="40" y="18" fill="#0F172A" fontSize="9" fontWeight="800">CLIENT-SIDE VERIFIED</text>
            <text x="40" y="30" fill="#64748B" fontSize="7.5" fontWeight="600">Zero Server Telemetry</text>
          </g>

          {/* Simulated Signature */}
          <path
            d="M 10 400 Q 30 380 60 395 T 100 385 T 140 400"
            stroke="#1E3A8A"
            strokeWidth="1.8"
            fill="none"
            opacity="0.8"
          />
          <text x="10" y="420" fill="#94A3B8" fontSize="7" fontWeight="600" letterSpacing="0.5">
            AUTHORIZED SYSTEM SPECIFICATION
          </text>
        </g>

        {/* -------------------------------------------------------------
            RIGHT PAGE: CITIZEN SERVICES & PARTNER CHECKLIST
            ------------------------------------------------------------- */}
        <g transform="translate(305, 375)">
          {/* Header */}
          <text x="0" y="16" fill="#0F172A" fontSize="12" fontWeight="900" letterSpacing="1">
            ANIS ONLINE SERVICES
          </text>
          <text x="0" y="32" fill="#DC2626" fontSize="9" fontWeight="800">
            OFFICIAL DIGITAL SERVICES PARTNER
          </text>

          <line x1="0" y1="44" x2="190" y2="44" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Interactive To-Do Checklist */}
          {[
            { title: 'Aadhaar Update & e-KYC', sub: 'Verified Documentation' },
            { title: 'PAN Card Center (UTI/NSDL)', sub: 'Form 49A / Correction / Reprint' },
            { title: 'Online Govt Affidavits', sub: 'Citizen Legal Formatters' },
            { title: 'Administrative Filings', sub: 'Direct Verified Assistance' },
            { title: '50+ Govt Portal Access', sub: 'Passport, Parivahan, Voter' },
          ].map((item, idx) => {
            const y = 60 + idx * 46;
            return (
              <g key={idx}>
                <rect x="0" y={y} width="14" height="14" rx="3" fill="#052F52" />
                <path
                  d={`M 3 ${y + 7} L 6 ${y + 10} L 11 ${y + 4}`}
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <text x="22" y={y + 9} fill="#0F172A" fontSize="9.5" fontWeight="700">
                  {item.title}
                </text>
                <text x="22" y={y + 20} fill="#64748B" fontSize="8">
                  {item.sub}
                </text>
                <line x1="0" y1={y + 30} x2="190" y2={y + 30} stroke="#F1F5F9" strokeWidth="1" />
              </g>
            );
          })}

          {/* Notebook Footer Note */}
          <g transform="translate(0, 315)">
            <rect x="0" y="0" width="190" height="48" rx="8" fill="#052F52" />
            <text x="14" y="20" fill="#FFFFFF" fontSize="9.5" fontWeight="800">
              anis-online-services.pages.dev
            </text>
            <text x="14" y="34" fill="#67E8F9" fontSize="8" fontWeight="600">
              Open Verified Portfolio Portal ↗
            </text>
          </g>

          <text x="0" y="415" fill="#475569" fontSize="8" fontWeight="600">
            AOS TOOLS V4.0 · FAST · EASY · FREE
          </text>
        </g>
      </g>

      {/* =========================================================================
          6. SMARTPHONE (Bottom Center / Right)
          ========================================================================= */}
      <g filter="url(#itemShadow)" transform="rotate(-6 620 950)">
        {/* Phone Body (Matte Black with Glass Edge) */}
        <rect x="520" y="780" width="220" height="380" rx="34" fill="#0A0F1D" stroke="#334155" strokeWidth="4" />
        {/* Dynamic Island Pill */}
        <rect x="595" y="792" width="70" height="14" rx="7" fill="#000000" />
        {/* Phone Screen Glass */}
        <rect x="528" y="812" width="204" height="332" rx="24" fill="#03182B" />

        {/* Live UI on Phone Screen */}
        <g transform="translate(540, 830)">
          {/* Status bar */}
          <text x="0" y="10" fill="#FFFFFF" fontSize="10" fontWeight="700">AOS Mobile</text>
          <text x="175" y="10" fill="#34D399" fontSize="9" fontWeight="800">100%</text>

          {/* Mini Performance Graph */}
          <rect x="0" y="24" width="180" height="90" rx="10" fill="#072642" stroke="#0D4775" strokeWidth="1" />
          <text x="10" y="40" fill="#94A3B8" fontSize="8" fontWeight="600">PROCESSING SPEED (0ms LAG)</text>

          {/* Glowing Line Graph */}
          <path
            d="M 15 85 L 45 60 L 75 75 L 105 45 L 135 65 L 165 40"
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Graph Gradient fill */}
          <path
            d="M 15 85 L 45 60 L 75 75 L 105 45 L 135 65 L 165 40 L 165 95 L 15 95 Z"
            fill="#22D3EE"
            opacity="0.15"
          />

          {/* Quick Stats Grid */}
          <rect x="0" y="125" width="85" height="45" rx="8" fill="#072642" />
          <text x="8" y="142" fill="#38BDF8" fontSize="13" fontWeight="900">31+</text>
          <text x="8" y="156" fill="#94A3B8" fontSize="7.5" fontWeight="600">TOTAL TOOLS</text>

          <rect x="95" y="125" width="85" height="45" rx="8" fill="#072642" />
          <text x="103" y="142" fill="#34D399" fontSize="13" fontWeight="900">0 KB</text>
          <text x="103" y="156" fill="#94A3B8" fontSize="7.5" fontWeight="600">SERVER UPLOADS</text>

          {/* Live Passport & ID badge preview */}
          <rect x="0" y="180" width="180" height="50" rx="10" fill="#1E293B" stroke="#0D4775" strokeWidth="1" />
          <circle cx="25" cy="205" r="14" fill="#EF4444" />
          <text x="48" y="200" fill="#FFFFFF" fontSize="9" fontWeight="800">CR80 ID + Passport</text>
          <text x="48" y="212" fill="#94A3B8" fontSize="7.5">300 DPI Lab Accurate</text>
        </g>
      </g>

      {/* =========================================================================
          7. DELICATE WHITE FLORAL BRANCH (Bottom Left Corner)
          ========================================================================= */}
      <g opacity="0.85">
        {/* Stems */}
        <path
          d="M 0 1200 C 60 1140 100 1060 130 960 C 145 910 160 870 170 820"
          stroke="#475569"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 100 1060 C 130 1020 160 1000 200 980"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 140 930 C 170 900 210 890 230 870"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Delicate White Petal Buds */}
        {[
          { x: 170, y: 820 },
          { x: 155, y: 840 },
          { x: 185, y: 835 },
          { x: 200, y: 980 },
          { x: 215, y: 965 },
          { x: 230, y: 870 },
          { x: 245, y: 885 },
          { x: 125, y: 990 },
          { x: 85, y: 1100 },
          { x: 105, y: 1070 },
        ].map((bud, bIdx) => (
          <g key={bIdx}>
            <circle cx={bud.x} cy={bud.y} r="7" fill="#F8FAFC" />
            <circle cx={bud.x + 2} cy={bud.y - 2} r="5" fill="#FFFFFF" />
            <circle cx={bud.x} cy={bud.y} r="2.5" fill="#FEF08A" />
          </g>
        ))}
      </g>
    </svg>
  );
};
