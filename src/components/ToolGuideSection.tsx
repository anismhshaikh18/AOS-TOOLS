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
  // 1. Real Client Ledger Diary (Khata)
  'khata-diary': {
    steps: [
      {
        title: 'Add Citizen or Customer Account',
        desc: 'Enter customer name, mobile number, and village/locality to establish a private citizen ledger account in your local device storage.'
      },
      {
        title: 'Record Credit, Debit & Token Fees',
        desc: 'Log government application fees, online service charges, and customer payments with date, service category, and reference/token ID.'
      },
      {
        title: 'Send WhatsApp Slips & Export Ledger',
        desc: 'Click the WhatsApp icon to send an instant balance receipt directly to the customer, or export formatted PDF/Excel ledger summaries for your records.'
      }
    ],
    highlights: [
      '100% Offline Local IndexedDB Storage — Zero cloud tracking, zero subscription fees',
      'Instant WhatsApp payment reminder & billing slip generator for citizen convenience',
      'Dynamic token balance & total debit/credit automatic accounting calculations',
      'Complete data export & backup recovery feature for cyber cafe and Jan Seva Kendra counters'
    ],
    conclusionNote: 'Real Client Ledger Diary (Khata) is designed specifically for CSC Jan Seva Kendras, cyber cafes, and retail shops to manage customer balances, token tracking, and daily digital service collections without relying on paid third-party accounting apps.'
  },

  // 2. QR Code Generator & Barcode Generator
  'qr-code-generator': {
    steps: [
      {
        title: 'Choose Payload Type & Visual Style',
        desc: 'Select your target QR format: UPI Payment link, Website URL, Wi-Fi configuration credentials, vCard contact, or plain text.'
      },
      {
        title: 'Enter Payment / Link Information',
        desc: 'Type your UPI VPA handle, business name, or link. Fine-tune foreground and background colors to match your branding.'
      },
      {
        title: 'Generate & Download Vector SVG / PNG',
        desc: 'Review the instant real-time live scanner preview and download in ultra-crisp 300+ DPI PNG or scalable vector SVG for counter stands and stickers.'
      }
    ],
    highlights: [
      'Universal UPI QR generation compliant with NPCI, Google Pay, PhonePe, and Paytm',
      'Corporate Sapphire, Emerald, and Dark minimalist preset color themes with high contrast',
      'Vector SVG and lossless high-resolution PNG export for crisp physical printing',
      'Zero redirect ads or expiration dates — permanent client-side encoded QR matrix'
    ],
    conclusionNote: 'A fast, reliable QR code solution for retail counters, cyber cafes, payment stands, and promotional notices that stays functional forever without third-party redirection links.'
  },

  'barcode-generator': {
    steps: [
      {
        title: 'Select Barcode Symbology Standard',
        desc: 'Choose standard 1D barcode symbology: Code-128 (general alphanumeric), EAN-13 (retail products), UPC-A, or Code-39.'
      },
      {
        title: 'Input Serial, Product or Token Number',
        desc: 'Type your product code or token sequence. Adjust barcode height, bar width, and display human-readable text labels underneath.'
      },
      {
        title: 'Instant Download for Thermal / Label Printing',
        desc: 'Export razor-sharp vector SVG or PNG formatted specifically for thermal barcode sticker printers and laser label sheets.'
      }
    ],
    highlights: [
      'Full Code-128, EAN-13, and Code-39 industry-standard symbology validation',
      'Laser-crisp vector SVG output preventing laser scanner read failures and blurring',
      'Custom bar height, margin padding, and font typography controls',
      '100% offline generation with zero network lag or server processing'
    ],
    conclusionNote: 'Essential utility for shop inventory tagging, cyber cafe file labeling, and product packaging labels needing compliant, easily scannable barcodes.'
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

  // 3. Receipt Hub
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

  // 4. Passport Photo Studio
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

  'passport-photo-sheet': {
    steps: [
      {
        title: 'Upload Portrait Image',
        desc: 'Upload portrait photograph from your computer or capture directly using your smartphone camera.'
      },
      {
        title: 'Select Sheet Format & Copies',
        desc: 'Choose 4x6" photo paper (6, 8, or 12 copies) or standard A4 document sheet (up to 36 copies) with red cutting guide lines.'
      },
      {
        title: 'Print Direct or Download PDF',
        desc: 'Send directly to your photo printer or save high-resolution 300 DPI PDF ready for photo lab processing.'
      }
    ],
    highlights: [
      'Pre-formatted standard sizes: 35x45mm (India), 2x2" (US Visa), and 35x25mm (Govt exam)',
      'Candidate Name and Date of Photo (DOP) stamp compliant with SSC & UPSC rules',
      'Red optical cutting guides with scissor marks for effortless photo trimming',
      'Zero server upload keeps citizen facial biometric data completely safe'
    ],
    conclusionNote: 'Essential photo grid generator for printing multiple customer passport photos on economical glossy paper.'
  },

  // 5. Smart ID Card Studio
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

  // 6. PDF Suite Tools
  'merge-pdf': {
    steps: [
      {
        title: 'Select Multiple PDF Documents',
        desc: 'Choose two or more PDF files from your computer or phone. You can drag and drop them directly into the upload area.'
      },
      {
        title: 'Reorder Document Sequence',
        desc: 'Verify and drag documents up or down to set the exact chronological order of pages in the merged file.'
      },
      {
        title: 'Merge & Download Combined PDF',
        desc: 'Click Merge. The client-side WebAssembly engine binds all pages into a single organized PDF document without size loss.'
      }
    ],
    highlights: [
      'Unlimited PDF document combining with zero file size restrictions',
      'Visual drag-and-drop file reordering with real-time page count display',
      'Lossless vector and image text preservation with bookmarks retention',
      '100% local processing keeps sensitive contracts and bank statements private'
    ],
    conclusionNote: 'Ideal for combining loan application sets, court filings, job resumes, and scanned multi-page proofs into one tidy PDF.'
  },

  'split-pdf': {
    steps: [
      {
        title: 'Upload Source PDF File',
        desc: 'Select the large or multi-page PDF document you need to extract pages from.'
      },
      {
        title: 'Specify Target Pages or Ranges',
        desc: 'Enter page numbers or intervals (e.g., 1-3, 5, 8-10) or choose to split every page into an individual PDF.'
      },
      {
        title: 'Download Extracted PDF',
        desc: 'Click Split to instantly download only the selected clean pages with intact original quality.'
      }
    ],
    highlights: [
      'Precise page range parsing (single pages, comma-separated, or hyphenated ranges)',
      'Instant client-side page extraction without re-rendering or compression loss',
      'Extract individual application pages from heavy government gazettes and manuals',
      'Zero server upload keeps personal tax forms and confidential records secure'
    ],
    conclusionNote: 'Perfect for pulling out specific receipt pages, marksheet certificates, or Aadhaar pages from large scanned bundles.'
  },

  'compress-pdf': {
    steps: [
      {
        title: 'Upload Heavy PDF File',
        desc: 'Select the PDF document that exceeds online portal upload size limits.'
      },
      {
        title: 'Select Compression Ratio',
        desc: 'Choose strict <300 KB Government Portal preset, Recommended Balanced compression, or Maximum file shrink.'
      },
      {
        title: 'Download Optimized PDF',
        desc: 'Click Compress. The engine optimizes raster images and streamlines internal PDF streams while preserving text readability.'
      }
    ],
    highlights: [
      'Dedicated <300 KB and <100 KB presets calibrated for NSDL, UTIITSL, and UPSC portals',
      'Smart vector text stream optimization to keep typography razor-sharp',
      'Before & After file size comparison indicator with percentage reduction metrics',
      'Pure local execution with zero data transfer to external servers'
    ],
    conclusionNote: 'An essential everyday tool for job applicants, CSC operators, and students struggling with strict government portal file size caps.'
  },

  'protect-pdf': {
    steps: [
      {
        title: 'Select PDF Document',
        desc: 'Choose the sensitive PDF file you want to secure with password encryption.'
      },
      {
        title: 'Enter Strong Password',
        desc: 'Type and confirm your master access password. Ensure you remember the password as it will be required to open the file.'
      },
      {
        title: 'Download Encrypted PDF',
        desc: 'Click Protect. The document is encrypted using standard PDF security algorithms, requiring password entry on any viewer.'
      }
    ],
    highlights: [
      'Industry-standard AES encryption supported by Adobe Acrobat and all mobile PDF viewers',
      'Restricts unauthorized viewing, copying, and printing without the master password',
      'Password is processed purely in your browser memory and never transmitted online',
      'Essential for securing payroll slips, confidential legal agreements, and medical reports'
    ],
    conclusionNote: 'Provides ironclad local security for confidential personal documents before sharing over email or messaging platforms.'
  },

  'unlock-pdf': {
    steps: [
      {
        title: 'Upload Locked PDF File',
        desc: 'Select the password-protected PDF document that you have authorization to unlock.'
      },
      {
        title: 'Enter Existing Document Password',
        desc: 'Input the current password to decrypt the document security permissions.'
      },
      {
        title: 'Download Permanently Unlocked PDF',
        desc: 'Click Unlock. The security restriction is removed permanently, allowing direct opening and printing without password prompts.'
      }
    ],
    highlights: [
      'Permanently removes password locks for convenient archiving and repetitive printing',
      'Preserves original vector text, signatures, and document layouts perfectly',
      'Fast client-side decryption without uploading passwords to any remote service',
      'Ideal for bank e-statements, Aadhaar e-PDFs, and salary slips needing frequent access'
    ],
    conclusionNote: 'Saves time by removing repetitive password prompts from frequently used e-Aadhaar and bank statement files.'
  },

  'images-to-pdf': {
    steps: [
      {
        title: 'Upload Image Files (JPG, PNG, WebP)',
        desc: 'Select all scanned document pages or receipts you want to convert into a single PDF.'
      },
      {
        title: 'Arrange Order & Select Orientation',
        desc: 'Reorder images to match correct page flow and select Portrait or Landscape orientation.'
      },
      {
        title: 'Convert & Download A4 PDF',
        desc: 'Click Convert to compile all photos into a standardized, printable A4 PDF document.'
      }
    ],
    highlights: [
      'Combines multiple images into standard A4 or Letter size document sheets',
      'Auto-rescaling and orientation correction to avoid stretched or rotated pages',
      'Preserves full image resolution for official document submission clarity',
      'Zero cloud upload ensures private documents remain strictly on your local device'
    ],
    conclusionNote: 'Transforms loose mobile phone photos of homework, receipts, and certificates into a clean, professional PDF binder.'
  },

  'sign-pdf': {
    steps: [
      {
        title: 'Upload PDF Document',
        desc: 'Choose the contract, form, or application that requires your signature.'
      },
      {
        title: 'Draw Signature or Upload Sign Image',
        desc: 'Draw your signature using touch/mouse or upload an existing signature image with transparent background.'
      },
      {
        title: 'Position Signature & Export Signed PDF',
        desc: 'Drag and place your signature onto the signature line, adjust scale, and download your officially signed document.'
      }
    ],
    highlights: [
      'Interactive canvas signature pad with ink smoothing and dark blue/black pen options',
      'Auto-whitening filter for scanned paper signatures to remove yellow shadows',
      'Visual placement on any page with pinch-to-resize and rotation support',
      '100% private in-browser digital signing without paper printing or scanning'
    ],
    conclusionNote: 'Eliminates the tedious print-sign-scan cycle by allowing legally clean document signing directly on your screen.'
  },

  // 7. General Core Utilities
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
  },

  'photo-signature-resize': {
    steps: [
      {
        title: 'Upload Photo or Signature',
        desc: 'Select candidate portrait photograph or signature crop (JPG, PNG, or WebP).'
      },
      {
        title: 'Set Target File Size (e.g., 20 KB or 50 KB)',
        desc: 'Choose government portal preset (SSC 20-50KB Photo, 10-20KB Signature, UPSC, IBPS) or enter custom KB.'
      },
      {
        title: 'Instant Binary Search Compression',
        desc: 'The client-side algorithm calculates the optimal quality factor in milliseconds to achieve exact target KB without pixelation.'
      }
    ],
    highlights: [
      'Precision binary-search algorithm hits exact KB limits on the first attempt',
      'Preset dimensions for major Indian recruitment exams (SSC CGL/CHSL, UPSC, State PSC)',
      'Live DPI scaling ensuring 200 DPI resolution compliance',
      'Zero file upload protects applicant biometric identity'
    ],
    conclusionNote: 'Guarantees acceptance on strict government recruitment portals by matching both pixel dimensions and exact KB limits.'
  },

  'crop-image': {
    steps: [
      {
        title: 'Upload Image or Document',
        desc: 'Select your photo, certificate, marksheet, or ID scan from your device.'
      },
      {
        title: 'Set Aspect Ratio & Framing',
        desc: 'Use preset aspect ratio locks (Passport 7:9, PAN Card 25:35, Square 1:1, or Free crop) and position the crop handles.'
      },
      {
        title: 'Download Cropped Image',
        desc: 'Export the cropped image in original resolution with zero compression degradation.'
      }
    ],
    highlights: [
      'Preset aspect ratio locks matching Indian official identity standards',
      'Smooth touch-friendly drag handles calibrated for mobile screens',
      'Lossless canvas rendering preserving original high-resolution pixels',
      '100% private in-browser image clipping'
    ],
    conclusionNote: 'Provides clean, precise cropping for official documents and identity photos without distorting facial proportions.'
  }
};

export const ToolGuideSection: React.FC<ToolGuideSectionProps> = ({ tool }) => {
  // Determine customized guide or intelligent category fallback
  const customGuide = TOOL_GUIDES[tool.id];

  // Category-level smart defaults if specific tool ID is not explicitly mapped
  const defaultSteps = tool.category === 'pdf' 
    ? [
        {
          title: 'Select PDF Document',
          desc: tool.acceptedFormats 
            ? `Choose your PDF file (${tool.acceptedFormats}) from your computer or mobile storage.`
            : 'Select the PDF document you wish to process.'
        },
        {
          title: 'Configure Document Options',
          desc: 'Adjust target page parameters, compression ratio, password security, or layout settings according to your requirement.'
        },
        {
          title: 'Instant In-Browser Processing',
          desc: 'Click the action button. The client-side WebAssembly PDF engine processes your document directly in memory for immediate download.'
        }
      ]
    : tool.category === 'image'
    ? [
        {
          title: 'Upload Image or Photo',
          desc: tool.acceptedFormats 
            ? `Select your image (${tool.acceptedFormats}). Drag-and-drop is supported on desktop.`
            : 'Upload your photo or scanned document.'
        },
        {
          title: 'Tune Dimensions & Quality',
          desc: 'Adjust dimensions, aspect ratio, quality compression, or color enhancement filters to achieve desired results.'
        },
        {
          title: 'Download High-DPI Output',
          desc: 'Preview the rendered image on the real-time canvas and download lossless PNG, JPEG, or WebP instantly.'
        }
      ]
    : [
        {
          title: 'Provide Input Data or File',
          desc: tool.acceptedFormats 
            ? `Select your file (${tool.acceptedFormats}) or paste required input into the fields above.`
            : 'Enter or paste the required values, text, or parameters into the tool interface.'
        },
        {
          title: 'Configure Tool Settings',
          desc: 'Customize parameters, visual theme, security options, or layout preferences.'
        },
        {
          title: 'Execute & Save Result',
          desc: 'Click to process instantly. Your result is generated directly in the browser with zero server delay.'
        }
      ];

  const steps = customGuide?.steps || defaultSteps;

  const defaultHighlights = tool.category === 'pdf'
    ? [
        '100% In-Browser PDF Processing — Confidential documents never leave your local device memory',
        'WebAssembly accelerated execution eliminates server queues and slow upload bottlenecks',
        'Lossless vector fidelity preserves crisp text, official signatures, and embedded graphics',
        'Compatible with official Indian government upload standards (UTIITSL, Protean, SSC, UPSC)',
        '100% free with unlimited usage, zero subscriptions, and no watermarks'
      ]
    : tool.category === 'image'
    ? [
        'Client-side HTML5 Canvas processing ensures complete biometric and photo privacy',
        'High-DPI rendering engine calibrated for sharp photo lab and thermal card printing',
        'Fast real-time preview updates with zero processing lag or server latency',
        'Responsive touch-friendly controls optimized for mobile browsers and tablets',
        'No hidden quotas, no watermarks, and zero cost policy'
      ]
    : [
        '100% In-Browser Zero Knowledge Processing (Files never leave your local device)',
        'Ultra-fast processing powered by modern HTML5 Canvas, WebAssembly & Client JS',
        'High-DPI lossless output calibrated for official government portals and printouts',
        'Responsive and touch-friendly interface optimized for mobile and desktop screens',
        'Completely free with unlimited usage, no watermark, and no registration required'
      ];

  const features = customGuide?.highlights || defaultHighlights;

  const conclusion = customGuide?.conclusionNote || 
    `${tool.name} is designed to provide cyber cafe operators, CSC Jan Seva Kendras, students, and professionals with a fast, private, and dependable utility. By processing all operations directly in your web browser, AOS Tools guarantees zero data leakage, unmatched processing speed, and crisp production-quality output without any software installation.`;

  return (
    <section 
      aria-label={`${tool.name} Guide and Information`}
      className="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 space-y-8 animate-in fade-in duration-300"
    >
      {/* Guide Header Banner - Corporate Deep Navy Blue Theme with Perfect Contrast & No Text Clipping */}
      <div className="guide-banner-dark relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6 bg-gradient-to-r from-[#07192b] via-[#0d2a45] to-[#07192b] border border-sky-900/40 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 rounded-full bg-[#0284c7]/15 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8] shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="guide-tag-sky text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#0284c7]/20 px-2.5 py-0.5 rounded border border-[#0284c7]/30 whitespace-nowrap shrink-0 inline-flex items-center" style={{ color: '#38bdf8' }}>
                  USER MANUAL &amp; OVERVIEW
                </span>
              </div>
              <h2 
                className="guide-banner-title text-sm sm:text-base md:text-lg font-bold !text-white mt-1 leading-snug break-words"
                style={{ color: '#ffffff' }}
              >
                Complete Guide to {tool.name}
              </h2>
            </div>
          </div>
          <div 
            className="guide-banner-badge flex items-center gap-2 text-xs font-semibold !text-white bg-black/50 px-3 py-1.5 rounded-lg border border-white/20 whitespace-nowrap shrink-0 shadow-xs"
            style={{ color: '#ffffff' }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="!text-white font-medium" style={{ color: '#ffffff' }}>100% Client-Side Private</span>
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
