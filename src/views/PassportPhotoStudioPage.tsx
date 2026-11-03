import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Crop,
  Sliders,
  Layers,
  Eye,
  Printer,
  Download,
  Scissors,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  ZoomIn,
  Move,
  Maximize2,
  FileDown,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { getStockDemoPortraitDataUrl } from '../utils/stockPassportPhoto';

interface PassportPhotoStudioPageProps {
  onBack: () => void;
}

type SheetPresetId = '4x6-8' | '4x6-6' | 'a4-30' | 'a4-36' | 'single';

interface SheetPresetConfig {
  id: SheetPresetId;
  label: string;
  sub: string;
  paper: '4x6' | 'a4';
  cols: number;
  rows: number;
  defaultCopies: number;
}

const SHEET_PRESETS: SheetPresetConfig[] = [
  { id: '4x6-8', label: '4×6 (8)', sub: '4×2 grid', paper: '4x6', cols: 4, rows: 2, defaultCopies: 8 },
  { id: '4x6-6', label: '4×6 (6)', sub: '3×2 grid', paper: '4x6', cols: 3, rows: 2, defaultCopies: 6 },
  { id: 'a4-30', label: 'A4 (30)', sub: '5×6 grid', paper: 'a4', cols: 5, rows: 6, defaultCopies: 30 },
  { id: 'a4-36', label: 'A4 (36)', sub: '6×6 grid', paper: 'a4', cols: 6, rows: 6, defaultCopies: 36 },
  { id: 'single', label: 'Single', sub: '1 photo', paper: '4x6', cols: 1, rows: 1, defaultCopies: 1 },
];

const COPIES_OPTIONS = [1, 4, 6, 8, 12, 16, 24, 30, 36];

export const PassportPhotoStudioPage: React.FC<PassportPhotoStudioPageProps> = ({ onBack }) => {
  // Source photo (defaults to stock demo portrait matching the screenshot)
  const [photoSrc, setPhotoSrc] = useState<string>('');
  const [isStockModel, setIsStockModel] = useState<boolean>(true);

  // Crop / Zoom / Pan state
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showCropAdjuster, setShowCropAdjuster] = useState<boolean>(false);

  // Image Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  // Sheet Layout & Copies
  const [selectedPreset, setSelectedPreset] = useState<SheetPresetId>('4x6-8');
  const [totalCopies, setTotalCopies] = useState<number>(8);

  // Advanced Settings
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>('original'); // 'original' | '#FFFFFF' | '#93C5FD' | '#F8FAFC' | '#E2E8F0'
  const [withBorder, setWithBorder] = useState<boolean>(true);
  const [dottedCutLines, setDottedCutLines] = useState<boolean>(true);
  const [cellGap, setCellGap] = useState<number>(2); // mm gap

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize stock portrait
  useEffect(() => {
    const stock = getStockDemoPortraitDataUrl();
    setPhotoSrc(stock);
  }, []);

  // Update total copies when preset changes
  const handleSelectPreset = (presetId: SheetPresetId) => {
    setSelectedPreset(presetId);
    const conf = SHEET_PRESETS.find((p) => p.id === presetId);
    if (conf) {
      setTotalCopies(conf.defaultCopies);
    }
  };

  // Handle Photo Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
        setIsStockModel(false);
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  // Reset Crop
  const handleResetCrop = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  };

  // Render Cropped Preview (Single 35x45 mm photo at 413x531 px)
  const renderSinglePhoto = useCallback((
    targetCtx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img: HTMLImageElement
  ) => {
    targetCtx.save();

    // 1. Fill background if specified
    if (bgColor !== 'original') {
      targetCtx.fillStyle = bgColor;
      targetCtx.fillRect(0, 0, w, h);
    }

    // 2. Compute Cover Crop with Zoom & Pan
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;
    const srcRatio = srcW / srcH;
    const dstRatio = w / h;

    let baseCropW = srcW;
    let baseCropH = srcH;

    if (srcRatio > dstRatio) {
      baseCropW = srcH * dstRatio;
    } else {
      baseCropH = srcW / dstRatio;
    }

    const cropW = baseCropW / zoom;
    const cropH = baseCropH / zoom;

    const centerX = srcW / 2 + (panX / 100) * (srcW / 4);
    const centerY = srcH / 2 + (panY / 100) * (srcH / 4);

    let sx = centerX - cropW / 2;
    let sy = centerY - cropH / 2;

    // Boundary clamp
    sx = Math.max(0, Math.min(srcW - cropW, sx));
    sy = Math.max(0, Math.min(srcH - cropH, sy));

    // 3. Filters
    targetCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    targetCtx.drawImage(img, sx, sy, cropW, cropH, 0, 0, w, h);
    targetCtx.filter = 'none';

    // 4. Border
    if (withBorder) {
      targetCtx.strokeStyle = '#1e293b';
      targetCtx.lineWidth = 1.5;
      targetCtx.strokeRect(0, 0, w, h);
    }

    targetCtx.restore();
  }, [bgColor, zoom, panX, panY, brightness, contrast, saturation, withBorder]);

  // Update Single Preview Canvas
  useEffect(() => {
    if (!photoSrc) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 413;
      canvas.height = 531;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderSinglePhoto(ctx, 413, 531, img);
    };
    img.src = photoSrc;
  }, [photoSrc, renderSinglePhoto]);

  // Update Live Print Sheet Canvas
  useEffect(() => {
    if (!photoSrc) return;
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const activeConf = SHEET_PRESETS.find((p) => p.id === selectedPreset) || SHEET_PRESETS[0];

      // Sheet pixel dimensions:
      // 4x6 inch @ 300 DPI = 1800 x 1200 px (Landscape)
      // A4 @ 300 DPI = 2480 x 3508 px (Portrait)
      const isA4 = activeConf.paper === 'a4';
      const sheetW = isA4 ? 2480 : 1800;
      const sheetH = isA4 ? 3508 : 1200;

      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;

      // 1. Fill Crisp White Sheet
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Single photo dimensions on sheet: 35x45 mm @ 300 DPI (~413 x 531 px)
      const photoW = 413;
      const photoH = 531;

      // Grid arrangement
      const cols = activeConf.cols;
      const rows = activeConf.rows;
      const maxSlots = cols * rows;
      const copiesToDraw = Math.min(totalCopies, maxSlots);

      // Calculate margins to center the grid
      const gapPx = (cellGap / 25.4) * 300; // mm to px at 300 DPI
      const totalGridW = cols * photoW + (cols - 1) * gapPx;
      const totalGridH = rows * photoH + (rows - 1) * gapPx;

      const startX = (sheetW - totalGridW) / 2;
      const startY = (sheetH - totalGridH) / 2 - 25; // slight top offset to leave room for footer

      // Render copies
      let drawnCount = 0;
      for (let r = 0; r < rows && drawnCount < copiesToDraw; r++) {
        for (let c = 0; c < cols && drawnCount < copiesToDraw; c++) {
          const x = startX + c * (photoW + gapPx);
          const y = startY + r * (photoH + gapPx);

          // Draw photo into offscreen canvas then onto sheet
          const photoCanvas = document.createElement('canvas');
          photoCanvas.width = photoW;
          photoCanvas.height = photoH;
          const pCtx = photoCanvas.getContext('2d');
          if (pCtx) {
            renderSinglePhoto(pCtx, photoW, photoH, img);
            ctx.drawImage(photoCanvas, x, y);
          }

          // Dotted Cut Lines around photo cell
          if (dottedCutLines) {
            ctx.save();
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 6]);
            // Draw cut guidelines slightly outside the photo
            ctx.strokeRect(x - gapPx / 2, y - gapPx / 2, photoW + gapPx, photoH + gapPx);
            ctx.restore();
          }

          drawnCount++;
        }
      }

      // Footer branding stamp (matching screenshot: AOS PRINTER STUDIO • 35x45 mm • 8 Copies)
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const footerY = sheetH - 45;
      ctx.fillText(
        `AOS PRINTER STUDIO   •   35×45 mm   •   ${copiesToDraw} Copies`,
        sheetW / 2,
        footerY
      );
    };
    img.src = photoSrc;
  }, [photoSrc, selectedPreset, totalCopies, cellGap, dottedCutLines, renderSinglePhoto]);

  // Actions: Direct Print Sheet
  const handleDirectPrint = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to open the print view.');
      return;
    }

    const isA4 = SHEET_PRESETS.find((p) => p.id === selectedPreset)?.paper === 'a4';
    const paperSizeCss = isA4 ? 'A4 portrait' : '4in 6in landscape';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AOS Printer Studio - Passport Sheet</title>
          <style>
            @page {
              size: ${paperSizeCss};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Actions: Download PDF Sheet (using pdf-lib)
  const handleDownloadPdf = async () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;

    try {
      const activeConf = SHEET_PRESETS.find((p) => p.id === selectedPreset) || SHEET_PRESETS[0];
      const isA4 = activeConf.paper === 'a4';

      // 4x6 inch: 4 * 72 = 288 pt by 6 * 72 = 432 pt (Landscape: 432 x 288)
      // A4: 595.28 x 841.89 pt (Portrait)
      const pageW = isA4 ? 595.28 : 432;
      const pageH = isA4 ? 841.89 : 288;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pageW, pageH]);

      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.98);
      const jpgBytes = await (await fetch(jpgDataUrl)).arrayBuffer();
      const embeddedJpg = await pdfDoc.embedJpg(jpgBytes);

      page.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: pageW,
        height: pageH,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `AOS_Passport_Print_Sheet_${totalCopies}Photos_${activeConf.paper}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  // Actions: Download High-Res Sheet JPG
  const handleDownloadSheetJpg = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_Passport_Sheet_${totalCopies}Photos.jpg`;
    link.click();
  };

  // Actions: Download Single Photo JPG for Online Govt Portals (SSC/UPSC/Passport)
  const handleDownloadSingleJpg = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    // 35x45 mm export @ 0.88 quality (~35-45 KB, strictly under 50 KB for official portals)
    const url = canvas.toDataURL('image/jpeg', 0.88);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_Passport_Single_35x45mm_GovtReady.jpg`;
    link.click();
  };

  const activePaperLabel = SHEET_PRESETS.find((p) => p.id === selectedPreset)?.paper === 'a4' ? 'A4 Paper' : '4×6" Paper';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* =========================================================================
          TOP NAVIGATION & HEADER (Matching Screenshot)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#072642] hover:bg-[#0a355c] border border-[#0d4775] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            300 DPI Print Ready
          </span>
        </div>
      </div>

      {/* Main Studio Title Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#072642] border border-[#0d4775] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 shrink-0">
            <Crop className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Passport Photo Studio
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300">
                STUDIO CROP &amp; PRINT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Demo Portrait • Upload your photo to customize
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {isStockModel ? 'Stock Model Loaded' : 'Custom Photo Loaded'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: CROPPED PHOTO PREVIEW (Matching Screenshot 3)
          ========================================================================= */}
      <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              CROPPED PHOTO PREVIEW
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#03182b] text-slate-300 border border-[#0d4775]">
              35 × 45 mm (India Standard 7:9)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              India Standard 35×45 mm
            </span>
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white ml-1">
              STANDARD
            </span>
          </div>
        </div>

        {/* Center Cropped Photo Stage */}
        <div className="relative w-full py-6 flex flex-col items-center justify-center bg-[#03182b]/90 rounded-2xl border border-[#0d4775]/50 overflow-hidden">
          <div className="relative group">
            <canvas
              ref={previewCanvasRef}
              className="w-48 sm:w-56 aspect-[35/45] rounded-lg shadow-2xl object-contain border border-slate-700"
            />
            
            {/* Adjust Crop Floating Pill Button */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <button
                onClick={() => setShowCropAdjuster(!showCropAdjuster)}
                className="px-3.5 py-1.5 rounded-full bg-[#072642]/95 hover:bg-red-600 border border-[#0d4775] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer active:scale-95"
              >
                <Crop className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
                <span>Adjust Crop</span>
              </button>
            </div>
          </div>

          {/* Inline Crop / Pan / Zoom Adjuster Drawer */}
          {showCropAdjuster && (
            <div className="mt-4 w-full max-w-md p-4 rounded-xl bg-[#072642] border border-[#0d4775] space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-red-400" />
                  Face Framing &amp; Scale
                </span>
                <button
                  onClick={handleResetCrop}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Reset Position
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Zoom Scale</span>
                  <span className="font-mono text-red-400">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Pan Horizontal</span>
                    <span className="font-mono">{panX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span>Pan Vertical</span>
                    <span className="font-mono">{panY}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                    className="w-full accent-red-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: IMAGE ADJUSTMENTS (Matching Screenshot 1 & 3)
          ========================================================================= */}
      <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Image Adjustments</span>
          </div>
          <button
            onClick={handleResetAdjustments}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Brightness */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Brightness</span>
              <span className="font-mono text-blue-400">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 h-1.5 bg-[#03182b] rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Contrast</span>
              <span className="font-mono text-blue-400">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 h-1.5 bg-[#03182b] rounded-lg cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-200">
              <span>Saturation</span>
              <span className="font-mono text-blue-400">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
              className="w-full accent-blue-500 h-1.5 bg-[#03182b] rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: PRINT SHEET LAYOUT (Matching Screenshot 1 & 2)
          ========================================================================= */}
      <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Print Sheet Layout</span>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-[#03182b] border border-[#0d4775] px-2 py-0.5 rounded">
            {totalCopies} Photos
          </span>
        </div>

        {/* 5 Layout Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SHEET_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-[#03182b] border-[#0d4775] text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                <div className="text-xs font-black">{preset.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5">{preset.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Total Copies on Sheet selector */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Total Copies on Sheet:</span>
            <span className="font-mono text-blue-400 font-semibold">
              {totalCopies} Photos • {activePaperLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {COPIES_OPTIONS.map((count) => {
              const isSelected = totalCopies === count;
              return (
                <button
                  key={count}
                  onClick={() => setTotalCopies(count)}
                  className={`w-9 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                      : 'bg-[#03182b] border border-[#0d4775] text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion: Advanced Cutting & Border Settings */}
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer py-1"
          >
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-red-400" />
              Advanced Cutting &amp; Border Settings
            </span>
            {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isAccordionOpen && (
            <div className="mt-3 p-4 rounded-xl bg-[#03182b] border border-[#0d4775] space-y-4 animate-in fade-in duration-150">
              {/* Background Color tint */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Studio Background Tint
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'original', label: 'Original', color: 'transparent' },
                    { id: '#FFFFFF', label: 'Crisp White', color: '#FFFFFF' },
                    { id: '#93C5FD', label: 'Light Blue', color: '#93C5FD' },
                    { id: '#F8FAFC', label: 'Off-White', color: '#F8FAFC' },
                    { id: '#E2E8F0', label: 'Neutral Gray', color: '#E2E8F0' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBgColor(bg.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        bgColor === bg.id
                          ? 'border-red-500 bg-red-950/60 text-white shadow-sm'
                          : 'border-[#0d4775] bg-[#072642] text-slate-300 hover:text-white'
                      }`}
                    >
                      {bg.color !== 'transparent' && (
                        <span
                          className="w-3 h-3 rounded-full border border-slate-400"
                          style={{ backgroundColor: bg.color }}
                        />
                      )}
                      <span>{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={withBorder}
                    onChange={(e) => setWithBorder(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span>Solid black border on each photo</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-200">
                  <input
                    type="checkbox"
                    checked={dottedCutLines}
                    onChange={(e) => setDottedCutLines(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span>Dotted scissor cut guidelines</span>
                </label>
              </div>

              {/* Gap margin */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Photo Separation Margin (Cut Gap)</span>
                  <span className="font-mono text-red-400">{cellGap} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={cellGap}
                  onChange={(e) => setCellGap(parseFloat(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: LIVE PRINT SHEET (Matching Screenshot 1 & 2)
          ========================================================================= */}
      <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Live Print Sheet</span>
          </div>

          <div className="flex items-center gap-2">
            {dottedCutLines && (
              <span className="text-[10px] font-mono text-red-300 bg-red-950/70 border border-red-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Scissors className="w-3 h-3 text-red-400" />
                Dotted Cut Lines Active
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
              READY TO PRINT
            </span>
          </div>
        </div>

        {/* Live Print Canvas Sheet Display */}
        <div className="w-full py-4 flex items-center justify-center bg-[#03182b] rounded-2xl border border-[#0d4775] overflow-hidden p-2 sm:p-4">
          <canvas
            ref={sheetCanvasRef}
            className="w-full max-w-2xl rounded-lg shadow-2xl border border-slate-700 bg-white object-contain"
          />
        </div>

        {/* Actions: Print & Download Buttons matching screenshot */}
        <div className="space-y-2.5 pt-2">
          {/* Blue Primary Button: Direct Print Sheet */}
          <button
            onClick={handleDirectPrint}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Direct Print Sheet</span>
          </button>

          {/* Row of 2: Download PDF (Red) & Download JPG (Dark) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadPdf}
              className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-98"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadSheetJpg}
              className="py-3 rounded-xl bg-[#03182b] hover:bg-[#052642] border border-[#0d4775] text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download JPG</span>
            </button>
          </div>

          {/* Full-width button: Download Single Photo JPG for Online Forms */}
          <button
            onClick={handleDownloadSingleJpg}
            className="w-full py-2.5 rounded-xl bg-[#03182b] hover:bg-[#052642] border border-[#0d4775] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Single Photo JPG (For Online Forms)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
