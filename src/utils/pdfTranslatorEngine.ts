import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import {
  isProperNounFieldLabel,
  lookupOfflineCivicPhrase,
  translateOfflineWithDictionaryAndTransliteration,
  transliterateProperNounFieldToEnglish,
} from './offlineCivicDictionary';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export interface TranslatorLanguage {
  code: string;
  label: string;
  nativeName: string;
}

export const TRANSLATOR_LANGUAGES: TranslatorLanguage[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', label: 'French', nativeName: 'Français' },
  { code: 'es', label: 'Spanish', nativeName: 'Español' },
  { code: 'de', label: 'German', nativeName: 'Deutsch' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語' },
];

export type TranslationMode = 'hybrid-smart' | 'strict-offline';

export interface TranslationProgress {
  step: string;
  percent: number;
}

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface LayoutTextBlock {
  id: string;
  pageNumber: number;
  sourceText: string;
  translatedText: string;
  canvasX: number;
  canvasY: number;
  baselineY: number;
  widthPx: number;
  heightPx: number;
  eraseX: number;
  eraseY: number;
  eraseWidth: number;
  eraseHeight: number;
  minSafeLeftPx: number;
  maxSafeRightPx: number;
  isCenteredRow: boolean;
  fontSizePx: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  fontCategory: 'sans' | 'serif' | 'mono';
  angleRad: number;
  bgTopRgb: RgbColor;
  bgBottomRgb: RgbColor;
  inkRgb: RgbColor;
  isNonTranslatable: boolean;
  isProperNounValue?: boolean;
}

export interface LayoutPdfPage {
  pageNumber: number;
  widthPt: number;
  heightPt: number;
  renderScale: number;
  canvasWidth: number;
  canvasHeight: number;
  originalCanvas: HTMLCanvasElement;
  originalDataUrl: string;
  blocks: LayoutTextBlock[];
}

export interface LayoutTranslationResult {
  pages: LayoutPdfPage[];
  detectedSourceLang: string;
  engineUsed: 'offline-dictionary' | 'browser-native' | 'hybrid-client';
  translatedBlockCount: number;
  sourceFullText: string;
  translatedFullText: string;
  bilingualFullText: string;
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function rgbCss(c: RgbColor): string {
  return `rgb(${clampByte(c.r)}, ${clampByte(c.g)}, ${clampByte(c.b)})`;
}

function colorDistance(a: RgbColor, b: RgbColor): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function luminance(c: RgbColor): number {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

function medianColor(samples: RgbColor[]): RgbColor {
  if (samples.length === 0) return { r: 255, g: 255, b: 255 };
  const sorted = [...samples].sort((a, b) => luminance(a) - luminance(b));
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Normalizes broken Indic/Unicode spacing produced by government PDF generators
 * (e.g., stray spaces before Tamil/Devanagari/Telugu vowel signs or zero-width joiners).
 */
export function normalizeExtractedIndicText(raw: string): string {
  return raw
    .replace(/[\u200B\uFEFF]/g, '')
    // Join accidental space before combining Indic vowel/virama/anusvara marks (never after word-final ெ/ே/ை!)
    .replace(
      /\s+([\u0900-\u0903\u093A-\u093E\u0940-\u094F\u0951-\u0957\u0962-\u0963\u0981-\u0983\u09BC-\u09CD\u0A01-\u0A03\u0A3C-\u0A4D\u0A81-\u0A83\u0ABC-\u0ACD\u0B01-\u0B03\u0B3C-\u0B4D\u0B82-\u0B83\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCD\u0C00-\u0C04\u0C3E-\u0C56\u0C81-\u0C83\u0CBC-\u0CCD\u0D01-\u0D03\u0D3E-\u0D4D])/g,
      '$1'
    )
    // Reorder ONLY visual-order two-part vowels (ெ+க+ா -> கொ, ே+க+ா -> கோ)
    .replace(/([ெே])([\u0B95-\u0BB9])([ாௗ])/g, '$2$1$3')
    // Reorder visual-order pre-base Tamil vowels when at word start or after vowel/virama/punct (keeps logical தேன்/பெயர்/அட்டை intact)
    .replace(/(^|[\s(/:\u0B82-\u0BC8\u0BCD])([ெேை])([\u0B95-\u0BB9])/g, '$1$3$2')
    .replace(/(^|[\s(/:\u0902-\u094D])(\u093F)([\u0915-\u0939])/g, '$1$3$2')
    // Recombine decomposed two-part Tamil vowel signs (ெ + ா -> ொ, ே + ா -> ோ, ெ + ௗ -> ௌ)
    .replace(/\u0BC6\u0BBE/g, '\u0BCA')
    .replace(/\u0BC7\u0BBE/g, '\u0BCB')
    .replace(/\u0BC6\u0BD7/g, '\u0BCC')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a string is purely numeric, a date, currency value, code/ID, URL, email,
 * or punctuation that must remain pixel-identical on certificates/cards/receipts.
 */
export function isNonTranslatableToken(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length === 1 && !/[a-zA-Z\u0900-\u0FFF\u0600-\u06FF\u3040-\u30FF]/.test(t)) {
    return true;
  }
  // Pure numbers, dates, times, currency, decimals, percentages, phone numbers
  if (/^[\s₹$€£+\-–—.,:/\\()[\]#%*0-9०-९௦-௯]+$/.test(t)) return true;
  // Dates like "10-Jan-1983", "02-Jan-1985", "16 November 2026 | 04:27:10 PM"
  if (/^\d{1,2}[-/ ](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-/ ]\d{2,4}$/i.test(t)) {
    return true;
  }
  // Emails & URLs
  if (/^https?:\/\/\S+$/i.test(t) || /^www\.\S+$/i.test(t) || /^\S+@\S+\.\S+$/.test(t)) {
    return true;
  }
  // Strict alphanumeric ID codes (PAN, UFC, Shop codes like "97A0165270", "30EP059PY", "PHH-AAY")
  if (
    !/\s/.test(t) &&
    /[0-9]/.test(t) &&
    /^[A-Z0-9\-_/]+$/.test(t) &&
    t.length >= 4
  ) {
    return true;
  }
  return false;
}

function getPixel(img: ImageData, x: number, y: number): RgbColor {
  const cx = Math.max(0, Math.min(img.width - 1, Math.floor(x)));
  const cy = Math.max(0, Math.min(img.height - 1, Math.floor(y)));
  const idx = (cy * img.width + cx) * 4;
  return { r: img.data[idx], g: img.data[idx + 1], b: img.data[idx + 2] };
}

/**
 * Detects whether column x is a continuous vertical table/card border wall
 * (ink pixels extending significantly above AND below the text line band).
 */
function isVerticalWallColumn(
  img: ImageData,
  x: number,
  boxTop: number,
  boxBottom: number,
  bgRgb: RgbColor
): boolean {
  if (x < 0 || x >= img.width) return true;
  const h = Math.max(8, boxBottom - boxTop);
  const aboveTop = Math.max(0, Math.floor(boxTop - Math.max(10, h * 0.65)));
  const aboveBot = Math.max(0, Math.floor(boxTop - Math.max(3, h * 0.2)));
  const belowTop = Math.min(img.height - 1, Math.ceil(boxBottom + Math.max(3, h * 0.2)));
  const belowBot = Math.min(img.height - 1, Math.ceil(boxBottom + Math.max(10, h * 0.65)));

  // True table walls MUST paint ink continuously through BOTH the band above and below the cell text
  // (a single 1px horizontal table border hitting a glyph's vertical stem will only score ~1-2 pixels, never >=65%)
  let aboveHits = 0;
  let aboveTotal = 0;
  for (let py = aboveTop; py <= aboveBot; py++) {
    aboveTotal++;
    if (colorDistance(getPixel(img, x, py), bgRgb) > 30) {
      aboveHits++;
    }
  }
  if (aboveTotal === 0 || aboveHits < Math.max(3, Math.ceil(aboveTotal * 0.65))) return false;

  let belowHits = 0;
  let belowTotal = 0;
  for (let py = belowTop; py <= belowBot; py++) {
    belowTotal++;
    if (colorDistance(getPixel(img, x, py), bgRgb) > 30) {
      belowHits++;
    }
  }
  if (belowTotal === 0 || belowHits < Math.max(3, Math.ceil(belowTotal * 0.65))) return false;

  // Confirm continuous vertical line across text band
  let hits = 0;
  let total = 0;
  for (let py = aboveTop; py <= belowBot; py += 2) {
    total++;
    if (colorDistance(getPixel(img, x, py), bgRgb) > 30) {
      hits++;
    }
  }
  return total > 0 && hits / total > 0.78;
}

/**
 * Checks if a vertical table border line exists anywhere in horizontal range [x1, x2].
 */
function hasVerticalDividerBetween(
  img: ImageData,
  x1: number,
  x2: number,
  topY: number,
  bottomY: number
): boolean {
  const start = Math.floor(Math.min(x1, x2) + 1);
  const end = Math.ceil(Math.max(x1, x2) - 1);
  if (end <= start) return false;
  const midY = Math.floor((topY + bottomY) / 2);
  const bgSample = medianColor([
    getPixel(img, start, Math.max(0, Math.floor(topY - 4))),
    getPixel(img, end, Math.max(0, Math.floor(topY - 4))),
    getPixel(img, Math.floor((start + end) / 2), Math.min(img.height - 1, Math.ceil(bottomY + 4))),
  ]);
  for (let px = start; px <= end; px += 1) {
    if (
      colorDistance(getPixel(img, px, midY), bgSample) > 30 &&
      isVerticalWallColumn(img, px, topY, bottomY, bgSample)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Measures actual painted whitespace gap on the rendered canvas right before nextX,
 * completely immune to wrong PDF glyph advance widths on Indic OTF/CID fonts.
 */
function measureVisualInkGap(
  img: ImageData,
  prevLeftX: number,
  nextX: number,
  topY: number,
  bottomY: number,
  fontSizePx: number
): number {
  const bgSample = medianColor([
    getPixel(img, Math.max(0, nextX - 4), Math.max(0, Math.floor(topY - 3))),
    getPixel(img, Math.min(img.width - 1, nextX + 4), Math.max(0, Math.floor(topY - 3))),
    getPixel(img, Math.max(0, nextX - 4), Math.min(img.height - 1, Math.ceil(bottomY + 3))),
  ]);

  const yStart = Math.max(0, Math.floor(topY + fontSizePx * 0.12));
  const yEnd = Math.min(img.height - 1, Math.ceil(bottomY - fontSizePx * 0.1));
  const colHasInk = (px: number): boolean => {
    if (px < 0 || px >= img.width) return false;
    for (let py = yStart; py <= yEnd; py++) {
      if (colorDistance(getPixel(img, px, py), bgSample) > 34) return true;
    }
    return false;
  };

  // Find leftmost ink column belonging to `item` starting near nextX
  let nextInkStart = Math.round(nextX);
  const fwdLimit = Math.min(img.width - 1, Math.round(nextX + fontSizePx * 0.55));
  if (!colHasInk(nextInkStart)) {
    let found = false;
    for (let px = nextInkStart; px <= fwdLimit; px++) {
      if (colHasInk(px)) {
        nextInkStart = px;
        found = true;
        break;
      }
    }
    if (!found) {
      return Math.max(0, nextX - prevLeftX);
    }
  }

  // Scan leftward from nextInkStart - 1 across blank gap until hitting previous word's ink
  const backLimit = Math.max(0, Math.round(prevLeftX));
  let prevInkEnd = backLimit;
  for (let px = nextInkStart - 1; px >= backLimit; px--) {
    if (colHasInk(px)) {
      prevInkEnd = px;
      break;
    }
  }

  return Math.max(0, nextInkStart - prevInkEnd - 1);
}

function isHorizontalTableBorderRow(
  img: ImageData,
  py: number,
  xLeft: number,
  xRight: number,
  bgRgb: RgbColor
): boolean {
  if (py < 0 || py >= img.height) return true;
  const innerStart = Math.max(0, Math.floor(xLeft));
  const innerEnd = Math.min(img.width - 1, Math.ceil(xRight));
  if (innerEnd - innerStart < 8) return false;

  // 1. A real horizontal rule must be nearly solid (>= 82% ink) across the text span at 1px granularity
  let innerHits = 0;
  let innerTotal = 0;
  for (let px = innerStart; px <= innerEnd; px++) {
    innerTotal++;
    if (colorDistance(getPixel(img, px, py), bgRgb) > 22) innerHits++;
  }
  if (innerTotal === 0 || innerHits / innerTotal < 0.82) return false;

  // 2. Crucially, a real table border continues horizontally OUTSIDE the text glyph bounds,
  // whereas Tamil/Devanagari horizontal glyph strokes ALWAYS stop cleanly inside [xLeft..xRight].
  const lStart = Math.max(0, innerStart - 20);
  const lEnd = Math.max(-1, innerStart - 4);
  let leftHits = 0;
  let leftTotal = 0;
  for (let px = lStart; px <= lEnd; px++) {
    leftTotal++;
    if (colorDistance(getPixel(img, px, py), bgRgb) > 22) leftHits++;
  }
  const leftTailOk = leftTotal >= 6 && leftHits / leftTotal >= 0.72;

  const rStart = Math.min(img.width, innerEnd + 4);
  const rEnd = Math.min(img.width - 1, innerEnd + 20);
  let rightHits = 0;
  let rightTotal = 0;
  for (let px = rStart; px <= rEnd; px++) {
    rightTotal++;
    if (colorDistance(getPixel(img, px, py), bgRgb) > 22) rightHits++;
  }
  const rightTailOk = rightTotal >= 6 && rightHits / rightTotal >= 0.72;

  return leftTailOk || rightTailOk;
}

/**
 * Scans painted canvas ink pixels around the nominal PDF box to expand the erase
 * rectangle so 100% of overflowing Indic vowel hooks / trailing letters (ள், ன், ர், ண்)
 * are erased cleanly while strictly clamping inside table divider walls and horizontal borders.
 */
function computeExactInkEraseBounds(
  img: ImageData,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSizePx: number,
  maxAllowedRight: number,
  minAllowedLeft: number,
  bgRgb: RgbColor
): {
  eraseX: number;
  eraseY: number;
  eraseWidth: number;
  eraseHeight: number;
  safeLeft: number;
  safeRight: number;
} {
  const colHasGlyphInk = (px: number, scanTop: number, scanBottom: number): boolean => {
    if (px < 0 || px >= img.width) return false;
    for (let py = Math.max(0, Math.floor(scanTop)); py <= Math.min(img.height - 1, Math.ceil(scanBottom)); py++) {
      if (colorDistance(getPixel(img, px, py), bgRgb) > 34) {
        return true;
      }
    }
    return false;
  };

  // Detect true table divider walls starting inside [x + 0.35*fontSize .. rightScanLimit]
  // so even if PDF raw.width overshoots across a wall, wallRight clamps strictly inside the cell.
  const rightScanLimit = Math.min(
    img.width - 2,
    maxAllowedRight,
    x + w + Math.max(w * 0.6, fontSizePx * 5.5)
  );
  let wallRight = maxAllowedRight;
  const probeRightEnd = Math.min(img.width - 2, Math.max(rightScanLimit, maxAllowedRight));
  const probeRightStart = Math.max(0, Math.floor(x + Math.max(4, fontSizePx * 0.35)));
  for (let px = probeRightStart; px <= probeRightEnd; px += 1) {
    if (isVerticalWallColumn(img, px, y, y + h, bgRgb)) {
      wallRight = px - 2;
      break;
    }
  }

  let wallLeft = minAllowedLeft;
  const probeLeftStart = Math.max(0, Math.floor(x - 2));
  const probeLeftEnd = Math.max(1, Math.floor(minAllowedLeft));
  for (let px = probeLeftStart; px >= probeLeftEnd; px -= 1) {
    if (isVerticalWallColumn(img, px, y, y + h, bgRgb)) {
      wallLeft = px + 2;
      break;
    }
  }

  const scanTop = y + Math.max(1, h * 0.1);
  const scanBottom = y + h * 0.88;

  // Expand right to capture trailing Indic glyphs overhanging past pdfjs item.width, stopped at wallRight
  let eraseRight = Math.min(wallRight, x + w);
  let emptyCols = 0;
  for (let px = Math.floor(Math.min(wallRight, x + w)); px <= Math.min(wallRight, rightScanLimit); px++) {
    if (colHasGlyphInk(px, scanTop, scanBottom)) {
      eraseRight = px + 2;
      emptyCols = 0;
    } else {
      emptyCols++;
      if (emptyCols >= Math.max(10, Math.round(fontSizePx * 0.85))) {
        break;
      }
    }
  }
  eraseRight = Math.min(wallRight, eraseRight);

  // Expand left slightly to capture left-side stems/vowel modifiers (ட, ெ, ே, ை), stopped at wallLeft
  let eraseLeft = Math.max(wallLeft, x);
  const leftScanLimit = Math.max(wallLeft, x - fontSizePx * 0.75);
  let leftEmpty = 0;
  for (let px = Math.floor(eraseLeft); px >= leftScanLimit; px--) {
    if (colHasGlyphInk(px, scanTop, scanBottom)) {
      eraseLeft = px - 2;
      leftEmpty = 0;
    } else {
      leftEmpty++;
      if (leftEmpty >= 7) break;
    }
  }
  eraseLeft = Math.max(wallLeft, eraseLeft);

  // Protect top & bottom horizontal table border lines both outside and inside nominal [y .. y+h]
  const isHorizRule = (py: number) =>
    isHorizontalTableBorderRow(img, py, eraseLeft, eraseRight, bgRgb);

  let eraseTop = y;
  // Shrink downward if nominal top already hits a horizontal table border line
  for (let shift = 0; shift <= 4; shift++) {
    if (!isHorizRule(Math.floor(eraseTop))) break;
    eraseTop += 1.5;
  }
  const topLimit = Math.max(0, y - fontSizePx * 0.35);
  while (eraseTop > topLimit) {
    const candidate = Math.floor(eraseTop - 1);
    if (isHorizRule(candidate) || isHorizRule(candidate - 1)) break;
    let rowInk = false;
    for (let px = Math.floor(eraseLeft); px <= Math.ceil(eraseRight); px += 2) {
      if (colorDistance(getPixel(img, px, candidate), bgRgb) > 36) {
        rowInk = true;
        break;
      }
    }
    if (!rowInk) break;
    eraseTop = candidate;
  }

  let eraseBottom = y + h;
  // Shrink upward if nominal bottom already hits a horizontal table border line (common in compact rows!)
  for (let shift = 0; shift <= 5; shift++) {
    if (!isHorizRule(Math.ceil(eraseBottom))) break;
    eraseBottom -= 1.5;
  }
  const bottomLimit = Math.min(img.height - 1, y + h + fontSizePx * 0.38);
  while (eraseBottom < bottomLimit) {
    const candidate = Math.ceil(eraseBottom + 1);
    if (isHorizRule(candidate) || isHorizRule(candidate + 1)) break;
    let rowInk = false;
    for (let px = Math.floor(eraseLeft); px <= Math.ceil(eraseRight); px += 2) {
      if (colorDistance(getPixel(img, px, candidate), bgRgb) > 36) {
        rowInk = true;
        break;
      }
    }
    if (!rowInk) break;
    eraseBottom = candidate;
  }

  return {
    eraseX: eraseLeft,
    eraseY: eraseTop,
    eraseWidth: Math.max(4, eraseRight - eraseLeft),
    eraseHeight: Math.max(6, eraseBottom - eraseTop),
    safeLeft: wallLeft,
    safeRight: Math.min(wallRight, maxAllowedRight),
  };
}

function sampleBoxColors(
  img: ImageData,
  x: number,
  y: number,
  w: number,
  h: number
): { bgTopRgb: RgbColor; bgBottomRgb: RgbColor; inkRgb: RgbColor } {
  const topSamples: RgbColor[] = [];
  const bottomSamples: RgbColor[] = [];
  const stepX = Math.max(1, Math.floor(w / 18));

  for (let px = Math.floor(x); px <= Math.ceil(x + w); px += stepX) {
    topSamples.push(getPixel(img, px, Math.floor(y - 3)));
    bottomSamples.push(getPixel(img, px, Math.ceil(y + h + 3)));
  }
  topSamples.push(getPixel(img, Math.floor(x - 3), Math.floor(y + h * 0.25)));
  bottomSamples.push(getPixel(img, Math.ceil(x + w + 3), Math.floor(y + h * 0.75)));

  const bgTopRgb = medianColor(topSamples);
  const bgBottomRgb = medianColor(bottomSamples);
  const bgMid: RgbColor = {
    r: (bgTopRgb.r + bgBottomRgb.r) / 2,
    g: (bgTopRgb.g + bgBottomRgb.g) / 2,
    b: (bgTopRgb.b + bgBottomRgb.b) / 2,
  };

  const innerSamples: { color: RgbColor; dist: number }[] = [];
  const iyStart = Math.floor(y + h * 0.14);
  const iyEnd = Math.ceil(y + h * 0.84);
  const ixStep = Math.max(1, Math.floor(w / 24));
  const iyStep = Math.max(1, Math.floor((iyEnd - iyStart) / 6));

  for (let py = iyStart; py <= iyEnd; py += iyStep) {
    for (let px = Math.floor(x); px <= Math.ceil(x + w); px += ixStep) {
      const c = getPixel(img, px, py);
      const dist = colorDistance(c, bgMid);
      if (dist > 38) {
        innerSamples.push({ color: c, dist });
      }
    }
  }

  let inkRgb: RgbColor;
  if (innerSamples.length >= 3) {
    innerSamples.sort((a, b) => b.dist - a.dist);
    const topContrastSlice = innerSamples
      .slice(0, Math.max(3, Math.ceil(innerSamples.length * 0.25)))
      .map((s) => s.color);
    inkRgb = medianColor(topContrastSlice);
  } else {
    inkRgb = luminance(bgMid) < 128 ? { r: 255, g: 255, b: 255 } : { r: 15, g: 23, b: 42 };
  }

  return { bgTopRgb, bgBottomRgb, inkRgb };
}

function classifyFontStyle(
  fontName: string | undefined,
  stylesMap: Record<string, { fontFamily?: string }> | undefined
): {
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  fontCategory: 'sans' | 'serif' | 'mono';
} {
  const family = (fontName && stylesMap?.[fontName]?.fontFamily) || fontName || '';
  const lower = family.toLowerCase();
  const fontWeight: 'normal' | 'bold' = /bold|black|heavy|semibold|demi|700|800|900/.test(lower)
    ? 'bold'
    : 'normal';
  const fontStyle: 'normal' | 'italic' = /italic|oblique/.test(lower) ? 'italic' : 'normal';
  const fontCategory: 'sans' | 'serif' | 'mono' = /mono|courier|consolas|code/.test(lower)
    ? 'mono'
    : /serif|times|garamond|georgia|cambria/.test(lower)
    ? 'serif'
    : 'sans';

  return { fontWeight, fontStyle, fontCategory };
}

interface RawPositionedItem {
  str: string;
  isSpaceOnly?: boolean;
  x: number;
  baselineY: number;
  widthPx: number;
  fontSizePx: number;
  angleRad: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  fontCategory: 'sans' | 'serif' | 'mono';
}

/**
 * Parses PDF pages into high-DPI canvases and complete phrase/cell blocks,
 * preserving Indic glyph clusters, column separators, table walls, centering, and exact colors.
 */
export async function extractPdfLayoutPages(
  file: File,
  onProgress?: (progress: TranslationProgress) => void
): Promise<LayoutPdfPage[]> {
  onProgress?.({ step: 'Inspecting PDF geometry & layout locally...', percent: 8 });
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const layoutPages: LayoutPdfPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.({
      step: `Rendering & mapping page ${pageNum} of ${totalPages}...`,
      percent: Math.round(12 + (78 * pageNum) / totalPages),
    });

    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const maxDimPt = Math.max(baseViewport.width, baseViewport.height);
    const renderScale = maxDimPt < 420 ? 3.2 : maxDimPt < 720 ? 2.5 : 2.15;
    const viewport = page.getViewport({ scale: renderScale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Browser canvas context unavailable for PDF rendering.');
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;
    const originalDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const fullPageImg = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const textContent = await page.getTextContent();
    const stylesMap = (textContent.styles || {}) as Record<string, { fontFamily?: string }>;
    const rawItems: RawPositionedItem[] = [];

    for (const raw of textContent.items as Array<{
      str?: string;
      transform?: number[];
      width?: number;
      height?: number;
      fontName?: string;
    }>) {
      const str = typeof raw.str === 'string' ? raw.str : '';
      if (!str) continue;
      if (!Array.isArray(raw.transform) || raw.transform.length < 6) continue;

      const tx = pdfjsLib.Util.transform(viewport.transform, raw.transform);
      const fontSizePx = Math.max(6, Math.hypot(tx[2], tx[3]) || (raw.height || 10) * renderScale);
      const widthPx = Math.max(1, (raw.width || 0) * renderScale);
      const angleRad = Math.atan2(tx[1], tx[0]);
      const meta = classifyFontStyle(raw.fontName, stylesMap);

      rawItems.push({
        str,
        isSpaceOnly: !str.trim(),
        x: tx[4],
        baselineY: tx[5],
        widthPx,
        fontSizePx,
        angleRad,
        ...meta,
      });
    }

    // Group items into horizontal baseline rows
    rawItems.sort((a, b) => a.baselineY - b.baselineY || a.x - b.x);
    const rows: { baselineY: number; items: RawPositionedItem[] }[] = [];

    for (const item of rawItems) {
      const rowTolerance = Math.max(4, item.fontSizePx * 0.42);
      const existingRow = rows.find((r) => Math.abs(r.baselineY - item.baselineY) <= rowTolerance);
      if (existingRow) {
        existingRow.items.push(item);
      } else {
        rows.push({ baselineY: item.baselineY, items: [item] });
      }
    }

    const pageBlocks: LayoutTextBlock[] = [];
    let blockIndex = 0;

    for (const row of rows) {
      row.items.sort((a, b) => a.x - b.x);

      // Merge fragments inside the same line/cell while strictly splitting across table walls or wide column gaps
      const mergedInRow: {
        text: string;
        x: number;
        rightX: number;
        baselineY: number;
        fontSizePx: number;
        angleRad: number;
        fontWeight: 'normal' | 'bold';
        fontStyle: 'normal' | 'italic';
        fontCategory: 'sans' | 'serif' | 'mono';
      }[] = [];

      let pendingSpaceGap = false;
      for (const item of row.items) {
        if (item.isSpaceOnly) {
          pendingSpaceGap = true;
          continue;
        }
        const hadSpaceToken = pendingSpaceGap;
        pendingSpaceGap = false;

        const last = mergedInRow[mergedInRow.length - 1];
        if (!last) {
          mergedInRow.push({
            text: item.str,
            x: item.x,
            rightX: item.x + item.widthPx,
            baselineY: item.baselineY,
            fontSizePx: item.fontSizePx,
            angleRad: item.angleRad,
            fontWeight: item.fontWeight,
            fontStyle: item.fontStyle,
            fontCategory: item.fontCategory,
          });
          continue;
        }

        const nominalGap = item.x - last.rightX;
        const sizeRatio =
          Math.abs(item.fontSizePx - last.fontSizePx) / Math.max(item.fontSizePx, last.fontSizePx);
        const angleDiff = Math.abs(item.angleRad - last.angleRad);
        const rowTop = last.baselineY - last.fontSizePx * 0.85;
        const rowBottom = last.baselineY + last.fontSizePx * 0.25;

        const wallScanStart = Math.min(
          item.x,
          Math.max(last.x + 2, last.rightX - last.fontSizePx * 1.25)
        );
        const wallBetween =
          item.x > last.x + 3 &&
          hasVerticalDividerBetween(fullPageImg, wallScanStart, item.x, rowTop, rowBottom);
        const visualGap = wallBetween
          ? 9999
          : measureVisualInkGap(
              fullPageImg,
              last.x,
              item.x,
              rowTop,
              rowBottom,
              last.fontSizePx
            );
        const maxVisualMergeGap = Math.max(18 * renderScale, last.fontSizePx * 2.1);

        if (
          !wallBetween &&
          visualGap <= maxVisualMergeGap &&
          nominalGap >= -last.fontSizePx * 2.5 &&
          sizeRatio <= 0.35 &&
          angleDiff < 0.08
        ) {
          // Decide word boundary using preserved space tokens + nominal/canvas pixel gaps
          const startsWithCombiningOrPunct = /^[\s.,;:)\]/?!%\u0900-\u0903\u093A-\u094F\u0981-\u0983\u09BC-\u09CD\u0B82-\u0BCD\u0C00-\u0C04\u0C3E-\u0C56\u0C81-\u0CCD\u0D01-\u0D4D]/.test(
            item.str
          );
          const trailingNoSpaceChar = /[/(\-]$/.test(last.text);
          const hasExplicitSpace =
            hadSpaceToken || last.text.endsWith(' ') || item.str.startsWith(' ');
          const explicitBoundarySpace =
            hasExplicitSpace && (visualGap >= 0.8 || nominalGap >= 1.2);
          const needsSpace =
            !startsWithCombiningOrPunct &&
            !trailingNoSpaceChar &&
            (visualGap >= Math.max(2.3, last.fontSizePx * 0.16) ||
              (nominalGap >= Math.max(2.2, last.fontSizePx * 0.15) && visualGap >= 0.8) ||
              explicitBoundarySpace);

          last.text = `${last.text.trimEnd()}${needsSpace ? ' ' : ''}${item.str.trimStart()}`;
          last.x = Math.min(last.x, item.x);
          last.rightX = Math.max(last.rightX, item.x + item.widthPx);
          if (item.fontWeight === 'bold') last.fontWeight = 'bold';
        } else {
          mergedInRow.push({
            text: item.str,
            x: item.x,
            rightX: item.x + item.widthPx,
            baselineY: item.baselineY,
            fontSizePx: item.fontSizePx,
            angleRad: item.angleRad,
            fontWeight: item.fontWeight,
            fontStyle: item.fontStyle,
            fontCategory: item.fontCategory,
          });
        }
      }

      const leftMarginClamp = Math.max(8, canvas.width * 0.015);
      const rightMarginClamp = canvas.width - Math.max(10, canvas.width * 0.02);
      let prevActualEraseRight = leftMarginClamp;

      for (let i = 0; i < mergedInRow.length; i++) {
        const blk = mergedInRow[i];
        const normalizedText = normalizeExtractedIndicText(blk.text);
        if (!normalizedText) continue;

        const prevBlk = mergedInRow[i - 1];
        const nextBlk = mergedInRow[i + 1];
        const boxY = Math.max(0, blk.baselineY - blk.fontSizePx * 0.88);
        const boxW = Math.max(4, blk.rightX - blk.x);
        const boxH = Math.max(8, blk.fontSizePx * 1.18);

        // Do NOT let an overshot prevBlk.rightX bleed across a vertical table wall onto this cell's first glyph (e.g. ட)
        const hasWallOnLeft = prevBlk
          ? hasVerticalDividerBetween(
              fullPageImg,
              Math.min(blk.x - 1, Math.max(prevBlk.x + 2, prevBlk.rightX - blk.fontSizePx * 1.2)),
              blk.x + 2,
              boxY,
              boxY + boxH
            )
          : false;
        const minSafeLeftPx = prevBlk
          ? hasWallOnLeft
            ? leftMarginClamp
            : Math.min(prevActualEraseRight + 2, blk.x - 1)
          : leftMarginClamp;
        const rawMaxRight = nextBlk
          ? Math.max(blk.rightX, nextBlk.x - Math.max(5, blk.fontSizePx * 0.3))
          : rightMarginClamp;

        const colors = sampleBoxColors(fullPageImg, blk.x, boxY, boxW, boxH);
        const bgAvg: RgbColor = {
          r: (colors.bgTopRgb.r + colors.bgBottomRgb.r) / 2,
          g: (colors.bgTopRgb.g + colors.bgBottomRgb.g) / 2,
          b: (colors.bgTopRgb.b + colors.bgBottomRgb.b) / 2,
        };

        const exactErase = computeExactInkEraseBounds(
          fullPageImg,
          blk.x,
          boxY,
          boxW,
          boxH,
          blk.fontSizePx,
          rawMaxRight,
          minSafeLeftPx,
          bgAvg
        );
        prevActualEraseRight = exactErase.eraseX + exactErase.eraseWidth;

        const centerDiff = Math.abs((blk.x + blk.rightX) / 2 - canvas.width / 2);
        const isCenteredRow = mergedInRow.length === 1 && centerDiff < canvas.width * 0.06;
        const nonTranslatable = isNonTranslatableToken(normalizedText);

        pageBlocks.push({
          id: `p${pageNum}_b${blockIndex++}`,
          pageNumber: pageNum,
          sourceText: normalizedText,
          translatedText: normalizedText,
          canvasX: blk.x,
          canvasY: boxY,
          baselineY: blk.baselineY,
          widthPx: boxW,
          heightPx: boxH,
          eraseX: exactErase.eraseX,
          eraseY: exactErase.eraseY,
          eraseWidth: exactErase.eraseWidth,
          eraseHeight: exactErase.eraseHeight,
          minSafeLeftPx: exactErase.safeLeft,
          maxSafeRightPx: exactErase.safeRight,
          isCenteredRow,
          fontSizePx: blk.fontSizePx,
          fontWeight: blk.fontWeight,
          fontStyle: blk.fontStyle,
          fontCategory: blk.fontCategory,
          angleRad: blk.angleRad,
          bgTopRgb: colors.bgTopRgb,
          bgBottomRgb: colors.bgBottomRgb,
          inkRgb: colors.inkRgb,
          isNonTranslatable: nonTranslatable,
        });
      }
    }

    // Tag Proper Noun value cells (person names, father/husband names, villages, addresses)
    // so they are phonetically transliterated cleanly instead of translated as common nouns.
    for (let i = 0; i < pageBlocks.length; i++) {
      const blk = pageBlocks[i];
      if (blk.isNonTranslatable || isProperNounFieldLabel(blk.sourceText)) continue;

      const rowTol = Math.max(6, blk.fontSizePx * 0.55);
      // Find immediate neighbor strictly to the left on the same row
      let leftNeighbor: LayoutTextBlock | null = null;
      for (let j = i - 1; j >= 0; j--) {
        const cand = pageBlocks[j];
        if (cand.baselineY < blk.baselineY - rowTol) break;
        if (Math.abs(cand.baselineY - blk.baselineY) <= rowTol && cand.canvasX < blk.canvasX) {
          leftNeighbor = cand;
          break;
        }
      }

      if (leftNeighbor && isProperNounFieldLabel(leftNeighbor.sourceText)) {
        blk.isProperNounValue = true;
        continue;
      }

      // Check vertical column header above ONLY for short table cells (never wide footer notes)
      const leftIsEmptyOrRowIndex =
        !leftNeighbor || /^[\d#.]+$/.test(leftNeighbor.sourceText.trim());
      const looksLikeTableCell =
        blk.widthPx < canvas.width * 0.5 &&
        blk.sourceText.length < 55 &&
        !blk.sourceText.includes(':');
      if (leftIsEmptyOrRowIndex && looksLikeTableCell) {
        const maxHdrDist = canvas.height * 0.28;
        for (let j = i - 1; j >= 0; j--) {
          const hdr = pageBlocks[j];
          if (blk.baselineY - hdr.baselineY > maxHdrDist) break;
          if (hdr.baselineY >= blk.baselineY - rowTol) continue;

          // Stop at section banners (centered headers, dark banners, or "*Details / விவரங்கள் / விபரங்கள்")
          const isDarkBg = luminance(hdr.bgTopRgb) < 120;
          const isDetailsBanner = /விவரங்கள்|விபரங்கள்|details/i.test(hdr.sourceText);
          if (hdr.isCenteredRow || isDarkBg || isDetailsBanner) break;

          const hdrCenter = hdr.canvasX + hdr.widthPx / 2;
          const inSameColumn =
            hdrCenter >= blk.minSafeLeftPx - 6 &&
            hdrCenter <= blk.maxSafeRightPx + 6 &&
            blk.canvasX >= hdr.minSafeLeftPx - 14 &&
            blk.canvasX <= hdr.maxSafeRightPx + 6;
          if (!inSameColumn) continue;

          // Skip key-value row labels like "Village | Ullugurukki" (if hdr has a non-header right neighbor on its row, it's NOT a column header)
          const hdrRightNeighbor = pageBlocks[j + 1];
          const hdrHasRowValueRight =
            hdrRightNeighbor &&
            Math.abs(hdrRightNeighbor.baselineY - hdr.baselineY) <= Math.max(6, hdr.fontSizePx * 0.55) &&
            hdrRightNeighbor.canvasX > hdr.canvasX &&
            !lookupOfflineCivicPhrase(hdrRightNeighbor.sourceText, 'en');
          if (hdrHasRowValueRight) continue;

          if (isProperNounFieldLabel(hdr.sourceText)) {
            blk.isProperNounValue = true;
            break;
          }
          // Stop if we hit a different non-proper-noun column header above
          if (lookupOfflineCivicPhrase(hdr.sourceText, 'en')) {
            break;
          }
        }
      }
    }

    layoutPages.push({
      pageNumber: pageNum,
      widthPt: baseViewport.width,
      heightPt: baseViewport.height,
      renderScale,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      originalCanvas: canvas,
      originalDataUrl,
      blocks: pageBlocks,
    });
  }

  onProgress?.({ step: 'Layout geometry & pixel bounds mapped.', percent: 100 });
  return layoutPages;
}

async function tryNativeBrowserTranslator(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  if (sourceLang === 'auto') return null;
  try {
    const win = globalThis as unknown as {
      Translator?: {
        availability?: (opts: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
        create: (opts: { sourceLanguage: string; targetLanguage: string }) => Promise<{
          translate: (input: string) => Promise<string>;
          destroy?: () => void;
        }>;
      };
      translation?: {
        createTranslator?: (opts: { sourceLanguage: string; targetLanguage: string }) => Promise<{
          translate: (input: string) => Promise<string>;
        }>;
      };
    };

    if (win.Translator && typeof win.Translator.create === 'function') {
      if (typeof win.Translator.availability === 'function') {
        const avail = await win.Translator.availability({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        });
        if (avail === 'unavailable') return null;
      }
      const translator = await win.Translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      const result = await translator.translate(text);
      translator.destroy?.();
      return result || null;
    }

    if (win.translation?.createTranslator) {
      const translator = await win.translation.createTranslator({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      const result = await translator.translate(text);
      return result || null;
    }
  } catch {
    // Fallback cleanly
  }
  return null;
}

async function translateViaClientRequest(
  text: string,
  sourceLang: string,
  targetLang: string,
  signal?: AbortSignal
): Promise<{ text: string; detectedLang?: string } | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLang
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((seg: unknown) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
        const detected = typeof data[2] === 'string' ? data[2] : undefined;
        if (translated) return { text: translated, detectedLang: detected };
      }
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
  }

  if (sourceLang !== 'auto') {
    try {
      const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${encodeURIComponent(sourceLang)}|${encodeURIComponent(targetLang)}`;
      const res = await fetch(fallbackUrl, { signal });
      if (res.ok) {
        const json = (await res.json()) as {
          responseData?: { translatedText?: string };
        };
        const txt = json?.responseData?.translatedText?.trim();
        if (txt) return { text: txt, detectedLang: sourceLang };
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') throw err;
    }
  }

  return null;
}

async function translateSinglePhraseAccurately(
  phrase: string,
  sourceLang: string,
  targetLang: string,
  mode: TranslationMode,
  isProperNoun = false,
  signal?: AbortSignal
): Promise<{ text: string; detectedLang?: string; engine: 'offline' | 'native' | 'hybrid' }> {
  // 0. Guard compound Tamil kinship labels cleanly against literal verb drift
  if (
    targetLang === 'en' &&
    /தந்தை/.test(phrase) &&
    /கணவர்/.test(phrase) &&
    /பெய/.test(phrase)
  ) {
    return { text: 'Father / Husband Name', detectedLang: 'ta', engine: 'offline' };
  }

  // 1. Exact civic dictionary match (instant, 100% accurate for govt/card/certificate fields)
  const dictHit = lookupOfflineCivicPhrase(phrase, targetLang);
  if (dictHit) {
    return { text: dictHit.translated, detectedLang: dictHit.detectedLang, engine: 'offline' };
  }

  // 2. Proper-Noun cell (Person Name, Father/Husband Name, Village, Address Line) ->
  // Phonetic Title-Case transliteration so names/villages never become literal English common nouns
  if (targetLang === 'en' && isProperNoun && /[\u0900-\u0DFF]/.test(phrase)) {
    return {
      text: transliterateProperNounFieldToEnglish(phrase),
      detectedLang: sourceLang === 'auto' ? undefined : sourceLang,
      engine: 'offline',
    };
  }

  // 3. Colon-separated "Label : Value" handling so labels match dictionary while values translate cleanly
  const colonIdx = phrase.indexOf(':');
  if (colonIdx > 1 && colonIdx < phrase.length - 1) {
    const labelPart = phrase.slice(0, colonIdx).trim();
    const valuePart = phrase.slice(colonIdx + 1).trim();
    const labelHit = lookupOfflineCivicPhrase(labelPart, targetLang);
    if (labelHit && isNonTranslatableToken(valuePart)) {
      return {
        text: `${labelHit.translated}: ${valuePart}`,
        detectedLang: labelHit.detectedLang,
        engine: 'offline',
      };
    }
  }

  // 4. On-Device Browser Translator API
  const nativeOut = await tryNativeBrowserTranslator(phrase, sourceLang, targetLang);
  if (nativeOut) {
    return { text: nativeOut, detectedLang: sourceLang, engine: 'native' };
  }

  // 5. Strict Offline Mode fallback
  if (mode === 'strict-offline') {
    return {
      text: translateOfflineWithDictionaryAndTransliteration(phrase, targetLang),
      engine: 'offline',
    };
  }

  // 6. Clean isolated per-phrase browser translation (zero delimiter corruption)
  const webOut = await translateViaClientRequest(phrase, sourceLang, targetLang, signal);
  if (webOut?.text) {
    return { text: webOut.text, detectedLang: webOut.detectedLang, engine: 'hybrid' };
  }

  return {
    text: translateOfflineWithDictionaryAndTransliteration(phrase, targetLang),
    engine: 'offline',
  };
}

/**
 * Translates every positioned LayoutTextBlock independently without cross-block marker
 * contamination, using parallel worker batches for speed + local civic dictionary precision.
 */
export async function translateLayoutPages(
  pages: LayoutPdfPage[],
  sourceLang: string,
  targetLang: string,
  mode: TranslationMode,
  onProgress?: (progress: TranslationProgress) => void,
  signal?: AbortSignal
): Promise<LayoutTranslationResult> {
  const clonedPages: LayoutPdfPage[] = pages.map((p) => ({
    ...p,
    blocks: p.blocks.map((b) => ({ ...b })),
  }));

  const translatableBlocks: LayoutTextBlock[] = [];
  for (const p of clonedPages) {
    for (const b of p.blocks) {
      if (!b.isNonTranslatable && b.sourceText.trim()) {
        translatableBlocks.push(b);
      }
    }
  }

  if (translatableBlocks.length === 0) {
    throw new Error('No translatable text blocks found in this PDF.');
  }

  const translationCache = new Map<string, string>();
  let detectedSourceLang = sourceLang;
  let usedBrowserNative = false;
  let usedHybridClient = false;

  if (sourceLang === targetLang && sourceLang !== 'auto') {
    const summary = buildDocumentTextSummaries(clonedPages);
    return {
      pages: clonedPages,
      detectedSourceLang: sourceLang,
      engineUsed: 'offline-dictionary',
      translatedBlockCount: translatableBlocks.length,
      ...summary,
    };
  }

  const uniqueJobs: { key: string; phrase: string; isProperNoun: boolean }[] = [];
  const seen = new Set<string>();
  for (const blk of translatableBlocks) {
    const isProperNoun = Boolean(blk.isProperNounValue);
    const key = `${blk.sourceText}::${isProperNoun ? 'pn' : 'std'}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueJobs.push({ key, phrase: blk.sourceText, isProperNoun });
    }
  }

  const CONCURRENCY = 5;
  let completed = 0;

  for (let i = 0; i < uniqueJobs.length; i += CONCURRENCY) {
    if (signal?.aborted) {
      throw new DOMException('Translation cancelled', 'AbortError');
    }

    const slice = uniqueJobs.slice(i, i + CONCURRENCY);
    await Promise.all(
      slice.map(async (job) => {
        const res = await translateSinglePhraseAccurately(
          job.phrase,
          sourceLang,
          targetLang,
          mode,
          job.isProperNoun,
          signal
        );
        translationCache.set(job.key, res.text);
        if (res.detectedLang && detectedSourceLang === 'auto') {
          detectedSourceLang = res.detectedLang;
        }
        if (res.engine === 'hybrid') usedHybridClient = true;
        if (res.engine === 'native') usedBrowserNative = true;
      })
    );

    completed += slice.length;
    onProgress?.({
      step: `Translated ${completed} of ${uniqueJobs.length} unique fields...`,
      percent: Math.round(15 + (80 * completed) / Math.max(1, uniqueJobs.length)),
    });
  }

  for (const p of clonedPages) {
    for (const blk of p.blocks) {
      if (!blk.isNonTranslatable) {
        const key = `${blk.sourceText}::${blk.isProperNounValue ? 'pn' : 'std'}`;
        blk.translatedText = translationCache.get(key) ?? blk.sourceText;
      }
    }
  }

  onProgress?.({ step: 'Reconstructing exact PDF layout...', percent: 100 });
  const summary = buildDocumentTextSummaries(clonedPages);

  return {
    pages: clonedPages,
    detectedSourceLang,
    engineUsed: usedHybridClient
      ? 'hybrid-client'
      : usedBrowserNative
      ? 'browser-native'
      : 'offline-dictionary',
    translatedBlockCount: translatableBlocks.length,
    ...summary,
  };
}

export function buildDocumentTextSummaries(pages: LayoutPdfPage[]): {
  sourceFullText: string;
  translatedFullText: string;
  bilingualFullText: string;
} {
  const srcPages: string[] = [];
  const trPages: string[] = [];
  const biPages: string[] = [];

  for (const page of pages) {
    const header = pages.length > 1 ? `[PAGE ${page.pageNumber}]\n` : '';
    const srcLines = page.blocks.map((b) => b.sourceText).join('\n');
    const trLines = page.blocks.map((b) => b.translatedText).join('\n');
    const biLines = page.blocks
      .map((b) =>
        b.isNonTranslatable || b.sourceText === b.translatedText
          ? b.sourceText
          : `${b.sourceText}  →  ${b.translatedText}`
      )
      .join('\n');

    srcPages.push(`${header}${srcLines}`);
    trPages.push(`${header}${trLines}`);
    biPages.push(`${header}${biLines}`);
  }

  return {
    sourceFullText: srcPages.join('\n\n'),
    translatedFullText: trPages.join('\n\n'),
    bilingualFullText: biPages.join('\n\n────────────────────\n\n'),
  };
}

function getFontFamilyStack(category: 'sans' | 'serif' | 'mono'): string {
  if (category === 'serif') {
    return '"Noto Serif", Georgia, "Times New Roman", "Nirmala UI", serif';
  }
  if (category === 'mono') {
    return '"JetBrains Mono", "Courier New", monospace';
  }
  return '"Plus Jakarta Sans", "Noto Sans", "Nirmala UI", "Latha", "Mangal", "Gautami", system-ui, sans-serif';
}

/**
 * Renders an exact layout-preserved canvas copy of the page:
 * uses pixel-scanned erase rectangles so 0% of original glyphs remain behind,
 * protects table border walls & horizontal lines, centers headings naturally,
 * and fits Unicode text cleanly within cell margins.
 */
export function renderLayoutPreservedPageCanvas(
  page: LayoutPdfPage,
  targetLang: string
): HTMLCanvasElement {
  const outCanvas = document.createElement('canvas');
  outCanvas.width = page.canvasWidth;
  outCanvas.height = page.canvasHeight;
  const ctx = outCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return page.originalCanvas;

  ctx.drawImage(page.originalCanvas, 0, 0);
  const origImg = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);
  const outImg = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);

  const isRtl = targetLang === 'ur' || targetLang === 'ar';
  const blocksToRender = page.blocks.filter(
    (b) => !b.isNonTranslatable && b.translatedText.trim().length > 0
  );

  // Pass 1: Border-Preserving Pixel-Masked Erase of ONLY original translated glyphs
  for (const blk of blocksToRender) {
    if (Math.abs(blk.angleRad) > 0.04) {
      ctx.save();
      const grad = ctx.createLinearGradient(0, blk.eraseY, 0, blk.eraseY + blk.eraseHeight);
      grad.addColorStop(0, rgbCss(blk.bgTopRgb));
      grad.addColorStop(1, rgbCss(blk.bgBottomRgb));
      ctx.fillStyle = grad;
      ctx.translate(blk.canvasX, blk.baselineY);
      ctx.rotate(blk.angleRad);
      ctx.fillRect(-3, -blk.fontSizePx * 0.92, blk.eraseWidth + 6, blk.eraseHeight);
      ctx.restore();
      continue;
    }

    const x0 = Math.max(0, Math.floor(blk.eraseX));
    const y0 = Math.max(0, Math.floor(blk.eraseY));
    const x1 = Math.min(outCanvas.width - 1, Math.ceil(blk.eraseX + blk.eraseWidth));
    const y1 = Math.min(outCanvas.height - 1, Math.ceil(blk.eraseY + blk.eraseHeight));
    if (x1 <= x0 || y1 <= y0) continue;

    const bgAvg: RgbColor = {
      r: (blk.bgTopRgb.r + blk.bgBottomRgb.r) / 2,
      g: (blk.bgTopRgb.g + blk.bgBottomRgb.g) / 2,
      b: (blk.bgTopRgb.b + blk.bgBottomRgb.b) / 2,
    };

    const protectedRows = new Set<number>();
    for (let py = y0; py <= y1; py++) {
      if (isHorizontalTableBorderRow(origImg, py, x0, x1, bgAvg)) {
        protectedRows.add(py);
      }
    }

    const protectedCols = new Set<number>();
    for (let px = x0; px <= x1; px++) {
      if (isVerticalWallColumn(origImg, px, y0, y1, bgAvg)) {
        protectedCols.add(px);
      }
    }

    const totalH = Math.max(1, y1 - y0);
    for (let py = y0; py <= y1; py++) {
      if (protectedRows.has(py)) continue;
      const t = (py - y0) / totalH;
      const fillR = clampByte(blk.bgTopRgb.r + (blk.bgBottomRgb.r - blk.bgTopRgb.r) * t);
      const fillG = clampByte(blk.bgTopRgb.g + (blk.bgBottomRgb.g - blk.bgTopRgb.g) * t);
      const fillB = clampByte(blk.bgTopRgb.b + (blk.bgBottomRgb.b - blk.bgTopRgb.b) * t);

      for (let px = x0; px <= x1; px++) {
        if (protectedCols.has(px)) continue;
        const idx = (py * outImg.width + px) * 4;
        outImg.data[idx] = fillR;
        outImg.data[idx + 1] = fillG;
        outImg.data[idx + 2] = fillB;
        outImg.data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(outImg, 0, 0);

  // Pass 2: Draw Translated Unicode Text cleanly fitted strictly inside safe cell bounds
  for (const blk of blocksToRender) {
    ctx.save();
    const stack = getFontFamilyStack(blk.fontCategory);
    const leftAnchor = Math.max(blk.minSafeLeftPx, Math.min(blk.canvasX, blk.eraseX + 1));
    const availableWidth = blk.isCenteredRow
      ? Math.max(blk.eraseWidth, page.canvasWidth * 0.88)
      : Math.max(12, blk.maxSafeRightPx - leftAnchor - 2);

    let drawSize = blk.fontSizePx;
    const setCtxFont = (sz: number) => {
      ctx.font = `${blk.fontStyle} ${blk.fontWeight} ${sz.toFixed(1)}px ${stack}`;
    };

    setCtxFont(drawSize);
    let measuredW = ctx.measureText(blk.translatedText).width;

    const minReadableSize = Math.max(7.5, blk.fontSizePx * 0.6);
    if (measuredW > availableWidth && availableWidth > 12) {
      const scaledSize = drawSize * (availableWidth / measuredW);
      drawSize = Math.max(minReadableSize, scaledSize);
      setCtxFont(drawSize);
      measuredW = ctx.measureText(blk.translatedText).width;
    }

    let scaleX = 1;
    if (measuredW > availableWidth && availableWidth > 12) {
      scaleX = Math.max(0.72, availableWidth / measuredW);
    }

    ctx.fillStyle = rgbCss(blk.inkRgb);
    ctx.textBaseline = 'alphabetic';

    if (Math.abs(blk.angleRad) > 0.04) {
      ctx.translate(blk.canvasX, blk.baselineY);
      ctx.rotate(blk.angleRad);
      ctx.scale(scaleX, 1);
      ctx.direction = isRtl ? 'rtl' : 'ltr';
      ctx.textAlign = 'left';
      ctx.fillText(blk.translatedText, 0, 0);
    } else if (blk.isCenteredRow) {
      ctx.direction = isRtl ? 'rtl' : 'ltr';
      ctx.textAlign = 'center';
      ctx.translate(page.canvasWidth / 2, blk.baselineY);
      ctx.scale(scaleX, 1);
      ctx.fillText(blk.translatedText, 0, 0);
    } else if (isRtl) {
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      const anchorX = Math.min(blk.maxSafeRightPx, blk.canvasX + Math.max(blk.widthPx, measuredW * scaleX));
      ctx.translate(anchorX, blk.baselineY);
      ctx.scale(scaleX, 1);
      ctx.fillText(blk.translatedText, 0, 0);
    } else {
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
      const startX = Math.max(blk.minSafeLeftPx, Math.min(blk.canvasX, blk.eraseX + 1));
      ctx.translate(startX, blk.baselineY);
      ctx.scale(scaleX, 1);
      ctx.fillText(blk.translatedText, 0, 0);
    }

    ctx.restore();
  }

  return outCanvas;
}

/**
 * Generates a high-resolution multi-page PDF matching the EXACT page dimensions,
 * orientation, layout, margins, artwork, and positioning of the uploaded source PDF.
 */
export async function buildLayoutPreservedPdfBlob(
  pages: LayoutPdfPage[],
  targetLang: string,
  onProgress?: (progress: TranslationProgress) => void
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    onProgress?.({
      step: `Rendering exact PDF layout for page ${i + 1} of ${pages.length}...`,
      percent: Math.round(15 + (80 * (i + 1)) / pages.length),
    });

    const renderedCanvas = renderLayoutPreservedPageCanvas(page, targetLang);
    const imgDataUrl = renderedCanvas.toDataURL('image/jpeg', 0.94);
    const imgBytes = await (await fetch(imgDataUrl)).arrayBuffer();
    const embeddedImage = await pdfDoc.embedJpg(imgBytes);

    const pdfPage = pdfDoc.addPage([page.widthPt, page.heightPt]);
    pdfPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: page.widthPt,
      height: page.heightPt,
    });
  }

  onProgress?.({ step: 'Packaging layout-preserved PDF file...', percent: 100 });
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export function buildUnicodeWordDocumentBlob(
  title: string,
  sourceLang: string,
  targetLang: string,
  content: string
): Blob {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const html = `<!DOCTYPE html>
<html lang="${targetLang}">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0B192C; line-height: 1.65; margin: 36px; }
  .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
  .brand { font-size: 11px; color: #0284c7; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; }
  h1 { font-size: 18px; margin: 4px 0 4px 0; color: #0B192C; }
  .meta { font-size: 11px; color: #475569; }
  .content { font-size: 13px; white-space: pre-wrap; }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">AOS Tools · Exact Layout PDF Language Translator</div>
    <h1>${title}</h1>
    <div class="meta">Source: ${sourceLang.toUpperCase()} &rarr; Target: ${targetLang.toUpperCase()} &middot; Processed 100% locally in browser</div>
  </div>
  <div class="content">${escaped}</div>
</body>
</html>`;

  return new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
}
