import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  Layers, 
  Sliders, 
  Eye, 
  RefreshCw, 
  FileCode,
  FileJson,
  Share2
} from 'lucide-react';
import { ExtractedColorItem, extractColorPalette } from '../utils/imageEngine';

interface ColorPaletteExtractorViewProps {
  imageFile: File | null;
  palette: ExtractedColorItem[];
  onPaletteExtracted: (palette: ExtractedColorItem[]) => void;
  paletteMaxColors: number;
  setPaletteMaxColors: (n: number) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ColorPaletteExtractorView: React.FC<ColorPaletteExtractorViewProps> = ({
  imageFile,
  palette,
  onPaletteExtracted,
  paletteMaxColors,
  setPaletteMaxColors,
  onCopyText,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [activeSort, setActiveSort] = useState<'frequency' | 'lightness'>('frequency');

  const dominantColor = palette.length > 0 ? palette[0] : null;

  // Handle color count change and re-extract
  const handleCountChange = async (count: number) => {
    setPaletteMaxColors(count);
    if (imageFile) {
      setIsExtracting(true);
      try {
        const result = await extractColorPalette(imageFile, count);
        onPaletteExtracted(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleCopy = (text: string, key: string, label: string) => {
    onCopyText(text, label);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  // Copy All HEX
  const handleCopyAllHex = () => {
    if (palette.length === 0) return;
    const allHex = palette.map((c) => c.hex).join(', ');
    handleCopy(allHex, 'all-hex', `Copied ${palette.length} HEX codes to clipboard`);
  };

  // Copy CSS Variables
  const handleCopyCssVars = () => {
    if (palette.length === 0) return;
    const cssLines = [
      '/* Extracted Palette - AOS Tools Professional Engine */',
      ':root {',
      ...palette.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} (${c.percentage}%) */`),
      '}',
    ].join('\n');
    handleCopy(cssLines, 'css-vars', 'Copied CSS variables to clipboard');
  };

  // Download JSON Palette
  const handleDownloadJson = () => {
    if (palette.length === 0) return;
    const data = {
      source: 'AOS Tools Color Palette Extractor',
      extractedAt: new Date().toISOString(),
      dominantColor: dominantColor?.hex,
      colors: palette.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        percentage: c.percentage,
        name: c.name,
        isDark: c.isDark,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download High-Res Palette Card Image (PNG) with Dynamic Height and Safe Rendering
  const handleDownloadPaletteCard = () => {
    if (palette.length === 0) return;
    const canvas = document.createElement('canvas');
    const width = 1200;

    // Calculate columns, rows, and dynamic canvas height to prevent any cropping
    const cols = Math.min(palette.length, 6);
    const rows = Math.ceil(palette.length / cols);
    const gap = 16;
    const swatchW = (width - 120 - (cols - 1) * gap) / cols;
    const swatchH = 220;
    const startY = dominantColor ? 280 : 140;
    const totalHeight = startY + rows * (swatchH + gap) + 60;

    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Universal rounded rectangle renderer with fallback for older browsers
    const drawRoundedBox = (x: number, y: number, w: number, h: number, r: number, fillStyle: string) => {
      ctx.fillStyle = fillStyle;
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    };

    // Dark sleek background
    ctx.fillStyle = '#07192B';
    ctx.fillRect(0, 0, width, totalHeight);

    // Header Branding
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('AOS TOOLS • COLOR PALETTE EXTRACTOR', 60, 55);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Extracted Dominant Color Palette', 60, 98);

    // Draw Dominant Bar on Top
    if (dominantColor) {
      drawRoundedBox(60, 125, width - 120, 120, 16, dominantColor.hex);

      // Dominant text overlay
      ctx.fillStyle = dominantColor.isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`Dominant Color: ${dominantColor.hex}`, 88, 175);
      ctx.font = '16px sans-serif';
      ctx.fillText(`${dominantColor.name} • ${dominantColor.rgb} • ${dominantColor.percentage}% Dominance`, 88, 210);
    }

    // Draw ALL Swatches in Grid
    palette.forEach((col, idx) => {
      const colIdx = idx % cols;
      const rowIdx = Math.floor(idx / cols);
      const x = 60 + colIdx * (swatchW + gap);
      const y = startY + rowIdx * (swatchH + gap);

      // Card background
      drawRoundedBox(x, y, swatchW, swatchH, 14, '#0D2A45');

      // Color tile
      drawRoundedBox(x + 10, y + 10, swatchW - 20, 115, 10, col.hex);

      // Percentage badge
      ctx.fillStyle = col.isDark ? '#FFFFFF' : '#0F172A';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`${col.percentage}%`, x + 20, y + 32);

      // Color Labels
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(col.hex, x + 14, y + 152);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px sans-serif';
      ctx.fillText(col.name, x + 14, y + 175);

      ctx.fillStyle = '#64748B';
      ctx.font = '10px monospace';
      ctx.fillText(col.rgb, x + 14, y + 196);
    });

    // Footer note
    ctx.fillStyle = '#64748B';
    ctx.font = '13px sans-serif';
    ctx.fillText('Generated client-side with AOS Tools • https://aos-tools.pages.dev/', 60, totalHeight - 24);

    // Save as PNG with Blob support
    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `color-palette-${Date.now()}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `color-palette-${Date.now()}.png`;
      a.click();
    }
  };

  const displayedPalette = [...palette].sort((a, b) => {
    if (activeSort === 'lightness') {
      const lumA = (0.299 * a.r + 0.587 * a.g + 0.114 * a.b);
      const lumB = (0.299 * b.r + 0.587 * b.g + 0.114 * b.b);
      return lumB - lumA;
    }
    return b.percentage - a.percentage;
  });

  return (
    <div className="space-y-6 pt-3 animate-in fade-in duration-300">
      {/* Precision Controls & Palette Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-md">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Color Palette Precision Engine
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              High-accuracy adaptive quantization &amp; dominant color detection
            </p>
          </div>
        </div>

        {/* Palette Count Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
            Palette Size:
          </span>
          {[6, 8, 12, 16].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isExtracting}
              onClick={() => handleCountChange(num)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paletteMaxColors === num
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : 'liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* 1. DEDICATED MOST USED / DOMINANT COLOR PREVIEW CARD AT TOP */}
      {dominantColor && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0284c7] dark:text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Most Used / Dominant Color in Image</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              {dominantColor.percentage}% Dominance Area
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl liquid-glass border border-slate-200 dark:border-sky-500/20 shadow-xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Color Swatch Block */}
            <div className="md:col-span-5 flex flex-col items-center sm:items-start">
              <div
                className="w-full h-32 sm:h-36 rounded-2xl shadow-xl flex flex-col justify-between p-4 relative group transition-transform hover:scale-[1.01] border border-black/10"
                style={{ backgroundColor: dominantColor.hex }}
              >
                <div className="flex justify-between items-start">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full font-mono uppercase shadow-xs"
                    style={{
                      backgroundColor: dominantColor.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                      color: dominantColor.isDark ? '#FFFFFF' : '#0F172A',
                    }}
                  >
                    Dominant
                  </span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: dominantColor.isDark ? '#FFFFFF' : '#0F172A' }}
                  >
                    {dominantColor.percentage}%
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div
                    className="text-xl sm:text-2xl font-black font-mono tracking-wider drop-shadow-sm"
                    style={{ color: dominantColor.isDark ? '#FFFFFF' : '#0F172A' }}
                  >
                    {dominantColor.hex}
                  </div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: dominantColor.isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.85)' }}
                  >
                    {dominantColor.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Dominant Color Details & One-Tap Copy Buttons */}
            <div className="md:col-span-7 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {dominantColor.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Highest pixel frequency centroid detected across the canvas
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Contrast: {dominantColor.isDark ? 'White Text' : 'Dark Text'}
                </div>
              </div>

              {/* Code Strip with Instant One-Tap Copy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* HEX */}
                <div
                  onClick={() => handleCopy(dominantColor.hex, 'dom-hex', `Copied HEX ${dominantColor.hex}`)}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 hover:border-[#0284c7] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>HEX</span>
                    {copiedKey === 'dom-hex' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7]" />
                    )}
                  </div>
                  <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                    {dominantColor.hex}
                  </div>
                </div>

                {/* RGB */}
                <div
                  onClick={() => handleCopy(dominantColor.rgb, 'dom-rgb', `Copied RGB ${dominantColor.rgb}`)}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 hover:border-[#0284c7] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>RGB</span>
                    {copiedKey === 'dom-rgb' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7]" />
                    )}
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-1 truncate" title={dominantColor.rgb}>
                    {dominantColor.rgb}
                  </div>
                </div>

                {/* HSL */}
                <div
                  onClick={() => handleCopy(dominantColor.hsl, 'dom-hsl', `Copied HSL ${dominantColor.hsl}`)}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-800/60 hover:border-[#0284c7] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>HSL</span>
                    {copiedKey === 'dom-hsl' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7]" />
                    )}
                  </div>
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mt-1 truncate" title={dominantColor.hsl}>
                    {dominantColor.hsl}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Dominant Color */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopy(dominantColor.hex, 'dom-quick', `Copied HEX ${dominantColor.hex}`)}
                  className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Dominant HEX</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllHex}
                  className="px-3.5 py-2 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Copy All {palette.length} HEX</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPaletteCard}
                  className="px-3.5 py-2 rounded-xl bg-[#072642] hover:bg-[#0d4775] text-white border border-[#38bdf8]/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download Swatch PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MULTI-COLUMN GRID OF EXTRACTED COLOR PALETTE SWATCHES */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0284c7]" />
              <span>Extracted Palette Swatches ({displayedPalette.length} Colors)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any color swatch or code to copy instantly to clipboard
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyCssVars}
              className="px-2.5 py-1.5 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Copy as CSS :root variables"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-500" />
              <span>CSS Variables</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-2.5 py-1.5 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Export palette as JSON file"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-500" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Multi-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayedPalette.map((col, idx) => {
            const hexKey = `hex-${idx}-${col.hex}`;
            const rgbKey = `rgb-${idx}-${col.hex}`;
            const isHexCopied = copiedKey === hexKey;
            const isRgbCopied = copiedKey === rgbKey;

            return (
              <div
                key={idx}
                className="rounded-2xl liquid-glass-sub border border-slate-200 dark:border-white/10 overflow-hidden hover:border-[#0284c7]/60 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                {/* Visual Color Preview Box with Percentage Overlay */}
                <div
                  onClick={() => handleCopy(col.hex, hexKey, `Copied ${col.hex}`)}
                  className="w-full h-24 sm:h-28 relative cursor-pointer group-hover:opacity-95 transition-opacity p-2.5 flex flex-col justify-between"
                  style={{ backgroundColor: col.hex }}
                  title="Click to copy HEX code"
                >
                  <div className="flex justify-between items-start">
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs"
                      style={{
                        backgroundColor: col.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
                        color: col.isDark ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      {col.percentage}%
                    </span>
                    <span
                      className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded shadow-xs"
                      style={{
                        backgroundColor: col.isDark ? '#FFFFFF' : '#0F172A',
                        color: col.isDark ? '#0F172A' : '#FFFFFF',
                      }}
                    >
                      Copy
                    </span>
                  </div>

                  <div
                    className="text-[11px] font-extrabold truncate drop-shadow-xs"
                    style={{ color: col.isDark ? '#FFFFFF' : '#0F172A' }}
                  >
                    {col.name}
                  </div>
                </div>

                {/* Details & Copy Actions */}
                <div className="p-2.5 space-y-2 bg-white dark:bg-[#072642]">
                  {/* HEX with Copy Button */}
                  <div
                    onClick={() => handleCopy(col.hex, hexKey, `Copied HEX ${col.hex}`)}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-[#03182b] hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
                    title="Click to copy HEX"
                  >
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {col.hex}
                    </span>
                    {isHexCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284c7] shrink-0" />
                    )}
                  </div>

                  {/* RGB with Copy Button */}
                  <div
                    onClick={() => handleCopy(col.rgb, rgbKey, `Copied RGB ${col.rgb}`)}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-[#03182b] hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
                    title="Click to copy RGB"
                  >
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate" title={col.rgb}>
                      {col.rgb}
                    </span>
                    {isRgbCopied ? (
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 hover:text-[#0284c7] shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
