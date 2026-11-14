import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Circle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  RefreshCw,
  Download,
  CheckCircle2,
  Sparkles,
  Square,
  Hexagon,
  Palette,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { DEFAULT_STUDIO_MALE_SVG } from '../utils/stockPassportPhoto';

export type AvatarShape = 'circle' | 'squircle' | 'hexagon';
export type RingMode = 'none' | 'solid' | 'gradient';
export type TonePreset = 'natural' | 'crisp' | 'warm' | 'bw';
export type ExportFormat = 'image/png' | 'image/webp' | 'image/jpeg';

interface GradientPreset {
  id: string;
  label: string;
  stops: [string, string];
}

const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'aos-sapphire', label: 'AOS Blue', stops: ['#38bdf8', '#0d4775'] },
  { id: 'sunset-gold', label: 'Gold Glow', stops: ['#fbbf24', '#ea580c'] },
  { id: 'emerald-mint', label: 'Emerald', stops: ['#34d399', '#047857'] },
  { id: 'royal-crimson', label: 'Rose Gold', stops: ['#fb7185', '#9333ea'] },
];

const SOLID_COLOR_SWATCHES = ['#0284c7', '#ffffff', '#f59e0b', '#10b981', '#f43f5e', '#072642'];

interface CircleCropAvatarViewProps {
  file: File | null;
  onSuccess?: (result: {
    downloadUrl: string;
    fileName: string;
    originalSize: number;
    newSize: number;
    customMessage: string;
  }) => void;
}

export const CircleCropAvatarView: React.FC<CircleCropAvatarViewProps> = ({ file, onSuccess }) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isUsingDemo, setIsUsingDemo] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Framing & Transform State
  const [shape, setShape] = useState<AvatarShape>('circle');
  const [zoom, setZoom] = useState<number>(1.1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [baseRotation, setBaseRotation] = useState<number>(0); // 0, 90, 180, 270
  const [tiltDeg, setTiltDeg] = useState<number>(0); // -45 to +45
  const [flipH, setFlipH] = useState<boolean>(false);
  const [innerPaddingPct, setInnerPaddingPct] = useState<number>(0); // 0 to 15%

  // Ring / Border Studio State
  const [ringMode, setRingMode] = useState<RingMode>('solid');
  const [ringWidthPx, setRingWidthPx] = useState<number>(8); // in preview coords (scaled for export)
  const [ringColor, setRingColor] = useState<string>('#0284c7');
  const [gradientId, setGradientId] = useState<string>('aos-sapphire');

  // Background & Studio Depth
  const [bgMode, setBgMode] = useState<'transparent' | 'solid'>('transparent');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [dropShadow, setDropShadow] = useState<boolean>(false);

  // Tone Filter
  const [tonePreset, setTonePreset] = useState<TonePreset>('natural');

  // Output Specs
  const [outputSize, setOutputSize] = useState<number>(1024);
  const [outputFormat, setOutputFormat] = useState<ExportFormat>('image/png');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Pointer Dragging
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initPanX: number; initPanY: number }>({
    x: 0,
    y: 0,
    initPanX: 0,
    initPanY: 0,
  });

  // Load user file when changed
  useEffect(() => {
    if (!file) {
      if (!isUsingDemo) {
        setLoadedImage(null);
      }
      return;
    }

    let isMounted = true;
    setErrorMsg(null);
    setDownloadSuccess(false);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isMounted) {
        setLoadedImage(img);
        setIsUsingDemo(false);
        setZoom(1.05);
        setPanX(0);
        setPanY(0);
        setBaseRotation(0);
        setTiltDeg(0);
        setFlipH(false);
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      if (isMounted) {
        setErrorMsg('Unable to load image. Please select a valid JPG, PNG, or WEBP photo.');
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;

    return () => {
      isMounted = false;
    };
  }, [file]);

  const handleLoadDemo = () => {
    setErrorMsg(null);
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
      setIsUsingDemo(true);
      setZoom(1.1);
      setPanX(0);
      setPanY(0);
      setBaseRotation(0);
      setTiltDeg(0);
      setFlipH(false);
    };
    img.src = DEFAULT_STUDIO_MALE_SVG;
  };

  // Path helper for Circle / Squircle / Hexagon
  const traceAvatarShape = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    targetShape: AvatarShape
  ) => {
    ctx.beginPath();
    if (targetShape === 'circle') {
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    } else if (targetShape === 'squircle') {
      const size = radius * 2;
      const x = cx - radius;
      const y = cy - radius;
      const r = size * 0.28;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + size - r, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + r);
      ctx.lineTo(x + size, y + size - r);
      ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
      ctx.lineTo(x + r, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else if (targetShape === 'hexagon') {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
  };

  const getCssFilterString = (preset: TonePreset): string => {
    switch (preset) {
      case 'crisp':
        return 'contrast(1.12) brightness(1.05) saturate(1.08)';
      case 'warm':
        return 'sepia(0.18) saturate(1.18) brightness(1.03)';
      case 'bw':
        return 'grayscale(1) contrast(1.15)';
      default:
        return 'none';
    }
  };

  // Shared High-Precision Avatar Renderer (used for both Preview and Export)
  const renderAvatarToCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      targetSize: number,
      previewReferenceSize: number,
      drawCheckerboard: boolean
    ) => {
      if (!loadedImage) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = targetSize;
      canvas.height = targetSize;
      ctx.clearRect(0, 0, targetSize, targetSize);

      const scaleFactor = targetSize / previewReferenceSize;
      const cx = targetSize / 2;
      const cy = targetSize / 2;

      // Optional checkerboard background ONLY in preview when transparent is enabled
      if (drawCheckerboard && bgMode === 'transparent' && outputFormat !== 'image/jpeg') {
        const tile = Math.max(12, Math.round(targetSize / 24));
        for (let row = 0; row < targetSize / tile; row++) {
          for (let col = 0; col < targetSize / tile; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#e2e8f0' : '#cbd5e1';
            ctx.fillRect(col * tile, row * tile, tile, tile);
          }
        }
      } else if (outputFormat === 'image/jpeg' || bgMode === 'solid') {
        // Fill full canvas backdrop if JPG or solid bg chosen
        if (bgMode === 'solid' || outputFormat === 'image/jpeg') {
          if (drawCheckerboard) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, targetSize, targetSize);
          } else {
            ctx.fillStyle = bgMode === 'solid' ? bgColor : '#ffffff';
            ctx.fillRect(0, 0, targetSize, targetSize);
          }
        }
      }

      const paddingPx = (targetSize / 2) * (innerPaddingPct / 100);
      const shadowPad = dropShadow ? targetSize * 0.045 : 0;
      const effectiveRingWidth = ringMode !== 'none' ? ringWidthPx * scaleFactor : 0;
      const outerRadius = Math.max(20, targetSize / 2 - paddingPx - shadowPad);
      const photoRadius = Math.max(16, outerRadius - effectiveRingWidth / 2);

      // 1. Optional Studio Drop Shadow
      if (dropShadow) {
        ctx.save();
        ctx.shadowColor = 'rgba(2, 132, 199, 0.35)';
        ctx.shadowBlur = targetSize * 0.05;
        ctx.shadowOffsetY = targetSize * 0.015;
        traceAvatarShape(ctx, cx, cy, outerRadius, shape);
        ctx.fillStyle = bgMode === 'solid' ? bgColor : '#072642';
        ctx.fill();
        ctx.restore();
      }

      // 2. Clipped Inner Avatar Photo
      ctx.save();
      traceAvatarShape(ctx, cx, cy, photoRadius, shape);
      ctx.clip();

      // Solid inner fill behind transparent/zoomed-out images
      if (bgMode === 'solid' || outputFormat === 'image/jpeg') {
        ctx.fillStyle = bgMode === 'solid' ? bgColor : '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);
      }

      const totalRotRad = ((baseRotation + tiltDeg) * Math.PI) / 180;
      const imgW = loadedImage.naturalWidth || 400;
      const imgH = loadedImage.naturalHeight || 400;
      const isPerp = baseRotation === 90 || baseRotation === 270;
      const effW = isPerp ? imgH : imgW;
      const effH = isPerp ? imgW : imgH;

      const diameter = photoRadius * 2;
      const coverScale = Math.max(diameter / effW, diameter / effH);
      const drawW = imgW * coverScale * zoom;
      const drawH = imgH * coverScale * zoom;

      ctx.translate(cx + panX * scaleFactor, cy + panY * scaleFactor);
      ctx.rotate(totalRotRad);
      if (flipH) {
        ctx.scale(-1, 1);
      }

      ctx.filter = getCssFilterString(tonePreset);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // 3. Optional Frame / Ring Stroke
      if (ringMode !== 'none' && effectiveRingWidth > 0) {
        ctx.save();
        traceAvatarShape(ctx, cx, cy, outerRadius - effectiveRingWidth / 2, shape);
        ctx.lineWidth = effectiveRingWidth;
        if (ringMode === 'gradient') {
          const gradPreset = GRADIENT_PRESETS.find((g) => g.id === gradientId) || GRADIENT_PRESETS[0];
          const grad = ctx.createLinearGradient(
            cx - outerRadius,
            cy - outerRadius,
            cx + outerRadius,
            cy + outerRadius
          );
          grad.addColorStop(0, gradPreset.stops[0]);
          grad.addColorStop(1, gradPreset.stops[1]);
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = ringColor;
        }
        ctx.stroke();
        ctx.restore();
      }
    },
    [
      loadedImage,
      shape,
      zoom,
      panX,
      panY,
      baseRotation,
      tiltDeg,
      flipH,
      innerPaddingPct,
      ringMode,
      ringWidthPx,
      ringColor,
      gradientId,
      bgMode,
      bgColor,
      dropShadow,
      tonePreset,
      outputFormat,
    ]
  );

  // Redraw preview canvas whenever settings change
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !loadedImage) return;
    renderAvatarToCanvas(canvas, 400, 400, true);
  }, [loadedImage, renderAvatarToCanvas]);

  // Pointer Drag Handlers (scaled accurately to 400px coordinate space)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initPanX: panX,
      initPanY: panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const cssScale = rect.width > 0 ? 400 / rect.width : 1;
    const dx = (e.clientX - dragStartRef.current.x) * cssScale;
    const dy = (e.clientY - dragStartRef.current.y) * cssScale;
    setPanX(dragStartRef.current.initPanX + dx);
    setPanY(dragStartRef.current.initPanY + dy);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // High-Resolution Avatar Export
  const handleExportAvatar = async () => {
    if (!loadedImage) return;
    try {
      const exportCanvas = document.createElement('canvas');
      renderAvatarToCanvas(exportCanvas, outputSize, 400, false);

      const quality = outputFormat === 'image/png' ? 1.0 : 0.94;
      const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
      const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'aos_avatar';
      const outFileName = `AOS_${baseName}_${shape}_${outputSize}px.${ext}`;

      const blob: Blob = await new Promise((resolve, reject) => {
        exportCanvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to generate avatar image.'))),
          outputFormat,
          quality
        );
      });

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = outFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);

      onSuccess?.({
        downloadUrl,
        fileName: outFileName,
        originalSize: file?.size || blob.size,
        newSize: blob.size,
        customMessage: `Created ${outputSize}×${outputSize} px ${shape} avatar (${ext.toUpperCase()}) with custom studio framing.`,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Avatar export failed');
    }
  };

  const handleResetFraming = () => {
    setZoom(1.1);
    setPanX(0);
    setPanY(0);
    setBaseRotation(0);
    setTiltDeg(0);
    setFlipH(false);
    setInnerPaddingPct(0);
  };

  return (
    <div className="space-y-4 pt-1">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Pre-upload Quick Demo Bar */}
      {!loadedImage && (
        <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-[#072642]/70 border border-sky-200 dark:border-sky-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0284c7]/15 flex items-center justify-center text-[#0284c7] dark:text-sky-300 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white">
                Pro Avatar Studio Ready
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Upload a photo below, or test all Circle Crop, Ring &amp; Transparency tools with a sample portrait.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Portrait</span>
          </button>
        </div>
      )}

      {/* Main Studio Workspace (Activated as soon as image or demo is loaded) */}
      {loadedImage && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Interactive Preview Canvas + Live Badge */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Left / Top: Live Interactive Canvas */}
            <div className="md:col-span-5 flex flex-col items-center space-y-2.5 bg-slate-100 dark:bg-[#03182b]/90 p-3.5 rounded-2xl border border-slate-200 dark:border-sky-500/20">
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-sky-200">
                <span className="flex items-center gap-1.5">
                  <Circle className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Live Studio Preview</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#072642] border border-slate-200 dark:border-sky-500/30 text-[#0284c7] dark:text-sky-300">
                  {outputSize}×{outputSize} px
                </span>
              </div>

              <div className="relative w-full max-w-[270px] aspect-square rounded-2xl overflow-hidden border border-slate-300 dark:border-sky-500/30 shadow-inner bg-slate-200 dark:bg-slate-900">
                <canvas
                  ref={previewCanvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="w-full h-full block cursor-grab active:cursor-grabbing touch-none select-none"
                  title="Drag photo to align face inside the frame"
                />
              </div>

              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 text-center">
                Drag photo to center face · Use sliders to zoom &amp; tilt
              </div>
            </div>

            {/* Right / Bottom: Pro Studio Controls */}
            <div className="md:col-span-7 space-y-3.5">
              {/* 1. Cutout Shape */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#072642]/60 border border-slate-200 dark:border-white/10 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>1. Cutout Shape</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'circle', label: 'Circle', icon: Circle },
                    { id: 'squircle', label: 'Squircle', icon: Square },
                    { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = shape === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setShape(item.id as AvatarShape)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          active
                            ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                            : 'bg-slate-50 dark:bg-[#03182b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#0284c7]/40'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Framing: Zoom, Tilt, Rotate & Flip */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#072642]/60 border border-slate-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-300">
                    2. Framing &amp; Alignment
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBaseRotation((r) => (r + 90) % 360)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-[#03182b] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-[#0284c7]/50 inline-flex items-center gap-1 cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3 h-3 text-[#0284c7]" />
                      <span>90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipH((f) => !f)}
                      className={`px-2 py-1 rounded border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                        flipH
                          ? 'bg-[#0284c7] text-white border-[#0284c7]'
                          : 'bg-slate-100 dark:bg-[#03182b] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200'
                      }`}
                      title="Flip horizontally"
                    >
                      <FlipHorizontal className="w-3 h-3" />
                      <span>Flip</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFraming}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-[#03182b] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      title="Reset alignment"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Zoom Slider */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-[11px] font-semibold text-slate-600 dark:text-slate-300">Zoom</span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                    className="p-1 rounded bg-slate-100 dark:bg-[#03182b] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#0284c7] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.1).toFixed(2))))}
                    className="p-1 rounded bg-slate-100 dark:bg-[#03182b] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-right font-mono text-[11px] text-slate-700 dark:text-sky-300">
                    {zoom.toFixed(1)}×
                  </span>
                </div>

                {/* Straighten Tilt Slider */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-[11px] font-semibold text-slate-600 dark:text-slate-300">Tilt</span>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={tiltDeg}
                    onChange={(e) => setTiltDeg(parseInt(e.target.value, 10))}
                    className="flex-1 accent-[#0284c7] cursor-pointer"
                  />
                  <span className="w-10 text-right font-mono text-[11px] text-slate-700 dark:text-sky-300">
                    {tiltDeg > 0 ? `+${tiltDeg}°` : `${tiltDeg}°`}
                  </span>
                </div>

                {/* Inner Margin / Padding */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-[11px] font-semibold text-slate-600 dark:text-slate-300">Margin</span>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={innerPaddingPct}
                    onChange={(e) => setInnerPaddingPct(parseInt(e.target.value, 10))}
                    className="flex-1 accent-[#0284c7] cursor-pointer"
                  />
                  <span className="w-10 text-right font-mono text-[11px] text-slate-700 dark:text-sky-300">
                    {innerPaddingPct}%
                  </span>
                </div>
              </div>

              {/* 3. Pro Ring & Border Studio */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#072642]/60 border border-slate-200 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>3. Ring &amp; Border Studio</span>
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#03182b] border border-slate-200 dark:border-white/10">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'solid', label: 'Solid' },
                      { id: 'gradient', label: 'Gradient' },
                    ].map((rm) => (
                      <button
                        key={rm.id}
                        type="button"
                        onClick={() => setRingMode(rm.id as RingMode)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                          ringMode === rm.id
                            ? 'bg-[#0284c7] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {rm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {ringMode !== 'none' && (
                  <div className="space-y-2 pt-0.5">
                    {/* Ring Width Slider */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-16 text-[11px] font-semibold text-slate-600 dark:text-slate-300">Thickness</span>
                      <input
                        type="range"
                        min="2"
                        max="24"
                        step="1"
                        value={ringWidthPx}
                        onChange={(e) => setRingWidthPx(parseInt(e.target.value, 10))}
                        className="flex-1 accent-[#0284c7] cursor-pointer"
                      />
                      <span className="w-10 text-right font-mono text-[11px] text-slate-700 dark:text-sky-300">
                        {ringWidthPx}px
                      </span>
                    </div>

                    {ringMode === 'solid' ? (
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {SOLID_COLOR_SWATCHES.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setRingColor(hex)}
                              style={{ backgroundColor: hex }}
                              className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                                ringColor.toLowerCase() === hex.toLowerCase()
                                  ? 'border-[#0284c7] scale-115 ring-2 ring-sky-400/50'
                                  : 'border-slate-300 dark:border-white/30'
                              }`}
                              title={`Ring color ${hex}`}
                            />
                          ))}
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                          <span>Custom:</span>
                          <input
                            type="color"
                            value={ringColor}
                            onChange={(e) => setRingColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {GRADIENT_PRESETS.map((gp) => (
                          <button
                            key={gp.id}
                            type="button"
                            onClick={() => setGradientId(gp.id)}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 cursor-pointer ${
                              gradientId === gp.id
                                ? 'border-[#0284c7] bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300'
                                : 'border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
                              style={{
                                background: `linear-gradient(135deg, ${gp.stops[0]}, ${gp.stops[1]})`,
                              }}
                            />
                            <span className="truncate">{gp.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Backdrop, Tone Filters & High-Res Export Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Backdrop & Studio Tone */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#072642]/60 border border-slate-200 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-300">
                  4. Backdrop &amp; Depth
                </span>
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dropShadow}
                    onChange={(e) => setDropShadow(e.target.checked)}
                    className="accent-[#0284c7] rounded"
                  />
                  <span>Drop Shadow</span>
                </label>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setBgMode('transparent')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    bgMode === 'transparent'
                      ? 'bg-[#0284c7] text-white border-[#0284c7]'
                      : 'bg-slate-50 dark:bg-[#03182b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  Transparent BG
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('solid')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    bgMode === 'solid'
                      ? 'bg-[#0284c7] text-white border-[#0284c7]'
                      : 'bg-slate-50 dark:bg-[#03182b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                  }`}
                >
                  Solid Fill
                </button>
                {bgMode === 'solid' && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-slate-300 dark:border-white/20 p-0 bg-transparent"
                    title="Choose background color"
                  />
                )}
              </div>

              {/* Tone Filter */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Tone:</span>
                {[
                  { id: 'natural', label: 'Natural' },
                  { id: 'crisp', label: 'Studio Crisp' },
                  { id: 'warm', label: 'Warm' },
                  { id: 'bw', label: 'B&W' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTonePreset(t.id as TonePreset)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                      tonePreset === t.id
                        ? 'bg-[#0284c7]/15 text-[#0284c7] dark:text-sky-300 border-[#0284c7]/50'
                        : 'bg-slate-50 dark:bg-[#03182b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Resolution & Format */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#072642]/60 border border-slate-200 dark:border-white/10 space-y-2.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-300">
                5. Export Resolution &amp; Format
              </span>

              <div className="grid grid-cols-4 gap-1.5">
                {[400, 512, 1024, 2048].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setOutputSize(sz)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold font-mono border cursor-pointer ${
                      outputSize === sz
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-slate-50 dark:bg-[#03182b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 'image/png', label: 'PNG (Alpha)' },
                  { val: 'image/webp', label: 'WEBP (Small)' },
                  { val: 'image/jpeg', label: 'JPG (Solid)' },
                ].map((fmt) => (
                  <button
                    key={fmt.val}
                    type="button"
                    onClick={() => setOutputFormat(fmt.val as ExportFormat)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      outputFormat === fmt.val
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-slate-50 dark:bg-[#03182b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Download CTA */}
          <button
            type="button"
            onClick={handleExportAvatar}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-99"
          >
            <Download className="w-4 h-4" />
            <span>
              Download {outputSize}×{outputSize}px {shape.charAt(0).toUpperCase() + shape.slice(1)} Avatar (
              {outputFormat === 'image/png' ? 'Transparent PNG' : outputFormat === 'image/webp' ? 'WEBP' : 'JPG'})
            </span>
          </button>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>High-resolution Circle Avatar exported &amp; downloaded!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
