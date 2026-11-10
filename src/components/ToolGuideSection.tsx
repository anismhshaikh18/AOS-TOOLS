import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Layers, 
  Printer, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { ToolItem } from '../types';

interface ToolGuideSectionProps {
  tool: ToolItem;
}

// Tool-specific custom guidance mapping
interface ToolCustomGuide {
  steps: { title: string; desc: string }[];
  highlights: string[];
  conclusionNote?: string;
}

const TOOL_GUIDES: Record<string, ToolCustomGuide> = {
  'receipt-hub': {
    steps: [
      {
        title: 'Select Template & Business Info',
        desc: 'Choose from 5 official templates (GST Invoice, Cyber Cafe, CSC Seva, Rental/Panchayat, or Utility Bill) and enter your firm name, contact, and GST/PAN if applicable.'
      },
      {
        title: 'Add Items & Upload Brand Assets',
        desc: 'Add billed services or items with custom quantities and rates. Upload your custom shop logo, digital signature, and official seal/stamp (automatic transparent cutout supported).'
      },
      {
        title: 'Preview, Print & Share on WhatsApp',
        desc: 'Choose your custom theme color, review the real-time live thermal/A4 receipt, and click to instant print, download PDF, or send directly via WhatsApp to your customer.'
      }
    ],
    highlights: [
      '5 versatile Indian formats: GST Tax Invoice, Cyber Cafe Cash Slip, CSC Digital Seva, Panchayat, & General Utility',
      'Instant WhatsApp Share with pre-formatted bill summary and customer direct messaging',
      '10 regional Indian languages for local Gram Panchayat & Municipal receipts',
      'Thermal receipt (80mm/58mm) and standard A4 sheet print support with zero margins'
    ],
    conclusionNote: 'AOS Receipt Hub is an indispensable billing utility for Indian cyber cafes, Jan Seva Kendras, retail shops, and freelancers seeking rapid, paper-free, and legally compliant receipts without requiring expensive accounting software.'
  },
  'passport-photo-studio': {
    steps: [
      {
        title: 'Upload Citizen Portrait Photo',
        desc: 'Select a front-facing image (JPEG, PNG, or WebP). Ensure the face is clearly centered and well-lit.'
      },
      {
        title: 'Adjust Framing & Select Print Sheet',
        desc: 'Fine-tune crop, zoom, and border color. Choose your preferred layout (Single Passport Photo, 4x6" Sheet with 8/12 photos, or A4 Sheet with up to 36 photos).'
      },
      {
        title: 'Export Ultra-High 300 DPI Sheet',
        desc: 'Click Download to instantly generate a print-ready 300 DPI high-resolution canvas with precise cutting guides, ready for glossy photo paper printing.'
      }
    ],
    highlights: [
      'Standard Indian passport size (35mm x 45mm / 3.5cm x 4.5cm) pre-calibrated',
      'One-click multi-copy tiling on 4x6" and A4 glossy paper with alignment cut borders',
      'Ultra-sharp 300 DPI rendering engine to prevent any pixelation or blur during print',
      'Complete client-side processing ensuring customer photos never touch a remote server'
    ],
    conclusionNote: 'The Passport Photo Studio streamlines instant photo creation for CSC operators, photographers, and internet cafe owners, saving immense editing time while delivering studio-quality prints.'
  },
  'smart-id-card-studio': {
    steps: [
      {
        title: 'Enter Cardholder Details & Custom Text',
        desc: 'Fill in cardholder name, ID number, DOB, phone, address, and fully customize the Top Header, Bottom Header, and Terms & Conditions.'
      },
      {
        title: 'Upload Photo & Signature',
        desc: 'Upload portrait photo and applicant signature. Enable the built-in "Remove White Background" toggle for crisp transparent signatures.'
      },
      {
        title: 'Print Dual-Side 4x6" Pair or Single Card',
        desc: 'Preview the front and back cards side-by-side and export ultra-high resolution 300/600 DPI images or vector SVG for crystal clear PVC card thermal printing.'
      }
    ],
    highlights: [
      'CR80 Standard PVC Card dimensions (85.6mm x 54mm) with high-DPI scaling',
      '0-100% full text control over headers, titles, address blocks, and validity dates',
      'Built-in transparent signature threshold filter for professional clean signatures',
      'Dual Front & Back 4x6" print sheet alignment with precise cutting guidelines'
    ],
    conclusionNote: 'Smart ID Card Studio empowers schools, institutes, organizations, and CSC centers to issue durable, beautiful, and secure identity cards effortlessly in minutes.'
  },
  'qr-generator': {
    steps: [
      {
        title: 'Select Code Type (QR Code / Barcode)',
        desc: 'Choose between 2D QR Code (for UPI payments, URLs, Wi-Fi, vCard) or 1D Barcode (Code-128 standard for retail products and tracking).'
      },
      {
        title: 'Enter Data & Customize Colors',
        desc: 'Type your link, text, or serial numbers. Customize foreground and background colors to match your brand style.'
      },
      {
        title: 'Download High-DPI PNG or SVG',
        desc: 'Generate instantly and export crisp, scannable codes ready for product packaging, storefront stickers, or payment counters.'
      }
    ],
    highlights: [
      'Dual generator support: High-density 2D QR Code & standard Code-128 Barcode',
      'Crisp vector & high-resolution raster output with flawless smartphone scanner readability',
      'Custom color theming, margins, and error correction level adjustments',
      '100% offline-capable generation without any tracking redirects or expired links'
    ],
    conclusionNote: 'A fast and dependable code generator for merchants, shopkeepers, and developers needing permanent, unexpirable QR and barcodes without external redirect ads.'
  },
  'base64-url-codec': {
    steps: [
      {
        title: 'Choose Mode (Encode / Decode)',
        desc: 'Select whether you want to Base64 Encode, Base64 Decode, URL Encode, or URL Decode.'
      },
      {
        title: 'Paste Text, String, or Data URI',
        desc: 'Paste your raw text, JSON payload, or Data URI string into the input box. Auto-trim and sanitize cleans up whitespace and line breaks.'
      },
      {
        title: 'View Instant Result & Copy',
        desc: 'Get immediate live real-time output with helpful validation feedback and single-click clipboard copying.'
      }
    ],
    highlights: [
      'Robust UTF-8 Unicode support preventing accented or regional character corruption',
      'Gentle error handling with user-friendly syntax alerts on invalid Base64 input',
      'Auto-strips Data URI prefixes (data:image/png;base64,...) for rapid developer debugging',
      'One-tap copy to clipboard with toast notification'
    ],
    conclusionNote: 'A vital utility for web developers, API testers, and security researchers needing instantaneous, safe client-side encoding and decoding.'
  },
  'image-enhancer': {
    steps: [
      {
        title: 'Select Image (JPEG, PNG, WebP)',
        desc: 'Upload the photo or scan you want to enhance. (Note: For mobile .heic files, a convenient format guide is provided).'
      },
      {
        title: 'Tune Sharpness, Contrast & Brightness',
        desc: 'Use the intuitive enhancement sliders to sharpen blurry documents, increase text legibility, or enrich vivid photo colors.'
      },
      {
        title: 'Compare & Download Enhanced Output',
        desc: 'Inspect before-and-after improvements on the live canvas and download your perfected image in lossless PNG or optimized JPEG.'
      }
    ],
    highlights: [
      'Advanced HTML5 Canvas convolution kernel filters for real edge sharpening',
      'Dynamic contrast stretching ideal for faded government receipts and scanned IDs',
      'Zero server upload keeps sensitive Aadhaar, PAN, and certificates strictly private',
      'Instant real-time slider adjustments with no processing lag'
    ],
    conclusionNote: 'Perfect for enhancing faded document scans, brightening dark mobile captures, and boosting photo sharpness before submitting to government portals.'
  }
};

export const ToolGuideSection: React.FC<ToolGuideSectionProps> = ({ tool }) => {
  // Determine customized guide or intelligent category fallback
  const customGuide = TOOL_GUIDES[tool.id];

  const steps = customGuide?.steps || [
    {
      title: tool.acceptedFormats ? 'Upload or Input Your File' : 'Provide Input Data',
      desc: tool.acceptedFormats 
        ? `Select your file (${tool.acceptedFormats}) from your device. You can also drag and drop directly onto the upload area.`
        : 'Enter or paste the required information, text, or values into the input fields above.'
    },
    {
      title: 'Configure Parameters & Settings',
      desc: 'Adjust tool parameters, options, dimensions, or styling preferences to match your exact requirements.'
    },
    {
      title: 'Instant In-Browser Processing & Download',
      desc: 'Click the process button. Your file or result is rendered instantly in your browser with zero server latency. Download or copy immediately.'
    }
  ];

  const features = customGuide?.highlights || [
    '100% In-Browser Zero Knowledge Processing (Files never leave your local device)',
    'Ultra-fast processing powered by modern HTML5 Canvas, WebAssembly & Client JS',
    'High-DPI lossless output calibrated for official government portals and printouts',
    'Responsive and touch-friendly interface optimized for mobile and desktop screens',
    'Completely free with unlimited usage, no watermark, and no registration required'
  ];

  const conclusion = customGuide?.conclusionNote || 
    `${tool.name} is designed to provide cyber cafe operators, CSC Jan Seva Kendras, students, and professionals with a fast, private, and dependable utility. By processing all operations directly in your web browser, AOS Tools guarantees zero data leakage, unmatched processing speed, and crisp production-quality output without any software installation.`;

  return (
    <section 
      aria-label={`${tool.name} Guide and Information`}
      className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 space-y-8 animate-in fade-in duration-300"
    >
      {/* Guide Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-[#18181b] to-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-[#0284c7]/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#0284c7]/10 px-2 py-0.5 rounded border border-[#0284c7]/20">
                  User Manual &amp; Overview
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Complete Guide to {tool.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Private</span>
          </div>
        </div>
      </div>

      {/* Section 1: How to Use This Tool */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              How to Use {tool.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Follow these simple step-by-step instructions for the best results:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="relative p-4 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/40 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Step {idx + 1}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex justify-end mt-3 text-slate-400 dark:text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Key Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Key Features &amp; Capabilities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Why professionals and cyber cafe owners choose this tool:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Universal Features Grid */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                100% Client-Side Privacy
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Zero server uploads. Your confidential documents, photos, and records never leave your device.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Instant Execution Speed
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Powered by modern Canvas &amp; client JS with zero server queue delays or internet buffering.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                High-DPI Print Quality
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Output renders at 300+ DPI razor-sharp resolution, ensuring clear printouts on photo paper and card stock.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Mobile &amp; Touch Friendly
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Responsive layout optimized for smartphones (including Samsung Galaxy A07) and tablets without horizontal scroll.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                CSC &amp; Cyber Cafe Ready
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Designed specifically for daily counter service, customer bill generation, and online portal compliance.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                100% Free &amp; Unlimited
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                No subscription, no credits to buy, no watermarks, and no login required for full functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Tool Specific Feature Badges */}
        {features.length > 0 && (
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300">
              <Info className="w-3.5 h-3.5" />
              <span>Specialized Capabilities for {tool.name}:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-sky-900 dark:text-sky-200">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#0284c7] font-bold">•</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section 3: Conclusion */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Conclusion &amp; Best Practices
          </h4>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {conclusion}
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
          <span>✓ Guaranteed Privacy</span>
          <span>•</span>
          <span>✓ Zero Server Logs</span>
          <span>•</span>
          <span>✓ Optimized for Samsung Galaxy &amp; Mobile Web</span>
          <span>•</span>
          <span>✓ Powered by AOS Tools</span>
        </div>
      </div>
    </section>
  );
};
