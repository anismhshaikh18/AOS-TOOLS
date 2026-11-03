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
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ZoomIn,
  FileDown,
  Square,
  Sparkles,
  Type,
  CornerDownRight,
  Palette,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { getStockDemoPortraitDataUrl } from '../utils/stockPassportPhoto';

interface PassportPhotoStudioPageProps {
  onBack: () => void;
}

type SheetPresetId = '4x6-8' | '4x6-6' | 'a4-30' | 'a4-36' | 'single';
type CutGuideStyle = 'dotted' | 'crop-marks' | 'solid' | 'none';
type BorderThickness = 'none' | 'thin' | 'standard' | 'bold';

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

  // Advanced Border & Cutting Settings (Replaces background tint with professional studio features)
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [borderThickness, setBorderThickness] = useState<BorderThickness>('standard');
  const [borderColor, setBorderColor] = useState<string>('#000000');
  const [cornerStyle, setCornerStyle] = useState<'sharp' | 'rounded'>('sharp');

  // Cutting & Alignment Settings
  const [cutGuideStyle, setCutGuideStyle] = useState<CutGuideStyle>('dotted');
  const [cutGuideColor, setCutGuideColor] = useState<string>('#94A3B8');
  const [showScissorIcons, setShowScissorIcons] = useState<boolean>(true);
  const [cellGap, setCellGap] = useState<number>(2); // mm gap
  const [sheetMargin, setSheetMargin] = useState<number>(8); // mm outer margin

  // Candidate Name & Date Stamp (Govt Exam Requirement: SSC/UPSC)
  const [withNameDate, setWithNameDate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('ANIS SHAIKH');
  const [dopText, setDopText] = useState<string>(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `DOP: ${day}/${month}/${year}`;
  });

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

  // Helper: Get border pixel width
  const getBorderPx = (thickness: BorderThickness): number => {
    switch (thickness) {
      case 'none': return 0;
      case 'thin': return 1.2; // ~0.5pt
      case 'standard': return 2.2; // ~1.0pt
      case 'bold': return 4.0; // ~2.0pt
    }
  };

  // Render Cropped Preview (Single 35x45 mm photo at 413x531 px)
  const renderSinglePhoto = useCallback((
    targetCtx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img: HTMLImageElement
  ) => {
    targetCtx.save();

    // 1. Clear background to clean white
    targetCtx.fillStyle = '#FFFFFF';
    targetCtx.fillRect(0, 0, w, h);

    // 2. Compute usable photo height:
    // When Name & Date (DOB/DOP) is enabled, dedicate compact bottom strip (~56px) for the name plate
    // and frame the entire portrait above it so NOT a single pixel of the face, neck, or body is cut off!
    const stripH = withNameDate ? 56 : 0;
    const photoH = h - stripH; // Upper area for full portrait

    // 3. Compute Cover Crop with Zoom & Pan for the exact photo area
    const srcW = img.naturalWidth || 413;
    const srcH = img.naturalHeight || 531;
    const srcRatio = srcW / srcH;
    const dstRatio = w / photoH;

    let baseCropW = srcW;
    let baseCropH = srcH;

    if (srcRatio > dstRatio) {
      baseCropW = srcH * dstRatio;
    } else {
      baseCropH = srcW / dstRatio;
    }

    const cropW = baseCropW / zoom;
    const cropH = baseCropH / zoom;

    // In portraits, default focus is slightly higher (0.43 of height)
    // so forehead, hair, chin, neck and chest remain completely inside the frame!
    const defaultYRatio = withNameDate ? 0.43 : 0.48;
    const centerX = srcW / 2 + (panX / 100) * (srcW / 4);
    const centerY = srcH * defaultYRatio + (panY / 100) * (srcH / 4);

    let sx = centerX - cropW / 2;
    let sy = centerY - cropH / 2;

    // Boundary clamp
    sx = Math.max(0, Math.min(Math.max(0, srcW - cropW), sx));
    sy = Math.max(0, Math.min(Math.max(0, srcH - cropH), sy));

    // 4. Rounded corner clip if selected
    if (cornerStyle === 'rounded') {
      const radius = 16;
      targetCtx.beginPath();
      targetCtx.moveTo(radius, 0);
      targetCtx.lineTo(w - radius, 0);
      targetCtx.quadraticCurveTo(w, 0, w, radius);
      targetCtx.lineTo(w, h - radius);
      targetCtx.quadraticCurveTo(w, h, w - radius, h);
      targetCtx.lineTo(radius, h);
      targetCtx.quadraticCurveTo(0, h, 0, h - radius);
      targetCtx.lineTo(0, radius);
      targetCtx.quadraticCurveTo(0, 0, radius, 0);
      targetCtx.closePath();
      targetCtx.clip();
    }

    // 5. Draw image with filters strictly into the photo area (0 to photoH)
    targetCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    targetCtx.drawImage(img, sx, sy, cropW, cropH, 0, 0, w, photoH);
    targetCtx.filter = 'none';

    // 6. Name & Date Stamp (Govt Exam Requirement) in the bottom dedicated area
    if (withNameDate) {
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, photoH, w, stripH);

      // Subtle separator line
      targetCtx.strokeStyle = '#CBD5E1';
      targetCtx.lineWidth = 1;
      targetCtx.beginPath();
      targetCtx.moveTo(0, photoH);
      targetCtx.lineTo(w, photoH);
      targetCtx.stroke();

      targetCtx.fillStyle = '#000000';
      targetCtx.textAlign = 'center';
      targetCtx.textBaseline = 'middle';

      // Candidate Name
      targetCtx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      targetCtx.fillText(candidateName.trim().toUpperCase(), w / 2, photoH + stripH * 0.36);

      // Date of Photo / Date of Birth (DOP / DOB)
      targetCtx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      targetCtx.fillText(dopText.trim(), w / 2, photoH + stripH * 0.74);
    }

    // 5. Border
    const borderPx = getBorderPx(borderThickness);
    if (borderPx > 0) {
      targetCtx.strokeStyle = borderColor;
      targetCtx.lineWidth = borderPx;
      if (cornerStyle === 'rounded') {
        const radius = 16;
        targetCtx.beginPath();
        targetCtx.moveTo(radius, 0);
        targetCtx.lineTo(w - radius, 0);
        targetCtx.quadraticCurveTo(w, 0, w, radius);
        targetCtx.lineTo(w, h - radius);
        targetCtx.quadraticCurveTo(w, h, w - radius, h);
        targetCtx.lineTo(radius, h);
        targetCtx.quadraticCurveTo(0, h, 0, h - radius);
        targetCtx.lineTo(0, radius);
        targetCtx.quadraticCurveTo(0, 0, radius, 0);
        targetCtx.closePath();
        targetCtx.stroke();
      } else {
        targetCtx.strokeRect(borderPx / 2, borderPx / 2, w - borderPx, h - borderPx);
      }
    }

    targetCtx.restore();
  }, [
    zoom,
    panX,
    panY,
    brightness,
    contrast,
    saturation,
    borderThickness,
    borderColor,
    cornerStyle,
    withNameDate,
    candidateName,
    dopText,
  ]);

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

      // 1. Fill Crisp Pure White Print Sheet
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Single photo dimensions: 35x45 mm @ 300 DPI (~413 x 531 px)
      const photoW = 413;
      const photoH = 531;

      // Grid arrangement
      const cols = activeConf.cols;
      const rows = activeConf.rows;
      const maxSlots = cols * rows;
      const copiesToDraw = Math.min(totalCopies, maxSlots);

      // Calculate gaps in px at 300 DPI (1 inch = 25.4 mm)
      const gapPx = (cellGap / 25.4) * 300;

      // Helper function to draw a single photo slot and its cutting guides
      const drawPhotoSlot = (x: number, y: number, r: number, c: number) => {
        // Draw photo onto sheet
        const photoCanvas = document.createElement('canvas');
        photoCanvas.width = photoW;
        photoCanvas.height = photoH;
        const pCtx = photoCanvas.getContext('2d');
        if (pCtx) {
          renderSinglePhoto(pCtx, photoW, photoH, img);
          ctx.drawImage(photoCanvas, x, y);
        }

        // Cutting Guides
        if (cutGuideStyle === 'dotted') {
          ctx.save();
          ctx.strokeStyle = cutGuideColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([8, 6]);
          ctx.strokeRect(x - gapPx / 2, y - gapPx / 2, photoW + gapPx, photoH + gapPx);
          ctx.restore();
        } else if (cutGuideStyle === 'solid') {
          ctx.save();
          ctx.strokeStyle = cutGuideColor;
          ctx.lineWidth = 1.0;
          ctx.strokeRect(x - gapPx / 2, y - gapPx / 2, photoW + gapPx, photoH + gapPx);
          ctx.restore();
        } else if (cutGuideStyle === 'crop-marks') {
          // Pro Corner L-Crop Marks
          const markLen = 18;
          ctx.save();
          ctx.strokeStyle = cutGuideColor;
          ctx.lineWidth = 1.5;

          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(x - 2, y - markLen);
          ctx.lineTo(x - 2, y - 2);
          ctx.lineTo(x - markLen, y - 2);
          ctx.stroke();

          // Top-right corner
          ctx.beginPath();
          ctx.moveTo(x + photoW + 2, y - markLen);
          ctx.lineTo(x + photoW + 2, y - 2);
          ctx.lineTo(x + photoW + markLen, y - 2);
          ctx.stroke();

          // Bottom-left corner
          ctx.beginPath();
          ctx.moveTo(x - 2, y + photoH + markLen);
          ctx.lineTo(x - 2, y + photoH + 2);
          ctx.lineTo(x - markLen, y + photoH + 2);
          ctx.stroke();

          // Bottom-right corner
          ctx.beginPath();
          ctx.moveTo(x + photoW + 2, y + photoH + markLen);
          ctx.lineTo(x + photoW + 2, y + photoH + 2);
          ctx.lineTo(x + photoW + markLen, y + photoH + 2);
          ctx.stroke();

          ctx.restore();
        }

        // Optional Scissor Icons on edge
        if (showScissorIcons && cutGuideStyle !== 'none') {
          ctx.save();
          ctx.fillStyle = cutGuideColor;
          ctx.font = '14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (r === 0) {
            ctx.fillText('✂', x + photoW / 2, y - gapPx / 2 - 8);
          }
          if (c === 0) {
            ctx.fillText('✂', x - gapPx / 2 - 12, y + photoH / 2);
          }
          ctx.restore();
        }
      };

      // RENDER LOGIC:
      // When 1 copy is requested (or Single preset), place DEAD CENTER on sheet
      if (copiesToDraw === 1 || selectedPreset === 'single') {
        const x = Math.round((sheetW - photoW) / 2);
        const y = Math.round((sheetH - photoH) / 2 - 25);
        drawPhotoSlot(x, y, 0, 0);
      } else {
        // Multi-photo layout: dynamically center rows and columns
        let effectiveCols = Math.min(cols, copiesToDraw);
        let effectiveRows = Math.ceil(copiesToDraw / effectiveCols);

        // Optimal balanced grid on 4x6 paper
        if (copiesToDraw === 4 && cols >= 2) {
          effectiveCols = 2;
          effectiveRows = 2;
        } else if (copiesToDraw === 6 && cols === 4) {
          effectiveCols = 3;
          effectiveRows = 2;
        }

        const totalGridW = effectiveCols * photoW + (effectiveCols - 1) * gapPx;
        const totalGridH = effectiveRows * photoH + (effectiveRows - 1) * gapPx;
        const startY = Math.round((sheetH - totalGridH) / 2 - 25);

        let drawnCount = 0;
        for (let r = 0; r < effectiveRows && drawnCount < copiesToDraw; r++) {
          const remaining = copiesToDraw - drawnCount;
          const photosInThisRow = Math.min(effectiveCols, remaining);
          const rowW = photosInThisRow * photoW + (photosInThisRow - 1) * gapPx;
          const rowStartX = Math.round((sheetW - rowW) / 2);

          for (let c = 0; c < photosInThisRow && drawnCount < copiesToDraw; c++) {
            const x = Math.round(rowStartX + c * (photoW + gapPx));
            const y = Math.round(startY + r * (photoH + gapPx));
            drawPhotoSlot(x, y, r, c);
            drawnCount++;
          }
        }
      }

      // Footer branding stamp: Updated to "AOS Passport Photo Studio"
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      const footerY = sheetH - 42;
      ctx.fillText(
        `AOS Passport Photo Studio   •   35×45 mm   •   ${copiesToDraw} Copies`,
        sheetW / 2,
        footerY
      );
    };
    img.src = photoSrc;
  }, [
    photoSrc,
    selectedPreset,
    totalCopies,
    cellGap,
    sheetMargin,
    cutGuideStyle,
    cutGuideColor,
    showScissorIcons,
    renderSinglePhoto,
  ]);

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
          <title>AOS Passport Photo Studio - Print Sheet</title>
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
      link.download = `AOS_Passport_Photo_Studio_${totalCopies}Photos_${activeConf.paper}.pdf`;
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
    link.download = `AOS_Passport_Photo_Studio_${totalCopies}Photos.jpg`;
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-sub hover:border-red-500/50 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
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
      <div className="p-4 sm:p-5 rounded-2xl liquid-glass shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
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
          {!isStockModel && (
            <button
              onClick={() => {
                setPhotoSrc(getStockDemoPortraitDataUrl());
                setIsStockModel(true);
                setZoom(1.0);
                setPanX(0);
                setPanY(0);
              }}
              className="px-3 py-2 rounded-xl liquid-glass-sub hover:border-red-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Reset to official sample portrait"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span>Use Sample</span>
            </button>
          )}
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            {isStockModel ? 'Sample Portrait Loaded' : 'Custom Photo Loaded'}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: CROPPED PHOTO PREVIEW (Matching Screenshot 3)
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-white tracking-wider uppercase">
              CROPPED PHOTO PREVIEW
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded liquid-glass-sub text-slate-300">
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
        <div className="relative w-full py-6 flex flex-col items-center justify-center liquid-glass-sub rounded-2xl border border-white/10 overflow-hidden">
          <div className="relative group">
            <canvas
              ref={previewCanvasRef}
              className="w-48 sm:w-56 aspect-[35/45] rounded-lg shadow-2xl object-contain border border-slate-700 bg-white"
            />
            
            {/* Adjust Crop Floating Pill Button */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <button
                onClick={() => setShowCropAdjuster(!showCropAdjuster)}
                className="px-3.5 py-1.5 rounded-full liquid-glass hover:bg-red-600 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Crop className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
                <span>Adjust Crop</span>
              </button>
            </div>
          </div>

          {/* Inline Crop / Pan / Zoom Adjuster Drawer */}
          {showCropAdjuster && (
            <div className="mt-4 w-full max-w-md p-4 rounded-xl liquid-glass-sub border border-white/10 space-y-3 animate-in fade-in zoom-in-95">
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
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
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
              className="w-full accent-blue-500 h-1.5 liquid-glass-sub rounded-lg cursor-pointer"
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
              className="w-full accent-blue-500 h-1.5 liquid-glass-sub rounded-lg cursor-pointer"
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
              className="w-full accent-blue-500 h-1.5 liquid-glass-sub rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: PRINT SHEET LAYOUT & ADVANCED CUTTING SETTINGS
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Print Sheet Layout</span>
          </div>
          <span className="text-xs font-mono text-slate-400 liquid-glass-sub px-2 py-0.5 rounded">
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
                    : 'liquid-glass-sub text-slate-300 hover:border-red-500/40 hover:text-white'
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
                      : 'liquid-glass-sub text-slate-300 hover:text-white hover:border-red-500/40'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            ACCORDION: ADVANCED CUTTING & BORDER SETTINGS
            ========================================================================= */}
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
            <div className="mt-3 p-4 rounded-xl liquid-glass-sub border border-white/10 space-y-5 animate-in fade-in duration-150">
              
              {/* 1. Photo Border Thickness & Style */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Photo Border Thickness (Cutting Edge)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'No Border', sub: 'Frameless' },
                    { id: 'thin', label: 'Hairline', sub: '0.5 pt Lab Cut' },
                    { id: 'standard', label: 'Standard', sub: '1.0 pt Standard' },
                    { id: 'bold', label: 'Bold Edge', sub: '2.0 pt High-Vis' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBorderThickness(b.id as BorderThickness)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        borderThickness === b.id
                          ? 'border-red-500 bg-red-950/60 text-white shadow-sm'
                          : 'liquid-glass text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{b.label}</div>
                      <div className="text-[10px] text-slate-400">{b.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Border Color & Corner Style */}
              {borderThickness !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Border Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { color: '#000000', label: 'Black' },
                        { color: '#334155', label: 'Charcoal' },
                        { color: '#94A3B8', label: 'Silver' },
                        { color: '#FFFFFF', label: 'White Inset' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() => setBorderColor(c.color)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            borderColor === c.color
                              ? 'border-red-500 bg-red-950/60 text-white'
                              : 'liquid-glass text-slate-300'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-500 shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Corner Cut Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCornerStyle('sharp')}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          cornerStyle === 'sharp'
                            ? 'border-red-500 bg-red-950/60 text-white'
                            : 'liquid-glass text-slate-300'
                        }`}
                      >
                        Square (90° Standard)
                      </button>
                      <button
                        onClick={() => setCornerStyle('rounded')}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          cornerStyle === 'rounded'
                            ? 'border-red-500 bg-red-950/60 text-white'
                            : 'liquid-glass text-slate-300'
                        }`}
                      >
                        Smooth Rounded (2mm)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Cutting Guide Style (Dotted, Crop Marks, Solid, None) */}
              <div className="space-y-2 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Cutting Guide Marks &amp; Lines
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScissorIcons}
                      onChange={(e) => setShowScissorIcons(e.target.checked)}
                      className="w-3.5 h-3.5 accent-red-600 rounded"
                    />
                    <span>Show ✂ Scissors on Margins</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'dotted', label: 'Dotted Grid', sub: 'Scissors Guide' },
                    { id: 'crop-marks', label: 'Corner Marks', sub: 'L-Crop Marks' },
                    { id: 'solid', label: 'Continuous Line', sub: 'Paper Trimmer' },
                    { id: 'none', label: 'Clean Blank', sub: 'No Guide Lines' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setCutGuideStyle(g.id as CutGuideStyle)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        cutGuideStyle === g.id
                          ? 'border-red-500 bg-red-950/60 text-white shadow-sm'
                          : 'liquid-glass text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{g.label}</div>
                      <div className="text-[10px] text-slate-400">{g.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Guide Line Color & Gap Spacing */}
              {cutGuideStyle !== 'none' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Guide Line Color
                    </label>
                    <div className="flex gap-2">
                      {[
                        { color: '#94A3B8', label: 'Soft Gray' },
                        { color: '#475569', label: 'Dark Slate' },
                        { color: '#EF4444', label: 'Red Laser' },
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() => setCutGuideColor(c.color)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                            cutGuideColor === c.color
                              ? 'border-red-500 bg-red-950/60 text-white'
                              : 'liquid-glass text-slate-300'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Inter-Photo Cutting Gap</span>
                      <span className="font-mono text-red-400">{cellGap} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="0.5"
                      value={cellGap}
                      onChange={(e) => setCellGap(parseFloat(e.target.value))}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>
              )}

              {/* 5. Candidate Name & Date (DOP) Stamp - SSC / UPSC Govt Exam Requirement */}
              <div className="p-3.5 rounded-xl liquid-glass border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      checked={withNameDate}
                      onChange={(e) => setWithNameDate(e.target.checked)}
                      className="w-4 h-4 accent-red-600 rounded"
                    />
                    <span>Print Candidate Name &amp; Date (DOP) on Photo</span>
                  </label>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded">
                    SSC / UPSC / Govt Exam
                  </span>
                </div>

                {withNameDate && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                          Candidate Full Name
                        </label>
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          placeholder="e.g. ANIS SHAIKH"
                          className="w-full liquid-glass-sub text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                          Date of Photo (DOP / DOB)
                        </label>
                        <input
                          type="text"
                          value={dopText}
                          onChange={(e) => setDopText(e.target.value)}
                          placeholder="e.g. DOP: 03/11/2026"
                          className="w-full liquid-glass-sub text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Quick Face & Frame Position Adjuster */}
                    <div className="p-2.5 rounded-lg liquid-glass-sub border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Crop className="w-3.5 h-3.5 text-blue-400" />
                        <span>Photo Framing (Upar / Neeche Position):</span>
                        <span className="font-mono text-emerald-400 text-[10px]">{panY > 0 ? `+${panY}%` : `${panY}%`}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPanY((prev) => Math.max(-50, prev - 4))}
                          className="px-2.5 py-1 rounded liquid-glass hover:bg-blue-600 border border-white/10 text-white text-[11px] font-bold transition-all cursor-pointer"
                          title="Shift photo upwards"
                        >
                          ▲ Nudge Up
                        </button>
                        <button
                          type="button"
                          onClick={() => setPanY((prev) => Math.min(50, prev + 4))}
                          className="px-2.5 py-1 rounded liquid-glass hover:bg-blue-600 border border-white/10 text-white text-[11px] font-bold transition-all cursor-pointer"
                          title="Shift photo downwards"
                        >
                          ▼ Nudge Down
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPanY(0); setPanX(0); setZoom(1.0); }}
                          className="px-2 py-1 rounded liquid-glass hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white text-[10px] font-semibold transition-all cursor-pointer"
                          title="Reset to default center"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: LIVE PRINT SHEET (Matching Screenshot 1 & 2)
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Live Print Sheet</span>
          </div>

          <div className="flex items-center gap-2">
            {cutGuideStyle !== 'none' && (
              <span className="text-[10px] font-mono text-red-300 bg-red-950/70 border border-red-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Scissors className="w-3 h-3 text-red-400" />
                {cutGuideStyle === 'crop-marks' ? 'Crop Marks Active' : 'Cut Guides Active'}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
              READY TO PRINT
            </span>
          </div>
        </div>

        {/* Live Print Canvas Sheet Display */}
        <div className="w-full py-4 flex items-center justify-center liquid-glass-sub rounded-2xl border border-white/10 overflow-hidden p-2 sm:p-4">
          <canvas
            ref={sheetCanvasRef}
            className="w-full max-w-2xl rounded-lg shadow-2xl border border-slate-700 bg-white object-contain"
          />
        </div>

        {/* Actions: Print & Download Buttons */}
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
              className="py-3 rounded-xl liquid-glass-sub hover:border-red-500/50 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download JPG</span>
            </button>
          </div>

          {/* Full-width button: Download Single Photo JPG for Online Forms */}
          <button
            onClick={handleDownloadSingleJpg}
            className="w-full py-2.5 rounded-xl liquid-glass-sub hover:border-red-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Single Photo JPG (For Online Forms)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
