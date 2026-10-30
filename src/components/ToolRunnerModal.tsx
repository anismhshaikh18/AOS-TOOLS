import React, { useState, useRef, useEffect } from 'react';
import { ToolItem } from '../types';
import { DynamicIcon } from './DynamicIcon';
import {
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Crop,
  Pipette,
  Play,
  RotateCw,
  PenTool,
  Lock,
  Unlock,
  Archive,
  Wrench,
  FileText,
  Table,
  GitCompare,
  Eye,
  Trash2,
  Maximize2,
  Sliders,
  FilePlus,
  Minimize2,
  Layers,
  Scissors,
  FileImage,
  ImageIcon,
  Zap,
  Share2,
  CreditCard,
  Globe,
  Wifi,
  Phone,
  LayoutTemplate,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Palette,
  EyeOff,
  ArrowRightLeft,
  Type,
  Binary,
  Scale,
  Camera,
} from 'lucide-react';
import {
  mergePDFs,
  splitPDF,
  rotatePDF,
  addWatermarkStamp,
  addPageNumbers,
  imagesToPDF,
  organizePDF,
  signPDF,
  cropPDF,
  repairPDF,
  protectPDF,
  unlockPDF,
  convertToPDFA,
  compressPDF,
  extractPDFRawText,
  comparePdfDocuments,
  renderPdfPagesToJpg,
  PDFProcessProgress,
} from '../utils/pdfEngine';
import {
  compressImage,
  convertImageFormat,
  resizeImage,
  cropCircleImage,
  rotateAndFlipImage,
  mergeImages,
  resizePhotoSignatureGovt,
  generatePassportPhotoSheet,
  processPassportStudioPhoto,
  PassportStudioOptions,
  enhanceImageFilters,
  extractColorPalette,
  cropRectImage,
  sampleImagePixelColor,
  loadImage,
} from '../utils/imageEngine';
import { generateBarcodeSvg, generateBarcodePngDataUrl, generateQrCodeDataUrl } from '../utils/barcodeQrEngine';
import { QrPosterTemplateId, QR_POSTER_TEMPLATES, renderQrPosterCanvas } from '../utils/qrPosterEngine';
import JSZip from 'jszip';

const toPdfBlob = (data: Uint8Array): Blob => {
  return new Blob([data.buffer as ArrayBuffer], { type: 'application/pdf' });
};

interface ToolRunnerModalProps {
  tool: ToolItem;
  onClose: () => void;
  onOpenKhataTab?: () => void;
}

export const ToolRunnerModal: React.FC<ToolRunnerModalProps> = ({
  tool,
  onClose,
  onOpenKhataTab,
}) => {
  // File & Process State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl?: string;
    fileName?: string;
    textOutput?: string;
    originalSize?: number;
    newSize?: number;
    customMessage?: string;
  } | null>(null);

  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Tool Specific Controls
  const [compressTargetKb, setCompressTargetKb] = useState<number>(295);
  const [compressMode, setCompressMode] = useState<'300' | '200' | '100' | 'custom'>('300');
  const [pageRangeInput, setPageRangeInput] = useState<string>('1-3');
  const [rotationDegrees, setRotationDegrees] = useState<number>(90);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkColor, setWatermarkColor] = useState<string>('#DC2626');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center' | 'top-right'>('bottom-center');
  const [pageNumberFormat, setPageNumberFormat] = useState<string>('Page {n} of {total}');
  const [organizePageOrder, setOrganizePageOrder] = useState<string>('1, 2, 3');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [sigInkColor, setSigInkColor] = useState<string>('#0F172A');
  const [hasSigned, setHasSigned] = useState<boolean>(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);

  // Image Tool Controls
  const [compressionQuality, setCompressionQuality] = useState<number>(75);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [photoSheetCount, setPhotoSheetCount] = useState<4 | 8 | 16 | 32>(8);
  const [govResizeType, setGovResizeType] = useState<'photo' | 'signature'>('photo');
  const [brightnessVal, setBrightnessVal] = useState<number>(100);
  const [contrastVal, setContrastVal] = useState<number>(100);
  const [saturationVal, setSaturationVal] = useState<number>(100);
  const [sharpnessToggle, setSharpnessToggle] = useState<boolean>(false);
  const [extractedPalette, setExtractedPalette] = useState<{ hex: string; rgb: string; percentage: number }[]>([]);
  const [cropAspectRatio, setCropAspectRatio] = useState<'1:1' | '4:3' | '16:9' | '3:4' | 'free'>('1:1');
  const [cropMargin, setCropMargin] = useState<number>(0);

  // Eyedropper State
  const [eyedropperImgUrl, setEyedropperImgUrl] = useState<string | null>(null);
  const eyedropperCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sampledColor, setSampledColor] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);

  // ZIP Extractor State
  const [zipEntries, setZipEntries] = useState<{ name: string; isDir: boolean; entry: JSZip.JSZipObject }[]>([]);

  // Special Tool Controls - Barcode
  const [barcodeText, setBarcodeText] = useState<string>('AOS102938475');
  const [barcodeFormat, setBarcodeFormat] = useState<'CODE128' | 'EAN13' | 'UPC' | 'CODE39'>('CODE128');
  const [barcodeSvgString, setBarcodeSvgString] = useState<string>('');
  const [barcodePngUrl, setBarcodePngUrl] = useState<string>('');

  // Special Tool Controls - QR Code (Input Types & Designer Templates)
  const [qrInputType, setQrInputType] = useState<'url' | 'social' | 'upi' | 'text'>('url');
  const [qrUrlInput, setQrUrlInput] = useState<string>('https://aostools.local');

  // Social Profile State
  const [qrSocialPlatform, setQrSocialPlatform] = useState<string>('instagram');
  const [qrSocialHandle, setQrSocialHandle] = useState<string>('aostools_official');

  // UPI Payment State
  const [qrUpiVpa, setQrUpiVpa] = useState<string>('merchant@okhdfcbank');
  const [qrUpiName, setQrUpiName] = useState<string>('AOS Digital Store');
  const [qrUpiAmount, setQrUpiAmount] = useState<string>('');
  const [qrUpiNote, setQrUpiNote] = useState<string>('CSC Service Charge');

  // Plain Text / Phone / Wi-Fi State
  const [qrTextSubtype, setQrTextSubtype] = useState<'plain' | 'phone' | 'wifi'>('plain');
  const [qrPlainTextInput, setQrPlainTextInput] = useState<string>('Welcome to AOS Tools - 100% Free & Secure');
  const [qrPhoneInput, setQrPhoneInput] = useState<string>('+919876543210');
  const [qrWifiSsid, setQrWifiSsid] = useState<string>('MyOfficeNetwork');
  const [qrWifiPass, setQrWifiPass] = useState<string>('securepassword123');
  const [qrWifiType, setQrWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // QR Code Generated Appearance State
  const [qrText, setQrText] = useState<string>('https://aostools.local');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrFgColor, setQrFgColor] = useState<string>('#000000');
  const [qrBgColor, setQrBgColor] = useState<string>('#FFFFFF');
  const [qrErrorLevel, setQrErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrMargin, setQrMargin] = useState<number>(2);
  const [qrPreset, setQrPreset] = useState<string>('classic');

  // Designer Poster Template State
  const [qrTemplate, setQrTemplate] = useState<QrPosterTemplateId>('pay');
  const [qrPosterTitle, setQrPosterTitle] = useState<string>('SCAN & PAY HERE');
  const [qrPosterSubtitle, setQrPosterSubtitle] = useState<string>('Accepted via BHIM UPI, GPay, PhonePe, Paytm & Bank Apps');
  const [qrPosterFooter, setQrPosterFooter] = useState<string>('AOS Digital Store & CSC Hub');
  const [qrPosterSubFooter, setQrPosterSubFooter] = useState<string>('UPI ID: merchant@okhdfcbank · Verified Merchant');
  const [isExportingPoster, setIsExportingPoster] = useState<boolean>(false);

  const [pwLength, setPwLength] = useState<number>(16);
  const [pwIncludeUpper, setPwIncludeUpper] = useState<boolean>(true);
  const [pwIncludeNumbers, setPwIncludeNumbers] = useState<boolean>(true);
  const [pwIncludeSymbols, setPwIncludeSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');

  // Age Calculator State
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [ageResult, setAgeResult] = useState<{
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalHours: number;
    nextBirthdayDays: number;
  } | null>(null);

  // HTML Live Sandbox State
  const [htmlCode, setHtmlCode] = useState<string>(
    `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; padding: 2rem; text-align: center; }
    h1 { color: #38bdf8; }
    button { background: #38bdf8; color: #0f172a; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; }
    button:hover { background: #7dd3fc; }
  </style>
</head>
<body>
  <h1>AOS Live HTML Sandbox</h1>
  <p>Edit HTML, CSS, and JS live in your browser.</p>
  <button onclick="alert('Client-side execution verified!')">Click Me</button>
</body>
</html>`
  );
  const [htmlPreviewSrcDoc, setHtmlPreviewSrcDoc] = useState<string>('');

  // PDF Protect / Unlock State
  const [showProtectPass, setShowProtectPass] = useState<boolean>(false);
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [showUnlockPass, setShowUnlockPass] = useState<boolean>(false);

  // Passport Size Photo Studio State
  const [passportAspectRatio, setPassportAspectRatio] = useState<'35x45' | '35x25' | '51x51' | '25x35'>('35x45');
  const [passportBgColor, setPassportBgColor] = useState<string>('#FFFFFF');
  const [passportBrightness, setPassportBrightness] = useState<number>(100);
  const [passportContrast, setPassportContrast] = useState<number>(100);
  const [passportSaturation, setPassportSaturation] = useState<number>(100);
  const [passportWithBorder, setPassportWithBorder] = useState<boolean>(true);
  const [passportSheetType, setPassportSheetType] = useState<'single' | '4x6' | 'a4'>('4x6');
  const [passportPhotosCount, setPassportPhotosCount] = useState<number>(8);

  // Unit & Currency Converter State
  const [convTab, setConvTab] = useState<'currency' | 'units'>('currency');
  const [currencyFrom, setCurrencyFrom] = useState<string>('USD');
  const [currencyTo, setCurrencyTo] = useState<string>('INR');
  const [currencyAmount, setCurrencyAmount] = useState<number>(1);
  const [unitCategory, setUnitCategory] = useState<string>('length');
  const [unitFrom, setUnitFrom] = useState<string>('m');
  const [unitTo, setUnitTo] = useState<string>('ft');
  const [unitAmount, setUnitAmount] = useState<number>(1);

  // Text Case Converter State
  const [textCaseContent, setTextCaseContent] = useState<string>(
    'AOS Tools provides client-side zero-knowledge document processing, PAN services, and modern utilities.'
  );

  // Base64 & URL Encoder/Decoder State
  const [codecMode, setCodecMode] = useState<'b64-enc' | 'b64-dec' | 'url-enc' | 'url-dec'>('b64-enc');
  const [codecInput, setCodecInput] = useState<string>('Welcome to AOS Tools - 100% Free & Secure');
  const [codecOutput, setCodecOutput] = useState<string>('');
  const [codecError, setCodecError] = useState<string | null>(null);

  // Live Codec Transformer
  useEffect(() => {
    if (tool.id !== 'base64-url-codec') return;
    try {
      setCodecError(null);
      if (codecMode === 'b64-enc') {
        setCodecOutput(btoa(unescape(encodeURIComponent(codecInput))));
      } else if (codecMode === 'b64-dec') {
        if (!codecInput.trim()) {
          setCodecOutput('');
        } else {
          setCodecOutput(decodeURIComponent(escape(atob(codecInput.trim()))));
        }
      } else if (codecMode === 'url-enc') {
        setCodecOutput(encodeURIComponent(codecInput));
      } else if (codecMode === 'url-dec') {
        setCodecOutput(decodeURIComponent(codecInput));
      }
    } catch {
      setCodecError('Invalid input syntax for chosen decoding format');
      setCodecOutput('');
    }
  }, [codecMode, codecInput, tool.id]);

  // Initializers for standalone tools
  useEffect(() => {
    if (tool.id === 'barcode-generator') {
      try {
        const svg = generateBarcodeSvg(barcodeText, barcodeFormat);
        setBarcodeSvgString(svg);
        const png = generateBarcodePngDataUrl(barcodeText, barcodeFormat, true, { scale: 2 });
        setBarcodePngUrl(png);
      } catch {
        // ignore
      }
    } else if (tool.id === 'qr-code-generator') {
      const initialText = 'https://aostools.local';
      setQrText(initialText);
      generateQrCodeDataUrl(initialText, {
        width: 480,
        margin: qrMargin,
        colorDark: qrFgColor,
        colorLight: qrBgColor,
        errorCorrectionLevel: qrErrorLevel,
      }).then(setQrDataUrl).catch(() => {});
    } else if (tool.id === 'password-generator') {
      generateLocalPassword();
    } else if (tool.id === 'age-calculator') {
      computeAge(birthDate, targetDate);
    } else if (tool.id === 'html-editor') {
      setHtmlPreviewSrcDoc(htmlCode);
    }
  }, [tool.id]);

  // QR Code Dynamic String Builder for URL, Social, UPI, and Text/WiFi/Phone
  const computeQrString = (
    type: 'url' | 'social' | 'upi' | 'text',
    opts?: {
      url?: string;
      socialPlatform?: string;
      socialHandle?: string;
      upiVpa?: string;
      upiName?: string;
      upiAmount?: string;
      upiNote?: string;
      textSubtype?: 'plain' | 'phone' | 'wifi';
      plainText?: string;
      phone?: string;
      wifiSsid?: string;
      wifiPass?: string;
      wifiType?: 'WPA' | 'WEP' | 'nopass';
    }
  ): string => {
    const url = opts?.url ?? qrUrlInput;
    const platform = opts?.socialPlatform ?? qrSocialPlatform;
    const handle = (opts?.socialHandle ?? qrSocialHandle).trim().replace(/^@/, '');
    const upiVpa = (opts?.upiVpa ?? qrUpiVpa).trim();
    const upiName = (opts?.upiName ?? qrUpiName).trim();
    const upiAmount = (opts?.upiAmount ?? qrUpiAmount).trim();
    const upiNote = (opts?.upiNote ?? qrUpiNote).trim();
    const textSubtype = opts?.textSubtype ?? qrTextSubtype;
    const plainText = opts?.plainText ?? qrPlainTextInput;
    const phone = opts?.phone ?? qrPhoneInput;
    const wifiSsid = opts?.wifiSsid ?? qrWifiSsid;
    const wifiPass = opts?.wifiPass ?? qrWifiPass;
    const wifiType = opts?.wifiType ?? qrWifiType;

    if (type === 'url') {
      return url || 'https://aostools.local';
    } else if (type === 'social') {
      switch (platform) {
        case 'instagram':
          return `https://instagram.com/${handle || 'aostools_official'}`;
        case 'youtube':
          return `https://youtube.com/@${handle || 'aostools'}`;
        case 'x':
          return `https://x.com/${handle || 'aostools'}`;
        case 'whatsapp':
          return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : '919876543210'}`;
        case 'linkedin':
          return `https://linkedin.com/in/${handle || 'aostools'}`;
        case 'github':
          return `https://github.com/${handle || 'aostools'}`;
        case 'telegram':
          return `https://t.me/${handle || 'aostools'}`;
        case 'facebook':
          return `https://facebook.com/${handle || 'aostools'}`;
        default:
          return `https://${platform}.com/${handle}`;
      }
    } else if (type === 'upi') {
      const vpa = upiVpa || 'merchant@upi';
      const name = encodeURIComponent(upiName || 'Merchant');
      let upiStr = `upi://pay?pa=${vpa}&pn=${name}&cu=INR`;
      if (upiAmount && !isNaN(Number(upiAmount)) && Number(upiAmount) > 0) {
        upiStr += `&am=${upiAmount}`;
      }
      if (upiNote) {
        upiStr += `&tn=${encodeURIComponent(upiNote)}`;
      }
      return upiStr;
    } else {
      if (textSubtype === 'phone') {
        return `tel:${phone || '+919876543210'}`;
      } else if (textSubtype === 'wifi') {
        return `WIFI:S:${wifiSsid || 'Network'};T:${wifiType};P:${wifiPass || ''};;`;
      } else {
        return plainText || 'Welcome to AOS Tools';
      }
    }
  };

  const regenerateQr = (
    textVal: string,
    fg = qrFgColor,
    bg = qrBgColor,
    margin = qrMargin,
    level = qrErrorLevel
  ) => {
    setQrText(textVal);
    generateQrCodeDataUrl(textVal, {
      width: 480,
      margin: margin,
      colorDark: fg,
      colorLight: bg,
      errorCorrectionLevel: level,
    })
      .then(setQrDataUrl)
      .catch(() => {});
  };

  const handleSelectPosterTemplate = (tplId: QrPosterTemplateId) => {
    setQrTemplate(tplId);
    const tpl = QR_POSTER_TEMPLATES.find((t) => t.id === tplId);
    if (tpl && tplId !== 'none') {
      setQrPosterTitle(tpl.defaultTitle);
      setQrPosterSubtitle(tpl.defaultSubtitle);
      if (qrInputType === 'upi') {
        setQrPosterFooter(qrUpiName || tpl.defaultFooter);
        setQrPosterSubFooter(`UPI ID: ${qrUpiVpa} · Verified Merchant`);
      } else if (qrInputType === 'social') {
        setQrPosterFooter(`@${qrSocialHandle.replace(/^@/, '')}`);
        setQrPosterSubFooter(tpl.defaultSubFooter || 'Follow · Like · Share');
      } else if (qrInputType === 'url') {
        setQrPosterFooter(qrUrlInput.replace(/^https?:\/\//, '') || tpl.defaultFooter);
        setQrPosterSubFooter(tpl.defaultSubFooter || 'Visit official website');
      } else {
        setQrPosterFooter(tpl.defaultFooter);
        setQrPosterSubFooter(tpl.defaultSubFooter || '');
      }
    }
  };

  const handleExportPoster = async () => {
    try {
      setIsExportingPoster(true);
      const posterDataUrl = await renderQrPosterCanvas({
        qrDataUrl,
        template: qrTemplate,
        headerTitle: qrPosterTitle,
        headerSubtitle: qrPosterSubtitle,
        footerText: qrPosterFooter,
        subFooterText: qrPosterSubFooter,
        qrFgColor,
        qrBgColor,
        amountText: qrInputType === 'upi' && qrUpiAmount ? `AMOUNT: ₹${qrUpiAmount}` : undefined,
      });

      const a = document.createElement('a');
      a.href = posterDataUrl;
      a.download = `AOS_QR_Poster_${qrTemplate.toUpperCase()}_${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to export high-resolution QR poster.');
    } finally {
      setIsExportingPoster(false);
    }
  };

  const generateLocalPassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (pwIncludeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (pwIncludeNumbers) charset += '0123456789';
    if (pwIncludeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const array = new Uint32Array(pwLength);
    window.crypto.getRandomValues(array);
    let pw = '';
    for (let i = 0; i < pwLength; i++) {
      pw += charset[array[i] % charset.length];
    }
    setGeneratedPassword(pw);
  };

  const computeAge = (birth: string, target: string) => {
    const b = new Date(birth);
    const t = new Date(target);
    if (isNaN(b.getTime()) || isNaN(t.getTime()) || b > t) {
      setAgeResult(null);
      return;
    }

    let years = t.getFullYear() - b.getFullYear();
    let months = t.getMonth() - b.getMonth();
    let days = t.getDate() - b.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(t.getFullYear(), t.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = t.getTime() - b.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;

    const nextBday = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    if (nextBday < t) {
      nextBday.setFullYear(t.getFullYear() + 1);
    }
    const nextBdayDays = Math.ceil((nextBday.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));

    setAgeResult({
      years,
      months,
      days,
      totalDays,
      totalHours,
      nextBirthdayDays: nextBdayDays,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setErrorMessage(null);
      setSuccessResult(null);

      // Color extractor auto trigger
      if (tool.id === 'color-extractor' && files[0]) {
        extractColorPalette(files[0], 6).then(setExtractedPalette).catch(() => {});
      }

      // Eyedropper image load
      if (tool.id === 'image-to-color' && files[0]) {
        const url = URL.createObjectURL(files[0]);
        setEyedropperImgUrl(url);
      }

      // ZIP Extractor auto inspect
      if (tool.id === 'zip-extractor' && files[0]) {
        JSZip.loadAsync(files[0]).then((zip) => {
          const list: { name: string; isDir: boolean; entry: JSZip.JSZipObject }[] = [];
          zip.forEach((path, entry) => {
            list.push({ name: path, isDir: entry.dir, entry });
          });
          setZipEntries(list);
        }).catch((err) => {
          setErrorMessage('Failed to read ZIP file: ' + err.message);
        });
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(updated);
    if (updated.length === 0) {
      setSuccessResult(null);
      setExtractedPalette([]);
      setZipEntries([]);
      setEyedropperImgUrl(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Canvas drawing handlers for signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingSig(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = sigInkColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawingSig(false);
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Main Processing Execution Engine
  const executeProcessing = async () => {
    // If tool requires file and none selected, open file picker immediately
    if (tool.acceptedFormats && selectedFiles.length === 0 && tool.id !== 'image-to-color') {
      fileInputRef.current?.click();
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMsg('Initializing client-side engine...');
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      // 1. PDF TOOLS
      if (tool.id === 'merge-pdf') {
        if (selectedFiles.length < 2) {
          throw new Error('Please select at least 2 PDF files to merge.');
        }
        const res = await mergePDFs(selectedFiles, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Successfully merged ${selectedFiles.length} PDF files into a single unified document.`,
        });
      } else if (tool.id === 'split-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file to split.');
        const res = await splitPDF(selectedFiles[0], pageRangeInput, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Extracted ${res.pageCount} page(s) matching range [${pageRangeInput}].`,
        });
      } else if (tool.id === 'compress-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file to compress.');
        const target = compressMode === 'custom' ? compressTargetKb : parseInt(compressMode, 10);
        const res = await compressPDF(selectedFiles[0], target, (p: PDFProcessProgress) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: `Compressed from ${(res.originalSize / 1024).toFixed(1)} KB to ${(res.newSize / 1024).toFixed(1)} KB (${Math.max(0, Math.round(((res.originalSize - res.newSize) / res.originalSize) * 100))}% reduction).`,
        });
      } else if (tool.id === 'rotate-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file to rotate.');
        const res = await rotatePDF(selectedFiles[0], rotationDegrees, 'all', (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Successfully rotated pages clockwise by ${rotationDegrees}°.`,
        });
      } else if (tool.id === 'watermark-stamp') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const res = await addWatermarkStamp(
          selectedFiles[0],
          watermarkText,
          watermarkOpacity,
          44,
          watermarkColor,
          (p) => {
            setProgressMsg(p.step);
            setProgressPercent(p.percent);
          }
        );
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Applied security watermark "${watermarkText}" across all pages.`,
        });
      } else if (tool.id === 'page-numbers') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const res = await addPageNumbers(
          selectedFiles[0],
          pageNumberPosition,
          pageNumberFormat,
          1,
          (p) => {
            setProgressMsg(p.step);
            setProgressPercent(p.percent);
          }
        );
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Added page numbers successfully to ${pageNumberPosition}.`,
        });
      } else if (tool.id === 'jpg-to-pdf') {
        if (selectedFiles.length === 0) throw new Error('Please select at least 1 image.');
        const res = await imagesToPDF(selectedFiles, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Converted ${selectedFiles.length} image(s) into a unified PDF document.`,
        });
      } else if (tool.id === 'organize-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const pageArr = organizePageOrder
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));
        if (pageArr.length === 0) throw new Error('Provide at least one page number in order.');
        const res = await organizePDF(selectedFiles[0], pageArr, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Rearranged pages to order: [${pageArr.join(', ')}].`,
        });
      } else if (tool.id === 'sign-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF to sign.');
        if (!sigCanvasRef.current || !hasSigned) {
          throw new Error('Please draw your signature in the signature box below.');
        }
        const sigUrl = sigCanvasRef.current.toDataURL('image/png');
        const res = await signPDF(selectedFiles[0], sigUrl, 1, 0.65, 0.08, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: 'Digital handwritten signature stamped onto page 1.',
        });
      } else if (tool.id === 'crop-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const res = await cropPDF(selectedFiles[0], 36, (p: PDFProcessProgress) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: 'Trimmed 0.5-inch margins from all document pages.',
        });
      } else if (tool.id === 'protect-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        if (!passwordInput.trim()) throw new Error('Please enter a password to protect the file.');
        const res = await protectPDF(selectedFiles[0], passwordInput, undefined, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: `Document successfully locked with AES-256 encryption. The file is genuinely protected and requires your password to open in any PDF viewer.`,
        });
      } else if (tool.id === 'unlock-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file to unlock.');
        const res = await unlockPDF(selectedFiles[0], unlockPassword, (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: res.statusMessage,
        });
      } else if (tool.id === 'pdf-to-pdfa') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const res = await convertToPDFA(selectedFiles[0], (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: 'Embedded ISO 19005-1 (PDF/A) archival metadata profile.',
        });
      } else if (tool.id === 'repair-pdf') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file to repair.');
        const res = await repairPDF(selectedFiles[0], (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = toPdfBlob(res.data);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: res.fileName,
          newSize: blob.size,
          customMessage: res.statusMessage,
        });
      } else if (tool.id === 'pdf-to-jpg') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const res = await renderPdfPagesToJpg(selectedFiles[0], (p: PDFProcessProgress) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        if (res.singleJpgUrl) {
          const blob = await (await fetch(res.singleJpgUrl)).blob();
          setSuccessResult({
            downloadUrl: res.singleJpgUrl,
            fileName: res.fileName,
            newSize: blob.size,
            customMessage: 'Rendered document page into crisp high-resolution JPG image.',
          });
        } else if (res.zipBlob) {
          setSuccessResult({
            downloadUrl: URL.createObjectURL(res.zipBlob),
            fileName: res.fileName,
            newSize: res.zipBlob.size,
            customMessage: `Rendered all ${res.pageCount} pages into high-resolution JPG images packaged in a ZIP archive.`,
          });
        }
      } else if (tool.id === 'pdf-to-text' || tool.id === 'pdf-to-word' || tool.id === 'pdf-to-excel') {
        if (!selectedFiles[0]) throw new Error('Please select a PDF file.');
        const res = await extractPDFRawText(selectedFiles[0], (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });

        let outputContent = res.text;
        let ext = 'txt';
        let mime = 'text/plain';

        if (tool.id === 'pdf-to-word') {
          outputContent = `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\n\\viewkind4\\uc1\\pard\\lang1033\\f0\\fs20\n${res.text.replace(/\n/g, '\\par\n')}\n}`;
          ext = 'rtf';
          mime = 'application/rtf';
        } else if (tool.id === 'pdf-to-excel') {
          const lines = res.text.split('\n').filter((l) => l.trim().length > 0);
          outputContent = 'Line,Extracted Content\n' + lines.map((l, idx) => `${idx + 1},"${l.replace(/"/g, '""')}"`).join('\n');
          ext = 'csv';
          mime = 'text/csv';
        }

        const blob = new Blob([outputContent], { type: mime });
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: `${selectedFiles[0].name.replace(/\.pdf$/i, '')}_extracted.${ext}`,
          textOutput: outputContent,
          newSize: blob.size,
          customMessage: `Extracted readable text across ${res.pageCount} page(s).`,
        });
      } else if (tool.id === 'compare-pdf') {
        if (selectedFiles.length < 2) {
          throw new Error('Please select 2 PDF files to compare.');
        }
        const res = await comparePdfDocuments(selectedFiles[0], selectedFiles[1], (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        });
        const blob = new Blob([res.reportText], { type: 'text/plain' });
        setSuccessResult({
          downloadUrl: URL.createObjectURL(blob),
          fileName: `AOS_Comparison_${selectedFiles[0].name}_vs_${selectedFiles[1].name}.txt`,
          textOutput: res.reportText,
          newSize: blob.size,
          customMessage: res.diffSummary,
        });
      }

      // 2. IMAGE TOOLS
      else if (tool.id === 'compress-image') {
        if (!selectedFiles[0]) throw new Error('Please select an image file to compress.');
        const res = await compressImage(selectedFiles[0], compressionQuality / 100, 'image/jpeg');
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: `Reduced file size by ${Math.max(0, Math.round(((res.originalSize - res.newSize) / res.originalSize) * 100))}% (from ${(res.originalSize / 1024).toFixed(1)} KB to ${(res.newSize / 1024).toFixed(1)} KB).`,
        });
      } else if (tool.id === 'image-to-jpg' || tool.id === 'image-to-png' || tool.id === 'image-to-webp') {
        if (!selectedFiles[0]) throw new Error('Please select an image file.');
        const fmt = tool.id.replace('image-to-', '') as 'jpg' | 'png' | 'webp';
        const res = await convertImageFormat(selectedFiles[0], fmt);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: `Converted image to standard .${fmt.toUpperCase()} format.`,
        });
      } else if (tool.id === 'crop-image') {
        if (!selectedFiles[0]) throw new Error('Please select an image to crop.');
        const res = await cropRectImage(selectedFiles[0], cropAspectRatio, cropMargin);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: `Cropped image to ${cropAspectRatio} aspect ratio (${res.width}x${res.height} px).`,
        });
      } else if (tool.id === 'crop-circle-image') {
        if (!selectedFiles[0]) throw new Error('Please select an image to crop.');
        const res = await cropCircleImage(selectedFiles[0]);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          newSize: res.newSize,
          customMessage: `Created circular transparent avatar (${res.width}x${res.height} px).`,
        });
      } else if (tool.id === 'resize-image') {
        if (!selectedFiles[0]) throw new Error('Please select an image to resize.');
        const res = await resizeImage(selectedFiles[0], targetWidth, targetHeight);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: `Resized image to ${res.width} x ${res.height} pixels.`,
        });
      } else if (tool.id === 'rotate-image') {
        if (!selectedFiles[0]) throw new Error('Please select an image to rotate.');
        const res = await rotateAndFlipImage(selectedFiles[0], rotationDegrees);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          newSize: res.newSize,
          customMessage: `Rotated image by ${rotationDegrees} degrees.`,
        });
      } else if (tool.id === 'image-merge') {
        if (selectedFiles.length < 2) throw new Error('Please select at least 2 images to merge.');
        const res = await mergeImages(selectedFiles, 'horizontal');
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          newSize: res.newSize,
          customMessage: `Merged ${selectedFiles.length} images into a single horizontal collage.`,
        });
      } else if (tool.id === 'photo-signature-resize') {
        if (!selectedFiles[0]) throw new Error('Please select photo or signature image.');
        const res = await resizePhotoSignatureGovt(selectedFiles[0], govResizeType);
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: `Optimized to official government portal specifications: ${res.width}x${res.height}px, ${(res.newSize / 1024).toFixed(1)} KB (under 50 KB limit).`,
        });
      } else if (tool.id === 'passport-photo-studio' || tool.id === 'passport-photo-sheet') {
        if (!selectedFiles[0]) throw new Error('Please select a photo for the passport studio.');
        const res = await processPassportStudioPhoto(selectedFiles[0], {
          aspectRatio: passportAspectRatio,
          bgColor: passportBgColor,
          brightness: passportBrightness,
          contrast: passportContrast,
          saturation: passportSaturation,
          withBorder: passportWithBorder,
          sheetType: passportSheetType,
          sheetPhotosCount: passportPhotosCount,
        });
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: passportSheetType === 'single'
            ? `Generated single ${passportAspectRatio} passport photo (${res.width}x${res.height} px).`
            : `Generated printable ${passportSheetType.toUpperCase()} studio sheet with ${passportPhotosCount} photos and cut lines.`,
        });
      } else if (tool.id === 'image-quality-enhancer') {
        if (!selectedFiles[0]) throw new Error('Please select an image to enhance.');
        const res = await enhanceImageFilters(
          selectedFiles[0],
          brightnessVal,
          contrastVal,
          saturationVal,
          sharpnessToggle
        );
        setSuccessResult({
          downloadUrl: URL.createObjectURL(res.blob),
          fileName: res.fileName,
          originalSize: res.originalSize,
          newSize: res.newSize,
          customMessage: 'Applied tonal balancing and unsharp clarity filters.',
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during file processing.');
    } finally {
      setIsProcessing(false);
      setProgressPercent(100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <DynamicIcon name={tool.iconName} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {tool.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>100% Client-Side Engine</span>
                <span aria-hidden="true">·</span>
                <span>Zero Server Uploads</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Tool Description Header */}
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <p className="font-medium text-slate-900 dark:text-slate-200">
              {tool.shortDesc}
            </p>
          </div>

          {/* 1. Barcode Generator UI */}
          {tool.id === 'barcode-generator' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Barcode Text or Numeric Value
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={barcodeText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBarcodeText(val);
                      try {
                        const svg = generateBarcodeSvg(val, barcodeFormat);
                        setBarcodeSvgString(svg);
                        const png = generateBarcodePngDataUrl(val, barcodeFormat, true, { scale: 2 });
                        setBarcodePngUrl(png);
                      } catch {}
                    }}
                    placeholder="Enter alphanumeric barcode string"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <select
                    value={barcodeFormat}
                    onChange={(e) => {
                      const fmt = e.target.value as any;
                      setBarcodeFormat(fmt);
                      try {
                        const svg = generateBarcodeSvg(barcodeText, fmt);
                        setBarcodeSvgString(svg);
                        const png = generateBarcodePngDataUrl(barcodeText, fmt, true, { scale: 2 });
                        setBarcodePngUrl(png);
                      } catch {}
                    }}
                    className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="CODE128">Code-128 (Standard Alphanumeric)</option>
                    <option value="EAN13">EAN-13 (12-13 Digits Retail)</option>
                    <option value="UPC">UPC (11-12 Digits Retail)</option>
                    <option value="CODE39">Code-39 (Industrial)</option>
                  </select>
                </div>
              </div>

              {barcodeSvgString && (
                <div className="p-6 bg-slate-100 dark:bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 space-y-4">
                  <div
                    dangerouslySetInnerHTML={{ __html: barcodeSvgString }}
                    className="bg-white p-4 rounded-lg shadow-xs max-w-full overflow-x-auto"
                  />
                  
                  {/* Dual Download Options: SVG and PNG */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([barcodeSvgString], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Barcode_${barcodeText || 'code'}.svg`;
                        a.click();
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download SVG Barcode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const pngUrl = barcodePngUrl || generateBarcodePngDataUrl(barcodeText, barcodeFormat, true, { scale: 3 });
                        const a = document.createElement('a');
                        a.href = pngUrl;
                        a.download = `Barcode_${barcodeText || 'code'}.png`;
                        a.click();
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG Image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. QR Code Generator UI with Designer Poster Templates & Dynamic Input Types */}
          {tool.id === 'qr-code-generator' && (
            <div className="space-y-6">
              
              {/* STEP 1: Dynamic Content Input Type Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Step 1: Select QR Content Type</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    Live Real-Time Encoding
                  </span>
                </div>

                {/* 4 Input Type Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'url', label: 'Website / Link', icon: Globe },
                    { id: 'social', label: 'Social Profile', icon: Share2 },
                    { id: 'upi', label: 'UPI Payment', icon: CreditCard },
                    { id: 'text', label: 'Text / Wi-Fi', icon: Wifi },
                  ].map((tItem) => {
                    const IconComp = tItem.icon;
                    const isActive = qrInputType === tItem.id;
                    return (
                      <button
                        key={tItem.id}
                        type="button"
                        onClick={() => {
                          const newType = tItem.id as any;
                          setQrInputType(newType);
                          const newStr = computeQrString(newType);
                          regenerateQr(newStr);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-[1.02]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{tItem.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Content Input Fields According to Active Tab */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  
                  {/* Option A: Website URL / Custom Link */}
                  {qrInputType === 'url' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Target Website URL or Web Link
                      </label>
                      <input
                        type="url"
                        value={qrUrlInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQrUrlInput(val);
                          const str = computeQrString('url', { url: val });
                          regenerateQr(str);
                        }}
                        placeholder="https://yourwebsite.com or https://drive.google.com/..."
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Users scanning with standard camera app will be directly prompted to open this web address.
                      </span>
                    </div>
                  )}

                  {/* Option B: Social Profile / Handle */}
                  {qrInputType === 'social' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Select Social Network Platform
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'instagram', name: 'Instagram', prefix: 'instagram.com/' },
                            { id: 'youtube', name: 'YouTube', prefix: 'youtube.com/@' },
                            { id: 'whatsapp', name: 'WhatsApp', prefix: 'wa.me/' },
                            { id: 'x', name: 'X / Twitter', prefix: 'x.com/' },
                            { id: 'linkedin', name: 'LinkedIn', prefix: 'linkedin.com/in/' },
                            { id: 'github', name: 'GitHub', prefix: 'github.com/' },
                            { id: 'telegram', name: 'Telegram', prefix: 't.me/' },
                            { id: 'facebook', name: 'Facebook', prefix: 'facebook.com/' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setQrSocialPlatform(p.id);
                                const str = computeQrString('social', { socialPlatform: p.id });
                                regenerateQr(str);
                              }}
                              className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors text-left ${
                                qrSocialPlatform === p.id
                                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {qrSocialPlatform === 'whatsapp' ? 'WhatsApp Phone Number (with Country Code)' : 'Account Username or Profile Handle'}
                        </label>
                        <div className="flex items-center">
                          <span className="px-2.5 py-2 text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-700">
                            {qrSocialPlatform === 'whatsapp' ? 'wa.me/' : qrSocialPlatform === 'youtube' ? 'youtube.com/@' : `${qrSocialPlatform}.com/`}
                          </span>
                          <input
                            type="text"
                            value={qrSocialHandle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrSocialHandle(val);
                              const str = computeQrString('social', { socialHandle: val });
                              regenerateQr(str);
                            }}
                            placeholder={qrSocialPlatform === 'whatsapp' ? '919876543210' : 'username'}
                            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-r-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option C: UPI Payment ID */}
                  {qrInputType === 'upi' && (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>Generates an NPCI-compliant BHIM UPI QR compatible with Google Pay, PhonePe, Paytm, and all banking apps.</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payee Virtual Address (VPA / UPI ID) *
                          </label>
                          <input
                            type="text"
                            value={qrUpiVpa}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrUpiVpa(val);
                              const str = computeQrString('upi', { upiVpa: val });
                              regenerateQr(str);
                            }}
                            placeholder="e.g. merchant@okhdfcbank or 9876543210@paytm"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payee / Merchant Name *
                          </label>
                          <input
                            type="text"
                            value={qrUpiName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrUpiName(val);
                              const str = computeQrString('upi', { upiName: val });
                              regenerateQr(str);
                            }}
                            placeholder="e.g. AOS Digital Services"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Requested Amount in ₹ (Optional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={qrUpiAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrUpiAmount(val);
                              const str = computeQrString('upi', { upiAmount: val });
                              regenerateQr(str);
                            }}
                            placeholder="Leave blank for any open amount"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payment Purpose / Note (Optional)
                          </label>
                          <input
                            type="text"
                            value={qrUpiNote}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrUpiNote(val);
                              const str = computeQrString('upi', { upiNote: val });
                              regenerateQr(str);
                            }}
                            placeholder="e.g. Document Services"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option D: Plain Text / Phone / Wi-Fi */}
                  {qrInputType === 'text' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {[
                          { id: 'plain', label: 'Plain Text' },
                          { id: 'phone', label: 'Direct Phone Call' },
                          { id: 'wifi', label: 'Wi-Fi Network' },
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              const s = sub.id as any;
                              setQrTextSubtype(s);
                              const str = computeQrString('text', { textSubtype: s });
                              regenerateQr(str);
                            }}
                            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                              qrTextSubtype === sub.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>

                      {qrTextSubtype === 'plain' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Text Content / Note
                          </label>
                          <textarea
                            rows={2}
                            value={qrPlainTextInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrPlainTextInput(val);
                              const str = computeQrString('text', { plainText: val });
                              regenerateQr(str);
                            }}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      )}

                      {qrTextSubtype === 'phone' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Phone Number with Country Code
                          </label>
                          <input
                            type="tel"
                            value={qrPhoneInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQrPhoneInput(val);
                              const str = computeQrString('text', { phone: val });
                              regenerateQr(str);
                            }}
                            placeholder="+919876543210"
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      )}

                      {qrTextSubtype === 'wifi' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Network SSID
                            </label>
                            <input
                              type="text"
                              value={qrWifiSsid}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQrWifiSsid(val);
                                const str = computeQrString('text', { wifiSsid: val });
                                regenerateQr(str);
                              }}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Password
                            </label>
                            <input
                              type="text"
                              value={qrWifiPass}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQrWifiPass(val);
                                const str = computeQrString('text', { wifiPass: val });
                                regenerateQr(str);
                              }}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Encryption
                            </label>
                            <select
                              value={qrWifiType}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setQrWifiType(val);
                                const str = computeQrString('text', { wifiType: val });
                                regenerateQr(str);
                              }}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                            >
                              <option value="WPA">WPA/WPA2 (Standard)</option>
                              <option value="WEP">WEP</option>
                              <option value="nopass">Open (No Password)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw Encoded String Preview */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Encoded QR String:</span>
                    <span className="font-mono truncate max-w-xs text-blue-600 dark:text-blue-400">{qrText}</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: Creative Templates (Designer Poster Frames) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Step 2: Choose Poster Frame Template</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Wrap QR inside aesthetic notice cards
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {QR_POSTER_TEMPLATES.map((tpl) => {
                    const isSelected = qrTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectPosterTemplate(tpl.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: tpl.themeColor }}
                          >
                            {tpl.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {tpl.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {tpl.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Template Copy Customization (Visible when template is selected) */}
                {qrTemplate !== 'none' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Customize Poster Frame Wording
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const tpl = QR_POSTER_TEMPLATES.find((t) => t.id === qrTemplate);
                          if (tpl) {
                            setQrPosterTitle(tpl.defaultTitle);
                            setQrPosterSubtitle(tpl.defaultSubtitle);
                            setQrPosterFooter(tpl.defaultFooter);
                            setQrPosterSubFooter(tpl.defaultSubFooter || '');
                          }
                        }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset Copy
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Header Title
                        </label>
                        <input
                          type="text"
                          value={qrPosterTitle}
                          onChange={(e) => setQrPosterTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Header Subtitle
                        </label>
                        <input
                          type="text"
                          value={qrPosterSubtitle}
                          onChange={(e) => setQrPosterSubtitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Footer Payee / Handle / Business Name
                        </label>
                        <input
                          type="text"
                          value={qrPosterFooter}
                          onChange={(e) => setQrPosterFooter(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Footer Secondary Line / UPI ID / Tagline
                        </label>
                        <input
                          type="text"
                          value={qrPosterSubFooter}
                          onChange={(e) => setQrPosterSubFooter(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: QR Code Color & Appearance Customization */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Step 3: QR Color Matrix &amp; Precision Settings</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Live Dot Palette</span>
                </div>

                {/* Style Presets */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Color Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {[
                      { id: 'classic', label: 'Classic B&W', fg: '#000000', bg: '#FFFFFF' },
                      { id: 'navy', label: 'Corporate Navy', fg: '#0F172A', bg: '#F8FAFC' },
                      { id: 'blue', label: 'Royal Blue', fg: '#1D4ED8', bg: '#EFF6FF' },
                      { id: 'emerald', label: 'Emerald Green', fg: '#047857', bg: '#ECFDF5' },
                      { id: 'violet', label: 'Vibrant Violet', fg: '#7C3AED', bg: '#F5F3FF' },
                      { id: 'sunset', label: 'Sunset Amber', fg: '#B45309', bg: '#FFFBEB' },
                      { id: 'dark', label: 'Inverted Dark', fg: '#F8FAFC', bg: '#0F172A' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setQrPreset(preset.id);
                          setQrFgColor(preset.fg);
                          setQrBgColor(preset.bg);
                          regenerateQr(qrText, preset.fg, preset.bg);
                        }}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] cursor-pointer transition-colors text-left ${
                          qrPreset === preset.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 font-semibold text-blue-900 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.fg }}
                        />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Foreground Pattern Color:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrFgColor}
                        onChange={(e) => {
                          const col = e.target.value;
                          setQrFgColor(col);
                          setQrPreset('custom');
                          regenerateQr(qrText, col, qrBgColor);
                        }}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={qrFgColor}
                        onChange={(e) => {
                          const col = e.target.value;
                          setQrFgColor(col);
                          setQrPreset('custom');
                          if (/^#[0-9A-Fa-f]{6}$/.test(col)) {
                            regenerateQr(qrText, col, qrBgColor);
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Background Color:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => {
                          const col = e.target.value;
                          setQrBgColor(col);
                          setQrPreset('custom');
                          regenerateQr(qrText, qrFgColor, col);
                        }}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={qrBgColor}
                        onChange={(e) => {
                          const col = e.target.value;
                          setQrBgColor(col);
                          setQrPreset('custom');
                          if (/^#[0-9A-Fa-f]{6}$/.test(col)) {
                            regenerateQr(qrText, qrFgColor, col);
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Correction & Margin Options */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Error Correction Level:
                    </label>
                    <select
                      value={qrErrorLevel}
                      onChange={(e) => {
                        const level = e.target.value as any;
                        setQrErrorLevel(level);
                        regenerateQr(qrText, qrFgColor, qrBgColor, qrMargin, level);
                      }}
                      className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="L">Low (7% recovery)</option>
                      <option value="M">Medium (15% recovery)</option>
                      <option value="Q">Quartile (25% recovery)</option>
                      <option value="H">High (30% recovery - Recommended for Posters)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Quiet Zone Margin:
                    </label>
                    <select
                      value={qrMargin}
                      onChange={(e) => {
                        const m = parseInt(e.target.value, 10);
                        setQrMargin(m);
                        regenerateQr(qrText, qrFgColor, qrBgColor, m, qrErrorLevel);
                      }}
                      className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="0">No Margin (0)</option>
                      <option value="1">Compact (1)</option>
                      <option value="2">Standard (2)</option>
                      <option value="4">Wide Margin (4)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 4: Live Designer Preview & High-Res Export Options */}
              {qrDataUrl && (
                <div className="p-6 bg-slate-100 dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Live Preview &amp; Export
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {qrTemplate !== 'none'
                        ? 'High-resolution poster frame with custom branding'
                        : 'Standalone QR code ready for direct download'}
                    </span>
                  </div>

                  {/* VISUAL PREVIEW DISPLAY */}
                  <div className="w-full max-w-sm flex justify-center">
                    
                    {/* Template: SCAN & PAY (UPI) */}
                    {qrTemplate === 'pay' && (
                      <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-emerald-600 shadow-xl overflow-hidden text-center">
                        <div className="bg-emerald-700 p-4 text-white space-y-2">
                          <div className="inline-block bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                            BHIM UPI · GPAY · PHONEPE · PAYTM
                          </div>
                          <h3 className="text-lg font-black tracking-tight">{qrPosterTitle}</h3>
                          <p className="text-[11px] text-emerald-100">{qrPosterSubtitle}</p>
                          {qrInputType === 'upi' && qrUpiAmount && (
                            <div className="inline-block bg-amber-300 text-amber-900 font-bold px-3 py-1 rounded-full text-xs shadow-xs">
                              AMOUNT: ₹{qrUpiAmount}
                            </div>
                          )}
                        </div>

                        <div className="p-5 flex flex-col items-center justify-center bg-white dark:bg-slate-950">
                          <div
                            className="p-3 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 inline-block transition-transform hover:scale-105"
                            style={{ backgroundColor: qrBgColor }}
                          >
                            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 block" />
                          </div>

                          <div className="mt-4 space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {qrPosterFooter}
                            </h4>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {qrPosterSubFooter}
                            </p>
                          </div>

                          <div className="mt-3 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full text-[10px] font-medium text-slate-500">
                            🔒 100% Secure Instant Bank Transfer
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template: SOCIALS & CREATOR */}
                    {qrTemplate === 'social' && (
                      <div className="w-full bg-slate-900 rounded-2xl border-2 border-pink-500 shadow-xl overflow-hidden text-center text-white">
                        <div className="bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 p-4 space-y-1.5">
                          <div className="inline-block bg-black/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                            ✦ OFFICIAL SOCIAL PROFILE ✦
                          </div>
                          <h3 className="text-lg font-black tracking-tight">{qrPosterTitle}</h3>
                          <p className="text-[11px] text-pink-100">{qrPosterSubtitle}</p>
                        </div>

                        <div className="p-5 flex flex-col items-center justify-center bg-slate-950">
                          <div
                            className="p-3 rounded-xl shadow-md border-2 border-pink-500/50 inline-block transition-transform hover:scale-105"
                            style={{ backgroundColor: qrBgColor }}
                          >
                            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 block" />
                          </div>

                          <div className="mt-4 inline-block bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold text-white shadow-xs">
                            {qrPosterFooter}
                          </div>

                          <p className="text-[11px] text-slate-400 mt-2">
                            {qrPosterSubFooter || 'Scan with your camera to open directly'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Template: CONNECT WITH US (DIRECTORY) */}
                    {qrTemplate === 'connect' && (
                      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-600 shadow-xl overflow-hidden text-center">
                        <div className="bg-blue-600 p-4 text-white space-y-1.5">
                          <div className="inline-block bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                            ★ OFFICIAL ONLINE PORTAL ★
                          </div>
                          <h3 className="text-lg font-black tracking-tight">{qrPosterTitle}</h3>
                          <p className="text-[11px] text-blue-100">{qrPosterSubtitle}</p>
                        </div>

                        <div className="p-5 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                          <div
                            className="p-3 rounded-xl shadow-md border border-blue-200 dark:border-blue-900/60 inline-block transition-transform hover:scale-105"
                            style={{ backgroundColor: qrBgColor }}
                          >
                            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 block" />
                          </div>

                          <div className="mt-4 space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {qrPosterFooter}
                            </h4>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {qrPosterSubFooter}
                            </p>
                          </div>

                          <div className="mt-3 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full text-[10px] font-medium text-blue-700 dark:text-blue-300">
                            🌐 Fast · Secure · Zero Server Retention
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template: MINIMALIST FRAME */}
                    {qrTemplate === 'minimal' && (
                      <div className="w-full bg-white dark:bg-slate-950 rounded-2xl border-4 border-slate-900 dark:border-slate-100 p-5 shadow-xl text-center space-y-3">
                        <div className="border border-slate-300 dark:border-slate-800 p-4 space-y-3">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">
                            {qrPosterTitle}
                          </h3>
                          <p className="text-xs text-slate-500">{qrPosterSubtitle}</p>

                          <div
                            className="p-3 border border-slate-900 dark:border-slate-100 inline-block shadow-xs"
                            style={{ backgroundColor: qrBgColor }}
                          >
                            <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 block" />
                          </div>

                          <div className="pt-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {qrPosterFooter}
                            </h4>
                            <p className="text-[10px] text-slate-500">{qrPosterSubFooter}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Template: NONE (RAW STANDALONE QR) */}
                    {qrTemplate === 'none' && (
                      <div
                        className="p-4 rounded-2xl shadow-lg border border-black/10 inline-block transition-transform hover:scale-105"
                        style={{ backgroundColor: qrBgColor }}
                      >
                        <img
                          src={qrDataUrl}
                          alt="Customized QR Code"
                          className="w-56 h-56 block"
                        />
                      </div>
                    )}
                  </div>

                  {/* High-Resolution Download Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    {qrTemplate !== 'none' && (
                      <button
                        type="button"
                        onClick={handleExportPoster}
                        disabled={isExportingPoster}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        {isExportingPoster ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Generating 300DPI Poster...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Framed Poster (High-Res PNG)</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = qrDataUrl;
                        a.download = `AOS_QRCode_${Date.now()}.png`;
                        a.click();
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Download Standalone QR (PNG)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 3. Password Generator UI */}
          {tool.id === 'password-generator' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-mono text-base font-semibold text-slate-900 dark:text-white tracking-wider select-all break-all">
                  {generatedPassword || '••••••••••••••••'}
                </span>
                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => copyToClipboard(generatedPassword)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {hasCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={generateLocalPassword}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Password Length: {pwLength} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={pwLength}
                  onChange={(e) => {
                    setPwLength(parseInt(e.target.value, 10));
                    setTimeout(generateLocalPassword, 10);
                  }}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pwIncludeUpper}
                    onChange={(e) => {
                      setPwIncludeUpper(e.target.checked);
                      setTimeout(generateLocalPassword, 10);
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Uppercase (A-Z)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pwIncludeNumbers}
                    onChange={(e) => {
                      setPwIncludeNumbers(e.target.checked);
                      setTimeout(generateLocalPassword, 10);
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Numbers (0-9)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pwIncludeSymbols}
                    onChange={(e) => {
                      setPwIncludeSymbols(e.target.checked);
                      setTimeout(generateLocalPassword, 10);
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Symbols (!@#$)</span>
                </label>
              </div>
            </div>
          )}

          {/* 4. Age Calculator UI */}
          {tool.id === 'age-calculator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      computeAge(e.target.value, targetDate);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age at Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => {
                      setTargetDate(e.target.value);
                      computeAge(birthDate, e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {ageResult && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-3">
                  <div className="text-center">
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Exact Chronological Age</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {ageResult.years} <span className="text-sm font-normal text-slate-500">Years</span> {ageResult.months} <span className="text-sm font-normal text-slate-500">Months</span> {ageResult.days} <span className="text-sm font-normal text-slate-500">Days</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 text-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Days</span>
                      <span className="font-bold text-slate-900 dark:text-white">{ageResult.totalDays.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Hours</span>
                      <span className="font-bold text-slate-900 dark:text-white">{ageResult.totalHours.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Next Birthday In</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{ageResult.nextBirthdayDays} days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Live HTML Sandbox UI */}
          {tool.id === 'html-editor' && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    HTML / CSS / JS Source Code
                  </label>
                  <button
                    onClick={() => setHtmlPreviewSrcDoc(htmlCode)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
                  >
                    <Play className="w-3 h-3" /> Run Code
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full p-2.5 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sandboxed Iframe Preview
                </label>
                <iframe
                  title="HTML Sandbox Output"
                  srcDoc={htmlPreviewSrcDoc}
                  sandbox="allow-scripts"
                  className="w-full h-44 border border-slate-200 dark:border-slate-800 rounded-xl bg-white"
                />
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([htmlCode], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'AOS_Sandbox.html';
                  a.click();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download HTML File
              </button>
            </div>
          )}

          {/* 6. Image Color Eyedropper UI */}
          {tool.id === 'image-to-color' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!eyedropperImgUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50"
                >
                  <Pipette className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Upload an Image to Sample Colors
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click anywhere on the image to inspect and copy pixel HEX, RGB, and HSL
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Click anywhere on image to sample pixel:
                    </span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      Change Image
                    </button>
                  </div>

                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 max-h-64 flex items-center justify-center">
                    <img
                      src={eyedropperImgUrl}
                      alt="Sample Target"
                      onClick={(e) => {
                        const sample = sampleImagePixelColor(e.currentTarget, e.clientX, e.clientY);
                        if (sample) {
                          setSampledColor(sample);
                        }
                      }}
                      className="max-h-64 object-contain cursor-crosshair mx-auto"
                    />
                  </div>

                  {sampledColor && (
                    <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg border border-black/20 shadow-xs"
                          style={{ backgroundColor: sampledColor.hex }}
                        />
                        <div className="text-xs">
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            {sampledColor.hex}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {sampledColor.rgb} · {sampledColor.hsl}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(sampledColor.hex)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                      >
                        {hasCopied ? 'Copied!' : 'Copy HEX'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 7. Khata Diary direct shortcut */}
          {tool.id === 'khata-diary' && (
            <div className="p-6 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                The Real Client Ledger Diary (Khata) has a dedicated full-screen workspace with search, receipt generator, financial calculations, and editable net profit tokens.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenKhataTab) onOpenKhataTab();
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                Open Full Khata Ledger Workspace →
              </button>
            </div>
          )}

          {/* 7b. Unit & Currency Converter Standalone UI */}
          {tool.id === 'unit-currency-converter' && (() => {
            const currencyRates: Record<string, { rate: number; symbol: string; name: string }> = {
              INR: { rate: 86.85, symbol: '₹', name: 'Indian Rupee' },
              USD: { rate: 1.0, symbol: '$', name: 'US Dollar' },
              EUR: { rate: 0.95, symbol: '€', name: 'Euro' },
              GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
              AED: { rate: 3.67, symbol: 'د.إ', name: 'UAE Dirham' },
              SAR: { rate: 3.75, symbol: '﷼', name: 'Saudi Riyal' },
              CAD: { rate: 1.42, symbol: 'CA$', name: 'Canadian Dollar' },
              AUD: { rate: 1.57, symbol: 'AU$', name: 'Australian Dollar' },
              JPY: { rate: 154.5, symbol: '¥', name: 'Japanese Yen' },
              SGD: { rate: 1.35, symbol: 'S$', name: 'Singapore Dollar' },
              CNY: { rate: 7.28, symbol: '¥', name: 'Chinese Yuan' },
              KWD: { rate: 0.31, symbol: 'KD', name: 'Kuwaiti Dinar' },
              QAR: { rate: 3.64, symbol: 'QR', name: 'Qatari Riyal' },
              BDT: { rate: 121.5, symbol: '৳', name: 'Bangladeshi Taka' },
              PKR: { rate: 279.0, symbol: '₨', name: 'Pakistani Rupee' },
              NPR: { rate: 139.0, symbol: 'रू', name: 'Nepalese Rupee' },
            };

            const unitCategories: Record<string, { label: string; units: Record<string, { name: string; factor: number }> }> = {
              length: {
                label: 'Length',
                units: {
                  m: { name: 'Meter (m)', factor: 1 },
                  km: { name: 'Kilometer (km)', factor: 1000 },
                  cm: { name: 'Centimeter (cm)', factor: 0.01 },
                  mm: { name: 'Millimeter (mm)', factor: 0.001 },
                  in: { name: 'Inch (in)', factor: 0.0254 },
                  ft: { name: 'Foot (ft)', factor: 0.3048 },
                  yd: { name: 'Yard (yd)', factor: 0.9144 },
                  mi: { name: 'Mile (mi)', factor: 1609.344 },
                },
              },
              weight: {
                label: 'Weight',
                units: {
                  kg: { name: 'Kilogram (kg)', factor: 1 },
                  g: { name: 'Gram (g)', factor: 0.001 },
                  mg: { name: 'Milligram (mg)', factor: 1e-6 },
                  lb: { name: 'Pound (lb)', factor: 0.453592 },
                  oz: { name: 'Ounce (oz)', factor: 0.0283495 },
                  ton: { name: 'Metric Ton (t)', factor: 1000 },
                },
              },
              area: {
                label: 'Area',
                units: {
                  sqm: { name: 'Square Meter (m²)', factor: 1 },
                  sqft: { name: 'Square Foot (ft²)', factor: 0.092903 },
                  sqyd: { name: 'Square Yard (yd²)', factor: 0.836127 },
                  acre: { name: 'Acre (ac)', factor: 4046.86 },
                  ha: { name: 'Hectare (ha)', factor: 10000 },
                  sqkm: { name: 'Square Km (km²)', factor: 1e6 },
                },
              },
              volume: {
                label: 'Volume',
                units: {
                  L: { name: 'Liter (L)', factor: 1 },
                  mL: { name: 'Milliliter (mL)', factor: 0.001 },
                  gal: { name: 'Gallon US (gal)', factor: 3.78541 },
                  cbm: { name: 'Cubic Meter (m³)', factor: 1000 },
                  cbft: { name: 'Cubic Foot (ft³)', factor: 28.3168 },
                },
              },
              speed: {
                label: 'Speed',
                units: {
                  mps: { name: 'Meters/sec (m/s)', factor: 1 },
                  kmh: { name: 'Km/hour (km/h)', factor: 0.277778 },
                  mph: { name: 'Miles/hour (mph)', factor: 0.44704 },
                  knot: { name: 'Knot (kn)', factor: 0.514444 },
                },
              },
              data: {
                label: 'Data Storage',
                units: {
                  B: { name: 'Byte (B)', factor: 1 },
                  KB: { name: 'Kilobyte (KB)', factor: 1024 },
                  MB: { name: 'Megabyte (MB)', factor: 1048576 },
                  GB: { name: 'Gigabyte (GB)', factor: 1073741824 },
                  TB: { name: 'Terabyte (TB)', factor: 1099511627776 },
                },
              },
            };

            const fromRate = currencyRates[currencyFrom]?.rate || 1;
            const toRate = currencyRates[currencyTo]?.rate || 1;
            const convertedCurrency = ((currencyAmount / fromRate) * toRate).toFixed(4);

            const activeCatUnits = unitCategories[unitCategory]?.units || unitCategories.length.units;
            const fromFactor = activeCatUnits[unitFrom]?.factor || 1;
            const toFactor = activeCatUnits[unitTo]?.factor || 1;
            const convertedUnit = ((unitAmount * fromFactor) / toFactor).toFixed(6).replace(/\.?0+$/, '');

            return (
              <div className="space-y-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setConvTab('currency')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      convTab === 'currency'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Currency Exchange Rates
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvTab('units')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      convTab === 'units'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Physical Units Converter
                  </button>
                </div>

                {convTab === 'currency' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-end">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Amount & From Currency
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={currencyAmount}
                            onChange={(e) => setCurrencyAmount(parseFloat(e.target.value) || 0)}
                            className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                          />
                          <select
                            value={currencyFrom}
                            onChange={(e) => setCurrencyFrom(e.target.value)}
                            className="w-1/2 px-2 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                          >
                            {Object.entries(currencyRates).map(([code, item]) => (
                              <option key={code} value={code}>
                                {code} - {item.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            const temp = currencyFrom;
                            setCurrencyFrom(currencyTo);
                            setCurrencyTo(temp);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                          title="Swap Currencies"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          To Target Currency
                        </label>
                        <select
                          value={currencyTo}
                          onChange={(e) => setCurrencyTo(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                        >
                          {Object.entries(currencyRates).map(([code, item]) => (
                            <option key={code} value={code}>
                              {code} - {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider block">
                          Converted Result
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {currencyRates[currencyTo]?.symbol} {convertedCurrency}{' '}
                          <span className="text-xs font-semibold text-slate-500">{currencyTo}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          1 {currencyFrom} ≈ {((1 / fromRate) * toRate).toFixed(4)} {currencyTo}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${convertedCurrency} ${currencyTo}`);
                          setCopyToast('Copied converted currency value!');
                          setTimeout(() => setCopyToast(null), 2000);
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Amount
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                        Measurement Category
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(unitCategories).map(([catKey, cat]) => (
                          <button
                            key={catKey}
                            type="button"
                            onClick={() => {
                              setUnitCategory(catKey);
                              const units = Object.keys(cat.units);
                              setUnitFrom(units[0] || 'm');
                              setUnitTo(units[1] || units[0] || 'm');
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              unitCategory === catKey
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-end">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Amount & From Unit
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="any"
                            value={unitAmount}
                            onChange={(e) => setUnitAmount(parseFloat(e.target.value) || 0)}
                            className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                          />
                          <select
                            value={unitFrom}
                            onChange={(e) => setUnitFrom(e.target.value)}
                            className="w-1/2 px-2 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                          >
                            {Object.entries(activeCatUnits).map(([unitKey, item]) => (
                              <option key={unitKey} value={unitKey}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            const temp = unitFrom;
                            setUnitFrom(unitTo);
                            setUnitTo(temp);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                          title="Swap Units"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Target Unit
                        </label>
                        <select
                          value={unitTo}
                          onChange={(e) => setUnitTo(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                        >
                          {Object.entries(activeCatUnits).map(([unitKey, item]) => (
                            <option key={unitKey} value={unitKey}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
                          Converted Unit Measurement
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {convertedUnit} <span className="text-xs font-semibold text-slate-500">{activeCatUnits[unitTo]?.name || unitTo}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${convertedUnit} ${activeCatUnits[unitTo]?.name || unitTo}`);
                          setCopyToast('Copied converted unit measurement!');
                          setTimeout(() => setCopyToast(null), 2000);
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Measurement
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 7c. Text Case Converter Standalone UI */}
          {tool.id === 'text-case-converter' && (() => {
            const charCount = textCaseContent.length;
            const charNoSpaces = textCaseContent.replace(/\s+/g, '').length;
            const wordCount = textCaseContent.trim() ? textCaseContent.trim().split(/\s+/).length : 0;
            const lineCount = textCaseContent ? textCaseContent.split('\n').length : 0;
            const sentenceCount = textCaseContent.trim() ? (textCaseContent.match(/[.!?]+(?:\s+|$)/g) || []).length || 1 : 0;
            const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

            const applyCase = (type: string) => {
              let res = textCaseContent;
              if (type === 'upper') {
                res = textCaseContent.toUpperCase();
              } else if (type === 'lower') {
                res = textCaseContent.toLowerCase();
              } else if (type === 'title') {
                res = textCaseContent.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
              } else if (type === 'sentence') {
                res = textCaseContent.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
              } else if (type === 'capitalized') {
                res = textCaseContent.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
              } else if (type === 'camel') {
                const words = textCaseContent.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
                res = words.map((w, idx) => idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
              } else if (type === 'pascal') {
                const words = textCaseContent.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
                res = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
              } else if (type === 'kebab') {
                res = textCaseContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
              } else if (type === 'snake') {
                res = textCaseContent.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
              } else if (type === 'constant') {
                res = textCaseContent.toUpperCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
              } else if (type === 'alternating') {
                res = textCaseContent.split('').map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase())).join('');
              }
              setTextCaseContent(res);
            };

            const downloadTxt = () => {
              const blob = new Blob([textCaseContent], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'AOS_Converted_Text.txt';
              a.click();
              URL.revokeObjectURL(url);
            };

            return (
              <div className="space-y-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
                <div className="flex flex-wrap gap-2 text-[11px] p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 font-medium text-slate-600 dark:text-slate-300">
                  <span>Characters: <strong className="text-slate-900 dark:text-white">{charCount}</strong> ({charNoSpaces} no spaces)</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>Words: <strong className="text-slate-900 dark:text-white">{wordCount}</strong></span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>Sentences: <strong className="text-slate-900 dark:text-white">{sentenceCount}</strong></span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>Lines: <strong className="text-slate-900 dark:text-white">{lineCount}</strong></span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span>Reading: <strong className="text-slate-900 dark:text-white">~{readingTimeMin} min</strong></span>
                </div>

                <div>
                  <textarea
                    rows={6}
                    value={textCaseContent}
                    onChange={(e) => setTextCaseContent(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    One-Click Case Converters
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => applyCase('upper')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      UPPERCASE
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('lower')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      lowercase
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('title')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      Title Case
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('sentence')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      Sentence case
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('capitalized')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      Capitalized Case
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('camel')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      camelCase
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('pascal')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      PascalCase
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('kebab')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      kebab-case
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('snake')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      snake_case
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('constant')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      CONSTANT_CASE
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCase('alternating')}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      aLtErNaTiNg
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(textCaseContent);
                        setCopyToast('Copied transformed text to clipboard!');
                        setTimeout(() => setCopyToast(null), 2000);
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </button>
                    <button
                      type="button"
                      onClick={downloadTxt}
                      className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Save .txt
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTextCaseContent('')}
                    className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg cursor-pointer inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 7d. Base64 & URL Encoder/Decoder Standalone UI */}
          {tool.id === 'base64-url-codec' && (
            <div className="space-y-4 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'b64-enc', label: 'Base64 Encode' },
                  { id: 'b64-dec', label: 'Base64 Decode' },
                  { id: 'url-enc', label: 'URL Encode' },
                  { id: 'url-dec', label: 'URL Decode' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCodecMode(tab.id as any)}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      codecMode === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <label>Input Text / Data String</label>
                  <button
                    type="button"
                    onClick={() => setCodecInput('')}
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={codecInput}
                  onChange={(e) => setCodecInput(e.target.value)}
                  placeholder="Enter content to encode or decode..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (codecOutput) {
                      setCodecInput(codecOutput);
                      if (codecMode === 'b64-enc') setCodecMode('b64-dec');
                      else if (codecMode === 'b64-dec') setCodecMode('b64-enc');
                      else if (codecMode === 'url-enc') setCodecMode('url-dec');
                      else if (codecMode === 'url-dec') setCodecMode('url-enc');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Swap Input & Output
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <label>Processed Output</label>
                  {codecOutput && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {codecOutput.length} characters
                    </span>
                  )}
                </div>
                {codecError ? (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-300">
                    {codecError}
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    readOnly
                    value={codecOutput}
                    placeholder="Processed result will appear here live..."
                    className="w-full p-3 text-xs bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none select-all"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  disabled={!codecOutput}
                  onClick={() => {
                    navigator.clipboard.writeText(codecOutput);
                    setCopyToast('Copied output string to clipboard!');
                    setTimeout(() => setCopyToast(null), 2000);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Output
                </button>
              </div>
            </div>
          )}

          {/* 8. Options and Settings visible for all file-based tools */}
          {tool.acceptedFormats && tool.id !== 'image-to-color' && (
            <div className="space-y-4">
              
              {/* Tool Options Controls Header */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Tool Configuration & Settings
                </span>

                {/* Compress PDF Target Options */}
                {tool.id === 'compress-pdf' && (
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Target Maximum File Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCompressMode('300');
                          setCompressTargetKb(295);
                        }}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border cursor-pointer text-center ${
                          compressMode === '300'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        &lt; 300 KB (PAN Spec)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCompressMode('200');
                          setCompressTargetKb(195);
                        }}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border cursor-pointer text-center ${
                          compressMode === '200'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        &lt; 200 KB
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCompressMode('100');
                          setCompressTargetKb(95);
                        }}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border cursor-pointer text-center ${
                          compressMode === '100'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        &lt; 100 KB
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompressMode('custom')}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg border cursor-pointer text-center ${
                          compressMode === 'custom'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Custom KB
                      </button>
                    </div>
                    {compressMode === 'custom' && (
                      <div className="pt-2">
                        <input
                          type="number"
                          min="30"
                          max="2000"
                          value={compressTargetKb}
                          onChange={(e) => setCompressTargetKb(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          placeholder="Target size in KB (e.g. 250)"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Split PDF Page Range */}
                {tool.id === 'split-pdf' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Page Range (e.g. 1-3, 5, 8)
                    </label>
                    <input
                      type="text"
                      value={pageRangeInput}
                      onChange={(e) => setPageRangeInput(e.target.value)}
                      placeholder="e.g. 1-3 or 2, 4, 6"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Rotation angle options */}
                {(tool.id === 'rotate-pdf' || tool.id === 'rotate-image') && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Rotation Angle
                    </label>
                    <div className="flex gap-2">
                      {[90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotationDegrees(deg)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                            rotationDegrees === deg
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {deg}° Clockwise
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Watermark Text & Color */}
                {tool.id === 'watermark-stamp' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Watermark Text
                      </label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Color & Opacity ({Math.round(watermarkOpacity * 100)}%)
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <input
                          type="range"
                          min="0.1"
                          max="0.8"
                          step="0.05"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                          className="flex-1 accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Page Number Position & Format */}
                {tool.id === 'page-numbers' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Number Position
                      </label>
                      <select
                        value={pageNumberPosition}
                        onChange={(e) => setPageNumberPosition(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Format
                      </label>
                      <select
                        value={pageNumberFormat}
                        onChange={(e) => setPageNumberFormat(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="Page {n} of {total}">Page 1 of 5</option>
                        <option value="{n} / {total}">1 / 5</option>
                        <option value="Page {n}">Page 1</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Organize PDF Page Order */}
                {tool.id === 'organize-pdf' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Page Sequence (comma-separated, e.g. 3, 1, 2)
                    </label>
                    <input
                      type="text"
                      value={organizePageOrder}
                      onChange={(e) => setOrganizePageOrder(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Protect PDF Encryption Options */}
                {tool.id === 'protect-pdf' && (
                  <div className="space-y-2.5 p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Document Security Password (Required)
                    </label>
                    <div className="relative">
                      <input
                        type={showProtectPass ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password to encrypt PDF"
                        className="w-full px-3 py-2 pr-10 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowProtectPass(!showProtectPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showProtectPass ? 'Hide Password' : 'Show Password'}
                      >
                        {showProtectPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standard AES-256 zero-knowledge encryption. The output file will be locked and will prompt for this exact password in any PDF reader (Adobe Acrobat, Chrome, Android, iOS).
                    </p>
                  </div>
                )}

                {/* Unlock PDF Password */}
                {tool.id === 'unlock-pdf' && (
                  <div className="space-y-2 p-3 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Document Password (If Protected)
                    </label>
                    <div className="relative">
                      <input
                        type={showUnlockPass ? 'text' : 'password'}
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        placeholder="Enter password (leave blank for restriction removal only)"
                        className="w-full px-3 py-2 pr-10 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUnlockPass(!showUnlockPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showUnlockPass ? 'Hide Password' : 'Show Password'}
                      >
                        {showUnlockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tip: If the PDF opens freely but has restrictions (printing, copying, or form editing locked), leave the password blank and click <strong>Process PDF</strong> to remove all permission locks.
                    </p>
                  </div>
                )}

                {/* Sign PDF Touch Drawing Canvas with Direct One-Tap Download */}
                {tool.id === 'sign-pdf' && (
                  <div className="space-y-3 p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Draw Handwritten Signature Below
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSigInkColor('#0F172A')}
                          className={`w-5 h-5 rounded-full bg-slate-900 cursor-pointer transition-transform ${sigInkColor === '#0F172A' ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                          title="Black Ink"
                        />
                        <button
                          type="button"
                          onClick={() => setSigInkColor('#1D4ED8')}
                          className={`w-5 h-5 rounded-full bg-blue-700 cursor-pointer transition-transform ${sigInkColor === '#1D4ED8' ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                          title="Blue Ink"
                        />
                        <button
                          type="button"
                          onClick={clearSigCanvas}
                          className="text-xs text-red-600 hover:underline cursor-pointer ml-2"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <canvas
                      ref={sigCanvasRef}
                      width={500}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={drawSignature}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={drawSignature}
                      onTouchEnd={stopDrawing}
                      className="w-full h-28 bg-white border border-slate-300 dark:border-slate-700 rounded-lg cursor-crosshair touch-none shadow-xs"
                    />

                    {/* Direct One-Tap Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!sigCanvasRef.current) return;
                          const canvas = sigCanvasRef.current;
                          const dataUrl = canvas.toDataURL('image/png');
                          const link = document.createElement('a');
                          link.href = dataUrl;
                          link.download = 'AOS_Drawn_Signature.png';
                          link.click();
                          setCopyToast('Downloaded signature PNG!');
                          setTimeout(() => setCopyToast(null), 2000);
                        }}
                        className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Signature (PNG)
                      </button>

                      {selectedFiles[0] && (
                        <button
                          type="button"
                          onClick={executeProcessing}
                          className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          One-Tap Sign &amp; Download Document
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Compression Quality Slider */}
                {tool.id === 'compress-image' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Quality Level: {compressionQuality}%</span>
                      <span>{compressionQuality > 80 ? 'High' : compressionQuality > 50 ? 'Balanced' : 'Max Savings'}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={compressionQuality}
                      onChange={(e) => setCompressionQuality(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}

                {/* Crop Image Aspect Ratios */}
                {tool.id === 'crop-image' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Aspect Ratio Preset
                    </label>
                    <div className="flex gap-2">
                      {[
                        { label: '1:1 Square', val: '1:1' },
                        { label: '4:3 Standard', val: '4:3' },
                        { label: '16:9 Wide', val: '16:9' },
                        { label: '3:4 Portrait', val: '3:4' },
                        { label: 'Freeform', val: 'free' },
                      ].map((ar) => (
                        <button
                          key={ar.val}
                          type="button"
                          onClick={() => setCropAspectRatio(ar.val as any)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                            cropAspectRatio === ar.val
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Resize Dimensions */}
                {tool.id === 'resize-image' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => setTargetWidth(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => setTargetHeight(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Govt Photo Signature Specs */}
                {tool.id === 'photo-signature-resize' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Government Specification
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGovResizeType('photo')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                          govResizeType === 'photo'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Passport Photo (3.5x2.5cm, &lt;50KB)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGovResizeType('signature')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                          govResizeType === 'signature'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Signature Spec (2.0x4.5cm, &lt;50KB)
                      </button>
                    </div>
                  </div>
                )}

                {/* Passport Photo Studio & Sheet Configuration */}
                {(tool.id === 'passport-photo-studio' || tool.id === 'passport-photo-sheet') && (
                  <div className="space-y-3.5 p-3.5 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Standard Photo Dimensions Preset
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: '35x45', label: 'Indian Passport', sub: '35 x 45 mm' },
                          { id: '35x25', label: 'Govt Exam / SSC', sub: '35 x 25 mm' },
                          { id: '51x51', label: 'US Visa / 2x2"', sub: '51 x 51 mm' },
                          { id: '25x35', label: 'PAN Card / ID', sub: '25 x 35 mm' },
                        ].map((spec) => (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => setPassportAspectRatio(spec.id as any)}
                            className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                              passportAspectRatio === spec.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="block text-xs font-bold leading-tight">{spec.label}</span>
                            <span className="block text-[10px] opacity-75">{spec.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Studio Background Shade
                      </label>
                      <div className="flex flex-wrap gap-2 items-center">
                        {[
                          { color: '#FFFFFF', label: 'Crisp White' },
                          { color: '#F1F5F9', label: 'Off-White' },
                          { color: '#93C5FD', label: 'Studio Light Blue' },
                          { color: '#CBD5E1', label: 'Neutral Grey' },
                        ].map((bg) => (
                          <button
                            key={bg.color}
                            type="button"
                            onClick={() => setPassportBgColor(bg.color)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer inline-flex items-center gap-2 ${
                              passportBgColor === bg.color
                                ? 'ring-2 ring-blue-500 border-blue-500 font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                              style={{ backgroundColor: bg.color }}
                            />
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Brightness ({passportBrightness}%)</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="130"
                          value={passportBrightness}
                          onChange={(e) => setPassportBrightness(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Contrast ({passportContrast}%)</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="130"
                          value={passportContrast}
                          onChange={(e) => setPassportContrast(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Saturation ({passportSaturation}%)</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={passportSaturation}
                          onChange={(e) => setPassportSaturation(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Printable Layout Sheet
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'single', label: 'Single Photo', desc: '1 Photo file' },
                          { id: '4x6', label: '4x6" Photo Paper', desc: 'Standard studio print' },
                          { id: 'a4', label: 'A4 Document Sheet', desc: 'Full-page document' },
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setPassportSheetType(st.id as any)}
                            className={`p-2 text-left rounded-lg border transition-all cursor-pointer ${
                              passportSheetType === st.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="block text-xs font-bold">{st.label}</span>
                            <span className="block text-[10px] opacity-75">{st.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {passportSheetType !== 'single' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Photos on Sheet
                        </label>
                        <div className="flex gap-2">
                          {[4, 8, 12, 16, 32].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setPassportPhotosCount(cnt)}
                              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                                passportPhotosCount === cnt
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {cnt} Photos
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="passport-border"
                        checked={passportWithBorder}
                        onChange={(e) => setPassportWithBorder(e.target.checked)}
                        className="rounded accent-blue-600 cursor-pointer"
                      />
                      <label htmlFor="passport-border" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        Add fine cutting guide border lines around photos
                      </label>
                    </div>
                  </div>
                )}

                {/* Image Enhancer sliders */}
                {tool.id === 'image-quality-enhancer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Brightness ({brightnessVal}%)</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightnessVal}
                          onChange={(e) => setBrightnessVal(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          <span>Contrast ({contrastVal}%)</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={contrastVal}
                          onChange={(e) => setContrastVal(parseInt(e.target.value, 10))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sharpnessToggle}
                        onChange={(e) => setSharpnessToggle(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span>Apply Unsharp Mask Filter (Sharpen Text & Details)</span>
                    </label>
                  </div>
                )}

                {/* Color Extractor Display */}
                {tool.id === 'color-extractor' && extractedPalette.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Extracted Dominant Palette:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {extractedPalette.map((col, idx) => (
                        <div
                          key={idx}
                          onClick={() => copyToClipboard(col.hex)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center cursor-pointer hover:shadow-xs"
                          title="Click to copy HEX"
                        >
                          <div
                            className="w-full h-8 rounded-md mb-1.5 border border-black/10"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="block font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            {col.hex}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ZIP Extractor list */}
                {tool.id === 'zip-extractor' && zipEntries.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Archive Contents ({zipEntries.length} files found):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      {zipEntries.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1 px-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded">
                          <span className="truncate max-w-[70%] font-mono text-slate-700 dark:text-slate-300">
                            {item.name}
                          </span>
                          {!item.isDir && (
                            <button
                              type="button"
                              onClick={async () => {
                                const blob = await item.entry.async('blob');
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = item.name.split('/').pop() || 'file';
                                a.click();
                              }}
                              className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold cursor-pointer"
                            >
                              Extract
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* File Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                multiple={
                  tool.id === 'merge-pdf' ||
                  tool.id === 'jpg-to-pdf' ||
                  tool.id === 'image-merge' ||
                  tool.id === 'compare-pdf'
                }
                accept={tool.acceptedFormats}
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-600 dark:hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-blue-50/30 dark:bg-blue-950/20 group"
              >
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 mx-auto mb-2 transition-transform" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedFiles.length === 0
                    ? tool.id === 'compare-pdf'
                      ? 'Click to Select 2 PDF Files to Compare'
                      : tool.id === 'merge-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'image-merge'
                      ? 'Click to Select Multiple Files or Drag & Drop'
                      : 'Click to Select File or Drag & Drop'
                    : 'Click to Choose Different File(s)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supported formats: {tool.acceptedFormats} · Processed 100% locally in browser memory
                </p>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Selected File(s) ({selectedFiles.length}):</span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-red-600 hover:underline font-normal text-[11px] cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="truncate max-w-[70%] font-medium text-slate-800 dark:text-slate-200">
                          {i + 1}. {f.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-500">
                            {(f.size / 1024).toFixed(1)} KB
                          </span>
                          <button
                            onClick={() => removeFile(i)}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                onClick={executeProcessing}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{progressMsg || 'Processing File...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {selectedFiles.length === 0
                        ? `Select File & Run ${tool.name}`
                        : `Process & Run ${tool.name}`}
                    </span>
                  </>
                )}
              </button>

            </div>
          )}

          {/* Progress bar during async tasks */}
          {isProcessing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{progressMsg}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Result & Download Box */}
          {successResult && (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successResult.customMessage || 'Processing Completed Successfully!'}</span>
              </div>

              {successResult.originalSize && successResult.newSize && (
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                  <span>Original: {(successResult.originalSize / 1024).toFixed(1)} KB</span>
                  <span>→</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    Processed: {(successResult.newSize / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}

              {successResult.textOutput && (
                <div className="relative">
                  <textarea
                    readOnly
                    rows={6}
                    value={successResult.textOutput}
                    className="w-full p-2.5 font-mono text-[11px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                  />
                  <button
                    onClick={() => copyToClipboard(successResult.textOutput!)}
                    className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {hasCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    Copy Text
                  </button>
                </div>
              )}

              {successResult.downloadUrl && (
                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={successResult.downloadUrl}
                    download={successResult.fileName || 'AOS_Processed_File'}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Processed File ({successResult.fileName})
                  </a>
                  <button
                    onClick={() => {
                      setSelectedFiles([]);
                      setSuccessResult(null);
                    }}
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    Process Another
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Floating Copy Feedback Toast */}
        {copyToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-fade-in border border-slate-700 dark:border-slate-200">
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{copyToast}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
          <span>AOS Tools · In-Browser Zero Knowledge Processing</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
