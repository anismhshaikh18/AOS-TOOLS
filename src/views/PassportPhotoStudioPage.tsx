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
  Camera,
  Check,
  RefreshCw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import {
  SAMPLE_PORTRAITS,
  DEFAULT_STUDIO_MALE_SVG,
  getStockDemoPortraitDataUrl,
  SamplePortrait,
} from '../utils/stockPassportPhoto';

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
  // Source photo URL / Data URL
  const [photoSrc, setPhotoSrc] = useState<string>(() => getStockDemoPortraitDataUrl());
  const [selectedSampleId, setSelectedSampleId] = useState<string>('studio-male');
  const [isStockModel, setIsStockModel] = useState<boolean>(true);
  const [loadedPhotoImg, setLoadedPhotoImg] = useState<HTMLImageElement | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Biometric Framing Overlay Guide (70-80% face coverage & eye-level line)
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(false);

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

  // Advanced Border & Cutting Settings
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [borderThickness, setBorderThickness] = useState<BorderThickness>('standard');
  const [borderColor, setBorderColor] = useState<string>('#000000');
  const [cornerStyle, setCornerStyle] = useState<'sharp' | 'rounded'>('sharp');

  // Cutting & Alignment Settings
  const [cutGuideStyle, setCutGuideStyle] = useState<CutGuideStyle>('dotted');
  const [cutGuideColor, setCutGuideColor] = useState<string>('#94A3B8');
  const [showScissorIcons, setShowScissorIcons] = useState<boolean>(true);
  const [cellGap, setCellGap] = useState<number>(2); // mm gap

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

  // Canvas Refs & Hidden Inputs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Preload Image Element safely whenever photoSrc changes
  // Guarded crossOrigin avoids CORS/Security blocking on Data URLs and Blob URLs in mobile browsers!
  useEffect(() => {
    if (!photoSrc) return;
    setIsImageLoading(true);

    const img = new Image();
    const isHttp = photoSrc.startsWith('http://') || photoSrc.startsWith('https://');
    if (isHttp) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      setLoadedPhotoImg(img);
      setIsImageLoading(false);
    };

    img.onerror = () => {
      console.warn('Primary portrait failed to load, falling back to guaranteed vector portrait');
      if (photoSrc !== DEFAULT_STUDIO_MALE_SVG) {
        setPhotoSrc(DEFAULT_STUDIO_MALE_SVG);
        setSelectedSampleId('studio-vector-male');
      }
      setIsImageLoading(false);
    };

    img.src = photoSrc;
  }, [photoSrc]);

  // Handle Preset Switch
  const handleSelectPreset = (presetId: SheetPresetId) => {
    setSelectedPreset(presetId);
    const conf = SHEET_PRESETS.find((p) => p.id === presetId);
    if (conf) {
      setTotalCopies(conf.defaultCopies);
    }
  };

  // Safe file reader handler (supports any file input event or drop)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
        setIsStockModel(false);
        setSelectedSampleId('');
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Photo Upload from file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Crucial: reset target value so uploading the same image or re-selecting works every time!
    e.target.value = '';
  };

  // Handle Camera Capture
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Clipboard Paste Support (Ctrl+V anywhere in document or page)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Quick switch to sample portrait
  const handleSelectSample = (sample: SamplePortrait) => {
    setPhotoSrc(sample.url);
    setSelectedSampleId(sample.id);
    setIsStockModel(true);
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  };

  // Reset Adjustments
  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  // Reset Crop & Framing
  const handleResetCrop = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  };

  // Helper: Border pixel width
  const getBorderPx = (thickness: BorderThickness): number => {
    switch (thickness) {
      case 'none': return 0;
      case 'thin': return 1.2;
      case 'standard': return 2.2;
      case 'bold': return 4.0;
    }
  };

  // =========================================================================
  // CORE RENDERER: Single 35×45 mm Photo with Strict Boundary Clamping
  // =========================================================================
  const renderSinglePhoto = useCallback((
    targetCtx: CanvasRenderingContext2D,
    w: number,
    h: number,
    img: HTMLImageElement
  ) => {
    targetCtx.save();

    // 1. Fill clean pure white background
    targetCtx.fillStyle = '#FFFFFF';
    targetCtx.fillRect(0, 0, w, h);

    // 2. Compute dedicated candidate name/DOP bottom strip
    const stripH = withNameDate ? 56 : 0;
    const photoH = Math.max(10, h - stripH);

    // 3. Mathematical cover crop with zoom & pan
    const srcW = Math.max(1, img.naturalWidth || img.width || 413);
    const srcH = Math.max(1, img.naturalHeight || img.height || 531);
    const srcRatio = srcW / srcH;
    const dstRatio = w / photoH;

    let baseCropW = srcW;
    let baseCropH = srcH;

    if (srcRatio > dstRatio) {
      baseCropW = srcH * dstRatio;
      baseCropH = srcH;
    } else {
      baseCropW = srcW;
      baseCropH = srcW / dstRatio;
    }

    // Strict clamp: crop box must NEVER exceed source image dimensions (avoids IndexSizeError)
    const effectiveZoom = Math.max(0.6, Math.min(3.0, zoom));
    const cropW = Math.min(srcW, Math.max(20, baseCropW / effectiveZoom));
    const cropH = Math.min(srcH, Math.max(20, baseCropH / effectiveZoom));

    // Centering and pan offset
    const defaultYRatio = withNameDate ? 0.43 : 0.48;
    const maxPanOffsetX = (srcW - cropW) / 2;
    const maxPanOffsetY = (srcH - cropH) / 2;

    const centerX = srcW / 2 + (panX / 100) * maxPanOffsetX;
    const centerY = srcH * defaultYRatio + (panY / 100) * maxPanOffsetY;

    // Boundary clamp: sx and sy must stay strictly within [0, src - crop]
    const sx = Math.max(0, Math.min(Math.max(0, srcW - cropW), centerX - cropW / 2));
    const sy = Math.max(0, Math.min(Math.max(0, srcH - cropH), centerY - cropH / 2));

    const finalCropW = Math.min(cropW, srcW - sx);
    const finalCropH = Math.min(cropH, srcH - sy);

    // 4. Optional rounded corner clip
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

    // 5. Draw image with studio filters
    try {
      targetCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      targetCtx.drawImage(img, sx, sy, finalCropW, finalCropH, 0, 0, w, photoH);
      targetCtx.filter = 'none';
    } catch (err) {
      console.warn('Canvas drawImage fallback:', err);
      targetCtx.fillStyle = '#E2E8F0';
      targetCtx.fillRect(0, 0, w, photoH);
    }

    // 6. Candidate Name & Date of Photo (Govt Exam Standard)
    if (withNameDate) {
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, photoH, w, stripH);

      // Fine separator
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

      // Date of Photo (DOP / DOB)
      targetCtx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      targetCtx.fillText(dopText.trim(), w / 2, photoH + stripH * 0.74);
    }

    // 7. Outer Border
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

  // =========================================================================
  // SYNCHRONOUS CANVAS 1: Single 35×45 mm Preview (413×531 px at 300 DPI)
  // =========================================================================
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !loadedPhotoImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 413;
    canvas.height = 531;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderSinglePhoto(ctx, 413, 531, loadedPhotoImg);
  }, [loadedPhotoImg, renderSinglePhoto]);

  // =========================================================================
  // SYNCHRONOUS CANVAS 2: High-Performance Live Print Sheet
  // (Uses single offscreen cache before tiling to prevent memory spikes)
  // =========================================================================
  useEffect(() => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas || !loadedPhotoImg) return;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

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

    // Render single photo ONCE to an offscreen cache canvas for instant tiling
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = photoW;
    offscreenCanvas.height = photoH;
    const offCtx = offscreenCanvas.getContext('2d');
    if (offCtx) {
      renderSinglePhoto(offCtx, photoW, photoH, loadedPhotoImg);
    }

    // Grid arrangement
    const cols = activeConf.cols;
    const rows = activeConf.rows;
    const maxSlots = cols * rows;
    const copiesToDraw = Math.min(totalCopies, maxSlots);

    // Calculate gap in px at 300 DPI (1 inch = 25.4 mm)
    const gapPx = (cellGap / 25.4) * 300;

    // Helper function to draw a single photo slot and its cutting guides
    const drawPhotoSlot = (x: number, y: number, r: number, c: number) => {
      // Paint photo directly from cached offscreen canvas
      ctx.drawImage(offscreenCanvas, x, y);

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

    // Center single copy or grid
    if (copiesToDraw === 1 || selectedPreset === 'single') {
      const x = Math.round((sheetW - photoW) / 2);
      const y = Math.round((sheetH - photoH) / 2);
      drawPhotoSlot(x, y, 0, 0);
    } else {
      let effectiveCols = Math.min(cols, copiesToDraw);
      let effectiveRows = Math.ceil(copiesToDraw / effectiveCols);

      if (copiesToDraw === 4 && cols >= 2) {
        effectiveCols = 2;
        effectiveRows = 2;
      } else if (copiesToDraw === 6 && cols >= 3) {
        effectiveCols = 3;
        effectiveRows = 2;
      } else if (copiesToDraw === 8 && cols >= 4) {
        effectiveCols = 4;
        effectiveRows = 2;
      }

      const totalGridW = effectiveCols * photoW + (effectiveCols - 1) * gapPx;
      const totalGridH = effectiveRows * photoH + (effectiveRows - 1) * gapPx;

      const startX = Math.round((sheetW - totalGridW) / 2);
      const startY = Math.round((sheetH - totalGridH) / 2);

      let drawn = 0;
      for (let r = 0; r < effectiveRows; r++) {
        for (let c = 0; c < effectiveCols; c++) {
          if (drawn >= copiesToDraw) break;
          const x = Math.round(startX + c * (photoW + gapPx));
          const y = Math.round(startY + r * (photoH + gapPx));
          drawPhotoSlot(x, y, r, c);
          drawn++;
        }
      }
    }
  }, [
    loadedPhotoImg,
    selectedPreset,
    totalCopies,
    cellGap,
    cutGuideStyle,
    cutGuideColor,
    showScissorIcons,
    renderSinglePhoto,
  ]);

  // Actions: Safe Iframe Printing (Avoids popup blockers and iframe sandbox restrictions)
  const handleDirectPrint = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

    const isA4 = SHEET_PRESETS.find((p) => p.id === selectedPreset)?.paper === 'a4';
    const paperSizeCss = isA4 ? 'A4 portrait' : '4in 6in landscape';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.write(`
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
          <img src="${dataUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch (e) {
        // Ignored
      }
    }, 4000);
  };

  // Actions: Download PDF Sheet (using pdf-lib)
  const handleDownloadPdf = async () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;

    try {
      const activeConf = SHEET_PRESETS.find((p) => p.id === selectedPreset) || SHEET_PRESETS[0];
      const isA4 = activeConf.paper === 'a4';

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
    const url = canvas.toDataURL('image/jpeg', 0.88);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_Passport_Single_35x45mm_GovtReady.jpg`;
    link.click();
  };

  const activePaperLabel = SHEET_PRESETS.find((p) => p.id === selectedPreset)?.paper === 'a4' ? 'A4 Paper' : '4×6" Paper';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* Hidden file and camera inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* TOP NAVIGATION & HEADER */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            300 DPI Studio Quality
          </span>
        </div>
      </div>

      {/* Main Studio Title & Upload Control Card */}
      <div className="p-4 sm:p-5 rounded-2xl liquid-glass shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/30 shrink-0">
            <Crop className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Passport Photo Studio
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-[#072642] border border-sky-400/40 text-[#0284c7] dark:text-[#38bdf8] whitespace-nowrap shrink-0 inline-flex items-center">
                STUDIO CROP &amp; PRINT
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Instant 35×45 mm Passport cropping • 4×6 &amp; A4 sheets • 100% private
            </p>
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#0284c7]/30 transition-all cursor-pointer active:scale-95"
            title="Upload any portrait photo from your computer or phone"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-3 py-2 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Take a photo with your device camera"
          >
            <Camera className="w-4 h-4 text-[#0284c7]" />
            <span className="hidden sm:inline">Camera</span>
          </button>
        </div>
      </div>

      {/* SAMPLE PORTRAITS QUICK SWITCHER */}
      <div className="p-3 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Instant Sample Portraits (Test Any Image in 1-Click):</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {isStockModel ? 'Sample Active' : 'Custom Upload Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_PORTRAITS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#0284c7]/15 text-[#0284c7] dark:text-white font-bold shadow-sm'
                    : 'liquid-glass text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white/20'
                }`}
              >
                <div className="w-6 h-7 rounded border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  <img src={sample.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate">{sample.name}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{sample.tag}</div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0284c7] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: CROPPED PHOTO PREVIEW (With Proper 35×45 mm 7:9 Shape)
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Crop className="w-4 h-4 text-[#0284c7]" />
            <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase">
              CROPPED PHOTO PREVIEW
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded liquid-glass-sub text-slate-700 dark:text-slate-300">
              35 × 45 mm (India Standard 7:9)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBiometricGuide(!showBiometricGuide)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                showBiometricGuide
                  ? 'border-[#0284c7] bg-[#0284c7] text-white shadow-sm'
                  : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:border-[#0284c7]/40'
              }`}
              title="Show official passport face measurement guidelines"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Face Guidelines</span>
            </button>
            <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-[#0284c7] text-white">
              STANDARD
            </span>
          </div>
        </div>

        {/* Center Cropped Photo Stage with Drag & Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full py-8 flex flex-col items-center justify-center liquid-glass-sub rounded-2xl border transition-all overflow-hidden ${
            isDragOver
              ? 'border-[#0284c7] bg-[#0284c7]/10 ring-2 ring-[#0284c7]'
              : 'border-slate-200 dark:border-white/10'
          }`}
        >
          {isDragOver && (
            <div className="absolute inset-0 bg-[#072642]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white p-4">
              <Upload className="w-10 h-10 text-sky-400 animate-bounce mb-2" />
              <div className="text-sm font-bold">Drop photo here to apply instantly!</div>
              <div className="text-xs text-sky-200 mt-1">Supports JPG, PNG, WEBP</div>
            </div>
          )}

          {/* Proportional Preview Container: Guaranteed 35×45 mm aspect ratio */}
          <div className="relative group flex flex-col items-center">
            <div
              className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-slate-300 dark:border-sky-500/30 bg-white transition-transform"
              style={{
                width: '210px',
                height: '270px',
                maxWidth: '90vw',
                aspectRatio: '35 / 45',
              }}
            >
              <canvas
                ref={previewCanvasRef}
                width={413}
                height={531}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />

              {/* Biometric Face Guide Lines Overlay */}
              {showBiometricGuide && (
                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 border-2 border-dashed border-sky-400/70">
                  <div className="text-[8px] font-mono font-bold text-sky-600 bg-white/80 px-1 py-0.5 rounded self-center shadow-xs">
                    Crown (Top of Head)
                  </div>
                  <div className="w-full border-t border-sky-400/40 relative">
                    <span className="absolute -top-3 left-1 text-[8px] font-mono text-sky-600 bg-white/80 px-0.5 rounded">Eye Level</span>
                  </div>
                  <div className="w-full border-t border-sky-400/40 relative">
                    <span className="absolute -top-3 left-1 text-[8px] font-mono text-sky-600 bg-white/80 px-0.5 rounded">Chin Level</span>
                  </div>
                  <div className="text-[8px] font-mono font-bold text-sky-600 bg-white/80 px-1 py-0.5 rounded self-center shadow-xs">
                    70-80% Face Coverage Standard
                  </div>
                </div>
              )}
            </div>

            {/* Adjust Crop Floating Pill Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowCropAdjuster(!showCropAdjuster)}
                className="px-4 py-2 rounded-full liquid-glass hover:bg-[#0284c7] hover:text-white border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Crop className="w-3.5 h-3.5 text-[#0284c7] group-hover:text-white" />
                <span>{showCropAdjuster ? 'Close Crop Adjuster' : 'Adjust Crop & Framing'}</span>
              </button>
            </div>
          </div>

          {/* Inline Crop / Pan / Zoom Adjuster Drawer */}
          {showCropAdjuster && (
            <div className="mt-4 w-full max-w-md p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Face Framing &amp; Scale</span>
                </span>
                <button
                  onClick={handleResetCrop}
                  className="text-[11px] text-[#0284c7] hover:underline cursor-pointer"
                >
                  Reset Position
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                  <span>Zoom Scale</span>
                  <span className="font-mono text-[#0284c7] font-bold">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                  <span>Horizontal (Left / Right)</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{panX > 0 ? `+${panX}%` : `${panX}%`}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={panX}
                  onChange={(e) => setPanX(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 mb-1">
                  <span>Vertical (Up / Down)</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">{panY > 0 ? `+${panY}%` : `${panY}%`}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={panY}
                  onChange={(e) => setPanY(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: IMAGE ADJUSTMENTS (Brightness, Contrast, Saturation)
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0284c7]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Studio Adjustments</span>
          </div>
          <button
            onClick={handleResetAdjustments}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#0284c7]" />
            <span>Reset Sliders</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Brightness</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">{brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Contrast</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Color Saturation</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: SHEET LAYOUT PRESETS & COPIES (Matching Screenshot 1 & 2)
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0284c7]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Print Sheet Layout</span>
          </div>
          <span className="text-xs font-semibold text-[#0284c7]">
            {activePaperLabel}
          </span>
        </div>

        {/* 5 Sheet Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {SHEET_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white shadow-md'
                    : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400'
                }`}
              >
                <div className="text-xs font-black">{preset.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{preset.sub}</div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0284c7]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Total Copies Selector */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Total Copies on Sheet
          </label>
          <div className="flex flex-wrap gap-2">
            {COPIES_OPTIONS.map((num) => {
              const isSelected = totalCopies === num;
              return (
                <button
                  key={num}
                  onClick={() => setTotalCopies(num)}
                  className={`w-10 h-9 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0284c7] text-white shadow-lg shadow-[#0284c7]/40 ring-2 ring-[#0284c7]'
                      : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            ADVANCED STUDIO ACCORDION: BORDER, CUTTING & SSC/UPSC NAME/DATE
            ========================================================================= */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/40 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#0284c7]" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Advanced Border, Cut Guides &amp; Candidate Stamp
              </span>
            </div>
            {isAccordionOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isAccordionOpen && (
            <div className="mt-3 p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-4 animate-in fade-in duration-150">
              
              {/* Border Thickness */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Photo Border Thickness
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'thin', 'standard', 'bold'] as BorderThickness[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBorderThickness(t)}
                      className={`p-2 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        borderThickness === t
                          ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white shadow-sm'
                          : 'liquid-glass text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cutting Guide Style */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Cutting Guide Marks &amp; Lines
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScissorIcons}
                      onChange={(e) => setShowScissorIcons(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#0284c7] rounded"
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
                          ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white shadow-sm'
                          : 'liquid-glass text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{g.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{g.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate Stamp for SSC / UPSC */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Candidate Name &amp; Date Stamp</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-400 border border-sky-400/30">
                        SSC / UPSC Standard
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Print candidate name and date of photo (DOP) at the bottom
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={withNameDate}
                    onChange={(e) => setWithNameDate(e.target.checked)}
                    className="w-4 h-4 accent-[#0284c7] rounded cursor-pointer"
                  />
                </div>

                {withNameDate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Candidate Full Name
                      </label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. ANIS SHAIKH"
                        className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#0284c7] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Date of Photo (DOP / DOB)
                      </label>
                      <input
                        type="text"
                        value={dopText}
                        onChange={(e) => setDopText(e.target.value)}
                        placeholder="e.g. DOP: 03/11/2026"
                        className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#0284c7] font-medium"
                      />
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
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#0284c7]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Live Print Sheet</span>
          </div>

          <div className="flex items-center gap-2">
            {cutGuideStyle !== 'none' && (
              <span className="text-[10px] font-mono text-[#0284c7] bg-sky-50 dark:bg-sky-950/70 border border-sky-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Scissors className="w-3 h-3 text-[#0284c7]" />
                {cutGuideStyle === 'crop-marks' ? 'Crop Marks Active' : 'Cut Guides Active'}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
              READY TO PRINT
            </span>
          </div>
        </div>

        {/* Live Print Canvas Sheet Display */}
        <div className="w-full py-4 flex items-center justify-center liquid-glass-sub rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden p-2 sm:p-4">
          <canvas
            ref={sheetCanvasRef}
            className="w-full max-w-2xl rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 bg-white object-contain"
          />
        </div>

        {/* Actions: Print & Download Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Blue Primary Button: Direct Print Sheet */}
          <button
            onClick={handleDirectPrint}
            className="w-full py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0284c7]/30 transition-all cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Direct Print Sheet</span>
          </button>

          {/* Row of 2: Download PDF & Download JPG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadPdf}
              className="py-3 rounded-xl bg-[#072642] hover:bg-[#0d4775] text-white border border-[#38bdf8]/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <FileDown className="w-4 h-4 text-sky-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadSheetJpg}
              className="py-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res JPG Sheet</span>
            </button>
          </div>

          {/* Full-width button: Download Single Photo JPG for Online Forms */}
          <button
            onClick={handleDownloadSingleJpg}
            className="w-full py-2.5 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Download Single Photo JPG (35×45 mm &lt;50 KB for Online Portals)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
