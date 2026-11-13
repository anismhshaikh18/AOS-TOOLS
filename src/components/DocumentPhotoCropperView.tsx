import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Download,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export type AspectRatioPreset = 'free' | 'passport' | 'cr80' | '1:1' | '4:3' | '16:9' | 'signature' | 'a4';

interface PresetConfig {
  id: AspectRatioPreset;
  label: string;
  sub: string;
  ratio: number | null; // width / height
}

const PRESETS: PresetConfig[] = [
  { id: 'passport', label: 'Passport (35×45 mm)', sub: '7:9 Biometric', ratio: 35 / 45 },
  { id: 'cr80', label: 'PAN / CR80 (85.6×54)', sub: 'ID Card Format', ratio: 85.6 / 54 },
  { id: 'signature', label: 'Signature Strip', sub: '3:1 Recruitment', ratio: 3 / 1 },
  { id: '1:1', label: 'Square (1:1)', sub: 'CSC / Profile', ratio: 1 / 1 },
  { id: '4:3', label: 'Photo (4:3)', sub: 'Standard Frame', ratio: 4 / 3 },
  { id: '16:9', label: 'Wide (16:9)', sub: 'Landscape Banner', ratio: 16 / 9 },
  { id: 'a4', label: 'A4 Document', sub: '1:1.414 Sheet', ratio: 1 / 1.414 },
  { id: 'free', label: 'Freeform', sub: 'Manual Width/Height', ratio: null },
];

interface DocumentPhotoCropperViewProps {
  file: File | null;
  onSuccess?: (result: { downloadUrl: string; fileName: string; newSize: number; customMessage: string }) => void;
}

export const DocumentPhotoCropperView: React.FC<DocumentPhotoCropperViewProps> = ({ file, onSuccess }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Crop configuration state
  const [activePreset, setActivePreset] = useState<AspectRatioPreset>('passport');
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // in degrees: 0, 90, 180, 270
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');

  // Interactive dragging on canvas
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initPanX: number; initPanY: number }>({ x: 0, y: 0, initPanX: 0, initPanY: 0 });

  // Output stats
  const [cropDimensions, setCropDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // 1. Load File (handles both images and PDF documents)
  useEffect(() => {
    if (!file) {
      setLoadedImage(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);
    setDownloadSuccess(false);

    const load = async () => {
      try {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          const buffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
          const pdfDoc = await loadingTask.promise;
          const page = await pdfDoc.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 }); // 300 DPI high resolution
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = viewport.width;
          offscreenCanvas.height = viewport.height;
          const ctx = offscreenCanvas.getContext('2d');
          if (!ctx) throw new Error('Canvas initialization failed');

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;

          const dataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.95);
          const img = new Image();
          img.onload = () => {
            if (isMounted) {
              setLoadedImage(img);
              setIsLoading(false);
              setPanX(0);
              setPanY(0);
              setZoom(1.0);
              setRotation(0);
            }
          };
          img.onerror = () => {
            if (isMounted) {
              setErrorMsg('Failed to render PDF page. Please ensure PDF is not password encrypted.');
              setIsLoading(false);
            }
          };
          img.src = dataUrl;
        } else {
          // Standard Image
          const objectUrl = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            if (isMounted) {
              setLoadedImage(img);
              setIsLoading(false);
              setPanX(0);
              setPanY(0);
              setZoom(1.0);
              setRotation(0);
            }
          };
          img.onerror = () => {
            if (isMounted) {
              setErrorMsg('Failed to load image. Please provide a valid JPG, PNG, or WEBP file.');
              setIsLoading(false);
            }
          };
          img.src = objectUrl;
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Error processing file');
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // 2. Compute Target Aspect Ratio
  const currentRatio = PRESETS.find((p) => p.id === activePreset)?.ratio || (loadedImage ? loadedImage.naturalWidth / loadedImage.naturalHeight : 1);

  // 3. Render Interactive Preview onto Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed preview viewport dimensions
    const viewW = 600;
    const viewH = 450;
    canvas.width = viewW;
    canvas.height = viewH;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, viewW, viewH);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < viewW; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewH);
      ctx.stroke();
    }
    for (let y = 0; y < viewH; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(viewW, y);
      ctx.stroke();
    }

    // Determine Crop Box viewport placement (centered with margin)
    const margin = 30;
    const availW = viewW - margin * 2;
    const availH = viewH - margin * 2;

    let cropBoxW = availW;
    let cropBoxH = availW / currentRatio;

    if (cropBoxH > availH) {
      cropBoxH = availH;
      cropBoxW = availH * currentRatio;
    }

    const cropBoxX = Math.round((viewW - cropBoxW) / 2);
    const cropBoxY = Math.round((viewH - cropBoxH) / 2);

    // Save context for image drawing
    ctx.save();

    // Draw the image with Zoom, Pan, and Rotation centered within crop box
    const centerX = cropBoxX + cropBoxW / 2 + panX;
    const centerY = cropBoxY + cropBoxH / 2 + panY;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale image to fill cropBox
    const imgW = loadedImage.naturalWidth;
    const imgH = loadedImage.naturalHeight;
    const isPerpendicular = rotation === 90 || rotation === 270;
    const effImgW = isPerpendicular ? imgH : imgW;
    const effImgH = isPerpendicular ? imgW : imgH;

    const baseScale = Math.max(cropBoxW / effImgW, cropBoxH / effImgH);
    const drawW = imgW * baseScale * zoom;
    const drawH = imgH * baseScale * zoom;

    ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Dark Mask outside Crop Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    // Top
    ctx.fillRect(0, 0, viewW, cropBoxY);
    // Bottom
    ctx.fillRect(0, cropBoxY + cropBoxH, viewW, viewH - (cropBoxY + cropBoxH));
    // Left
    ctx.fillRect(0, cropBoxY, cropBoxX, cropBoxH);
    // Right
    ctx.fillRect(cropBoxX + cropBoxW, cropBoxY, viewW - (cropBoxX + cropBoxW), cropBoxH);

    // Crop Box Border & Rule of Thirds Guidelines
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cropBoxX, cropBoxY, cropBoxW, cropBoxH);

    // Rule of Thirds grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical third lines
    ctx.beginPath();
    ctx.moveTo(cropBoxX + cropBoxW / 3, cropBoxY);
    ctx.lineTo(cropBoxX + cropBoxW / 3, cropBoxY + cropBoxH);
    ctx.moveTo(cropBoxX + (cropBoxW * 2) / 3, cropBoxY);
    ctx.lineTo(cropBoxX + (cropBoxW * 2) / 3, cropBoxY + cropBoxH);
    // Horizontal third lines
    ctx.moveTo(cropBoxX, cropBoxY + cropBoxH / 3);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cropBoxH / 3);
    ctx.moveTo(cropBoxX, cropBoxY + (cropBoxH * 2) / 3);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + (cropBoxH * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner Accents
    const cornerSize = 16;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(cropBoxX, cropBoxY + cornerSize);
    ctx.lineTo(cropBoxX, cropBoxY);
    ctx.lineTo(cropBoxX + cornerSize, cropBoxY);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(cropBoxX + cropBoxW - cornerSize, cropBoxY);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(cropBoxX, cropBoxY + cropBoxH - cornerSize);
    ctx.lineTo(cropBoxX, cropBoxY + cropBoxH);
    ctx.lineTo(cropBoxX + cornerSize, cropBoxY + cropBoxH);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(cropBoxX + cropBoxW - cornerSize, cropBoxY + cropBoxH);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cropBoxH);
    ctx.lineTo(cropBoxX + cropBoxW, cropBoxY + cropBoxH - cornerSize);
    ctx.stroke();

    // Calculate actual pixel dimensions that will be exported
    const estExportW = Math.round(cropBoxW * (imgW / drawW));
    const estExportH = Math.round(cropBoxH * (imgH / drawH));
    setCropDimensions({ w: Math.max(1, estExportW), h: Math.max(1, estExportH) });
  }, [loadedImage, currentRatio, zoom, panX, panY, rotation]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Mouse & Touch Dragging for Panning
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
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.initPanX + dx);
    setPanY(dragStartRef.current.initPanY + dy);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // High-Resolution Export
  const handleExecuteCrop = async () => {
    if (!loadedImage) return;

    try {
      // Create high-res export canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewW = 600;
      const viewH = 450;
      const margin = 30;
      const availW = viewW - margin * 2;
      const availH = viewH - margin * 2;

      let cropBoxW = availW;
      let cropBoxH = availW / currentRatio;
      if (cropBoxH > availH) {
        cropBoxH = availH;
        cropBoxW = availH * currentRatio;
      }
      const cropBoxX = Math.round((viewW - cropBoxW) / 2);
      const cropBoxY = Math.round((viewH - cropBoxH) / 2);

      const imgW = loadedImage.naturalWidth;
      const imgH = loadedImage.naturalHeight;
      const isPerpendicular = rotation === 90 || rotation === 270;
      const effImgW = isPerpendicular ? imgH : imgW;
      const effImgH = isPerpendicular ? imgW : imgH;

      const baseScale = Math.max(cropBoxW / effImgW, cropBoxH / effImgH);
      const drawW = imgW * baseScale * zoom;
      const drawH = imgH * baseScale * zoom;

      // Desired export resolution (at least 1200px or full source resolution)
      const exportScale = Math.max(1, 1200 / cropBoxW);
      const outW = Math.round(cropBoxW * exportScale);
      const outH = Math.round(cropBoxH * exportScale);

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = outW;
      exportCanvas.height = outH;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Export canvas context error');

      // Crisp background
      ctx.fillStyle = outputFormat === 'image/jpeg' ? '#FFFFFF' : 'transparent';
      ctx.fillRect(0, 0, outW, outH);

      ctx.save();
      const exportCenterX = (outW / 2) + panX * exportScale;
      const exportCenterY = (outH / 2) + panY * exportScale;

      ctx.translate(exportCenterX, exportCenterY);
      ctx.rotate((rotation * Math.PI) / 180);

      const finalDrawW = drawW * exportScale;
      const finalDrawH = drawH * exportScale;

      ctx.drawImage(loadedImage, -finalDrawW / 2, -finalDrawH / 2, finalDrawW, finalDrawH);
      ctx.restore();

      const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
      const origName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
      const outFileName = `AOS_${origName}_cropped_${activePreset}.${ext}`;

      const dataUrl = exportCanvas.toDataURL(outputFormat, 0.95);
      const blob = await (await fetch(dataUrl)).blob();

      // Download directly
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = outFileName;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);

      onSuccess?.({
        downloadUrl: dataUrl,
        fileName: outFileName,
        newSize: blob.size,
        customMessage: `Successfully cropped document/photo with ${activePreset.toUpperCase()} preset (${outW}×${outH} px).`,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Crop export failed');
    }
  };

  return (
    <div className="space-y-4 pt-2" ref={containerRef}>
      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span>Rendering high-resolution document / photo pages...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Preset Buttons Grid */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>Aspect Ratio &amp; Document Preset:</span>
          <span className="text-[11px] font-mono text-[#0284c7] dark:text-sky-400">
            {cropDimensions.w} × {cropDimensions.h} px
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePreset(p.id);
                  setPanX(0);
                  setPanY(0);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0284c7]/40'
                }`}
              >
                <div className="text-xs font-bold leading-tight truncate">{p.label}</div>
                <div className={`text-[10px] leading-tight truncate ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {p.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Crop Preview Canvas */}
      {loadedImage && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-sky-900/60 shadow-lg bg-slate-900 flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full max-w-[600px] h-auto cursor-grab active:cursor-grabbing touch-none select-none"
              title="Drag image to position inside crop box"
            />
            {/* Overlay hint */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/80 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-md pointer-events-none">
              <span>🖱️ Drag to pan • Pinch / Slider to zoom</span>
              <span>{outputFormat === 'image/jpeg' ? 'JPG (95% HD)' : 'PNG (Lossless)'}</span>
            </div>
          </div>

          {/* Quick Adjustment Sliders & Toolbar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="range"
                min="0.6"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#0284c7] cursor-pointer"
                title="Zoom level"
              />
              <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 w-10 text-right">
                {zoom.toFixed(1)}×
              </span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw className="w-3 h-3 text-[#0284c7]" />
                <span>Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPanX(0);
                  setPanY(0);
                  setZoom(1.0);
                  setRotation(0);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="Reset crop frame to center"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Reset</span>
              </button>

              {/* Format Toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/jpeg')}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                    outputFormat === 'image/jpeg' ? 'bg-[#0284c7] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  JPG
                </button>
                <button
                  type="button"
                  onClick={() => setOutputFormat('image/png')}
                  className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                    outputFormat === 'image/png' ? 'bg-[#0284c7] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PNG
                </button>
              </div>
            </div>
          </div>

          {/* Action Button: Crop & Instant Download */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleExecuteCrop}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-98"
            >
              <Crop className="w-4 h-4" />
              <span>Crop &amp; Download Document/Photo</span>
            </button>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Document cropped and downloaded successfully!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
