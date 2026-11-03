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
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { getStockDemoPortraitDataUrl } from '../utils/stockPassportPhoto';

interface SmartIdCardStudioPageProps {
  onBack: () => void;
}

type StudioTab = 'front' | 'back' | 'colors' | 'photo' | 'qr' | 'print';

export const SmartIdCardStudioPage: React.FC<SmartIdCardStudioPageProps> = ({ onBack }) => {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<StudioTab>('front');

  // --- 1. FRONT FIELDS STATE (Matching Screenshot exactly) ---
  const [orgName, setOrgName] = useState<string>('NATIONAL INSTITUTE OF TECHNOLOGY');
  const [subtitle, setSubtitle] = useState<string>('An Autonomous Institution • Govt. of India');
  const [cardHeadline, setCardHeadline] = useState<string>('STUDENT IDENTITY CARD');
  const [candidateName, setCandidateName] = useState<string>('ROHIT RAJPUT');
  const [idNumber, setIdNumber] = useState<string>('NIT-2026-0849');
  const [roleDept, setRoleDept] = useState<string>('B.Tech Computer Science (CSE)');
  const [dob, setDob] = useState<string>('14/07/2003');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [validTill, setValidTill] = useState<string>('30/06/2027');

  // Front Font & Highlight settings
  const [orgFontSize, setOrgFontSize] = useState<number>(30); // px on 1012px canvas
  const [nameFontSize, setNameFontSize] = useState<number>(34);
  const [idHighlightColor, setIdHighlightColor] = useState<string>('#2563eb');

  // --- 2. BACK & TERMS STATE ---
  const [backHeader, setBackHeader] = useState<string>('TERMS & RESIDENTIAL ADDRESS');
  const [address, setAddress] = useState<string>(
    'House 40, Civil Lines, Main University Road, Patna, Bihar - 800001'
  );
  const [instruction1, setInstruction1] = useState<string>(
    '1. This card is non-transferable and remains property of the institute.'
  );
  const [instruction2, setInstruction2] = useState<string>(
    '2. If found, please return to the administrative office.'
  );
  const [instruction3, setInstruction3] = useState<string>(
    '3. Misuse of this identification card is strictly punishable.'
  );
  const [helpline, setHelpline] = useState<string>('Helpline: 1800-111-5232 | Police: 112');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Authorized Signatory');

  // --- 3. HEADER & COLOR THEMES ---
  const [headerColor, setHeaderColor] = useState<string>('#1E3A8A'); // Deep Navy Blue
  const [accentColor, setAccentColor] = useState<string>('#D4AF37'); // Gold Accent Ribbon
  const [cardBgColor, setCardBgColor] = useState<string>('#FFFFFF');
  const [footerText, setFooterText] = useState<string>('VALID FOR ACADEMIC & OFFICIAL ENTRY');

  // --- 4. PHOTO & SIGNATURE STATE ---
  const [photoSrc, setPhotoSrc] = useState<string>('');
  const [photoZoom, setPhotoZoom] = useState<number>(1.0);
  const [photoPanX, setPhotoPanX] = useState<number>(0);
  const [photoPanY, setPhotoPanY] = useState<number>(0);

  const [signatureMode, setSignatureMode] = useState<'typed' | 'draw' | 'upload'>('typed');
  const [typedSignature, setTypedSignature] = useState<string>('Rohit Rajput');
  const [signatureSrc, setSignatureSrc] = useState<string>('');

  // --- 5. QR CODE STATE ---
  const [qrData, setQrData] = useState<string>('https://verify.nit.ac.in/id/NIT-2026-0849');
  const [qrSubtext, setQrSubtext] = useState<string>('Scan to Verify');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // --- 6. PRINT SHEET SETTINGS ---
  const [sheetLayout, setSheetLayout] = useState<'4x6-2' | 'a4-8' | 'single-cr80'>('4x6-2');
  const [cutGuideStyle, setCutGuideStyle] = useState<'dotted' | 'solid' | 'crop-marks' | 'none'>('dotted');

  // Canvases
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);
  const signaturePadCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Preloaded image element states for synchronous canvas rendering
  const [loadedPhotoImg, setLoadedPhotoImg] = useState<HTMLImageElement | null>(null);
  const [loadedQrImg, setLoadedQrImg] = useState<HTMLImageElement | null>(null);
  const [loadedSigImg, setLoadedSigImg] = useState<HTMLImageElement | null>(null);

  // Initialize sample portrait and QR Code
  useEffect(() => {
    // Generate QR Code data URL
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

  // Preload photo image
  useEffect(() => {
    if (!photoSrc) {
      setLoadedPhotoImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
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

  // Preload Signature image
  useEffect(() => {
    if (!signatureSrc) {
      setLoadedSigImg(null);
      return;
    }
    const img = new Image();
    img.onload = () => setLoadedSigImg(img);
    img.src = signatureSrc;
  }, [signatureSrc]);

  // Standard CR80 pixel dimensions @ 300 DPI (85.6 mm x 54 mm)
  const CR80_W = 1012;
  const CR80_H = 638;
  const CR80_RADIUS = 36;

  // Helper: Draw Rounded Rectangle Path
  const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
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

  // --- RENDER FRONT CARD ---
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

    // Subtle background watermark pattern (fine micro-dots for official security feel)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, CR80_W, CR80_H);

    // 3. Top Header Banner
    const headerHeight = 135;
    ctx.fillStyle = headerColor;
    ctx.fillRect(0, 0, CR80_W, headerHeight);

    // Subtle gradient shine on header
    const shineGrad = ctx.createLinearGradient(0, 0, CR80_W, headerHeight);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    shineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(0, 0, CR80_W, headerHeight);

    // Organization Name
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${orgFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(orgName.toUpperCase(), CR80_W / 2, 48);

    // Subtitle / Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(subtitle, CR80_W / 2, 85);

    // Headline Ribbon (STUDENT IDENTITY CARD)
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 108, CR80_W, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(cardHeadline.toUpperCase(), CR80_W / 2, 122);
    ctx.letterSpacing = '0px';

    // Accent Line Divider (Gold Strip)
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, headerHeight, CR80_W, 6);

    // 4. Photo Frame (Left side)
    const photoX = 60;
    const photoY = 165;
    const photoW = 210;
    const photoH = 265;
    const photoR = 12;

    // Photo Box Background & Clip
    ctx.save();
    roundedRect(ctx, photoX, photoY, photoW, photoH, photoR);
    ctx.clip();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(photoX, photoY, photoW, photoH);

    // Draw Candidate Photo Synchronously
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

      const cropW = baseCropW / photoZoom;
      const cropH = baseCropH / photoZoom;
      const cx = srcW / 2 + (photoPanX / 100) * (srcW / 4);
      const cy = srcH / 2 + (photoPanY / 100) * (srcH / 4);

      let sx = cx - cropW / 2;
      let sy = cy - cropH / 2;
      sx = Math.max(0, Math.min(srcW - cropW, sx));
      sy = Math.max(0, Math.min(srcH - cropH, sy));

      ctx.drawImage(loadedPhotoImg, sx, sy, cropW, cropH, photoX, photoY, photoW, photoH);
    } else {
      // Default clean avatar silhouette
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + 95, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(photoX + photoW / 2, photoY + 230, 80, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // CRITICAL: Restore immediately so text and footer are NEVER clipped!
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
    currY += 40;
    const idPillText = `ID: ${idNumber}`;
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const pillW = ctx.measureText(idPillText).width + 24;
    ctx.fillStyle = `${idHighlightColor}1A`; // 10% opacity tint
    roundedRect(ctx, textX, currY - 18, pillW, 28, 6);
    ctx.fill();
    ctx.strokeStyle = `${idHighlightColor}66`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = idHighlightColor;
    ctx.fillText(idPillText, textX + 12, currY + 2);

    // Role / Course / Department
    currY += 42;
    ctx.fillStyle = '#334155';
    ctx.font = '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Role/Class: ${roleDept}`, textX, currY);

    // Date of Birth & Blood Group
    currY += 34;
    ctx.fillStyle = '#475569';
    ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`DOB: ${dob}   Blood: ${bloodGroup}`, textX, currY);

    // Contact Phone
    currY += 34;
    ctx.fillText(`Phone: ${phone}`, textX, currY);

    // Valid Till / Expiry
    currY += 34;
    ctx.fillStyle = '#DC2626'; // Red accent
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`VALID UPTO: ${validTill}`, textX, currY);

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
    idNumber,
    roleDept,
    dob,
    bloodGroup,
    phone,
    validTill,
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

  // --- RENDER BACK CARD ---
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
    ctx.fillText('Residential Address:', contentX, currY);

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

    // 5. Instructions & Guidelines
    currY += 38;
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Instructions & Guidelines:', contentX, currY);

    ctx.fillStyle = '#475569';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const bullets = [instruction1, instruction2, instruction3].filter(Boolean);
    bullets.forEach((b) => {
      currY += 24;
      ctx.fillText(b, contentX, currY);
    });

    // 6. Right Side: Real Live QR Code
    const qrX = 740;
    const qrY = 115;
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
    ctx.fillStyle = '#B91C1C';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(helpline, contentX, bottomY + 25);

    // Authorized Signatory Box on Right
    const signX = 750;
    const signW = 190;

    // Draw Signature (Typed Cursive, Canvas Drawn, or Uploaded)
    if (signatureMode === 'typed' && typedSignature) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'italic 26px "Brush Script MT", "Caveat", "Dancing Script", cursive, sans-serif';
      ctx.fillText(typedSignature, signX + signW / 2, bottomY);
    } else if (loadedSigImg) {
      ctx.drawImage(loadedSigImg, signX + 20, bottomY - 30, signW - 40, 36);
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
    address,
    instruction1,
    instruction2,
    instruction3,
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

  // Update card previews whenever relevant dependencies change
  useEffect(() => {
    renderFrontCard();
    renderBackCard();
  }, [renderFrontCard, renderBackCard]);

  // --- RENDER PRINT SHEET CANVAS ---
  const renderPrintSheet = useCallback(() => {
    const sheetCanvas = sheetCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (!sheetCanvas || !frontCanvas || !backCanvas) return;

    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // Dimensions:
    // 4x6" @ 300 DPI = 1800 x 1200 px (Landscape)
    // A4 @ 300 DPI = 2480 x 3508 px (Portrait)
    // Single CR80 = 1012 x 638 px
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

    if (sheetLayout === '4x6-2') {
      // 4x6" Sheet: Front & Back side-by-side or stacked
      // Scale cards slightly to fit 4x6 (1800 x 1200) with safe cutting margins
      // 2 cards stacked vertically or side-by-side:
      const scale = 0.86;
      const targetW = cardW * scale;
      const targetH = cardH * scale;

      const gap = 40;
      const totalH = targetH * 2 + gap;
      const startX = (sheetW - targetW) / 2;
      const startY = (sheetH - totalH) / 2 - 20;

      // Draw Front Card
      ctx.save();
      ctx.translate(startX, startY);
      ctx.scale(scale, scale);
      drawCardWithGuides(frontCanvas, 0, 0);
      ctx.restore();

      // Draw Back Card
      ctx.save();
      ctx.translate(startX, startY + targetH + gap);
      ctx.scale(scale, scale);
      drawCardWithGuides(backCanvas, 0, 0);
      ctx.restore();

      // Footer stamp
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('AOS Smart ID Card Studio • 4×6" Print Sheet (Front & Back Pair)', sheetW / 2, sheetH - 35);
    } else if (sheetLayout === 'a4-8') {
      // A4 Sheet: 4 pairs (8 cards: 4 Front + 4 Back in 2 columns x 4 rows)
      const scale = 0.88;
      const targetW = cardW * scale;
      const targetH = cardH * scale;
      const gapX = 60;
      const gapY = 50;

      const totalGridW = targetW * 2 + gapX;
      const startX = (sheetW - totalGridW) / 2;
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
  }, [sheetLayout, cutGuideStyle]);

  useEffect(() => {
    renderPrintSheet();
  }, [renderPrintSheet, renderFrontCard, renderBackCard]);

  // --- ACTION HANDLERS ---
  const handleDownloadPdf = async () => {
    try {
      const frontCanvas = frontCanvasRef.current;
      const backCanvas = backCanvasRef.current;
      if (!frontCanvas || !backCanvas) return;

      const pdfDoc = await PDFDocument.create();

      // CR80: 85.6 mm x 54 mm = 242.65 x 153.07 pt
      // 4x6 inch: 432 x 288 pt (Landscape)
      // A4: 595.28 x 841.89 pt
      let pageW = 432;
      let pageH = 288;

      if (sheetLayout === 'a4-8') {
        pageW = 595.28;
        pageH = 841.89;
      }

      const sheetCanvas = sheetCanvasRef.current;
      if (!sheetCanvas) return;

      const jpgDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);
      const jpgBytes = await (await fetch(jpgDataUrl)).arrayBuffer();
      const embedded = await pdfDoc.embedJpg(jpgBytes);

      const page = pdfDoc.addPage([pageW, pageH]);
      page.drawImage(embedded, {
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
      link.download = `AOS_Smart_ID_${idNumber || 'CR80'}_PrintReady.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  const handleDirectPrint = () => {
    const sheetCanvas = sheetCanvasRef.current;
    if (!sheetCanvas) return;
    const dataUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups to open the print dialog.');
      return;
    }

    const paperCss = sheetLayout === 'a4-8' ? 'A4 portrait' : '4in 6in landscape';
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AOS Smart ID Card Studio - Print Ready</title>
          <style>
            @page { size: ${paperCss}; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleDownloadFrontJpg = () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ID_Front_${idNumber || 'CR80'}_300DPI.jpg`;
    link.click();
  };

  const handleDownloadBackJpg = () => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ID_Back_${idNumber || 'CR80'}_300DPI.jpg`;
    link.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      
      {/* Top Header matching Screenshot */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#072642] hover:bg-[#0a355c] border border-[#0d4775] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CR80 300 DPI Studio
          </span>
        </div>
      </div>

      {/* Main Studio Banner Card (Matching Screenshot exactly) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#072642] border border-[#0d4775] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <CreditCard className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Smart ID Card Studio
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950/90 border border-blue-500/40 text-blue-300">
                CR80 STANDARD (85.6 × 54 mm)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Customizable Front &amp; Back Designer with Live QR Code &amp; Signature
            </p>
          </div>
        </div>

        {/* Action Buttons Top Right: Download PDF (Red) & Print Sheet (Blue) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: LIVE CR80 CARD PREVIEW (FRONT & BACK)
          (Matching Screenshot 2 exactly)
          ========================================================================= */}
      <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Live CR80 Card Preview (Front &amp; Back)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFrontJpg}
              className="px-3 py-1.5 rounded-lg bg-[#03182b] hover:bg-[#052642] border border-[#0d4775] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Front JPG</span>
            </button>
            <button
              onClick={handleDownloadBackJpg}
              className="px-3 py-1.5 rounded-lg bg-[#03182b] hover:bg-[#052642] border border-[#0d4775] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Back JPG</span>
            </button>
          </div>
        </div>

        {/* 2 Previews Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Front Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Front Side (CR80)</span>
              <span className="font-mono text-[10px] text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                300 DPI
              </span>
            </div>
            <div className="p-3 bg-[#03182b] rounded-2xl border border-[#0d4775] flex items-center justify-center overflow-hidden">
              <canvas
                ref={frontCanvasRef}
                className="w-full aspect-[1012/638] rounded-xl shadow-2xl border border-slate-700 bg-white object-contain"
              />
            </div>
          </div>

          {/* Back Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Back Side (CR80)</span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Live QR &amp; Address
              </span>
            </div>
            <div className="p-3 bg-[#03182b] rounded-2xl border border-[#0d4775] flex items-center justify-center overflow-hidden">
              <canvas
                ref={backCanvasRef}
                className="w-full aspect-[1012/638] rounded-xl shadow-2xl border border-slate-700 bg-white object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: TABBED CONTROLS NAVIGATION
          (Matching Screenshot 2 exactly)
          ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'front', label: 'Front Fields', icon: User },
          { id: 'back', label: 'Back & Terms', icon: FileText },
          { id: 'colors', label: 'Header & Colors', icon: Palette },
          { id: 'photo', label: 'Photo & Signature', icon: ImageIcon },
          { id: 'qr', label: 'QR Code Generator', icon: QrCode },
          { id: 'print', label: 'Print Sheet', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudioTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                  : 'bg-[#072642] text-slate-300 hover:text-white border border-[#0d4775]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: FRONT FIELDS (Matching Screenshot exactly)
          ========================================================================= */}
      {activeTab === 'front' && (
        <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Organization / Institute Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="NATIONAL INSTITUTE OF TECHNOLOGY"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="An Autonomous Institution • Govt. of India"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Card Headline
              </label>
              <input
                type="text"
                value={cardHeadline}
                onChange={(e) => setCardHeadline(e.target.value)}
                placeholder="STUDENT IDENTITY CARD"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase">
                  Candidate Full Name
                </label>
                <span className="text-[10px] font-mono text-slate-400">Size: {nameFontSize}px</span>
              </div>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="ROHIT RAJPUT"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                ID Number / Reg No
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="NIT-2026-0849"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Course / Role / Department
              </label>
              <input
                type="text"
                value={roleDept}
                onChange={(e) => setRoleDept(e.target.value)}
                placeholder="B.Tech Computer Science (CSE)"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Date of Birth
              </label>
              <input
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="14/07/2003"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Blood Group
              </label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                placeholder="O+"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Valid Till / Expiry
            </label>
            <input
              type="text"
              value={validTill}
              onChange={(e) => setValidTill(e.target.value)}
              placeholder="30/06/2027"
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-red-400"
            />
          </div>

          {/* Sliders: Org Font Size & Candidate Name Size & ID Color */}
          <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                <span>Org Header Font Size:</span>
                <span className="font-mono text-blue-400">{orgFontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="40"
                value={orgFontSize}
                onChange={(e) => setOrgFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                <span>Candidate Name Size:</span>
                <span className="font-mono text-blue-400">{nameFontSize}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="44"
                value={nameFontSize}
                onChange={(e) => setNameFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                <span>ID Highlight Color</span>
                <span className="font-mono text-[11px]">{idHighlightColor}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={idHighlightColor}
                  onChange={(e) => setIdHighlightColor(e.target.value)}
                  className="w-9 h-8 rounded-lg bg-transparent border border-[#0d4775] cursor-pointer"
                />
                <div className="flex gap-1.5">
                  {['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'].map((col) => (
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
          TAB 2: BACK & TERMS
          ========================================================================= */}
      {activeTab === 'back' && (
        <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Back Header Title
            </label>
            <input
              type="text"
              value={backHeader}
              onChange={(e) => setBackHeader(e.target.value)}
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-300 uppercase">
              Terms &amp; Instructions (Bullet Points)
            </label>
            <input
              type="text"
              value={instruction1}
              onChange={(e) => setInstruction1(e.target.value)}
              placeholder="Rule 1"
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={instruction2}
              onChange={(e) => setInstruction2(e.target.value)}
              placeholder="Rule 2"
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={instruction3}
              onChange={(e) => setInstruction3(e.target.value)}
              placeholder="Rule 3"
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Emergency Helpline / Contact
              </label>
              <input
                type="text"
                value={helpline}
                onChange={(e) => setHelpline(e.target.value)}
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-red-400 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Signatory Title
              </label>
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HEADER & COLORS
          ========================================================================= */}
      {activeTab === 'colors' && (
        <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-2">
              Color Palette Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Royal Navy', header: '#1E3A8A', accent: '#D4AF37' },
                { name: 'Prussian Dark', header: '#052F52', accent: '#00D4FF' },
                { name: 'Classic Crimson', header: '#991B1B', accent: '#F59E0B' },
                { name: 'Emerald Forest', header: '#065F46', accent: '#34D399' },
                { name: 'Obsidian Noir', header: '#0F172A', accent: '#94A3B8' },
                { name: 'Executive Gold', header: '#78350F', accent: '#FBBF24' },
                { name: 'Violet Tech', header: '#581C87', accent: '#E879F9' },
                { name: 'Steel Modern', header: '#334155', accent: '#38BDF8' },
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setHeaderColor(p.header);
                    setAccentColor(p.accent);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    headerColor === p.header
                      ? 'border-blue-500 bg-blue-950/60 shadow-md'
                      : 'border-[#0d4775] bg-[#03182b] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.header }} />
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }} />
                  </div>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Custom Header Banner Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-[#0d4775] cursor-pointer"
                />
                <input
                  type="text"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                Accent Stripe Color (Gold/Red/Cyan)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border border-[#0d4775] cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2.5 rounded-xl font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Card Bottom Footer Text
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PHOTO & SIGNATURE
          ========================================================================= */}
      {activeTab === 'photo' && (
        <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-6 animate-in fade-in duration-150">
          {/* Candidate Photo Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-400" />
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
                  className="px-2.5 py-1 rounded bg-[#03182b] hover:bg-[#052642] border border-[#0d4775] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-blue-400" />
                  <span>Use Sample Photo</span>
                </button>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Adjust Photo Scale & Pan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Photo Zoom Scale</span>
                  <span className="font-mono text-blue-400">{photoZoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2.2"
                  step="0.05"
                  value={photoZoom}
                  onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Pan Horizontal</span>
                  <span className="font-mono">{photoPanX}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={photoPanX}
                  onChange={(e) => setPhotoPanX(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Pan Vertical</span>
                  <span className="font-mono">{photoPanY}%</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={photoPanY}
                  onChange={(e) => setPhotoPanY(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-emerald-400" />
                Authorized Signature
              </span>
              <div className="flex items-center gap-1 bg-[#03182b] p-1 rounded-lg border border-[#0d4775]">
                {(['typed', 'upload'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSignatureMode(mode)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                      signatureMode === mode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'typed' ? 'Digital Cursive' : 'Upload PNG'}
                  </button>
                ))}
              </div>
            </div>

            {signatureMode === 'typed' ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Signatory Name (Rendered in Cursive Script)
                </label>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="e.g. Rohit Rajput"
                  className="w-full bg-[#03182b] border border-[#0d4775] text-white text-base px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-serif italic"
                />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={signInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setSignatureSrc(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => signInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#03182b] hover:bg-[#072642] border border-[#0d4775] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Choose Signature Image (Transparent PNG / JPG)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: QR CODE GENERATOR
          ========================================================================= */}
      {activeTab === 'qr' && (
        <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              Live QR Code Verification Payload
            </label>
            <input
              type="text"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="https://verify.nit.ac.in/id/NIT-2026-0849"
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setQrData(`https://verify.nit.ac.in/id/${idNumber}`)}
              className="px-3 py-1.5 rounded-lg bg-[#03182b] border border-[#0d4775] text-xs text-blue-300 hover:text-white cursor-pointer"
            >
              Set Official Verification URL
            </button>
            <button
              onClick={() => setQrData(`MECARD:N:${candidateName};TEL:${phone};NOTE:ID-${idNumber};;`)}
              className="px-3 py-1.5 rounded-lg bg-[#03182b] border border-[#0d4775] text-xs text-blue-300 hover:text-white cursor-pointer"
            >
              Generate Contact vCard
            </button>
            <button
              onClick={() => setQrData(`REG:${idNumber} | NAME:${candidateName} | DEPT:${roleDept}`)}
              className="px-3 py-1.5 rounded-lg bg-[#03182b] border border-[#0d4775] text-xs text-blue-300 hover:text-white cursor-pointer"
            >
              Plain Student Metadata
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
              QR Caption Under Code
            </label>
            <input
              type="text"
              value={qrSubtext}
              onChange={(e) => setQrSubtext(e.target.value)}
              placeholder="Scan to Verify"
              className="w-full bg-[#03182b] border border-[#0d4775] text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PRINT SHEET
          ========================================================================= */}
      {activeTab === 'print' && (
        <div className="rounded-2xl bg-[#072642] border border-[#0d4775] p-5 shadow-xl space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              Print Sheet Layout &amp; Card Alignment
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
              300 DPI Print Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: '4x6-2', title: '4×6" Paper (Front & Back Pair)', sub: '2 cards stacked side-by-side for CR80 pouch' },
              { id: 'a4-8', title: 'A4 Paper (8 Cards / 4 Pairs)', sub: 'High-yield batch sheet with cut lines' },
              { id: 'single-cr80', title: 'Single CR80 Card (PVC Direct)', sub: '85.6 × 54 mm direct for thermal printer' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSheetLayout(p.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  sheetLayout === p.id
                    ? 'border-blue-500 bg-blue-950/70 text-white shadow-lg shadow-blue-600/30'
                    : 'border-[#0d4775] bg-[#03182b] text-slate-300 hover:text-white'
                }`}
              >
                <div className="text-xs sm:text-sm font-bold">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-1">{p.sub}</div>
              </button>
            ))}
          </div>

          {/* Cutting Guides */}
          <div className="space-y-2 pt-2">
            <label className="block text-[11px] font-bold text-slate-300 uppercase">
              Cutting Guide Marks
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'dotted', label: 'Dotted Grid', sub: 'Scissors line' },
                { id: 'crop-marks', label: 'Corner Marks', sub: 'L-Crop Marks' },
                { id: 'solid', label: 'Continuous Line', sub: 'Paper trimmer' },
                { id: 'none', label: 'Clean Blank', sub: 'No guides' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCutGuideStyle(c.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    cutGuideStyle === c.id
                      ? 'border-blue-500 bg-blue-950/60 text-white'
                      : 'border-[#0d4775] bg-[#03182b] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{c.label}</div>
                  <div className="text-[10px] opacity-75">{c.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Sheet Preview */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-300">Live Print Sheet Canvas:</span>
            <div className="p-3 bg-[#03182b] rounded-2xl border border-[#0d4775] flex items-center justify-center overflow-hidden">
              <canvas
                ref={sheetCanvasRef}
                className="w-full max-w-2xl rounded-lg shadow-2xl border border-slate-700 bg-white object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
