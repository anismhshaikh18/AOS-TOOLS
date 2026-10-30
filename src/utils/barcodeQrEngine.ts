import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export async function generateQrCodeDataUrl(
  text: string,
  options?: {
    width?: number;
    margin?: number;
    colorDark?: string;
    colorLight?: string;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<string> {
  if (!text.trim()) throw new Error('Please enter text or URL for QR code');
  return QRCode.toDataURL(text, {
    width: options?.width || 360,
    margin: options?.margin === undefined ? 2 : options.margin,
    color: {
      dark: options?.colorDark || '#000000',
      light: options?.colorLight || '#FFFFFF',
    },
    errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
  });
}

export function generateBarcodeSvg(
  text: string,
  format: string = 'CODE128',
  displayValue: boolean = true
): string {
  if (!text.trim()) throw new Error('Please enter barcode data');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, text, {
    format,
    lineColor: '#000000',
    width: 2,
    height: 70,
    displayValue,
    font: 'monospace',
    fontSize: 14,
    textMargin: 4,
    margin: 10,
    background: '#FFFFFF',
  });
  return new XMLSerializer().serializeToString(svg);
}

export function generateBarcodePngDataUrl(
  text: string,
  format: string = 'CODE128',
  displayValue: boolean = true,
  options?: { lineColor?: string; scale?: number; background?: string }
): string {
  if (!text.trim()) throw new Error('Please enter barcode data');
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, {
    format,
    lineColor: options?.lineColor || '#000000',
    width: (options?.scale || 1) * 2,
    height: (options?.scale || 1) * 70,
    displayValue,
    font: 'monospace',
    fontSize: (options?.scale || 1) * 14,
    textMargin: 4,
    margin: 12,
    background: options?.background || '#FFFFFF',
  });
  return canvas.toDataURL('image/png');
}
