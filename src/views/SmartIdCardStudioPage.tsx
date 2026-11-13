import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Download,
  FileDown,
  Printer,
  Upload,
  RotateCcw,
  User,
  FileText,
  Palette,
  Image as ImageIcon,
  QrCode,
  Layers,
  ArrowLeft,
  Check,
  Eye,
  Scissors,
  PenTool,
  ZoomIn,
  Sparkles,
  Wand2,
  Sliders,
  Type,
  FileCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { getStockDemoPortraitDataUrl } from '../utils/stockPassportPhoto';
import { StarRatingWidget } from '../components/StarRatingWidget';
import { SmartIdCardGraphicCard } from '../components/ToolIllustrativeCards';

interface SmartIdCardStudioPageProps {
  onBack: () => void;
}

type StudioTab = 'front' | 'back' | 'colors' | 'photo' | 'qr' | 'print' | 'export';
type SheetLayoutOption = '4x6-horizontal' | '4x6-vertical' | 'a4-8' | 'single-cr80';
type CutGuideStyle = 'dotted' | 'solid' | 'crop-marks' | 'none';
type SigColorMode = 'original' | 'navy' | 'black';

// CR80 standard dimensions: 85.6 mm × 54 mm @ 300 DPI
const CR80_W = 1012;
const CR80_H = 638;
const CR80_RADIUS = 36;

// Helper: XML entity escaper for safe SVG vector rendering
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const SmartIdCardStudioPage: React.FC<SmartIdCardStudioPageProps> = ({ onBack }) => {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<StudioTab>('front');

  // --- 1. FRONT FIELDS STATE (100% Fully Customizable) ---
  const [orgName, setOrgName] = useState<string>('NATIONAL INSTITUTE OF TECHNOLOGY');
  const [subtitle, setSubtitle] = useState<string>('An Autonomous Institution • Govt. of India');
  const [cardHeadline, setCardHeadline] = useState<string>('STUDENT IDENTITY CARD');
  const [candidateName, setCandidateName] = useState<string>('ROHIT RAJPUT');
  
  // Custom Labels & Values
  const [idLabel, setIdLabel] = useState<string>('ID:');
  const [idNumber, setIdNumber] = useState<string>('NIT-2026-0849');
  
  const [roleLabel, setRoleLabel] = useState<string>('Role/Class:');
  const [roleDept, setRoleDept] = useState<string>('B.Tech Computer Science (CSE)');
  
  const [dobLabel, setDobLabel] = useState<string>('DOB:');
  const [dob, setDob] = useState<string>('14/07/2003');
  
  const [bloodLabel, setBloodLabel] = useState<string>('Blood:');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  
  const [phoneLabel, setPhoneLabel] = useState<string>('Phone:');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  
  const [validTillLabel, setValidTillLabel] = useState<string>('VALID UPTO:');
  const [validTill, setValidTill] = useState<string>('30/06/2027');

  // Extra optional field (e.g. Father's Name or Roll No)
  const [showExtraField, setShowExtraField] = useState<boolean>(false);
  const [extraFieldLabel, setExtraFieldLabel] = useState<string>("Father's Name:");
  const [extraFieldValue, setExtraFieldValue] = useState<string>('Ramesh Rajput');

  // Front Typography & Highlight Settings
  const [orgFontSize, setOrgFontSize] = useState<number>(30); // px on 1012px canvas
  const [nameFontSize, setNameFontSize] = useState<number>(34);
  const [idHighlightColor, setIdHighlightColor] = useState<string>('#0284c7');

  // --- 2. BACK & TERMS STATE (100% Fully Customizable) ---
  const [backHeader, setBackHeader] = useState<string>('TERMS & RESIDENTIAL ADDRESS');
  
  // Residence Address
  const [addressTitle, setAddressTitle] = useState<string>('Residential Address:');
  const [address, setAddress] = useState<string>(
    'House 40, Civil Lines, Main University Road, Patna, Bihar - 800001'
  );

  // Terms & Guidelines
  const [termsTitle, setTermsTitle] = useState<string>('Instructions & Guidelines:');
  const [instruction1, setInstruction1] = useState<string>(
    '1. This card is non-transferable and remains property of the institute.'
  );
  const [instruction2, setInstruction2] = useState<string>(
    '2. If found, please return to the administrative office.'
  );
  const [instruction3, setInstruction3] = useState<string>(
    '3. Misuse of this identification card is strictly punishable.'
  );
  const [instruction4, setInstruction4] = useState<string>(
    '4. Cardholder must carry this card at all times on premises.'
  );

  // Helpline & Signatory
  const [helpline, setHelpline] = useState<string>('Helpline: 1800-111-5232 | Police: 112');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Authorized Signatory');

  // --- 3. HEADER & COLOR THEMES (Clean Professional Blue) ---
  const [headerColor, setHeaderColor] = useState<string>('#072642'); // Deep Navy Blue
  const [accentColor, setAccentColor] = useState<string>('#38bdf8'); // Sky Blue Accent
  const [cardBgColor, setCardBgColor] = useState<string>('#FFFFFF');
  const [footerText, setFooterText] = useState<string>('VALID FOR ACADEMIC & OFFICIAL ENTRY');

  // --- 4. PHOTO & SIGNATURE STATE ---
  const [photoSrc, setPhotoSrc] = useState<string>('');
  const [photoZoom, setPhotoZoom] = useState<number>(1.0);
  const [photoPanX, setPhotoPanX] = useState<number>(0);
  const [photoPanY, setPhotoPanY] = useState<number>(0);

  // Signature state
  const [signatureMode, setSignatureMode] = useState<'typed' | 'upload'>('typed');
  const [typedSignature, setTypedSignature] = useState<string>('Rohit Rajput');
  const [rawSignatureSrc, setRawSignatureSrc] = useState<string>('');
  const [signatureSrc, setSignatureSrc] = useState<string>('');

  // Signature Background Removal Controls
  const [removeSigBg, setRemoveSigBg] = useState<boolean>(true);
  const [sigBgThreshold, setSigBgThreshold] = useState<number>(215); // 150-250
  const [sigColorMode, setSigColorMode] = useState<SigColorMode>('navy');
  const [isProcessingSig, setIsProcessingSig] = useState<boolean>(false);

  // --- 5. QR CODE STATE ---
  const [qrData, setQrData] = useState<string>('https://verify.nit.ac.in/id/NIT-2026-0849');
  const [qrSubtext, setQrSubtext] = useState<string>('Scan to Verify');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // --- 6. PRINT SHEET SETTINGS ---
  const [sheetLayout, setSheetLayout] = useState<SheetLayoutOption>('4x6-horizontal');
  const [cutGuideStyle, setCutGuideStyle] = useState<CutGuideStyle>('dotted');
  const [sheetFooterNote, setSheetFooterNote] = useState<string>(
    'AOS Smart ID Card Studio • 4×6" Print Sheet (Front & Back Pair)'
  );

  // Canvases
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  // Preloaded image elements for synchronous rendering
  const [loadedPhotoImg, setLoadedPhotoImg] = useState<HTMLImageElement | null>(null);
  const [loadedQrImg, setLoadedQrImg] = useState<HTMLImageElement | null>(null);
  const [loadedSigImg, setLoadedSigImg] = useState<HTMLImageElement | null>(null);

  // Initialize sample portrait and QR Code
  useEffect(() => {
    QRCodeLib.toDataURL(qrData, {
      margin: 1,
      width: 240,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR gen error:', err));
  }, [qrData]);

  // Load sample portrait
  useEffect(() => {
    const stockUrl = getStockDemoPortraitDataUrl();
    setPhotoSrc(stockUrl);
  }, []);

  // Preload photo image safely
  useEffect(() => {
    if (!photoSrc) {
      setLoadedPhotoImg(null);
      return;
    }
    const img = new Image();
    if (photoSrc.startsWith('http://') || photoSrc.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => setLoadedPhotoImg(img);
    img.src = photoSrc;
  }, [photoSrc]);

  // Preload QR Code image
  useEffect(() => {
    if (!qrDataUrl) {
      setLoadedQrImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setLoadedQrImg(img);
    img.src = qrDataUrl;
  }, [qrDataUrl]);

  // Signature Processor: Removes White/Paper Background & Adjusts Ink Color
  useEffect(() => {
    if (!rawSignatureSrc) {
      setSignatureSrc('');
      setLoadedSigImg(null);
      return;
    }

    setIsProcessingSig(true);
    const img = new Image();
    img.onload = () => {
      try {
        const offCanvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width || 300;
        const height = img.naturalHeight || img.height || 120;
        offCanvas.width = width;
        offCanvas.height = height;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) {
          setSignatureSrc(rawSignatureSrc);
          setIsProcessingSig(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        if (removeSigBg || sigColorMode !== 'original') {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 10) continue;

            // Perceived lightness / brightness of the pixel
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

            if (removeSigBg) {
              if (brightness >= sigBgThreshold) {
                // Background paper completely transparent
                data[i + 3] = 0;
              } else if (brightness > sigBgThreshold - 35) {
                // Smooth anti-aliased edge feathering
                const alphaFactor = (sigBgThreshold - brightness) / 35;
                data[i + 3] = Math.round(a * alphaFactor);
              }
            }

            // Optional ink recoloring (e.g. convert dull scans or pencil to Royal Navy or Black)
            if (data[i + 3] > 0) {
              if (sigColorMode === 'navy') {
                data[i] = 7;     // #072642
                data[i + 1] = 38;
                data[i + 2] = 66;
              } else if (sigColorMode === 'black') {
                data[i] = 15;    // #0F172A
                data[i + 1] = 23;
                data[i + 2] = 42;
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
        }

        const processedUrl = offCanvas.toDataURL('image/png');
        setSignatureSrc(processedUrl);

        const loadedImg = new Image();
        loadedImg.onload = () => {
          setLoadedSigImg(loadedImg);
          setIsProcessingSig(false);
        };
        loadedImg.src = processedUrl;
      } catch (err) {
        console.error('Signature processing failed:', err);
        setSignatureSrc(rawSignatureSrc);
        setIsProcessingSig(false);
      }
    };
    img.src = rawSignatureSrc;
  }, [rawSignatureSrc, removeSigBg, sigBgThreshold, sigColorMode]);

  // Helper: Draw Rounded Rectangle Path on 2D context
  const roundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
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
  };

  // =========================================================================
  // CORE RENDERER: FRONT CARD (CR80 1012 × 638 px @ 300 DPI)
  // =========================================================================
  const renderFrontCard = useCallback(() => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CR80_W;
    canvas.height = CR80_H;

    ctx.save();
    ctx.clearRect(0, 0, CR80_W, CR80_H);

    // 1. Clip CR80 Rounded Card Boundary
    roundedRect(ctx, 0, 0, CR80_W, CR80_H, CR80_RADIUS);
    ctx.clip();

    // 2. Base Card Background
    ctx.fillStyle = cardBgColor;
    ctx.fillRect(0, 0, CR80_W, CR80_H);

    // Micro security background tint
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, CR80_W, CR80_H);

    // 3. Top Header Banner
    const headerHeight = 135;
    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, CR80_W, headerHeight);

    // Subtle gradient shine on header
    const shineGrad = ctx.createLinearGradient(0, 0, CR80_W, headerHeight);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
    shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.20)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(0, 0, CR80_W, headerHeight);

    // Organization / Institute Name
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${orgFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(orgName.toUpperCase(), CR80_W / 2, 48);

    // Subtitle / Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(subtitle, CR80_W / 2, 85);

    // Headline Ribbon (STUDENT IDENTITY CARD)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 108, CR80_W, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(cardHeadline.toUpperCase(), CR80_W / 2, 122);

    // Accent Stripe Divider (Sky Blue / Gold Ribbon)
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, headerHeight, CR80_W, 6);

    // 4. Photo Frame (Left side)
    const photoX = 60;
    const photoY = 165;
    const photoW = 210;
    const photoH = 265;
    const photoR = 12;

    ctx.save();
    roundedRect(ctx, photoX, photoY, photoW, photoH, photoR);
    ctx.clip();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(photoX, photoY, photoW, photoH);

    if (loadedPhotoImg) {
      const srcW = loadedPhotoImg.naturalWidth || photoW;
      const srcH = loadedPhotoImg.naturalHeight || photoH;
      const srcRatio = srcW / srcH;
      const dstRatio = photoW / photoH;

      let baseCropW = srcW;
      let baseCropH = srcH;
      if (srcRatio > dstRatio) {
        baseCropW = srcH * dstRatio;
      } else {
        baseCropH = srcW / dstRatio;
      }

      const effectiveZoom = Math.max(0.6, Math.min(3.0, photoZoom));
      const cropW = Math.min(srcW, Math.max(20, baseCropW / effectiveZoom));
      const cropH = Math.min(srcH, Math.max(20, baseCropH / effectiveZoom));

      const cx = srcW / 2 + (photoPanX / 100) * (srcW / 4);
      const cy = srcH / 2 + (photoPanY / 100) * (srcH / 4);

      const sx = Math.max(0, Math.min(srcW - cropW, cx - cropW / 2));
      const sy = Math.max(0, Math.min(srcH - cropH, cy - cropH / 2));

      ctx.drawImage(loadedPhotoImg, sx, sy, cropW, cropH, photoX, photoY, photoW, photoH);
    } else {
      // Default clean candidate avatar silhouette
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + 95, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(photoX + photoW / 2, photoY + 230, 80, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Photo Border
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    roundedRect(ctx, photoX, photoY, photoW, photoH, photoR);
    ctx.stroke();

    // 5. Candidate Information Block (Right side)
    const textX = 310;
    let currY = 185;

    // Full Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = `900 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(candidateName.toUpperCase(), textX, currY);

    // ID Number Highlight Ribbon Pill
    currY += 38;
    const idPillText = `${idLabel} ${idNumber}`;
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const pillW = ctx.measureText(idPillText).width + 24;
    ctx.fillStyle = `${idHighlightColor}1A`;
    roundedRect(ctx, textX, currY - 18, pillW, 28, 6);
    ctx.fill();
    ctx.strokeStyle = `${idHighlightColor}66`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = idHighlightColor;
    ctx.fillText(idPillText, textX + 12, currY + 2);

    // Role / Course / Department
    currY += 40;
    ctx.fillStyle = '#334155';
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${roleLabel} ${roleDept}`, textX, currY);

    // Date of Birth & Blood Group
    currY += 32;
    ctx.fillStyle = '#475569';
    ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${dobLabel} ${dob}   ${bloodLabel} ${bloodGroup}`, textX, currY);

    // Contact Phone
    currY += 32;
    ctx.fillText(`${phoneLabel} ${phone}`, textX, currY);

    // Optional Extra Field (e.g. Father's Name)
    if (showExtraField && extraFieldValue) {
      currY += 30;
      ctx.fillText(`${extraFieldLabel} ${extraFieldValue}`, textX, currY);
    }

    // Valid Till / Expiry (Clean High-Contrast Blue or Accent)
    currY += 34;
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${validTillLabel} ${validTill}`, textX, currY);

    // 6. Footer Ribbon
    const footerH = 34;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, CR80_H - footerH, CR80_W, footerH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(footerText.toUpperCase(), CR80_W / 2, CR80_H - footerH / 2);

    // Outer Card Border
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 1, 1, CR80_W - 2, CR80_H - 2, CR80_RADIUS);
    ctx.stroke();

    ctx.restore();
  }, [
    orgName,
    subtitle,
    cardHeadline,
    candidateName,
    idLabel,
    idNumber,
    roleLabel,
    roleDept,
    dobLabel,
    dob,
    bloodLabel,
    bloodGroup,
    phoneLabel,
    phone,
    validTillLabel,
    validTill,
    showExtraField,
    extraFieldLabel,
    extraFieldValue,
    orgFontSize,
    nameFontSize,
    idHighlightColor,
    headerColor,
    accentColor,
    cardBgColor,
    footerText,
    loadedPhotoImg,
    photoZoom,
    photoPanX,
    photoPanY,
  ]);

  // =========================================================================
  // CORE RENDERER: BACK CARD (CR80 1012 × 638 px @ 300 DPI)
  // =========================================================================
  const renderBackCard = useCallback(() => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CR80_W;
    canvas.height = CR80_H;

    ctx.save();
    ctx.clearRect(0, 0, CR80_W, CR80_H);

    // 1. Clip CR80 Rounded Card Boundary
    roundedRect(ctx, 0, 0, CR80_W, CR80_H, CR80_RADIUS);
    ctx.clip();

    // 2. Base Card Background
    ctx.fillStyle = cardBgColor;
    ctx.fillRect(0, 0, CR80_W, CR80_H);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, CR80_W, CR80_H);

    // 3. Header Banner
    const headerHeight = 65;
    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, CR80_W, headerHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(backHeader.toUpperCase(), CR80_W / 2, headerHeight / 2);

    // Accent Stripe
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, headerHeight, CR80_W, 5);

    // 4. Residential Address Block (Left side)
    const contentX = 55;
    let currY = 105;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(addressTitle, contentX, currY);

    currY += 24;
    ctx.fillStyle = '#334155';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Wrap address nicely
    const maxAddressW = 560;
    const words = address.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxAddressW && n > 0) {
        ctx.fillText(line, contentX, currY);
        line = words[n] + ' ';
        currY += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, contentX, currY);

    // 5. Terms & Guidelines
    currY += 38;
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(termsTitle, contentX, currY);

    ctx.fillStyle = '#475569';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const bullets = [instruction1, instruction2, instruction3, instruction4].filter(Boolean);
    bullets.forEach((b) => {
      currY += 24;
      ctx.fillText(b, contentX, currY);
    });

    // 6. Right Side: Real Live QR Code
    const qrX = 740;
    const qrY = 110;
    const qrSize = 175;

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    roundedRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (loadedQrImg) {
      ctx.drawImage(loadedQrImg, qrX, qrY, qrSize, qrSize);
    }

    // QR Code caption
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(qrSubtext, qrX + qrSize / 2, qrY + qrSize + 22);
    ctx.restore();

    // 7. Bottom Section: Helpline on Left, Authorized Signature on Right
    const bottomY = CR80_H - 65;

    // Emergency Helpline
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(helpline, contentX, bottomY + 25);

    // Authorized Signatory Box on Right
    const signX = 740;
    const signW = 200;

    // Draw Signature (Typed Cursive or Transparent Processed Image)
    if (signatureMode === 'typed' && typedSignature) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#072642';
      ctx.font = 'italic 26px "Brush Script MT", "Caveat", "Dancing Script", cursive, sans-serif';
      ctx.fillText(typedSignature, signX + signW / 2, bottomY);
    } else if (loadedSigImg) {
      // Draw transparent processed signature image without white box overlay
      ctx.drawImage(loadedSigImg, signX + 15, bottomY - 35, signW - 30, 42);
    }

    // Signature Divider Line
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(signX, bottomY + 10);
    ctx.lineTo(signX + signW, bottomY + 10);
    ctx.stroke();

    // Signatory Label
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(signatoryTitle, signX + signW / 2, bottomY + 26);

    // Subtle Outer Card Border
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 1, 1, CR80_W - 2, CR80_H - 2, CR80_RADIUS);
    ctx.stroke();

    ctx.restore();
  }, [
    backHeader,
    addressTitle,
    address,
    termsTitle,
    instruction1,
    instruction2,
    instruction3,
    instruction4,
    helpline,
    signatoryTitle,
    headerColor,
    accentColor,
    cardBgColor,
    loadedQrImg,
    qrSubtext,
    signatureMode,
    typedSignature,
    loadedSigImg,
  ]);

  // Synchronous preview redraw
  useEffect(() => {
    renderFrontCard();
    renderBackCard();
  }, [renderFrontCard, renderBackCard]);

  // =========================================================================
  // LIVE PRINT SHEET RENDERER: ZERO TEXT OVERLAP BUG FIX
  // (Front & Back Pair side-by-side or stacked with abundant bottom clearance)
  // =========================================================================
  const renderPrintSheet = useCallback(() => {
    const sheetCanvas = sheetCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (!sheetCanvas || !frontCanvas || !backCanvas) return;

    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // Dimensions at 300 DPI:
    // 4x6" Sheet: 1800 × 1200 px (Landscape)
    // A4 Sheet: 2480 × 3508 px (Portrait)
    // Single CR80: 1012 × 638 px
    let sheetW = 1800;
    let sheetH = 1200;

    if (sheetLayout === 'a4-8') {
      sheetW = 2480;
      sheetH = 3508;
    } else if (sheetLayout === 'single-cr80') {
      sheetW = 1012;
      sheetH = 638;
    }

    sheetCanvas.width = sheetW;
    sheetCanvas.height = sheetH;

    // Fill Crisp Pure White Print Sheet
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sheetW, sheetH);

    const cardW = CR80_W;
    const cardH = CR80_H;

    const drawCardWithGuides = (cardCanvas: HTMLCanvasElement, x: number, y: number) => {
      ctx.drawImage(cardCanvas, x, y);

      if (cutGuideStyle === 'dotted') {
        ctx.save();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(x - 2, y - 2, cardW + 4, cardH + 4);
        ctx.restore();
      } else if (cutGuideStyle === 'solid') {
        ctx.save();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 1, y - 1, cardW + 2, cardH + 2);
        ctx.restore();
      } else if (cutGuideStyle === 'crop-marks') {
        const markLen = 22;
        ctx.save();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x - 4, y - markLen);
        ctx.lineTo(x - 4, y - 4);
        ctx.lineTo(x - markLen, y - 4);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + cardW + 4, y - markLen);
        ctx.lineTo(x + cardW + 4, y - 4);
        ctx.lineTo(x + cardW + markLen, y - 4);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x - 4, y + cardH + markLen);
        ctx.lineTo(x - 4, y + cardH + 4);
        ctx.lineTo(x - markLen, y + cardH + 4);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + cardW + 4, y + cardH + markLen);
        ctx.lineTo(x + cardW + 4, y + cardH + 4);
        ctx.lineTo(x + cardW + markLen, y + cardH + 4);
        ctx.stroke();
        ctx.restore();
      }
    };

    if (sheetLayout === '4x6-horizontal') {
      // 4×6" Side-by-Side (Horizontal Pair) - Zero Overlap!
      // Scale: 0.78 fits 2 cards horizontally with generous margins
      const scale = 0.78;
      const targetW = cardW * scale; // ~789 px
      const targetH = cardH * scale; // ~498 px
      const gapX = 60;

      const totalW = targetW * 2 + gapX; // ~1638 px
      const startX = Math.round((sheetW - totalW) / 2);
      const startY = Math.round((sheetH - targetH - 120) / 2); // Centered vertically above footer

      // Front Card (Left)
      ctx.save();
      ctx.translate(startX, startY);
      ctx.scale(scale, scale);
      drawCardWithGuides(frontCanvas, 0, 0);
      ctx.restore();

      // Back Card (Right)
      ctx.save();
      ctx.translate(startX + targetW + gapX, startY);
      ctx.scale(scale, scale);
      drawCardWithGuides(backCanvas, 0, 0);
      ctx.restore();

      // Card Type Sub-captions above each card
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONT SIDE', startX + targetW / 2, startY - 24);
      ctx.fillText('BACK SIDE', startX + targetW + gapX + targetW / 2, startY - 24);

      // Clean, spaced bottom footer note (Zero text overlap!)
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(sheetFooterNote, sheetW / 2, sheetH - 45);

      // Cutting separator centerline
      ctx.save();
      ctx.strokeStyle = '#CBD5E1';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sheetW / 2, startY - 35);
      ctx.lineTo(sheetW / 2, startY + targetH + 35);
      ctx.stroke();
      ctx.restore();

    } else if (sheetLayout === '4x6-vertical') {
      // 4×6" Stacked Vertically (Fold-over Pouch)
      // Scale 0.70 leaves 230 px of vertical margin so text never collides!
      const scale = 0.70;
      const targetW = cardW * scale; // ~708 px
      const targetH = cardH * scale; // ~446 px
      const gapY = 32;

      const totalH = targetH * 2 + gapY; // ~924 px
      const startX = Math.round((sheetW - targetW) / 2);
      const startY = 55;

      // Front Card (Top)
      ctx.save();
      ctx.translate(startX, startY);
      ctx.scale(scale, scale);
      drawCardWithGuides(frontCanvas, 0, 0);
      ctx.restore();

      // Back Card (Bottom)
      ctx.save();
      ctx.translate(startX, startY + targetH + gapY);
      ctx.scale(scale, scale);
      drawCardWithGuides(backCanvas, 0, 0);
      ctx.restore();

      // Footer note safely at the bottom
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sheetFooterNote, sheetW / 2, sheetH - 35);

    } else if (sheetLayout === 'a4-8') {
      // A4 Sheet: 4 pairs (8 cards total: 4 Front + 4 Back)
      const scale = 0.88;
      const targetW = cardW * scale;
      const targetH = cardH * scale;
      const gapX = 60;
      const gapY = 50;

      const totalGridW = targetW * 2 + gapX;
      const startX = Math.round((sheetW - totalGridW) / 2);
      const startY = 120;

      for (let r = 0; r < 4; r++) {
        const y = startY + r * (targetH + gapY);
        // Col 0: Front
        ctx.save();
        ctx.translate(startX, y);
        ctx.scale(scale, scale);
        drawCardWithGuides(frontCanvas, 0, 0);
        ctx.restore();

        // Col 1: Back
        ctx.save();
        ctx.translate(startX + targetW + gapX, y);
        ctx.scale(scale, scale);
        drawCardWithGuides(backCanvas, 0, 0);
        ctx.restore();
      }

      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('AOS Smart ID Card Studio • A4 High-Yield Print Sheet (4 Pairs / 8 Cards)', sheetW / 2, sheetH - 45);

    } else {
      // Single CR80 Direct Card
      drawCardWithGuides(frontCanvas, 0, 0);
    }
  }, [sheetLayout, cutGuideStyle, sheetFooterNote]);

  useEffect(() => {
    renderPrintSheet();
  }, [renderPrintSheet, renderFrontCard, renderBackCard]);

  // =========================================================================
  // VECTOR SVG GENERATOR: 100% PURE VECTOR CRISP OUTPUT (Zero Pixelation)
  // =========================================================================
  const generateFrontSvgString = (): string => {
    const photoDataHref = loadedPhotoImg?.src || '';
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CR80_W} ${CR80_H}" width="85.6mm" height="54mm">
  <defs>
    <clipPath id="cardClip">
      <rect x="0" y="0" width="${CR80_W}" height="${CR80_H}" rx="${CR80_RADIUS}" ry="${CR80_RADIUS}"/>
    </clipPath>
    <clipPath id="photoClip">
      <rect x="60" y="165" width="210" height="265" rx="12" ry="12"/>
    </clipPath>
    <linearGradient id="headerShine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.20"/>
    </linearGradient>
  </defs>

  <!-- Card Body -->
  <g clip-path="url(#cardClip)">
    <rect width="${CR80_W}" height="${CR80_H}" fill="${cardBgColor}"/>
    <rect width="${CR80_W}" height="${CR80_H}" fill="#F8FAFC"/>

    <!-- Top Header Banner -->
    <rect width="${CR80_W}" height="135" fill="${headerColor}"/>
    <rect width="${CR80_W}" height="135" fill="url(#headerShine)"/>
    
    <!-- Org Name -->
    <text x="${CR80_W / 2}" y="52" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${orgFontSize}" font-weight="bold" text-anchor="middle">${escapeXml(orgName.toUpperCase())}</text>
    
    <!-- Subtitle -->
    <text x="${CR80_W / 2}" y="88" fill="#FFFFFF" fill-opacity="0.9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" text-anchor="middle">${escapeXml(subtitle)}</text>
    
    <!-- Headline Ribbon -->
    <rect x="0" y="108" width="${CR80_W}" height="28" fill="#0F172A"/>
    <text x="${CR80_W / 2}" y="126" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${escapeXml(cardHeadline.toUpperCase())}</text>
    
    <!-- Accent Ribbon -->
    <rect x="0" y="135" width="${CR80_W}" height="6" fill="${accentColor}"/>

    <!-- Photo -->
    <g clip-path="url(#photoClip)">
      <rect x="60" y="165" width="210" height="265" fill="#E2E8F0"/>
      ${photoDataHref ? `<image href="${photoDataHref}" x="60" y="165" width="210" height="265" preserveAspectRatio="xMidYMid slice"/>` : ''}
    </g>
    <rect x="60" y="165" width="210" height="265" rx="12" ry="12" fill="none" stroke="#CBD5E1" stroke-width="2"/>

    <!-- Candidate Info -->
    <text x="310" y="188" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${nameFontSize}" font-weight="900">${escapeXml(candidateName.toUpperCase())}</text>
    
    <!-- ID Badge -->
    <rect x="310" y="209" width="220" height="28" rx="6" ry="6" fill="${idHighlightColor}1A" stroke="${idHighlightColor}66" stroke-width="1.2"/>
    <text x="322" y="228" fill="${idHighlightColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold">${escapeXml(idLabel)} ${escapeXml(idNumber)}</text>

    <!-- Details -->
    <text x="310" y="270" fill="#334155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600">${escapeXml(roleLabel)} ${escapeXml(roleDept)}</text>
    <text x="310" y="304" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500">${escapeXml(dobLabel)} ${escapeXml(dob)}   ${escapeXml(bloodLabel)} ${escapeXml(bloodGroup)}</text>
    <text x="310" y="336" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500">${escapeXml(phoneLabel)} ${escapeXml(phone)}</text>
    ${showExtraField ? `<text x="310" y="366" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16">${escapeXml(extraFieldLabel)} ${escapeXml(extraFieldValue)}</text>` : ''}
    <text x="310" y="${showExtraField ? 400 : 374}" fill="#0284c7" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="bold">${escapeXml(validTillLabel)} ${escapeXml(validTill)}</text>

    <!-- Bottom Footer Ribbon -->
    <rect x="0" y="${CR80_H - 34}" width="${CR80_W}" height="34" fill="#0F172A"/>
    <text x="${CR80_W / 2}" y="${CR80_H - 12}" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${escapeXml(footerText.toUpperCase())}</text>

    <!-- Outer Border -->
    <rect x="1" y="1" width="${CR80_W - 2}" height="${CR80_H - 2}" rx="${CR80_RADIUS}" ry="${CR80_RADIUS}" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  </g>
</svg>`;
  };

  const generateBackSvgString = (): string => {
    const qrHref = loadedQrImg?.src || '';
    const sigHref = loadedSigImg?.src || '';
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CR80_W} ${CR80_H}" width="85.6mm" height="54mm">
  <defs>
    <clipPath id="backCardClip">
      <rect x="0" y="0" width="${CR80_W}" height="${CR80_H}" rx="${CR80_RADIUS}" ry="${CR80_RADIUS}"/>
    </clipPath>
  </defs>

  <g clip-path="url(#backCardClip)">
    <rect width="${CR80_W}" height="${CR80_H}" fill="${cardBgColor}"/>
    <rect width="${CR80_W}" height="${CR80_H}" fill="#F8FAFC"/>

    <!-- Header -->
    <rect width="${CR80_W}" height="65" fill="${headerColor}"/>
    <text x="${CR80_W / 2}" y="38" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">${escapeXml(backHeader.toUpperCase())}</text>
    <rect x="0" y="65" width="${CR80_W}" height="5" fill="${accentColor}"/>

    <!-- Address -->
    <text x="55" y="110" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold">${escapeXml(addressTitle)}</text>
    <text x="55" y="134" fill="#334155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500">${escapeXml(address)}</text>

    <!-- Terms -->
    <text x="55" y="195" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="bold">${escapeXml(termsTitle)}</text>
    <text x="55" y="222" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">${escapeXml(instruction1)}</text>
    <text x="55" y="246" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">${escapeXml(instruction2)}</text>
    <text x="55" y="270" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">${escapeXml(instruction3)}</text>
    ${instruction4 ? `<text x="55" y="294" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13">${escapeXml(instruction4)}</text>` : ''}

    <!-- QR Code Block -->
    <rect x="732" y="102" width="191" height="191" rx="12" ry="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    ${qrHref ? `<image href="${qrHref}" x="740" y="110" width="175" height="175"/>` : ''}
    <text x="827" y="316" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${escapeXml(qrSubtext)}</text>

    <!-- Helpline -->
    <text x="55" y="${CR80_H - 40}" fill="#0284c7" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="bold">${escapeXml(helpline)}</text>

    <!-- Signatory -->
    ${signatureMode === 'typed'
      ? `<text x="840" y="${CR80_H - 65}" fill="#072642" font-family="'Brush Script MT', cursive, sans-serif" font-size="26" font-style="italic" text-anchor="middle">${escapeXml(typedSignature)}</text>`
      : sigHref ? `<image href="${sigHref}" x="755" y="${CR80_H - 100}" width="170" height="42"/>` : ''}
    <line x1="740" y1="${CR80_H - 55}" x2="940" y2="${CR80_H - 55}" stroke="#0F172A" stroke-width="1"/>
    <text x="840" y="${CR80_H - 39}" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${escapeXml(signatoryTitle)}</text>

    <rect x="1" y="1" width="${CR80_W - 2}" height="${CR80_H - 2}" rx="${CR80_RADIUS}" ry="${CR80_RADIUS}" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>
  </g>
</svg>`;
  };

  // Download SVG Vector File
  const handleDownloadSvg = (side: 'front' | 'back') => {
    const svgStr = side === 'front' ? generateFrontSvgString() : generateBackSvgString();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_CR80_${side === 'front' ? 'Front' : 'Back'}_Vector.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Ultra-High Resolution 600 DPI Download (2024 × 1276 px)
  const handleDownload600Dpi = (side: 'front' | 'back') => {
    const sourceCanvas = side === 'front' ? frontCanvasRef.current : backCanvasRef.current;
    if (!sourceCanvas) return;

    const hdCanvas = document.createElement('canvas');
    hdCanvas.width = CR80_W * 2; // 2024 px @ 600 DPI
    hdCanvas.height = CR80_H * 2; // 1276 px @ 600 DPI
    const ctx = hdCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, hdCanvas.width, hdCanvas.height);

    const url = hdCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_CR80_${side === 'front' ? 'Front' : 'Back'}_600DPI_UltraHD.png`;
    link.click();
  };

  // Standard Downloads
  const handleDownloadFrontJpg = () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_CR80_Front_300DPI.jpg`;
    link.click();
  };

  const handleDownloadBackJpg = () => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_CR80_Back_300DPI.jpg`;
    link.click();
  };

  const handleDownloadSheetJpg = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AOS_CR80_PrintSheet_300DPI.jpg`;
    link.click();
  };

  // Safe Iframe Direct Print
  const handleDirectPrint = () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);

    const isA4 = sheetLayout === 'a4-8';
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
          <title>AOS Smart ID Card Studio - Print Sheet</title>
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

  // Download PDF Sheet
  const handleDownloadPdf = async () => {
    try {
      const sheetCanvas = sheetCanvasRef.current;
      if (!sheetCanvas) return;

      const pdfDoc = await PDFDocument.create();
      const isA4 = sheetLayout === 'a4-8';

      // 4×6 inch: 432 × 288 pt (Landscape) | A4: 595.28 × 841.89 pt
      const pageW = isA4 ? 595.28 : 432;
      const pageH = isA4 ? 841.89 : 288;

      const page = pdfDoc.addPage([pageW, pageH]);
      const jpgDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);
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
      link.download = `AOS_Smart_ID_Card_${isA4 ? 'A4' : '4x6'}_PrintReady.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  // Upload Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
        setPhotoZoom(1.0);
        setPhotoPanX(0);
        setPhotoPanY(0);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawSignatureSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={signInputRef}
        accept="image/*"
        onChange={handleSignatureUpload}
        className="hidden"
      />

      {/* TOP BAR NAVIGATION */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CR80 300/600 DPI Studio
          </span>
        </div>
      </div>

      {/* MAIN STUDIO BANNER CARD */}
      <div className="p-4 sm:p-5 rounded-2xl liquid-glass shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/30 shrink-0">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Smart ID Card Studio
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-[#072642] border border-sky-400/40 text-[#0284c7] dark:text-[#38bdf8] whitespace-nowrap shrink-0 inline-flex items-center">
                100% CUSTOM EDITING
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Full text &amp; header control • Auto-transparent signature • Vector SVG &amp; 600 DPI output
            </p>
            <StarRatingWidget toolId="smart-id-card-studio" toolName="Smart ID Card Studio" className="pt-2" />
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setActiveTab('export')}
            className="px-3.5 py-2 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <FileCode className="w-4 h-4 text-[#0284c7]" />
            <span>Vector SVG</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 rounded-xl bg-[#072642] hover:bg-[#0d4775] text-white border border-[#38bdf8]/40 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#0284c7]/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Illustrative Architecture & CR80 Standard Card */}
      <SmartIdCardGraphicCard />

      {/* =========================================================================
          SECTION 1: LIVE CR80 CARD PREVIEW (FRONT & BACK DUAL VIEW)
          ========================================================================= */}
      <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#0284c7]" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              Live CR80 Card Preview (85.6 × 54 mm Standard)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload600Dpi('front')}
              className="px-2.5 py-1 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Download Ultra High-DPI 600 DPI PNG"
            >
              <Download className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Front HD (600 DPI)</span>
            </button>
            <button
              onClick={() => handleDownload600Dpi('back')}
              className="px-2.5 py-1 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Download Ultra High-DPI 600 DPI PNG"
            >
              <Download className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Back HD (600 DPI)</span>
            </button>
          </div>
        </div>

        {/* 2 Previews Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Front Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold">Front Side (CR80 PVC)</span>
              <span className="font-mono text-[10px] text-[#0284c7] font-bold bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                300/600 DPI Ready
              </span>
            </div>
            <div className="p-3 liquid-glass-sub rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
              <canvas
                ref={frontCanvasRef}
                className="w-full aspect-[1012/638] rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 bg-white object-contain"
              />
            </div>
          </div>

          {/* Back Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold">Back Side (QR &amp; Address)</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Live QR &amp; Transparent Sign
              </span>
            </div>
            <div className="p-3 liquid-glass-sub rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
              <canvas
                ref={backCanvasRef}
                className="w-full aspect-[1012/638] rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 bg-white object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: TABBED CONTROLS NAVIGATION
          ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'front', label: 'Front Fields & Headers', icon: User },
          { id: 'back', label: 'Back & Terms', icon: FileText },
          { id: 'colors', label: 'Header & Colors', icon: Palette },
          { id: 'photo', label: 'Photo & Transparent Sign', icon: ImageIcon },
          { id: 'qr', label: 'QR Code Generator', icon: QrCode },
          { id: 'print', label: 'Print Sheet Layout', icon: Printer },
          { id: 'export', label: 'Vector SVG & High-DPI', icon: FileCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0284c7] text-white shadow-lg shadow-[#0284c7]/40 ring-2 ring-[#0284c7]'
                  : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-[#0284c7]/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: FRONT FIELDS & ALL HEADERS (100% Fully Editable)
          ========================================================================= */}
      {activeTab === 'front' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          
          {/* Header 1: Organization Name & Subtitle */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3">
            <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Top Organization Headers</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Top Header (Organization / Institution Name)
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. NATIONAL INSTITUTE OF TECHNOLOGY"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Subtitle / Tagline (Under Org Name)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. An Autonomous Institution • Govt. of India"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Card Headline Ribbon Text
                </label>
                <input
                  type="text"
                  value={cardHeadline}
                  onChange={(e) => setCardHeadline(e.target.value)}
                  placeholder="e.g. STUDENT IDENTITY CARD or EMPLOYEE ID"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Card Bottom Header / Sub-Footer Text
                </label>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. VALID FOR ACADEMIC & OFFICIAL ENTRY"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Candidate Details */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-4">
            <span className="text-xs font-bold text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Candidate Information &amp; Labels</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Candidate Full Name
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">Size: {nameFontSize}px</span>
                </div>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. ROHIT RAJPUT"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-black"
                />
              </div>

              {/* ID Number with editable Label */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    ID Label
                  </label>
                  <input
                    type="text"
                    value={idLabel}
                    onChange={(e) => setIdLabel(e.target.value)}
                    placeholder="ID:"
                    className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    ID / Roll / Reg Number
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. NIT-2026-0849"
                    className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Role Label
                </label>
                <input
                  type="text"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  placeholder="Role/Class:"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-semibold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Course / Role / Department Value
                </label>
                <input
                  type="text"
                  value={roleDept}
                  onChange={(e) => setRoleDept(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science (CSE)"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>

            {/* DOB, Blood Group, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="14/07/2003"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Blood Group
                </label>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  placeholder="O+"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>

            {/* Valid Upto Date (Fully Editable Label & Date) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-white/5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  'Valid Upto' Label Text
                </label>
                <input
                  type="text"
                  value={validTillLabel}
                  onChange={(e) => setValidTillLabel(e.target.value)}
                  placeholder="VALID UPTO:"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold text-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  'Valid Upto' Expiry Date
                </label>
                <input
                  type="text"
                  value={validTill}
                  onChange={(e) => setValidTill(e.target.value)}
                  placeholder="30/06/2027"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold text-[#0284c7]"
                />
              </div>
            </div>

            {/* Optional Extra Custom Field Toggle */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showExtraField}
                  onChange={(e) => setShowExtraField(e.target.checked)}
                  className="w-4 h-4 accent-[#0284c7] rounded"
                />
                <span>Add Extra Field (e.g. Father's Name, Batch, or Emergency Contact)</span>
              </label>

              {showExtraField && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-in fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Custom Label
                    </label>
                    <input
                      type="text"
                      value={extraFieldLabel}
                      onChange={(e) => setExtraFieldLabel(e.target.value)}
                      placeholder="Father's Name:"
                      className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Custom Value
                    </label>
                    <input
                      type="text"
                      value={extraFieldValue}
                      onChange={(e) => setExtraFieldValue(e.target.value)}
                      placeholder="e.g. Ramesh Rajput"
                      className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Typography Sliders & ID Highlight Color */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                <span>Top Header Font Size:</span>
                <span className="font-mono text-[#0284c7] font-bold">{orgFontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="40"
                value={orgFontSize}
                onChange={(e) => setOrgFontSize(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                <span>Candidate Name Size:</span>
                <span className="font-mono text-[#0284c7] font-bold">{nameFontSize}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="44"
                value={nameFontSize}
                onChange={(e) => setNameFontSize(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                <span>ID Highlight Color:</span>
                <span className="font-mono text-[11px] text-[#0284c7] font-bold">{idHighlightColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={idHighlightColor}
                  onChange={(e) => setIdHighlightColor(e.target.value)}
                  className="w-9 h-8 rounded-lg bg-transparent border border-slate-300 dark:border-white/20 cursor-pointer"
                />
                <div className="flex gap-1.5">
                  {['#0284c7', '#0369a1', '#059669', '#d97706', '#7c3aed'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setIdHighlightColor(col)}
                      className="w-6 h-6 rounded-md border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BACK & TERMS (100% Fully Editable)
          ========================================================================= */}
      {activeTab === 'back' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Back Header Title Text
            </label>
            <input
              type="text"
              value={backHeader}
              onChange={(e) => setBackHeader(e.target.value)}
              placeholder="e.g. TERMS & RESIDENTIAL ADDRESS"
              className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold"
            />
          </div>

          {/* Residence Address Full Controls */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Address Section Title
                </label>
                <input
                  type="text"
                  value={addressTitle}
                  onChange={(e) => setAddressTitle(e.target.value)}
                  placeholder="Residential Address:"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Residence Address Text (Wraps nicely on card)
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full residential address..."
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions Full Controls */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Terms &amp; Conditions Section Title
              </label>
              <input
                type="text"
                value={termsTitle}
                onChange={(e) => setTermsTitle(e.target.value)}
                placeholder="Instructions & Guidelines:"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7] font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                Terms &amp; Instructions Bullet Points
              </label>
              <input
                type="text"
                value={instruction1}
                onChange={(e) => setInstruction1(e.target.value)}
                placeholder="Rule 1"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
              />
              <input
                type="text"
                value={instruction2}
                onChange={(e) => setInstruction2(e.target.value)}
                placeholder="Rule 2"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
              />
              <input
                type="text"
                value={instruction3}
                onChange={(e) => setInstruction3(e.target.value)}
                placeholder="Rule 3"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
              />
              <input
                type="text"
                value={instruction4}
                onChange={(e) => setInstruction4(e.target.value)}
                placeholder="Rule 4 (Optional extra rule)"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7]"
              />
            </div>
          </div>

          {/* Helpline & Signatory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Emergency Helpline / Contact
              </label>
              <input
                type="text"
                value={helpline}
                onChange={(e) => setHelpline(e.target.value)}
                className="w-full liquid-glass-sub text-[#0284c7] text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Signatory Title
              </label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="Authorized Signatory / Principal"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HEADER & COLOR THEMES (Professional Blue Theme)
          ========================================================================= */}
      {activeTab === 'colors' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Color Palette Presets (Anis Online Services Blue &amp; Corporate)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'AOS Royal Blue', header: '#072642', accent: '#38bdf8' },
                { name: 'Prussian Navy', header: '#0a3356', accent: '#0284c7' },
                { name: 'Corporate Cobalt', header: '#1e3a8a', accent: '#fbbf24' },
                { name: 'Emerald Forest', header: '#065f46', accent: '#34d399' },
                { name: 'Obsidian Noir', header: '#0f172a', accent: '#94a3b8' },
                { name: 'Executive Teal', header: '#134e4a', accent: '#2dd4bf' },
                { name: 'Violet Tech', header: '#4c1d95', accent: '#c084fc' },
                { name: 'Steel Modern', header: '#334155', accent: '#38bdf8' },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setHeaderColor(p.header);
                    setAccentColor(p.accent);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    headerColor === p.header
                      ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white shadow-md'
                      : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: p.header }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: p.accent }} />
                  </div>
                  <div className="text-xs font-bold">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Custom Header Banner Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-slate-300 dark:border-white/20 cursor-pointer"
                />
                <input
                  type="text"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Accent Stripe Ribbon Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-slate-300 dark:border-white/20 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PHOTO & SIGNATURE (With Automatic White Background Removal)
          ========================================================================= */}
      {activeTab === 'photo' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-6 animate-in fade-in duration-150">
          
          {/* Candidate Photo Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#0284c7]" />
                Candidate Photograph
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPhotoSrc(getStockDemoPortraitDataUrl());
                    setPhotoZoom(1.0);
                    setPhotoPanX(0);
                    setPhotoPanY(0);
                  }}
                  className="px-2.5 py-1 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#0284c7]" />
                  <span>Use Sample</span>
                </button>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Adjust Photo Scale & Pan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                  <span>Photo Zoom Scale</span>
                  <span className="font-mono text-[#0284c7] font-bold">{photoZoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.05"
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                  <span>Pan Horizontal</span>
                  <span className="font-mono">{photoPanX}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={photoPanX}
                  onChange={(e) => setPhotoPanX(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                  <span>Pan Vertical</span>
                  <span className="font-mono">{photoPanY}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={photoPanY}
                  onChange={(e) => setPhotoPanY(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SIGNATURE SECTION (WITH AUTOMATIC WHITE BACKGROUND REMOVAL & INK ENHANCE)
              ========================================================================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-[#0284c7]" />
                Authorized Signature &amp; Background Remover
              </span>
              <div className="flex items-center gap-1 liquid-glass-sub p-1 rounded-lg border border-slate-200 dark:border-white/10">
                {(['typed', 'upload'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSignatureMode(mode)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      signatureMode === mode
                        ? 'bg-[#0284c7] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mode === 'typed' ? 'Digital Cursive' : 'Upload Signature'}
                  </button>
                ))}
              </div>
            </div>

            {signatureMode === 'typed' ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Signatory Name (Rendered in Cursive Script)
                </label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="e.g. Rohit Rajput"
                  className="w-full liquid-glass-sub text-slate-900 dark:text-white text-base px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-serif italic"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => signInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Signature Image (Photo / Scan)</span>
                  </button>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {rawSignatureSrc ? 'Custom Signature Loaded' : 'Upload any paper or phone photo of signature'}
                  </span>
                </div>

                {/* Background Removal Engine Controls */}
                {rawSignatureSrc && (
                  <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={removeSigBg}
                          onChange={(e) => setRemoveSigBg(e.target.checked)}
                          className="w-4 h-4 accent-[#0284c7] rounded"
                        />
                        <Wand2 className="w-4 h-4 text-[#0284c7]" />
                        <span>Auto-Remove White / Paper Background (Instant Transparent Alpha)</span>
                      </label>

                      {isProcessingSig && (
                        <span className="text-[11px] font-mono text-[#0284c7] animate-pulse">
                          Processing ink...
                        </span>
                      )}
                    </div>

                    {removeSigBg && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1">
                            <span>Background Clean Sensitivity</span>
                            <span className="font-mono text-[#0284c7] font-bold">{sigBgThreshold}</span>
                          </div>
                          <input
                            type="range"
                            min="160"
                            max="245"
                            value={sigBgThreshold}
                            onChange={(e) => setSigBgThreshold(parseInt(e.target.value, 10))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                            <span>Light Paper</span>
                            <span>Standard</span>
                            <span>Yellowed / Dark Paper</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Ink Color Enhancement
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'navy', label: 'Royal Navy' },
                              { id: 'black', label: 'Classic Black' },
                              { id: 'original', label: 'Original Ink' },
                            ].map((c) => (
                              <button
                                key={c.id}
                                onClick={() => setSigColorMode(c.id as SigColorMode)}
                                className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                  sigColorMode === c.id
                                    ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white'
                                    : 'liquid-glass text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Transparency Checkerboard Preview of Cleaned Signature */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Signature Transparency Preview:
                      </span>
                      <div
                        className="w-full h-16 rounded-xl border border-slate-300 dark:border-white/20 flex items-center justify-center p-2"
                        style={{
                          backgroundImage:
                            'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)',
                          backgroundSize: '16px 16px',
                        }}
                      >
                        {signatureSrc ? (
                          <img
                            src={signatureSrc}
                            alt="Transparent signature"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No signature image</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: QR CODE GENERATOR
          ========================================================================= */}
      {activeTab === 'qr' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Live QR Code Verification Payload (URL, ID, or Contact)
            </label>
            <input
              type="text"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="https://verify.nit.ac.in/id/NIT-2026-0849"
              className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7] font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setQrData(`https://verify.nit.ac.in/id/${idNumber}`)}
              className="px-3 py-1.5 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-[#0284c7] hover:text-[#0369a1] font-semibold cursor-pointer"
            >
              Set Official Verification URL
            </button>
            <button
              onClick={() => setQrData(`MECARD:N:${candidateName};TEL:${phone};NOTE:ID-${idNumber};;`)}
              className="px-3 py-1.5 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-[#0284c7] hover:text-[#0369a1] font-semibold cursor-pointer"
            >
              Generate Contact vCard
            </button>
            <button
              onClick={() => setQrData(`REG:${idNumber} | NAME:${candidateName} | DEPT:${roleDept}`)}
              className="px-3 py-1.5 rounded-lg liquid-glass-sub hover:border-[#0284c7]/50 text-xs text-[#0284c7] hover:text-[#0369a1] font-semibold cursor-pointer"
            >
              Plain Student Metadata
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              QR Caption Subtext (Under QR Code on Back)
            </label>
            <input
              type="text"
              value={qrSubtext}
              onChange={(e) => setQrSubtext(e.target.value)}
              placeholder="Scan to Verify"
              className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#0284c7] font-semibold"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PRINT SHEET LAYOUT (Fixed Zero Text Overlap Bug)
          ========================================================================= */}
      {activeTab === 'print' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 flex-wrap gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#0284c7]" />
              Print Sheet Layout &amp; Card Alignment
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
              300 DPI Studio Sheet
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { id: '4x6-horizontal', title: '4×6" Side-by-Side (Recommended)', sub: 'Zero overlap horizontal pair for pouch' },
              { id: '4x6-vertical', title: '4×6" Vertical Stacked', sub: 'Top & bottom fold pair' },
              { id: 'a4-8', title: 'A4 Sheet (8 Cards / 4 Pairs)', sub: 'High-yield batch sheet with cut lines' },
              { id: 'single-cr80', title: 'Single CR80 PVC Direct', sub: '85.6 × 54 mm direct for thermal printer' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSheetLayout(p.id as SheetLayoutOption)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  sheetLayout === p.id
                    ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white shadow-md'
                    : 'liquid-glass-sub text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{p.title}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{p.sub}</div>
              </button>
            ))}
          </div>

          {/* Cutting Guides & Footer Note Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                Cutting Guide Marks
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dotted', label: 'Dotted Grid', sub: 'Scissors line' },
                  { id: 'crop-marks', label: 'Corner Marks', sub: 'L-Crop Marks' },
                  { id: 'solid', label: 'Continuous Line', sub: 'Paper trimmer' },
                  { id: 'none', label: 'Clean Blank', sub: 'No guides' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCutGuideStyle(c.id as CutGuideStyle)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      cutGuideStyle === c.id
                        ? 'border-[#0284c7] bg-[#0284c7]/20 text-[#0284c7] dark:text-white'
                        : 'liquid-glass-sub text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{c.label}</div>
                    <div className="text-[10px] opacity-75">{c.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                Bottom Sheet Note Text (Positioned Cleanly Underneath)
              </label>
              <input
                type="text"
                value={sheetFooterNote}
                onChange={(e) => setSheetFooterNote(e.target.value)}
                placeholder="AOS Smart ID Card Studio • 4x6 Print Sheet"
                className="w-full liquid-glass-sub text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0284c7]"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Zero Overlap Guarantee: Positioned at bottom with safe clearance margin away from card boundaries.
              </p>
            </div>
          </div>

          {/* Live Print Sheet Canvas */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Live Print Sheet Canvas Preview:
            </span>
            <div className="p-3 liquid-glass-sub rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
              <canvas
                ref={sheetCanvasRef}
                className="w-full max-w-2xl rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 bg-white object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: VECTOR SVG & ULTRA-HIGH RESOLUTION 600 DPI EXPORTS
          ========================================================================= */}
      {activeTab === 'export' && (
        <div className="rounded-2xl liquid-glass p-5 shadow-xl space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-200 dark:border-white/10 pb-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0284c7]" />
              <span>Ultra-Crisp Export Engine (Vector SVG &amp; 600 DPI HD)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Download pure vector SVGs with infinite zoom sharpness or ultra-high resolution 600 DPI images for professional PVC card printers.
            </p>
          </div>

          {/* 1. Vector SVG Section */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#0284c7]" />
                  <span>Pure Vector SVG Downloads (CorelDraw &amp; Illustrator Ready)</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  100% vector typography and lines. Zero pixelation at any physical size or resolution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleDownloadSvg('front')}
                className="p-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Front Card (SVG Vector)</span>
              </button>

              <button
                onClick={() => handleDownloadSvg('back')}
                className="p-3 rounded-xl bg-[#072642] hover:bg-[#0d4775] text-white border border-[#38bdf8]/40 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Download Back Card (SVG Vector)</span>
              </button>
            </div>
          </div>

          {/* 2. Ultra 600 DPI High-Definition Images */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ultra 600 DPI High-Definition Images (2024 × 1276 px)</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Rendered at 2× native scale for high-end thermal dye sublimation and UV flatbed card printers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleDownload600Dpi('front')}
                className="p-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-[#0284c7]" />
                <span>Download Front (600 DPI HD PNG)</span>
              </button>

              <button
                onClick={() => handleDownload600Dpi('back')}
                className="p-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-[#0284c7]" />
                <span>Download Back (600 DPI HD PNG)</span>
              </button>
            </div>
          </div>

          {/* 3. Sheet & PDF Direct Prints */}
          <div className="p-4 rounded-xl liquid-glass-sub border border-slate-200 dark:border-white/10 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-[#0284c7]" />
              <span>Full Print Sheets &amp; PDF</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={handleDownloadPdf}
                className="p-3 rounded-xl bg-[#072642] hover:bg-[#0d4775] text-white border border-[#38bdf8]/40 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <FileDown className="w-4 h-4 text-sky-400" />
                <span>Print Ready PDF</span>
              </button>

              <button
                onClick={handleDownloadSheetJpg}
                className="p-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-[#0284c7]" />
                <span>Sheet JPG (300 DPI)</span>
              </button>

              <button
                onClick={handleDirectPrint}
                className="p-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Direct Print Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
