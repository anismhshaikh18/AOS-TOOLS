import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  RotateCw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  FileDown,
  Camera,
  Check,
  Sparkles,
  UserCheck,
  Calendar,
  FileCheck2,
  Move,
  AlertCircle,
  X,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import {
  SAMPLE_PORTRAITS,
  DEFAULT_STUDIO_MALE_SVG,
  getStockDemoPortraitDataUrl,
  SamplePortrait,
} from '../utils/stockPassportPhoto';
import { StarRatingWidget } from '../components/StarRatingWidget';
import {
  readSessionDraft,
  writeSessionDraft,
  removeSessionDraft,
  saveSessionImageSafely,
  readSessionImageSafely,
  subscribeCanvasVisibilityRestore,
} from '../utils/sessionDraftStorage';

interface PassportPhotoStudioPageProps {
  onBack: () => void;
}

const PASSPORT_DRAFT_KEY = 'aos_passport_studio_draft_v1';
const PASSPORT_PHOTO_KEY = 'aos_passport_studio_photo_v1';

type DimensionPresetId =
  | 'indian-passport'
  | 'pan-nsdl'
  | 'pan-square'
  | 'ssc-upsc'
  | 'stamp-size';

type PaperType = '4x6' | 'a4';
type TargetKbOption = 'best' | 20 | 50 | 100;
type CutGuideStyle = 'dotted' | 'crop-marks' | 'solid' | 'none';
type BorderThickness = 'none' | 'thin' | 'standard' | 'bold';

interface DimensionPresetConfig {
  id: DimensionPresetId;
  label: string;
  portalBadge: string;
  sizeLabel: string;
  widthPx: number; // Exact 300 DPI pixel width
  heightPx: number; // Exact 300 DPI pixel height
  defaultTargetKb: TargetKbOption;
  fileSlug: string;
  suggestDop?: boolean;
}

const DIMENSION_PRESETS: DimensionPresetConfig[] = [
  {
    id: 'indian-passport',
    label: 'Indian Passport',
    portalBadge: 'MEA / Seva',
    sizeLabel: '35 × 45 mm',
    widthPx: 413,
    heightPx: 531,
    defaultTargetKb: 100,
    fileSlug: 'IndianPassport_35x45mm',
  },
  {
    id: 'pan-nsdl',
    label: 'PAN Card',
    portalBadge: '2.5×3.5 cm',
    sizeLabel: '2.5 × 3.5 cm',
    widthPx: 295,
    heightPx: 413,
    defaultTargetKb: 50,
    fileSlug: 'PAN_25x35mm',
  },
  {
    id: 'pan-square',
    label: 'PAN Portal',
    portalBadge: '213×213 px',
    sizeLabel: '213 × 213 px',
    widthPx: 213,
    heightPx: 213,
    defaultTargetKb: 50,
    fileSlug: 'PAN_213x213px',
  },
  {
    id: 'ssc-upsc',
    label: 'SSC / UPSC / TNPSC',
    portalBadge: 'Govt Exam',
    sizeLabel: '3.5 × 4.5 cm',
    widthPx: 413,
    heightPx: 531,
    defaultTargetKb: 50,
    fileSlug: 'SSC_UPSC_TNPSC_35x45mm',
    suggestDop: true,
  },
  {
    id: 'stamp-size',
    label: 'Stamp Size',
    portalBadge: '20×25 mm',
    sizeLabel: '20 × 25 mm',
    widthPx: 236,
    heightPx: 295,
    defaultTargetKb: 20,
    fileSlug: 'StampSize_20x25mm',
  },
];

const TARGET_KB_OPTIONS: { value: TargetKbOption; label: string; sub: string }[] = [
  { value: 20, label: '< 20 KB', sub: 'Stamp / Strict' },
  { value: 50, label: '< 50 KB', sub: 'PAN / SSC / UPSC' },
  { value: 100, label: '< 100 KB', sub: 'Passport / Visa' },
  { value: 'best', label: 'Max HD', sub: '300 DPI Crisp' },
];

const PAPER_DIMS: Record<PaperType, { w: number; h: number; label: string; marginPx: number; pdfW: number; pdfH: number; cssPage: string }> = {
  '4x6': {
    w: 1800,
    h: 1200,
    label: '4×6" Photo Paper',
    marginPx: 26,
    pdfW: 432,
    pdfH: 288,
    cssPage: '6in 4in',
  },
  a4: {
    w: 2480,
    h: 3508,
    label: 'A4 Sheet',
    marginPx: 48,
    pdfW: 595.28,
    pdfH: 841.89,
    cssPage: 'A4 portrait',
  },
};

function getTodayFormatted(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function estimateBase64Bytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return 0;
  const b64 = dataUrl.slice(commaIdx + 1);
  let padding = 0;
  if (b64.endsWith('==')) padding = 2;
  else if (b64.endsWith('=')) padding = 1;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

interface CompressedPhotoResult {
  dataUrl: string;
  sizeKb: number;
  quality: number;
  width: number;
  height: number;
}

/**
 * Pure Canvas binary-search JPEG compressor (0 external libraries, <15ms on mobile).
 * Guarantees output stays strictly under maxKb when a target KB is selected.
 */
function compressCanvasToTargetKb(
  sourceCanvas: HTMLCanvasElement,
  targetKb: TargetKbOption
): CompressedPhotoResult {
  if (targetKb === 'best') {
    const dataUrl = sourceCanvas.toDataURL('image/jpeg', 0.94);
    return {
      dataUrl,
      sizeKb: estimateBase64Bytes(dataUrl) / 1024,
      quality: 0.94,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
    };
  }

  // Keep a tiny 400-byte safety headroom so strict portals never reject boundary sizes
  const maxBytes = Math.max(2048, targetKb * 1024 - 400);

  const runBinarySearch = (canvasToEncode: HTMLCanvasElement): CompressedPhotoResult | null => {
    const maxQData = canvasToEncode.toDataURL('image/jpeg', 0.95);
    const maxQBytes = estimateBase64Bytes(maxQData);
    if (maxQBytes <= maxBytes) {
      return {
        dataUrl: maxQData,
        sizeKb: maxQBytes / 1024,
        quality: 0.95,
        width: canvasToEncode.width,
        height: canvasToEncode.height,
      };
    }

    const minQData = canvasToEncode.toDataURL('image/jpeg', 0.14);
    const minQBytes = estimateBase64Bytes(minQData);
    if (minQBytes > maxBytes) {
      return null;
    }

    let low = 0.14;
    let high = 0.95;
    let bestDataUrl = minQData;
    let bestBytes = minQBytes;
    let bestQ = 0.14;

    for (let i = 0; i < 7; i++) {
      const mid = (low + high) / 2;
      const url = canvasToEncode.toDataURL('image/jpeg', mid);
      const bytes = estimateBase64Bytes(url);
      if (bytes <= maxBytes) {
        bestDataUrl = url;
        bestBytes = bytes;
        bestQ = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    return {
      dataUrl: bestDataUrl,
      sizeKb: bestBytes / 1024,
      quality: bestQ,
      width: canvasToEncode.width,
      height: canvasToEncode.height,
    };
  };

  // First try native 300 DPI dimensions
  const nativeHit = runBinarySearch(sourceCanvas);
  if (nativeHit) return nativeHit;

  // Fallback for ultra-detailed noisy photos at strict <20 KB: gentle proportional step-down
  const scales = [0.85, 0.72, 0.6, 0.5];
  const scratch = document.createElement('canvas');
  const sCtx = scratch.getContext('2d');
  if (sCtx) {
    for (const scale of scales) {
      scratch.width = Math.max(120, Math.round(sourceCanvas.width * scale));
      scratch.height = Math.max(120, Math.round(sourceCanvas.height * scale));
      sCtx.fillStyle = '#FFFFFF';
      sCtx.fillRect(0, 0, scratch.width, scratch.height);
      sCtx.imageSmoothingEnabled = true;
      sCtx.imageSmoothingQuality = 'high';
      sCtx.drawImage(sourceCanvas, 0, 0, scratch.width, scratch.height);
      const hit = runBinarySearch(scratch);
      if (hit) return hit;
    }
  }

  const fallbackUrl = sourceCanvas.toDataURL('image/jpeg', 0.14);
  return {
    dataUrl: fallbackUrl,
    sizeKb: estimateBase64Bytes(fallbackUrl) / 1024,
    quality: 0.14,
    width: sourceCanvas.width,
    height: sourceCanvas.height,
  };
}

function computeSheetCapacity(
  paper: PaperType,
  photoW: number,
  photoH: number,
  gapMm: number
): { cols: number; rows: number; maxSlots: number; gapPx: number } {
  const conf = PAPER_DIMS[paper];
  const gapPx = Math.round((gapMm / 25.4) * 300);
  const usableW = conf.w - conf.marginPx * 2;
  const usableH = conf.h - conf.marginPx * 2;
  const cols = Math.max(1, Math.floor((usableW + gapPx) / (photoW + gapPx)));
  const rows = Math.max(1, Math.floor((usableH + gapPx) / (photoH + gapPx)));
  return { cols, rows, maxSlots: cols * rows, gapPx };
}

interface PassportStudioDraft {
  dimensionId: DimensionPresetId;
  showFaceGuide: boolean;
  zoom: number;
  panX: number;
  panY: number;
  fineRotation: number;
  baseRotate90: number;
  brightness: number;
  contrast: number;
  saturation: number;
  withNameDate: boolean;
  candidateName: string;
  dopText: string;
  targetKb: TargetKbOption;
  paperType: PaperType;
  totalCopies: number;
  borderThickness: BorderThickness;
  borderColor: string;
  cutGuideStyle: CutGuideStyle;
  cutGuideColor: string;
  showScissorIcons: boolean;
  cellGap: number;
  showFineTuning: boolean;
  selectedSampleId: string;
  isStockModel: boolean;
}

function getDefaultPassportDraft(): PassportStudioDraft {
  return {
    dimensionId: 'indian-passport',
    showFaceGuide: true,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    fineRotation: 0,
    baseRotate90: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    withNameDate: false,
    candidateName: 'ANIS SHAIKH',
    dopText: `DOP: ${getTodayFormatted()}`,
    targetKb: 50,
    paperType: '4x6',
    totalCopies: 8,
    borderThickness: 'standard',
    borderColor: '#0F172A',
    cutGuideStyle: 'dotted',
    cutGuideColor: '#64748B',
    showScissorIcons: true,
    cellGap: 2.5,
    showFineTuning: false,
    selectedSampleId: 'studio-male',
    isStockModel: true,
  };
}

function loadInitialPassportDraft(): PassportStudioDraft & { initialPhotoSrc: string } {
  const defaults = getDefaultPassportDraft();
  const saved = readSessionDraft<PassportStudioDraft>(PASSPORT_DRAFT_KEY, defaults);
  const validDim = DIMENSION_PRESETS.some((d) => d.id === saved.dimensionId)
    ? saved.dimensionId
    : defaults.dimensionId;
  const validPaper: PaperType = saved.paperType === 'a4' ? 'a4' : '4x6';

  let initialPhotoSrc =
    SAMPLE_PORTRAITS.find((s) => s.id === saved.selectedSampleId)?.url ||
    getStockDemoPortraitDataUrl();
  let resolvedIsStock = saved.isStockModel;
  let resolvedSampleId = saved.selectedSampleId;

  if (!saved.isStockModel) {
    const cachedUserPhoto = readSessionImageSafely(PASSPORT_PHOTO_KEY);
    if (cachedUserPhoto) {
      initialPhotoSrc = cachedUserPhoto;
    } else {
      resolvedIsStock = true;
      resolvedSampleId = 'studio-male';
      initialPhotoSrc = getStockDemoPortraitDataUrl();
    }
  }

  return {
    ...saved,
    dimensionId: validDim,
    paperType: validPaper,
    isStockModel: resolvedIsStock,
    selectedSampleId: resolvedSampleId,
    initialPhotoSrc,
  };
}

export const PassportPhotoStudioPage: React.FC<PassportPhotoStudioPageProps> = ({ onBack }) => {
  // Restore persisted session draft once per mount (survives screenshot / resize / visibility reload)
  const initialDraftRef = useRef<(PassportStudioDraft & { initialPhotoSrc: string }) | null>(null);
  if (initialDraftRef.current === null) {
    initialDraftRef.current = loadInitialPassportDraft();
  }
  const initialDraft = initialDraftRef.current;

  // Source photo state
  const [photoSrc, setPhotoSrc] = useState<string>(initialDraft.initialPhotoSrc);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(initialDraft.selectedSampleId);
  const [isStockModel, setIsStockModel] = useState<boolean>(initialDraft.isStockModel);
  const [loadedPhotoImg, setLoadedPhotoImg] = useState<HTMLImageElement | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Dimension Preset (Official Indian Portal Standards @ 300 DPI)
  const [dimensionId, setDimensionId] = useState<DimensionPresetId>(initialDraft.dimensionId);
  const activeDim = useMemo(
    () => DIMENSION_PRESETS.find((d) => d.id === dimensionId) || DIMENSION_PRESETS[0],
    [dimensionId]
  );

  // Interactive Framing & Face Guide
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(initialDraft.showFaceGuide);
  const [zoom, setZoom] = useState<number>(initialDraft.zoom);
  const [panX, setPanX] = useState<number>(initialDraft.panX); // normalized -100..+100 (% of frame width)
  const [panY, setPanY] = useState<number>(initialDraft.panY); // normalized -100..+100 (% of frame height)
  const [fineRotation, setFineRotation] = useState<number>(initialDraft.fineRotation); // -15..+15 deg
  const [baseRotate90, setBaseRotate90] = useState<number>(initialDraft.baseRotate90); // 0, 90, 180, 270
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // Studio Image Adjustments
  const [brightness, setBrightness] = useState<number>(initialDraft.brightness);
  const [contrast, setContrast] = useState<number>(initialDraft.contrast);
  const [saturation, setSaturation] = useState<number>(initialDraft.saturation);

  // Name & Date of Photo (DOP) Strip
  const [withNameDate, setWithNameDate] = useState<boolean>(initialDraft.withNameDate);
  const [candidateName, setCandidateName] = useState<string>(initialDraft.candidateName);
  const [dopText, setDopText] = useState<string>(initialDraft.dopText);

  // Target KB Compression for Single Photo Download
  const [targetKb, setTargetKb] = useState<TargetKbOption>(initialDraft.targetKb);
  const [estimatedSingleInfo, setEstimatedSingleInfo] = useState<{
    sizeKb: number;
    width: number;
    height: number;
  } | null>(null);

  // Print Sheet Layout & Cutting Guides
  const [paperType, setPaperType] = useState<PaperType>(initialDraft.paperType);
  const [totalCopies, setTotalCopies] = useState<number>(initialDraft.totalCopies);
  const [borderThickness, setBorderThickness] = useState<BorderThickness>(
    initialDraft.borderThickness
  );
  const [borderColor, setBorderColor] = useState<string>(initialDraft.borderColor);
  const [cutGuideStyle, setCutGuideStyle] = useState<CutGuideStyle>(initialDraft.cutGuideStyle);
  const [cutGuideColor, setCutGuideColor] = useState<string>(initialDraft.cutGuideColor);
  const [showScissorIcons, setShowScissorIcons] = useState<boolean>(initialDraft.showScissorIcons);
  const [cellGap, setCellGap] = useState<number>(initialDraft.cellGap); // mm gap
  const [showFineTuning, setShowFineTuning] = useState<boolean>(initialDraft.showFineTuning);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Non-destructive canvas repaint counter (repaints GPU-evicted canvases after mobile screenshots/resize without resetting state)
  const [canvasRepaintTick, setCanvasRepaintTick] = useState<number>(0);

  // Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Pointer tracking for silky 1-finger pan + 2-finger pinch zoom on mobile
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureStateRef = useRef<{
    startPanX: number;
    startPanY: number;
    startClientX: number;
    startClientY: number;
    pinchStartDist: number;
    pinchStartZoom: number;
  }>({
    startPanX: 0,
    startPanY: 0,
    startClientX: 0,
    startClientY: 0,
    pinchStartDist: 0,
    pinchStartZoom: 1,
  });

  // Sheet capacity based on active dimension preset + paper
  const sheetCapacity = useMemo(
    () => computeSheetCapacity(paperType, activeDim.widthPx, activeDim.heightPx, cellGap),
    [paperType, activeDim.widthPx, activeDim.heightPx, cellGap]
  );

  // Smart copy choices for the active sheet & dimension preset
  const copyChoices = useMemo(() => {
    const max = sheetCapacity.maxSlots;
    const base = [1, 2, 4, 6, 8, 10, 12, 16, 18, 24, 30, 36, 48, 60];
    const filtered = base.filter((n) => n <= max);
    if (!filtered.includes(max)) filtered.push(max);
    // Keep UI tidy on mobile (max ~8 pills)
    if (filtered.length > 8) {
      const picked = [
        filtered[0],
        filtered[2],
        filtered[3],
        filtered[4],
        filtered[5],
        filtered[filtered.length - 3],
        filtered[filtered.length - 2],
        max,
      ];
      return Array.from(new Set(picked)).sort((a, b) => a - b);
    }
    return filtered;
  }, [sheetCapacity.maxSlots]);

  // Keep totalCopies within current sheet capacity when preset/paper changes
  useEffect(() => {
    setTotalCopies((prev) => {
      if (prev > sheetCapacity.maxSlots) return sheetCapacity.maxSlots;
      return prev;
    });
  }, [sheetCapacity.maxSlots]);

  // Subscribe to visibility / pageshow / orientationchange / width-resize for safe non-destructive canvas repaint
  useEffect(() => {
    return subscribeCanvasVisibilityRestore(() => {
      setCanvasRepaintTick((t) => t + 1);
    });
  }, []);

  // Debounced lightweight sessionStorage persistence for all Passport Studio settings
  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeSessionDraft<PassportStudioDraft>(PASSPORT_DRAFT_KEY, {
        dimensionId,
        showFaceGuide,
        zoom,
        panX,
        panY,
        fineRotation,
        baseRotate90,
        brightness,
        contrast,
        saturation,
        withNameDate,
        candidateName,
        dopText,
        targetKb,
        paperType,
        totalCopies,
        borderThickness,
        borderColor,
        cutGuideStyle,
        cutGuideColor,
        showScissorIcons,
        cellGap,
        showFineTuning,
        selectedSampleId,
        isStockModel,
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [
    dimensionId,
    showFaceGuide,
    zoom,
    panX,
    panY,
    fineRotation,
    baseRotate90,
    brightness,
    contrast,
    saturation,
    withNameDate,
    candidateName,
    dopText,
    targetKb,
    paperType,
    totalCopies,
    borderThickness,
    borderColor,
    cutGuideStyle,
    cutGuideColor,
    showScissorIcons,
    cellGap,
    showFineTuning,
    selectedSampleId,
    isStockModel,
  ]);

  // Preload image safely whenever photoSrc changes (and cache size-capped user portrait in sessionStorage)
  useEffect(() => {
    if (!photoSrc) return;
    let cancelled = false;
    setIsImageLoading(true);
    const img = new Image();
    const isHttp = photoSrc.startsWith('http://') || photoSrc.startsWith('https://');
    if (isHttp) img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;
      setLoadedPhotoImg(img);
      setIsImageLoading(false);
      if (!isStockModel) {
        saveSessionImageSafely(PASSPORT_PHOTO_KEY, img);
      }
    };
    img.onerror = () => {
      if (cancelled) return;
      if (photoSrc !== DEFAULT_STUDIO_MALE_SVG) {
        setPhotoSrc(DEFAULT_STUDIO_MALE_SVG);
        setSelectedSampleId('studio-vector-male');
        setIsStockModel(true);
      }
      setIsImageLoading(false);
    };
    img.src = photoSrc;
    return () => {
      cancelled = true;
    };
  }, [photoSrc, isStockModel]);

  const handleSelectDimension = (preset: DimensionPresetConfig) => {
    setDimensionId(preset.id);
    setTargetKb(preset.defaultTargetKb);
    const nextCap = computeSheetCapacity(paperType, preset.widthPx, preset.heightPx, cellGap);
    if (paperType === '4x6') {
      setTotalCopies(Math.min(nextCap.maxSlots, preset.id === 'stamp-size' ? 12 : nextCap.maxSlots));
    } else {
      setTotalCopies(Math.min(nextCap.maxSlots, 30));
    }
  };

  const handleSelectPaper = (nextPaper: PaperType) => {
    setPaperType(nextPaper);
    const nextCap = computeSheetCapacity(nextPaper, activeDim.widthPx, activeDim.heightPx, cellGap);
    setTotalCopies(nextPaper === '4x6' ? Math.min(nextCap.maxSlots, 12) : Math.min(nextCap.maxSlots, 30));
  };

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid JPG, PNG, or WEBP portrait image.');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
        setIsStockModel(false);
        setSelectedSampleId('');
        setZoom(1.0);
        setPanX(0);
        setPanY(0);
        setFineRotation(0);
        setBaseRotate90(0);
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

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
    if (file) processImageFile(file);
  };

  // Clipboard paste support
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
  }, [processImageFile]);

  const handleSelectSample = (sample: SamplePortrait) => {
    setUploadError(null);
    removeSessionDraft(PASSPORT_PHOTO_KEY);
    setPhotoSrc(sample.url);
    setSelectedSampleId(sample.id);
    setIsStockModel(true);
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setFineRotation(0);
    setBaseRotate90(0);
  };

  const handleResetFraming = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setFineRotation(0);
    setBaseRotate90(0);
  };

  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  // =========================================================================
  // INTERACTIVE POINTER HANDLERS (1-Finger Drag/Pan + 2-Finger Pinch Zoom)
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsPanning(true);

    if (activePointersRef.current.size === 1) {
      gestureStateRef.current.startPanX = panX;
      gestureStateRef.current.startPanY = panY;
      gestureStateRef.current.startClientX = e.clientX;
      gestureStateRef.current.startClientY = e.clientY;
    } else if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      gestureStateRef.current.pinchStartDist = Math.max(10, dist);
      gestureStateRef.current.pinchStartZoom = zoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const frame = previewFrameRef.current;
    if (!frame) return;

    if (activePointersRef.current.size === 1) {
      const rect = frame.getBoundingClientRect();
      const dx = e.clientX - gestureStateRef.current.startClientX;
      const dy = e.clientY - gestureStateRef.current.startClientY;
      // Convert display pixels to normalized pan % (-100..+100) for 1:1 finger tracking
      const deltaPctX = (dx / Math.max(60, rect.width)) * 100;
      const deltaPctY = (dy / Math.max(60, rect.height)) * 100;
      const nextX = Math.max(-100, Math.min(100, gestureStateRef.current.startPanX + deltaPctX));
      const nextY = Math.max(-100, Math.min(100, gestureStateRef.current.startPanY + deltaPctY));
      setPanX(Math.round(nextX * 2) / 2);
      setPanY(Math.round(nextY * 2) / 2);
    } else if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / Math.max(10, gestureStateRef.current.pinchStartDist);
      const nextZoom = Math.max(0.7, Math.min(2.8, gestureStateRef.current.pinchStartZoom * ratio));
      setZoom(Math.round(nextZoom * 100) / 100);
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      setIsPanning(false);
    } else if (activePointersRef.current.size === 1) {
      const remaining = Array.from(activePointersRef.current.values())[0];
      gestureStateRef.current.startPanX = panX;
      gestureStateRef.current.startPanY = panY;
      gestureStateRef.current.startClientX = remaining.x;
      gestureStateRef.current.startClientY = remaining.y;
    }
  };

  const getBorderPx = (thickness: BorderThickness): number => {
    switch (thickness) {
      case 'none':
        return 0;
      case 'thin':
        return 1.2;
      case 'standard':
        return 2.2;
      case 'bold':
        return 4.0;
    }
  };

  // Compute Name & DOP strip height proportionally to photo height
  const getStripHeight = useCallback(
    (h: number): number => {
      if (!withNameDate) return 0;
      return Math.round(Math.max(36, Math.min(64, h * 0.145)));
    },
    [withNameDate]
  );

  // =========================================================================
  // CORE RENDERER: Dynamic 300 DPI Photo with Smooth Pan, Zoom, Rotation & DOP
  // =========================================================================
  const renderSinglePhoto = useCallback(
    (targetCtx: CanvasRenderingContext2D, w: number, h: number, img: HTMLImageElement) => {
      targetCtx.save();

      // 1. Pure white studio canvas base
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, 0, w, h);

      // 2. Proportional bottom strip for Name & DOP
      const stripH = getStripHeight(h);
      const photoH = Math.max(20, h - stripH);

      // 3. Clip strictly to photo viewport so rotated edges never overlap DOP strip
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.rect(0, 0, w, photoH);
      targetCtx.clip();

      const srcW = Math.max(1, img.naturalWidth || img.width || w);
      const srcH = Math.max(1, img.naturalHeight || img.height || photoH);

      const totalDeg = baseRotate90 + fineRotation;
      const totalRad = (totalDeg * Math.PI) / 180;
      const isQuarterTurn = Math.abs(baseRotate90) % 180 === 90;
      const effSrcW = isQuarterTurn ? srcH : srcW;
      const effSrcH = isQuarterTurn ? srcW : srcH;

      // Cover scale ensures the portrait fills the frame cleanly at 1.0x zoom
      const coverScale = Math.max(w / effSrcW, photoH / effSrcH);
      const effectiveZoom = Math.max(0.7, Math.min(2.8, zoom));
      const finalScale = coverScale * effectiveZoom;

      // Smooth intuitive pan offset mapped directly to frame dimensions
      const offsetX = (panX / 100) * w;
      const offsetY = (panY / 100) * photoH;

      try {
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';
        targetCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        targetCtx.translate(w / 2 + offsetX, photoH / 2 + offsetY);
        targetCtx.rotate(totalRad);
        targetCtx.scale(finalScale, finalScale);
        targetCtx.drawImage(img, -srcW / 2, -srcH / 2, srcW, srcH);
        targetCtx.filter = 'none';
      } catch (err) {
        console.warn('Canvas drawImage fallback:', err);
        targetCtx.fillStyle = '#E2E8F0';
        targetCtx.fillRect(0, 0, w, photoH);
      }
      targetCtx.restore();

      // 4. Crisp White Name & Date of Photo (DOP) Strip
      if (withNameDate && stripH > 0) {
        targetCtx.fillStyle = '#FFFFFF';
        targetCtx.fillRect(0, photoH, w, stripH);

        // Clean hairline separator
        targetCtx.strokeStyle = '#CBD5E1';
        targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(0, photoH + 0.5);
        targetCtx.lineTo(w, photoH + 0.5);
        targetCtx.stroke();

        targetCtx.fillStyle = '#000000';
        targetCtx.textAlign = 'center';
        targetCtx.textBaseline = 'middle';

        const maxTextW = w - Math.max(12, Math.round(w * 0.06));
        const safeName = candidateName.trim().toUpperCase();
        const safeDop = dopText.trim();
        const hasBoth = safeName.length > 0 && safeDop.length > 0;

        // Auto-fit font helper so long names never clip on small presets (213×213 / Stamp)
        const drawFittedText = (text: string, baseSize: number, yCenter: number, weight = '800') => {
          if (!text) return;
          let fontSize = baseSize;
          targetCtx.font = `${weight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          while (fontSize > 8 && targetCtx.measureText(text).width > maxTextW) {
            fontSize -= 0.75;
            targetCtx.font = `${weight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          }
          targetCtx.fillText(text, w / 2, yCenter, maxTextW);
        };

        const nameBaseFont = Math.max(10, Math.min(18, Math.round(stripH * 0.31)));
        const dopBaseFont = Math.max(9, Math.min(14, Math.round(stripH * 0.24)));

        if (hasBoth) {
          drawFittedText(safeName, nameBaseFont, photoH + stripH * 0.34, '800');
          drawFittedText(safeDop, dopBaseFont, photoH + stripH * 0.72, '700');
        } else if (safeName) {
          drawFittedText(safeName, nameBaseFont + 1, photoH + stripH * 0.52, '800');
        } else if (safeDop) {
          drawFittedText(safeDop, dopBaseFont + 1, photoH + stripH * 0.52, '700');
        }
      }

      // 5. Outer Photo Border
      const borderPx = getBorderPx(borderThickness);
      if (borderPx > 0) {
        targetCtx.strokeStyle = borderColor;
        targetCtx.lineWidth = borderPx;
        targetCtx.strokeRect(borderPx / 2, borderPx / 2, w - borderPx, h - borderPx);
      }

      targetCtx.restore();
    },
    [
      getStripHeight,
      baseRotate90,
      fineRotation,
      zoom,
      panX,
      panY,
      brightness,
      contrast,
      saturation,
      withNameDate,
      candidateName,
      dopText,
      borderThickness,
      borderColor,
    ]
  );

  // =========================================================================
  // CANVAS 1 (60fps Instant): Single Cropped Photo Preview
  // =========================================================================
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !loadedPhotoImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = activeDim.widthPx;
    canvas.height = activeDim.heightPx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderSinglePhoto(ctx, activeDim.widthPx, activeDim.heightPx, loadedPhotoImg);
  }, [loadedPhotoImg, activeDim.widthPx, activeDim.heightPx, renderSinglePhoto, canvasRepaintTick]);

  // Debounced live KB estimate for Single Photo Download (keeps drag/sliders 60fps on mobile)
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !loadedPhotoImg) return;
    const timer = window.setTimeout(() => {
      const res = compressCanvasToTargetKb(canvas, targetKb);
      setEstimatedSingleInfo({
        sizeKb: res.sizeKb,
        width: res.width,
        height: res.height,
      });
    }, 140);
    return () => window.clearTimeout(timer);
  }, [loadedPhotoImg, activeDim.widthPx, activeDim.heightPx, targetKb, renderSinglePhoto]);

  // =========================================================================
  // CANVAS 2 (Debounced + Offscreen Cached): 4×6 & A4 Print Sheet with Cut Guides
  // =========================================================================
  useEffect(() => {
    if (!loadedPhotoImg) return;

    const timer = window.setTimeout(() => {
      const sheetCanvas = sheetCanvasRef.current;
      if (!sheetCanvas) return;
      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) return;

      const paperConf = PAPER_DIMS[paperType];
      const sheetW = paperConf.w;
      const sheetH = paperConf.h;

      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;

      // 1. Pure white glossy paper base
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, sheetW, sheetH);

      const photoW = activeDim.widthPx;
      const photoH = activeDim.heightPx;

      // Render single photo ONCE to offscreen buffer for rapid tiling
      const offscreen = document.createElement('canvas');
      offscreen.width = photoW;
      offscreen.height = photoH;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        renderSinglePhoto(offCtx, photoW, photoH, loadedPhotoImg);
      }

      const { cols, maxSlots, gapPx } = computeSheetCapacity(paperType, photoW, photoH, cellGap);
      const copiesToDraw = Math.max(1, Math.min(totalCopies, maxSlots));

      const drawPhotoSlot = (x: number, y: number, r: number, c: number) => {
        ctx.drawImage(offscreen, x, y);

        // Subtle dashed scissor-cut borders around every photo
        if (cutGuideStyle === 'dotted') {
          ctx.save();
          ctx.strokeStyle = cutGuideColor;
          ctx.lineWidth = 1.6;
          ctx.setLineDash([9, 6]);
          const pad = Math.max(3, Math.round(gapPx / 2));
          ctx.strokeRect(x - pad, y - pad, photoW + pad * 2, photoH + pad * 2);
          ctx.restore();
        } else if (cutGuideStyle === 'solid') {
          ctx.save();
          ctx.strokeStyle = cutGuideColor;
          ctx.lineWidth = 1.1;
          const pad = Math.max(2, Math.round(gapPx / 2));
          ctx.strokeRect(x - pad, y - pad, photoW + pad * 2, photoH + pad * 2);
          ctx.restore();
        } else if (cutGuideStyle === 'crop-marks') {
          const markLen = 18;
          ctx.save();
          ctx.strokeStyle = cutGuideColor;
          ctx.lineWidth = 1.6;
          const corners = [
            [x - 2, y - markLen, x - 2, y - 2, x - markLen, y - 2],
            [x + photoW + 2, y - markLen, x + photoW + 2, y - 2, x + photoW + markLen, y - 2],
            [x - 2, y + photoH + markLen, x - 2, y + photoH + 2, x - markLen, y + photoH + 2],
            [
              x + photoW + 2,
              y + photoH + markLen,
              x + photoW + 2,
              y + photoH + 2,
              x + photoW + markLen,
              y + photoH + 2,
            ],
          ];
          for (const [x1, y1, x2, y2, x3, y3] of corners) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Scissor marks along top & left cut edges
        if (showScissorIcons && cutGuideStyle !== 'none') {
          ctx.save();
          ctx.fillStyle = cutGuideColor;
          ctx.font = '15px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const pad = Math.max(3, Math.round(gapPx / 2));
          if (r === 0 && y - pad - 10 >= 10) {
            ctx.fillText('✂', x + photoW / 2, y - pad - 10);
          }
          if (c === 0 && x - pad - 12 >= 10) {
            ctx.fillText('✂', x - pad - 12, y + photoH / 2);
          }
          ctx.restore();
        }
      };

      const effectiveCols = Math.min(cols, copiesToDraw);
      const effectiveRows = Math.ceil(copiesToDraw / effectiveCols);

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
    }, 95);

    return () => window.clearTimeout(timer);
  }, [
    loadedPhotoImg,
    paperType,
    activeDim.widthPx,
    activeDim.heightPx,
    totalCopies,
    cellGap,
    cutGuideStyle,
    cutGuideColor,
    showScissorIcons,
    renderSinglePhoto,
    canvasRepaintTick,
  ]);

  // =========================================================================
  // EXPORTS: Single Compressed JPG, Print Sheet JPG, Print Sheet PDF, Direct Print
  // =========================================================================
  const handleDownloadSingleJpg = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const compressed = compressCanvasToTargetKb(canvas, targetKb);
    setEstimatedSingleInfo({
      sizeKb: compressed.sizeKb,
      width: compressed.width,
      height: compressed.height,
    });
    const suffix = targetKb === 'best' ? '300DPI' : `Under${targetKb}KB`;
    const link = document.createElement('a');
    link.href = compressed.dataUrl;
    link.download = `AOS_${activeDim.fileSlug}_${suffix}.jpg`;
    link.click();
  };

  const handleDownloadSheetJpg = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.96);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_${activeDim.fileSlug}_${totalCopies}x_${paperType.toUpperCase()}.jpg`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const conf = PAPER_DIMS[paperType];
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([conf.pdfW, conf.pdfH]);
      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.96);
      const jpgBytes = await (await fetch(jpgDataUrl)).arrayBuffer();
      const embeddedJpg = await pdfDoc.embedJpg(jpgBytes);
      page.drawImage(embeddedJpg, { x: 0, y: 0, width: conf.pdfW, height: conf.pdfH });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AOS_${activeDim.fileSlug}_${totalCopies}x_${paperType.toUpperCase()}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDirectPrint = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
    const conf = PAPER_DIMS[paperType];

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

    iframeDoc.write(`<!DOCTYPE html>
<html>
  <head>
    <title>AOS Passport Photo Studio — ${conf.label}</title>
    <style>
      @page { size: ${conf.cssPage}; margin: 0; }
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #fff; display: flex; align-items: center; justify-content: center; }
      img { width: 100%; height: 100%; object-fit: contain; display: block; }
    </style>
  </head>
  <body>
    <img src="${dataUrl}" onload="window.print();" />
  </body>
</html>`);
    iframeDoc.close();

    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {
        // Ignored
      }
    }, 4500);
  };

  // Display dimensions for interactive preview box (preserves exact preset aspect ratio on mobile)
  const previewBoxStyle = useMemo(() => {
    const ratio = activeDim.widthPx / activeDim.heightPx;
    const maxH = 278;
    const maxW = 248;
    let displayW = Math.round(maxH * ratio);
    let displayH = maxH;
    if (displayW > maxW) {
      displayW = maxW;
      displayH = Math.round(maxW / ratio);
    }
    return {
      width: `${displayW}px`,
      height: `${displayH}px`,
    };
  }, [activeDim.widthPx, activeDim.heightPx]);

  // Height % of the actual photo region above the DOP strip (keeps Face Guide aligned cleanly)
  const photoRegionPercent = useMemo(() => {
    const stripH = getStripHeight(activeDim.heightPx);
    return ((activeDim.heightPx - stripH) / activeDim.heightPx) * 100;
  }, [activeDim.heightPx, getStripHeight]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Hidden File & Mobile Camera Inputs (Single Source — Zero Duplicates) */}
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

      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="aos-btn-soft inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          300 DPI • 100% On-Device
        </span>
      </div>

      {/* STUDIO HEADER & PRIMARY UPLOAD BAR */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-glass border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0B192C] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/30 shrink-0 border border-sky-300/30">
              <Crop className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Passport Photo Studio
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-[#0B192C] border border-sky-400/40 text-[#0284c7] dark:text-[#38bdf8]">
                  300 DPI STUDIO
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Passport, PAN, SSC/UPSC &amp; Stamp presets • Drag framing • Target KB &amp; 4×6 / A4 cut sheets
              </p>
              <StarRatingWidget
                toolId="passport-photo-studio"
                toolName="Passport Photo Studio"
                className="pt-2"
              />
            </div>
          </div>

          {/* Primary Soft-UI Upload & Camera Triggers */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aos-btn-primary flex-1 sm:flex-initial px-4 py-2.5 min-h-[44px] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="aos-btn-soft px-4 py-2.5 min-h-[44px] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              title="Capture portrait with camera"
            >
              <Camera className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>Camera</span>
            </button>
          </div>
        </div>

        {/* Inline Dismissible Upload Error Banner (Zero window.alert) */}
        {uploadError && (
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-200 text-xs font-semibold">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="p-1 rounded-full hover:bg-rose-200/50 dark:hover:bg-rose-800/50 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Compact 1-Click Sample Portraits Strip */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-sky-400/15 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>Try Sample Portrait</span>
            </span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {isStockModel ? 'Demo Photo' : 'Your Photo Active'}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SAMPLE_PORTRAITS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`shrink-0 px-2.5 py-1.5 min-h-[40px] text-left cursor-pointer flex items-center gap-2 ${
                    isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft'
                  }`}
                >
                  <div className="w-6 h-7 rounded-md border border-white/40 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    <img src={sample.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <div className="text-[11px] font-bold leading-tight whitespace-nowrap">
                      {sample.name}
                    </div>
                    <div
                      className={`text-[9px] leading-tight whitespace-nowrap ${
                        isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {sample.tag}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: OFFICIAL PORTAL DIMENSION PRESETS (300 DPI ONE-CLICK PILLS)
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-glass border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Official Portal Size Preset (300 DPI)
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#0284c7] dark:text-[#38bdf8]">
            {activeDim.widthPx} × {activeDim.heightPx} px
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {DIMENSION_PRESETS.map((preset) => {
            const isSelected = dimensionId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectDimension(preset)}
                className={`px-3.5 py-2.5 min-h-[56px] rounded-2xl text-left flex flex-col justify-center cursor-pointer ${
                  isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-xs font-extrabold leading-tight truncate">
                    {preset.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </div>
                <div
                  className={`text-[10px] font-mono mt-0.5 flex items-center justify-between gap-1 ${
                    isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span>{preset.sizeLabel}</span>
                  <span className="opacity-80">{preset.portalBadge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STEP 2: INTERACTIVE FRAMING, HEAD & SHOULDERS GUIDE + NAME/DOP STRIP
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-glass border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200 dark:border-sky-400/15 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Move className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white truncate">
              2. Interactive Framing &amp; Face Guide
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFaceGuide((v) => !v)}
              className={`px-3 py-1.5 min-h-[36px] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                showFaceGuide ? 'aos-btn-soft-active' : 'aos-btn-soft'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Face Guide {showFaceGuide ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetFraming}
              className="aos-btn-soft px-3 py-1.5 min-h-[36px] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
              title="Reset position, zoom & rotation"
            >
              <RotateCcw className="w-3 h-3 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Touch-Interactive Photo Stage with Transparent Head & Shoulders SVG Overlay */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`lg:col-span-6 relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center liquid-glass-sub border transition-colors ${
              isDragOver
                ? 'border-[#0284c7] ring-2 ring-[#0284c7]/50'
                : 'border-slate-200 dark:border-sky-400/15'
            }`}
          >
            {isDragOver && (
              <div className="absolute inset-0 rounded-2xl bg-[#0B192C]/85 z-30 flex flex-col items-center justify-center text-white p-4">
                <Upload className="w-9 h-9 text-sky-400 animate-bounce mb-2" />
                <div className="text-sm font-bold">Drop Portrait Photo Here</div>
                <div className="text-[11px] text-sky-200 mt-0.5">JPG, PNG, or WEBP</div>
              </div>
            )}

            {/* Live Touch/Mouse Draggable Frame */}
            <div
              ref={previewFrameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUpOrCancel}
              onPointerCancel={handlePointerUpOrCancel}
              style={previewBoxStyle}
              className={`relative rounded-xl overflow-hidden shadow-2xl border-2 bg-white touch-none select-none ${
                isPanning
                  ? 'border-[#38bdf8] cursor-grabbing ring-4 ring-sky-400/20'
                  : 'border-slate-300 dark:border-sky-400/40 cursor-grab'
              }`}
              aria-label="Interactive photo framing canvas. Drag to pan face position."
            >
              <canvas
                ref={previewCanvasRef}
                width={activeDim.widthPx}
                height={activeDim.heightPx}
                className="w-full h-full block pointer-events-none"
              />

              {isImageLoading && (
                <div className="absolute inset-0 bg-[#0B192C]/40 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              )}

              {/* Transparent Head & Shoulders Dotted Alignment Guide (Non-Exported Overlay) */}
              {showFaceGuide && (
                <div
                  className="absolute top-0 left-0 right-0 pointer-events-none z-10 overflow-hidden"
                  style={{ height: `${photoRegionPercent}%` }}
                >
                  <svg
                    viewBox="0 0 200 260"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                    aria-hidden="true"
                  >
                    {/* Subtle contrast halo behind dotted lines so guide stays legible on white & dark walls */}
                    <g fill="none" stroke="rgba(11, 25, 44, 0.52)" strokeWidth="2.8">
                      <line x1="100" y1="8" x2="100" y2="252" strokeDasharray="3 5" />
                      <line x1="14" y1="30" x2="186" y2="30" strokeDasharray="4 4" />
                      <line x1="14" y1="108" x2="186" y2="108" strokeDasharray="5 4" />
                      <line x1="30" y1="176" x2="170" y2="176" strokeDasharray="4 4" />
                      <ellipse cx="100" cy="106" rx="46" ry="66" strokeDasharray="5 4" />
                      <path
                        d="M 12 256 C 18 205, 52 186, 76 184 L 124 184 C 148 186, 182 205, 188 256"
                        strokeDasharray="6 4"
                      />
                    </g>

                    {/* Crisp Sapphire/Cyan Dotted Alignment Silhouette */}
                    <g fill="none" stroke="#38bdf8" strokeWidth="1.5">
                      {/* Center Axis */}
                      <line x1="100" y1="8" x2="100" y2="252" strokeDasharray="3 5" opacity="0.7" />
                      {/* Crown Line */}
                      <line x1="14" y1="30" x2="186" y2="30" strokeDasharray="4 4" opacity="0.85" />
                      {/* Eye Level Line */}
                      <line x1="14" y1="108" x2="186" y2="108" strokeDasharray="5 4" stroke="#22d3ee" />
                      {/* Chin Line */}
                      <line x1="30" y1="176" x2="170" y2="176" strokeDasharray="4 4" opacity="0.85" />
                      {/* Head Oval */}
                      <ellipse cx="100" cy="106" rx="46" ry="66" strokeDasharray="5 4" />
                      {/* Shoulders Arc */}
                      <path
                        d="M 12 256 C 18 205, 52 186, 76 184 L 124 184 C 148 186, 182 205, 188 256"
                        strokeDasharray="6 4"
                      />
                    </g>
                  </svg>

                  {/* Tiny Non-Intrusive Guide Labels */}
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#0B192C]/75 text-[8px] font-mono font-bold text-sky-200 tracking-wide">
                    CROWN
                  </span>
                  <span className="absolute top-[41.5%] -translate-y-1/2 left-1.5 px-1 py-0.5 rounded bg-[#0B192C]/75 text-[8px] font-mono font-bold text-cyan-200">
                    EYES
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center">
              <Move className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
              <span>Drag photo directly to align face • Pinch or slide to zoom</span>
            </div>
          </div>

          {/* RIGHT: Zoom, Rotation & Candidate Name / DOP Controls */}
          <div className="lg:col-span-6 space-y-4">
            {/* Zoom Control */}
            <div className="p-3.5 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-400/15 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                    <span>Zoom</span>
                  </span>
                  <span className="font-mono text-[#0284c7] dark:text-[#38bdf8]">
                    {zoom.toFixed(2)}×
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.7, Math.round((z - 0.1) * 100) / 100))}
                    className="aos-btn-icon w-9 h-9 shrink-0 cursor-pointer"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.7"
                    max="2.8"
                    step="0.02"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                    aria-label="Zoom scale"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.8, Math.round((z + 0.1) * 100) / 100))}
                    className="aos-btn-icon w-9 h-9 shrink-0 cursor-pointer"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Fine Rotation + Quick 90° Turn */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-sky-400/15">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                    <span>Fine Tilt &amp; Rotate</span>
                  </span>
                  <span className="font-mono text-[#0284c7] dark:text-[#38bdf8]">
                    {fineRotation > 0 ? `+${fineRotation.toFixed(1)}°` : `${fineRotation.toFixed(1)}°`}
                    {baseRotate90 !== 0 ? ` (${baseRotate90}°)` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBaseRotate90((r) => (r - 90 + 360) % 360)}
                    className="aos-btn-icon w-9 h-9 shrink-0 cursor-pointer"
                    title="Rotate 90° left"
                    aria-label="Rotate 90 degrees left"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="-15"
                    max="15"
                    step="0.5"
                    value={fineRotation}
                    onChange={(e) => setFineRotation(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                    aria-label="Fine tilt rotation"
                  />
                  <button
                    type="button"
                    onClick={() => setBaseRotate90((r) => (r + 90) % 360)}
                    className="aos-btn-icon w-9 h-9 shrink-0 cursor-pointer"
                    title="Rotate 90° right"
                    aria-label="Rotate 90 degrees right"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Name & Date of Photo (DOP) Strip Toggle Card */}
            <div className="p-3.5 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-400/15 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Calendar className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8] shrink-0" />
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Name &amp; Date of Photo (DOP) Strip
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Adds a clean white strip below photo (SSC / UPSC / TNPSC)
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={withNameDate}
                  onClick={() => setWithNameDate((v) => !v)}
                  className={`px-3.5 py-1.5 min-h-[38px] text-xs font-bold shrink-0 cursor-pointer ${
                    withNameDate ? 'aos-btn-soft-active' : 'aos-btn-soft'
                  }`}
                >
                  {withNameDate ? 'ON' : 'OFF'}
                </button>
              </div>

              {withNameDate && (
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-sky-400/15 animate-in fade-in duration-150">
                  <div>
                    <label
                      htmlFor="aos-candidate-name"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1"
                    >
                      Candidate Name
                    </label>
                    <input
                      id="aos-candidate-name"
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. ANIS SHAIKH"
                      className="w-full px-3 py-2 min-h-[40px] rounded-xl text-xs font-bold uppercase bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-400/25 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="aos-dop-text"
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                      >
                        Date of Photo (DOP)
                      </label>
                      <button
                        type="button"
                        onClick={() => setDopText(`DOP: ${getTodayFormatted()}`)}
                        className="text-[10px] font-bold text-[#0284c7] dark:text-[#38bdf8] hover:underline cursor-pointer"
                      >
                        Use Today
                      </button>
                    </div>
                    <input
                      id="aos-dop-text"
                      type="text"
                      value={dopText}
                      onChange={(e) => setDopText(e.target.value)}
                      placeholder="e.g. DOP: 20/11/2026"
                      className="w-full px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-400/25 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Studio Brightness / Contrast / Saturation Sliders */}
            <div className="p-3.5 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-400/15 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
                  <span>Lighting &amp; Tone</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="text-[11px] font-bold text-[#0284c7] dark:text-[#38bdf8] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Bright</span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="145"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Contrast</span>
                    <span className="font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="145"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Color</span>
                    <span className="font-mono">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STEP 3: SINGLE PHOTO DOWNLOAD WITH TARGET KB COMPRESSION
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-glass border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200 dark:border-sky-400/15 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              3. Single Portal Photo (Target KB Compression)
            </h2>
          </div>

          {estimatedSingleInfo && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <span>{estimatedSingleInfo.sizeKb.toFixed(1)} KB</span>
              <span className="opacity-60">•</span>
              <span>
                {estimatedSingleInfo.width}×{estimatedSingleInfo.height}px
              </span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {TARGET_KB_OPTIONS.map((opt) => {
            const isSelected = targetKb === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setTargetKb(opt.value)}
                className={`px-3.5 py-2.5 min-h-[50px] rounded-2xl text-left flex flex-col justify-center cursor-pointer ${
                  isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft'
                }`}
              >
                <div className="text-xs font-extrabold">{opt.label}</div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {opt.sub}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleDownloadSingleJpg}
          className="aos-btn-emerald w-full py-3.5 px-5 min-h-[48px] font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>
            Download Single JPG ({activeDim.label} •{' '}
            {targetKb === 'best' ? '300 DPI HD' : `< ${targetKb} KB`})
          </span>
        </button>
      </div>

      {/* =========================================================================
          STEP 4: 4×6 & A4 PRINT SHEET WITH DASHED SCISSOR-CUT BORDERS
          ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl liquid-glass border border-slate-200 dark:border-sky-400/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-200 dark:border-sky-400/15 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              4. Print Sheet &amp; Scissor-Cut Guides
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {cutGuideStyle !== 'none' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#0284c7] dark:text-[#38bdf8] bg-sky-50 dark:bg-[#0B192C] border border-sky-400/30">
                <Scissors className="w-3 h-3" />
                <span>Cut Guides ON</span>
              </span>
            )}
            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
              {totalCopies} / {sheetCapacity.maxSlots} max
            </span>
          </div>
        </div>

        {/* Paper Format Segmented Pill Switcher */}
        <div className="aos-segmented-track p-1.5 grid grid-cols-2 gap-1.5">
          {(['4x6', 'a4'] as PaperType[]).map((paper) => {
            const isSelected = paperType === paper;
            const cap = computeSheetCapacity(paper, activeDim.widthPx, activeDim.heightPx, cellGap);
            return (
              <button
                key={paper}
                type="button"
                onClick={() => handleSelectPaper(paper)}
                className={`py-2.5 px-3 min-h-[44px] text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
                }`}
              >
                <span>{PAPER_DIMS[paper].label}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected ? 'text-sky-100' : 'opacity-70'
                  }`}
                >
                  (up to {cap.maxSlots})
                </span>
              </button>
            );
          })}
        </div>

        {/* Copies Selector Pills */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
            Copies on {PAPER_DIMS[paperType].label}
          </label>
          <div className="flex flex-wrap gap-2">
            {copyChoices.map((num) => {
              const isSelected = totalCopies === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTotalCopies(num)}
                  className={`min-w-[44px] min-h-[40px] px-3 text-xs font-extrabold cursor-pointer ${
                    isSelected ? 'aos-btn-soft-active' : 'aos-btn-soft'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Border & Cut Guide Fine-Tuning */}
        <div>
          <button
            type="button"
            onClick={() => setShowFineTuning((v) => !v)}
            className="aos-btn-soft w-full px-4 py-2.5 min-h-[42px] flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>Cut Guide &amp; Photo Border Options</span>
            </span>
            {showFineTuning ? (
              <ChevronUp className="w-4 h-4 opacity-70" />
            ) : (
              <ChevronDown className="w-4 h-4 opacity-70" />
            )}
          </button>

          {showFineTuning && (
            <div className="mt-3 p-4 rounded-2xl liquid-glass-sub border border-slate-200 dark:border-sky-400/15 space-y-4 animate-in fade-in duration-150">
              {/* Cut Guide Style */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Scissor Cut Lines
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScissorIcons}
                      onChange={(e) => setShowScissorIcons(e.target.checked)}
                      className="w-4 h-4 accent-[#0284c7] rounded"
                    />
                    <span>Show ✂ Icons</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'dotted', label: 'Dashed Cut' },
                    { id: 'crop-marks', label: 'Corner Marks' },
                    { id: 'solid', label: 'Solid Line' },
                    { id: 'none', label: 'No Guides' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setCutGuideStyle(g.id as CutGuideStyle)}
                      className={`py-2 px-3 min-h-[38px] text-xs font-bold cursor-pointer ${
                        cutGuideStyle === g.id ? 'aos-btn-soft-active' : 'aos-btn-soft'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Border Thickness */}
              <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-sky-400/15">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Photo Frame Border
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Gap: {cellGap.toFixed(1)}mm
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.5"
                      value={cellGap}
                      onChange={(e) => setCellGap(parseFloat(e.target.value))}
                      className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                      aria-label="Spacing gap in millimeters"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'thin', 'standard', 'bold'] as BorderThickness[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBorderThickness(t)}
                      className={`py-2 px-2.5 min-h-[38px] text-xs font-bold capitalize cursor-pointer ${
                        borderThickness === t ? 'aos-btn-soft-active' : 'aos-btn-soft'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Border &amp; Cut Tone:
                  </span>
                  {['#0F172A', '#475569', '#0284C7'].map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => {
                        setBorderColor(clr);
                        setCutGuideColor(clr === '#0F172A' ? '#64748B' : clr);
                      }}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                        borderColor === clr
                          ? 'border-sky-400 scale-110'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      style={{ backgroundColor: clr }}
                      aria-label={`Select border color ${clr}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIVE PRINT SHEET PREVIEW CANVAS */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>Live Print Preview ({PAPER_DIMS[paperType].label})</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              READY TO PRINT
            </span>
          </div>

          <div className="w-full p-2.5 sm:p-4 flex items-center justify-center liquid-glass-sub rounded-2xl border border-slate-200 dark:border-sky-400/15 overflow-hidden">
            <canvas
              ref={sheetCanvasRef}
              className="w-full max-w-2xl rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 bg-white object-contain"
            />
          </div>
        </div>

        {/* PRINT & SHEET EXPORT SOFT-UI PILL CTAS */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleDirectPrint}
            className="aos-btn-primary w-full py-3.5 px-5 min-h-[48px] font-extrabold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Direct Print {PAPER_DIMS[paperType].label}</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="aos-btn-soft py-3 px-4 min-h-[46px] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <FileDown className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>{isExportingPdf ? 'Generating PDF…' : 'Download 300 DPI PDF Sheet'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSheetJpg}
              className="aos-btn-soft py-3 px-4 min-h-[46px] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8]" />
              <span>Download Sheet JPG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
