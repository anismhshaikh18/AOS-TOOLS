// Official AOS PRINTER Sample Portraits & Stock Utilities

export interface SamplePortrait {
  id: string;
  name: string;
  tag: string;
  url: string;
}

// High-fidelity fallback SVG portrait (Guaranteed to load 100% offline with 0 network latency)
export const DEFAULT_STUDIO_MALE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 413 531" width="413" height="531">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="suitGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <radialGradient id="faceShade" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="70%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="413" height="531" fill="url(#bgGrad)"/>
  
  <!-- Studio Vignette / Lighting -->
  <circle cx="206" cy="220" r="190" fill="#FFFFFF" opacity="0.35"/>

  <!-- Body / Shoulders (Dark Navy Studio Suit) -->
  <path d="M 50 531 C 65 410 130 380 180 375 L 206 410 L 233 375 C 283 380 348 410 363 531 Z" fill="url(#suitGrad)"/>
  
  <!-- White Formal Shirt Collar -->
  <polygon points="175,372 206.5,430 238,372 220,365 206.5,385 193,365" fill="#FFFFFF"/>
  <!-- Red/Maroon Formal Tie -->
  <polygon points="200,385 213,385 218,480 206.5,505 195,480" fill="#991B1B"/>
  
  <!-- Neck -->
  <path d="M 182 305 L 182 375 Q 206.5 390 231 375 L 231 305 Z" fill="#EAB308"/>

  <!-- Face Contour -->
  <ellipse cx="206.5" cy="225" rx="88" ry="110" fill="url(#faceShade)"/>
  <!-- Ears -->
  <ellipse cx="116" cy="225" rx="14" ry="24" fill="#D97706"/>
  <ellipse cx="297" cy="225" rx="14" ry="24" fill="#D97706"/>

  <!-- Hair (Professional Short Crop) -->
  <path d="M 115 195 Q 115 110 206.5 105 Q 298 110 298 195 Q 275 140 206.5 135 Q 138 140 115 195 Z" fill="#18181B"/>
  <path d="M 116 195 L 124 220 L 132 195 Z" fill="#18181B"/>
  <path d="M 297 195 L 289 220 L 281 195 Z" fill="#18181B"/>

  <!-- Eyebrows -->
  <path d="M 148 185 Q 170 178 188 185" stroke="#18181B" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <path d="M 225 185 Q 243 178 265 185" stroke="#18181B" stroke-width="4.5" stroke-linecap="round" fill="none"/>

  <!-- Eyes -->
  <ellipse cx="168" cy="202" rx="12" ry="7" fill="#FFFFFF"/>
  <circle cx="168" cy="202" r="5" fill="#18181B"/>
  <circle cx="170" cy="200" r="1.8" fill="#FFFFFF"/>
  <ellipse cx="245" cy="202" rx="12" ry="7" fill="#FFFFFF"/>
  <circle cx="245" cy="202" r="5" fill="#18181B"/>
  <circle cx="247" cy="200" r="1.8" fill="#FFFFFF"/>

  <!-- Nose -->
  <path d="M 206.5 200 L 204 235 Q 206.5 242 212 237" stroke="#B45309" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- Lips / Pleasant Neutral Expression -->
  <path d="M 188 270 Q 206.5 277 225 270" stroke="#B45309" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
`)}`;

export const DEFAULT_STUDIO_FEMALE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 413 531" width="413" height="531">
  <defs>
    <linearGradient id="femBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="blazer" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
  </defs>
  <rect width="413" height="531" fill="url(#femBg)"/>
  <circle cx="206" cy="210" r="180" fill="#FFFFFF" opacity="0.4"/>
  <!-- Hair back -->
  <path d="M 90 220 Q 90 100 206.5 90 Q 323 100 323 220 L 335 440 L 80 440 Z" fill="#171717"/>
  <!-- Blazer / Top -->
  <path d="M 60 531 C 75 420 140 385 190 380 L 206.5 420 L 223 380 C 273 385 338 420 353 531 Z" fill="url(#blazer)"/>
  <polygon points="180,380 206.5,435 233,380" fill="#FFFFFF"/>
  <!-- Neck -->
  <path d="M 186 310 L 186 380 Q 206.5 395 227 380 L 227 310 Z" fill="#FBBF24"/>
  <!-- Face -->
  <ellipse cx="206.5" cy="225" rx="80" ry="102" fill="#FDE68A"/>
  <!-- Hair Front -->
  <path d="M 120 190 Q 150 115 206.5 115 Q 275 115 293 190 Q 240 145 206.5 145 Q 160 145 120 190 Z" fill="#171717"/>
  <!-- Eyebrows -->
  <path d="M 152 182 Q 172 173 190 180" stroke="#171717" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M 223 180 Q 241 173 261 182" stroke="#171717" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <ellipse cx="171" cy="200" rx="11" ry="6.5" fill="#FFFFFF"/>
  <circle cx="171" cy="200" r="4.8" fill="#171717"/>
  <circle cx="173" cy="198" r="1.5" fill="#FFFFFF"/>
  <ellipse cx="242" cy="200" rx="11" ry="6.5" fill="#FFFFFF"/>
  <circle cx="242" cy="200" r="4.8" fill="#171717"/>
  <circle cx="244" cy="198" r="1.5" fill="#FFFFFF"/>
  <!-- Nose -->
  <path d="M 206.5 198 L 205 232 Q 206.5 238 210 234" stroke="#D97706" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Smile -->
  <path d="M 191 267 Q 206.5 275 222 267" stroke="#E11D48" stroke-width="3.5" stroke-linecap="round" fill="none"/>
</svg>
`)}`;

export const DEFAULT_STUDIO_CANDIDATE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 413 531" width="413" height="531">
  <defs>
    <linearGradient id="candBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
  </defs>
  <rect width="413" height="531" fill="url(#candBg)"/>
  <!-- Candidate White Formal Shirt -->
  <path d="M 55 531 C 70 415 135 380 185 375 L 206.5 410 L 228 375 C 278 380 343 415 358 531 Z" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.5"/>
  <path d="M 206.5 410 L 206.5 531" stroke="#CBD5E1" stroke-width="2"/>
  <circle cx="206.5" cy="445" r="3" fill="#64748B"/>
  <circle cx="206.5" cy="485" r="3" fill="#64748B"/>
  <!-- Neck -->
  <path d="M 184 305 L 184 375 Q 206.5 390 229 375 L 229 305 Z" fill="#F59E0B"/>
  <!-- Face -->
  <ellipse cx="206.5" cy="225" rx="85" ry="108" fill="#FBBF24"/>
  <ellipse cx="118" cy="225" rx="12" ry="22" fill="#D97706"/>
  <ellipse cx="295" cy="225" rx="12" ry="22" fill="#D97706"/>
  <!-- Hair -->
  <path d="M 118 190 Q 120 110 206.5 105 Q 293 110 295 190 Q 270 135 206.5 135 Q 140 135 118 190 Z" fill="#09090B"/>
  <!-- Eyebrows -->
  <path d="M 150 183 Q 170 176 188 183" stroke="#09090B" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M 225 183 Q 243 176 263 183" stroke="#09090B" stroke-width="4" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <ellipse cx="169" cy="201" rx="11" ry="6.5" fill="#FFFFFF"/>
  <circle cx="169" cy="201" r="5" fill="#09090B"/>
  <ellipse cx="244" cy="201" rx="11" ry="6.5" fill="#FFFFFF"/>
  <circle cx="244" cy="201" r="5" fill="#09090B"/>
  <!-- Nose -->
  <path d="M 206.5 198 L 204.5 233 Q 206.5 240 211 235" stroke="#B45309" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <!-- Lips -->
  <path d="M 189 268 Q 206.5 275 224 268" stroke="#B45309" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>
`)}`;

// Primary high-res stock portrait provided by user in workspace
export const SAMPLE_PASSPORT_PHOTO_URL = '/assets/aistudio/AOS_Passport_Photo_35x45_1793535637742-1_384f2855.jpg';

export const SAMPLE_PORTRAITS: SamplePortrait[] = [
  {
    id: 'studio-male',
    name: 'Official Studio Portrait',
    tag: 'Formal Suit (High-Res)',
    url: SAMPLE_PASSPORT_PHOTO_URL,
  },
  {
    id: 'studio-vector-male',
    name: 'Male Standard Portrait',
    tag: 'Navy Suit 35×45',
    url: DEFAULT_STUDIO_MALE_SVG,
  },
  {
    id: 'studio-female',
    name: 'Female Studio Portrait',
    tag: 'Corporate Blue 35×45',
    url: DEFAULT_STUDIO_FEMALE_SVG,
  },
  {
    id: 'studio-candidate',
    name: 'Govt Exam Candidate',
    tag: 'SSC / UPSC Standard',
    url: DEFAULT_STUDIO_CANDIDATE_SVG,
  },
];

export function getStockDemoPortraitDataUrl(): string {
  return SAMPLE_PASSPORT_PHOTO_URL;
}
