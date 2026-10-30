export interface ImageProcessingResult {
  dataUrl: string;
  blob: Blob;
  fileName: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
}

export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));

    if (src instanceof File) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
}

export async function compressImage(
  file: File,
  quality: number = 0.75, // 0.1 to 1.0
  targetFormat: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg'
): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  if (targetFormat === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas compression failed'));
      },
      targetFormat,
      quality
    );
  });

  const extension = targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/png' ? 'png' : 'jpg';
  const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_compressed.${extension}`;
  const dataUrl = canvas.toDataURL(targetFormat, quality);

  return {
    dataUrl,
    blob,
    fileName,
    originalSize: file.size,
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function convertImageFormat(
  file: File,
  format: 'jpg' | 'png' | 'jpeg' | 'webp' | 'bmp',
  quality: number = 0.92
): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };

  const mime = mimeMap[format] || 'image/jpeg';

  if (format === 'jpg' || format === 'jpeg' || format === 'bmp') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const dataUrl = canvas.toDataURL(mime, quality);
  const blob: Blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `${file.name.replace(/\.[^/.]+$/, '')}.${format}`,
    originalSize: file.size,
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  format: string = 'image/jpeg',
  quality: number = 0.9
): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(targetWidth));
  canvas.height = Math.max(1, Math.round(targetHeight));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Resize blob failed'))), format, quality);
  });

  return {
    dataUrl: canvas.toDataURL(format, quality),
    blob,
    fileName: `${file.name.replace(/\.[^/.]+$/, '')}_${canvas.width}x${canvas.height}.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function cropCircleImage(file: File): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const size = Math.min(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const offsetX = (img.naturalWidth - size) / 2;
  const offsetY = (img.naturalHeight - size) / 2;

  ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

  const dataUrl = canvas.toDataURL('image/png');
  const blob: Blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `${file.name.replace(/\.[^/.]+$/, '')}_circle.png`,
    originalSize: file.size,
    newSize: blob.size,
    width: size,
    height: size,
  };
}

export async function rotateAndFlipImage(
  file: File,
  rotationDeg: number = 90,
  flipH: boolean = false,
  flipV: boolean = false
): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  const rads = (rotationDeg * Math.PI) / 180;
  const isPerpendicular = rotationDeg % 180 !== 0;

  canvas.width = isPerpendicular ? img.naturalHeight : img.naturalWidth;
  canvas.height = isPerpendicular ? img.naturalWidth : img.naturalHeight;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rads);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `${file.name.replace(/\.[^/.]+$/, '')}_rotated.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function mergeImages(
  files: File[],
  direction: 'horizontal' | 'vertical' = 'horizontal',
  gap: number = 10,
  bgColor: string = '#FFFFFF'
): Promise<ImageProcessingResult> {
  if (files.length < 2) throw new Error('Select at least 2 images to merge.');
  const images = await Promise.all(files.map((f) => loadImage(f)));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');

  if (direction === 'horizontal') {
    const maxHeight = Math.max(...images.map((im) => im.naturalHeight));
    const totalWidth = images.reduce((sum, im) => sum + im.naturalWidth, 0) + gap * (images.length - 1);
    canvas.width = totalWidth;
    canvas.height = maxHeight;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentX = 0;
    images.forEach((im) => {
      ctx.drawImage(im, currentX, (maxHeight - im.naturalHeight) / 2);
      currentX += im.naturalWidth + gap;
    });
  } else {
    const maxWidth = Math.max(...images.map((im) => im.naturalWidth));
    const totalHeight = images.reduce((sum, im) => sum + im.naturalHeight, 0) + gap * (images.length - 1);
    canvas.width = maxWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentY = 0;
    images.forEach((im) => {
      ctx.drawImage(im, (maxWidth - im.naturalWidth) / 2, currentY);
      currentY += im.naturalHeight + gap;
    });
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  const blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `AOS_Merged_${direction}_${Date.now()}.jpg`,
    originalSize: files.reduce((acc, f) => acc + f.size, 0),
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function resizePhotoSignatureGovt(
  file: File,
  type: 'photo' | 'signature'
): Promise<ImageProcessingResult> {
  // Specs:
  // Photo: 3.5cm x 2.5cm at 200 DPI -> ~275 x 354px, < 50KB
  // Signature: 2.0cm x 4.5cm at 200 DPI -> ~157 x 354px, < 50KB
  const targetW = type === 'photo' ? 275 : 354;
  const targetH = type === 'photo' ? 354 : 157;

  let quality = 0.85;
  let result = await resizeImage(file, targetW, targetH, 'image/jpeg', quality);

  // If size exceeds 50 KB, iteratively decrease quality
  while (result.newSize > 48 * 1024 && quality > 0.3) {
    quality -= 0.1;
    result = await resizeImage(file, targetW, targetH, 'image/jpeg', quality);
  }

  result.fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${type}_govt_spec.jpg`;
  return result;
}

export async function generatePassportPhotoSheet(
  file: File,
  count: 4 | 8 | 16 | 32 = 8,
  withBorder: boolean = true
): Promise<ImageProcessingResult> {
  const photo = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');

  // Standard 4x6 inch print at 300 DPI: 1800 x 1200 px
  canvas.width = 1800;
  canvas.height = 1200;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let cols = 4;
  let rows = 2;
  if (count === 4) {
    cols = 2;
    rows = 2;
  } else if (count === 16) {
    cols = 4;
    rows = 4;
  } else if (count === 32) {
    cols = 8;
    rows = 4;
  }

  const slotW = canvas.width / cols;
  const slotH = canvas.height / rows;
  const pad = 24;
  const targetW = slotW - pad * 2;
  const targetH = slotH - pad * 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * slotW + pad;
      const y = r * slotH + pad;

      ctx.drawImage(photo, x, y, targetW, targetH);

      if (withBorder) {
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, targetW, targetH);
      }
    }
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `AOS_Passport_Sheet_${count}Photos_4x6in.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export interface PassportStudioOptions {
  aspectRatio: '35x45' | '35x25' | '51x51' | '25x35';
  bgColor: string; // '#FFFFFF' | '#F3F4F6' | '#BFDBFE' | '#E5E7EB' | 'transparent'
  brightness: number; // 50 - 150
  contrast: number; // 50 - 150
  saturation: number; // 50 - 150
  withBorder: boolean;
  sheetType: 'single' | '4x6' | 'a4';
  sheetPhotosCount: number; // 4, 8, 16, 32
}

export async function processPassportStudioPhoto(
  file: File,
  options: PassportStudioOptions
): Promise<ImageProcessingResult> {
  const photo = await loadImage(file);
  
  // Dimensions for single photo based on standard 300 DPI
  // 35x45 mm -> ~413 x 531 px
  // 35x25 mm -> ~413 x 295 px
  // 51x51 mm (2x2 inch) -> ~600 x 600 px
  // 25x35 mm -> ~295 x 413 px
  let targetW = 413;
  let targetH = 531;
  if (options.aspectRatio === '35x25') {
    targetW = 413;
    targetH = 295;
  } else if (options.aspectRatio === '51x51') {
    targetW = 600;
    targetH = 600;
  } else if (options.aspectRatio === '25x35') {
    targetW = 295;
    targetH = 413;
  }

  // 1. Process single cropped photo with filters and background
  const singleCanvas = document.createElement('canvas');
  singleCanvas.width = targetW;
  singleCanvas.height = targetH;
  const sCtx = singleCanvas.getContext('2d');
  if (!sCtx) throw new Error('Canvas initialization failed');

  // Fill background
  if (options.bgColor && options.bgColor !== 'transparent') {
    sCtx.fillStyle = options.bgColor;
    sCtx.fillRect(0, 0, targetW, targetH);
  }

  // Calculate cover crop from source image to target aspect ratio
  const srcRatio = photo.naturalWidth / photo.naturalHeight;
  const dstRatio = targetW / targetH;
  let sWidth = photo.naturalWidth;
  let sHeight = photo.naturalHeight;
  let sx = 0;
  let sy = 0;

  if (srcRatio > dstRatio) {
    sWidth = photo.naturalHeight * dstRatio;
    sx = (photo.naturalWidth - sWidth) / 2;
  } else {
    sHeight = photo.naturalWidth / dstRatio;
    sy = (photo.naturalHeight - sHeight) / 2;
  }

  // Apply filters
  sCtx.filter = `brightness(${options.brightness}%) contrast(${options.contrast}%) saturate(${options.saturation}%)`;
  sCtx.drawImage(photo, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
  sCtx.filter = 'none';

  if (options.withBorder) {
    sCtx.strokeStyle = '#D1D5DB';
    sCtx.lineWidth = 2;
    sCtx.strokeRect(0, 0, targetW, targetH);
  }

  if (options.sheetType === 'single') {
    const dataUrl = singleCanvas.toDataURL('image/jpeg', 0.96);
    const blob = await (await fetch(dataUrl)).blob();
    return {
      dataUrl,
      blob,
      fileName: `AOS_Passport_Photo_${options.aspectRatio}_${Date.now()}.jpg`,
      originalSize: file.size,
      newSize: blob.size,
      width: targetW,
      height: targetH,
    };
  }

  // 2. Multi-photo Sheet Generation: 4x6 inch or A4 paper
  const sheetCanvas = document.createElement('canvas');
  const shCtx = sheetCanvas.getContext('2d');
  if (!shCtx) throw new Error('Sheet canvas initialization failed');

  if (options.sheetType === 'a4') {
    // A4 at 300 DPI: 2480 x 3508 px
    sheetCanvas.width = 2480;
    sheetCanvas.height = 3508;
  } else {
    // 4x6 inch at 300 DPI: 1800 x 1200 px (Landscape)
    sheetCanvas.width = 1800;
    sheetCanvas.height = 1200;
  }

  shCtx.fillStyle = '#FFFFFF';
  shCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

  let cols = 4;
  let rows = 2;
  const count = options.sheetPhotosCount || 8;

  if (options.sheetType === 'a4') {
    if (count <= 8) { cols = 2; rows = 4; }
    else if (count <= 16) { cols = 4; rows = 4; }
    else if (count <= 24) { cols = 4; rows = 6; }
    else if (count <= 32) { cols = 4; rows = 8; }
    else { cols = 6; rows = 6; }
  } else {
    // 4x6 inch
    if (count <= 4) { cols = 2; rows = 2; }
    else if (count <= 6) { cols = 3; rows = 2; }
    else if (count <= 8) { cols = 4; rows = 2; }
    else if (count <= 12) { cols = 4; rows = 3; }
    else { cols = 4; rows = 4; }
  }

  const slotW = sheetCanvas.width / cols;
  const slotH = sheetCanvas.height / rows;
  const pad = options.sheetType === 'a4' ? 36 : 20;

  // Preserve aspect ratio inside slot
  const pRatio = targetW / targetH;
  let printW = slotW - pad * 2;
  let printH = printW / pRatio;
  if (printH > slotH - pad * 2) {
    printH = slotH - pad * 2;
    printW = printH * pRatio;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r * cols + c >= count) break;
      const x = c * slotW + (slotW - printW) / 2;
      const y = r * slotH + (slotH - printH) / 2;

      shCtx.drawImage(singleCanvas, x, y, printW, printH);

      if (options.withBorder) {
        shCtx.strokeStyle = '#9CA3AF';
        shCtx.lineWidth = 1.5;
        shCtx.strokeRect(x, y, printW, printH);

        // Corner cut guidelines
        shCtx.setLineDash([4, 4]);
        shCtx.strokeStyle = '#D1D5DB';
        shCtx.strokeRect(c * slotW, r * slotH, slotW, slotH);
        shCtx.setLineDash([]);
      }
    }
  }

  // Header imprint
  shCtx.fillStyle = '#6B7280';
  shCtx.font = '24px sans-serif';
  shCtx.textAlign = 'center';
  shCtx.fillText(`AOS Tools Passport Studio · ${options.aspectRatio} (${count} Photos) · Ready to Print`, sheetCanvas.width / 2, sheetCanvas.height - 24);

  const dataUrl = sheetCanvas.toDataURL('image/jpeg', 0.95);
  const blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `AOS_Passport_Sheet_${options.sheetType.toUpperCase()}_${count}Photos.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    width: sheetCanvas.width,
    height: sheetCanvas.height,
  };
}

export async function enhanceImageFilters(
  file: File,
  brightness: number = 100, // 50 - 150
  contrast: number = 100,   // 50 - 150
  saturate: number = 100,   // 50 - 150
  sharpness: boolean = false
): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas error');

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
  ctx.drawImage(img, 0, 0);

  if (sharpness) {
    // Basic 3x3 convolution unsharp mask
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;
    const buff = new Uint8ClampedArray(data);

    // simple 3x3 sharpening kernel
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const val =
            buff[idx + c] * 5 -
            buff[((y - 1) * w + x) * 4 + c] -
            buff[((y + 1) * w + x) * 4 + c] -
            buff[(y * w + (x - 1)) * 4 + c] -
            buff[(y * w + (x + 1)) * 4 + c];
          data[idx + c] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `${file.name.replace(/\.[^/.]+$/, '')}_enhanced.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    width: canvas.width,
    height: canvas.height,
  };
}

export async function extractColorPalette(
  file: File,
  maxColors: number = 6
): Promise<{ hex: string; rgb: string; percentage: number }[]> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size).data;

  const colorBuckets: Record<string, { count: number; r: number; g: number; b: number }> = {};
  const totalPixels = size * size;

  for (let i = 0; i < imgData.length; i += 16) {
    const r = Math.round(imgData[i] / 32) * 32;
    const g = Math.round(imgData[i + 1] / 32) * 32;
    const b = Math.round(imgData[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { count: 0, r, g, b };
    }
    colorBuckets[key].count++;
  }

  const sorted = Object.values(colorBuckets)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors);

  const sampleCount = (totalPixels / 4);

  return sorted.map((c) => {
    const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1).toUpperCase()}`;
    return {
      hex,
      rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
      percentage: Math.round((c.count / sampleCount) * 100),
    };
  });
}

export async function cropRectImage(
  file: File,
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '3:4' = '1:1',
  cropMarginPercent: number = 0
): Promise<ImageProcessingResult> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context error');

  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  let targetW = origW;
  let targetH = origH;

  if (aspectRatio === '1:1') {
    const dim = Math.min(origW, origH);
    targetW = dim;
    targetH = dim;
  } else if (aspectRatio === '4:3') {
    if (origW / origH > 4 / 3) {
      targetH = origH;
      targetW = Math.round((origH * 4) / 3);
    } else {
      targetW = origW;
      targetH = Math.round((origW * 3) / 4);
    }
  } else if (aspectRatio === '16:9') {
    if (origW / origH > 16 / 9) {
      targetH = origH;
      targetW = Math.round((origH * 16) / 9);
    } else {
      targetW = origW;
      targetH = Math.round((origW * 9) / 16);
    }
  } else if (aspectRatio === '3:4') {
    if (origW / origH > 3 / 4) {
      targetH = origH;
      targetW = Math.round((origH * 3) / 4);
    } else {
      targetW = origW;
      targetH = Math.round((origW * 4) / 3);
    }
  }

  // Apply optional margin
  if (cropMarginPercent > 0) {
    const factor = (100 - cropMarginPercent) / 100;
    targetW = Math.round(targetW * factor);
    targetH = Math.round(targetH * factor);
  }

  const startX = Math.round((origW - targetW) / 2);
  const startY = Math.round((origH - targetH) / 2);

  canvas.width = targetW;
  canvas.height = targetH;

  ctx.drawImage(img, startX, startY, targetW, targetH, 0, 0, targetW, targetH);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const blob: Blob = await (await fetch(dataUrl)).blob();

  return {
    dataUrl,
    blob,
    fileName: `${file.name.replace(/\.[^/.]+$/, '')}_cropped_${aspectRatio.replace(':', 'x')}.jpg`,
    originalSize: file.size,
    newSize: blob.size,
    width: targetW,
    height: targetH,
  };
}

export function sampleImagePixelColor(
  imgElement: HTMLImageElement,
  clientX: number,
  clientY: number
): { hex: string; rgb: string; hsl: string } | null {
  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth || 100;
  canvas.height = imgElement.naturalHeight || 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(imgElement, 0, 0);

  const rect = imgElement.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((clientX - rect.left) * scaleX)));
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((clientY - rect.top) * scaleY)));

  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];

  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  const rgb = `rgb(${r}, ${g}, ${b})`;

  // Convert to HSL
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rf:
        h = (gf - bf) / d + (gf < bf ? 6 : 0);
        break;
      case gf:
        h = (bf - rf) / d + 2;
        break;
      case bf:
        h = (rf - gf) / d + 4;
        break;
    }
    h /= 6;
  }

  const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  return { hex, rgb, hsl };
}
