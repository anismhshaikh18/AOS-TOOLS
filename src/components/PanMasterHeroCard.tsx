import React, { useState, useRef } from 'react';
import {
  Building2,
  FileText,
  Minimize2,
  Camera,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  Download,
  RefreshCw,
  Sliders,
  Check,
  FileCheck,
} from 'lucide-react';
import { PAN_SERVICES, PHOTO_SIGNATURE_SPECS } from '../data/panMasterData';
import { compressPDF, imagesToPDF } from '../utils/pdfEngine';

interface PanMasterHeroCardProps {
  onOpenFullHub: () => void;
  onLaunchImageResize?: () => void;
}

export const PanMasterHeroCard: React.FC<PanMasterHeroCardProps> = ({
  onOpenFullHub,
  onLaunchImageResize,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'compressor' | 'specs'>('services');

  // Mini In-Hero <300 KB Document Compressor
  const [panFile, setPanFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<string>('');
  const [compressResult, setCompressResult] = useState<{
    url: string;
    fileName: string;
    originalKb: number;
    compressedKb: number;
  } | null>(null);
  const [compressError, setCompressError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPanFile(e.target.files[0]);
      setCompressResult(null);
      setCompressError(null);
    }
  };

  const handleRunCompress = async () => {
    if (!panFile) {
      setCompressError('Please select a PDF or scanned document.');
      return;
    }

    setIsCompressing(true);
    setCompressError(null);
    setCompressProgress('Compressing document to <300 KB...');

    try {
      const targetKbLimit = 295; // Under 300 KB statutory limit
      let finalBytes: Uint8Array;
      let outFileName: string;

      if (panFile.name.toLowerCase().endsWith('.pdf') || panFile.type === 'application/pdf') {
        const res = await compressPDF(panFile, targetKbLimit, (p) => {
          setCompressProgress(p.step);
        });
        finalBytes = res.data;
        outFileName = `${panFile.name.replace(/\.pdf$/i, '')}_PAN_Under300KB.pdf`;
      } else {
        setCompressProgress('Converting scanned proof to A4 PDF...');
        const res = await imagesToPDF([panFile], (p) => {
          setCompressProgress(p.step);
        });
        if (res.data.byteLength > targetKbLimit * 1024) {
          const tempBlob = new Blob([res.data.buffer as ArrayBuffer], { type: 'application/pdf' });
          const tempFile = new File([tempBlob], 'scan.pdf', { type: 'application/pdf' });
          const compRes = await compressPDF(tempFile, targetKbLimit, (p) => {
            setCompressProgress(p.step);
          });
          finalBytes = compRes.data;
        } else {
          finalBytes = res.data;
        }
        outFileName = `${panFile.name.replace(/\.[^/.]+$/, '')}_Doc_Under300KB.pdf`;
      }

      const blob = new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      setCompressResult({
        url: URL.createObjectURL(blob),
        fileName: outFileName,
        originalKb: Math.round(panFile.size / 1024),
        compressedKb: Math.round(blob.size / 1024),
      });
    } catch (err: any) {
      setCompressError(err.message || 'Compression failed. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="w-full rounded-3xl overflow-hidden liquid-glass p-4 sm:p-6 flex flex-col justify-between space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#0284c7] dark:text-sky-300 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">PAN Master Hub</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-[#072642] text-sky-700 dark:text-sky-300 border border-sky-400/40 font-bold uppercase tracking-wider whitespace-nowrap shrink-0 inline-flex items-center">
                NSDL &amp; UTIITSL
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
              Form 49A, Correction &amp; &lt;300 KB Document Prep
            </div>
          </div>
        </div>

        <button
          onClick={onOpenFullHub}
          title="Open Full PAN Master Hub"
          className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer group shrink-0 whitespace-nowrap"
        >
          <span>Full Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>

      {/* Mini Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 liquid-glass-sub p-1 rounded-xl text-xs border border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('services')}
          className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-[#0284c7] text-white shadow-sm shadow-[#0284c7]/30'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Forms &amp; Apply
        </button>
        <button
          onClick={() => setActiveTab('compressor')}
          className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'compressor'
              ? 'bg-[#0284c7] text-white shadow-sm shadow-[#0284c7]/30'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>&lt;300KB PDF</span>
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-[#0284c7] text-white shadow-sm shadow-[#0284c7]/30'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Photo &amp; Sign
        </button>
      </div>

      {/* TAB 1: Forms & Services */}
      {activeTab === 'services' && (
        <div className="space-y-2.5 text-xs animate-in fade-in duration-150">
          
          {/* Card: Form 49A New PAN */}
          <div className="p-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 border border-slate-200 dark:border-white/10 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>New PAN Card (Form 49A)</span>
              </span>
              <span className="text-[10px] text-[#0284c7] dark:text-cyan-300 font-semibold">Paperless e-KYC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              For Indian citizens never allotted a Permanent Account Number. Paperless e-KYC via Aadhaar OTP.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://onlineservices.proteantech.in/paam/endUserRegisterContact.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg liquid-glass-sub hover:bg-slate-100 dark:hover:bg-white/10 text-center font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1 transition-colors border border-slate-200 dark:border-white/10"
              >
                <span>Protean (NSDL)</span>
                <ExternalLink className="w-3 h-3 text-[#0284c7] dark:text-cyan-400" />
              </a>
              <a
                href="https://www.pan.utiitsl.com/PAN/newA49A.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg liquid-glass-sub hover:bg-slate-100 dark:hover:bg-white/10 text-center font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1 transition-colors border border-slate-200 dark:border-white/10"
              >
                <span>UTIITSL</span>
                <ExternalLink className="w-3 h-3 text-[#0284c7] dark:text-cyan-400" />
              </a>
            </div>
          </div>

          {/* Card: PAN Correction / Changes */}
          <div className="p-3 rounded-xl liquid-glass-sub hover:border-[#0284c7]/50 border border-slate-200 dark:border-white/10 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400" />
                <span>PAN Correction &amp; Changes (CSF)</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Name / DOB / Photo</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              Update spelling errors, father's name, DOB, signature, or address on existing PAN card.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://onlineservices.proteantech.in/paam/endUserRegisterContact.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg liquid-glass-sub hover:bg-slate-100 dark:hover:bg-white/10 text-center font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1 transition-colors border border-slate-200 dark:border-white/10"
              >
                <span>Apply Correction</span>
                <ExternalLink className="w-3 h-3 text-[#0284c7] dark:text-cyan-400" />
              </a>
              <a
                href="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/link-aadhaar-status"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg liquid-glass-sub hover:bg-slate-100 dark:hover:bg-white/10 text-center font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1 transition-colors border border-slate-200 dark:border-white/10"
              >
                <span>Link Aadhaar</span>
                <ExternalLink className="w-3 h-3 text-[#0284c7] dark:text-cyan-400" />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Dedicated <300 KB PDF Compressor */}
      {activeTab === 'compressor' && (
        <div className="space-y-3 text-xs animate-in fade-in duration-150">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Strict NSDL/UTIITSL &lt;300 KB limit for ID &amp; Address proofs.</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#0284c7] rounded-xl p-3.5 text-center cursor-pointer liquid-glass-sub transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,image/*"
              className="hidden"
            />
            <Upload className="w-5 h-5 mx-auto text-[#0284c7] mb-1" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">
              {panFile ? panFile.name : 'Select PDF or Scanned Document'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {panFile ? `${Math.round(panFile.size / 1024)} KB selected` : 'Aadhaar, Voter ID, Marksheet, Electricity bill'}
            </div>
          </div>

          {compressError && (
            <div className="text-red-500 dark:text-red-400 text-[11px] font-medium">{compressError}</div>
          )}

          {compressResult ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-slate-900 dark:text-white font-bold text-[11px]">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>Compressed to {compressResult.compressedKb} KB</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-through">
                  {compressResult.originalKb} KB
                </span>
              </div>
              <a
                href={compressResult.url}
                download={compressResult.fileName}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download &lt;300 KB PDF</span>
              </a>
            </div>
          ) : (
            <button
              onClick={handleRunCompress}
              disabled={!panFile || isCompressing}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                panFile && !isCompressing
                  ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/30'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCompressing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{compressProgress || 'Compressing...'}</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Compress Document (&lt; 300 KB)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* TAB 3: Photo & Signature Biometric Specs */}
      {activeTab === 'specs' && (
        <div className="space-y-2.5 text-xs animate-in fade-in duration-150">
          <div className="p-3 rounded-xl liquid-glass-sub space-y-1.5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>Applicant Photograph</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-mono font-semibold">
                &lt; 50 KB
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 font-mono">
              <div>Size: 3.5 cm (W) × 2.5 cm (H) (200 DPI)</div>
              <div>Pixels: approx. 213 × 213 px or 275 × 354 px</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Clear frontal face with pure white or light background.</div>
            </div>
          </div>

          <div className="p-3 rounded-xl liquid-glass-sub space-y-1.5 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400" />
                <span>Applicant Signature</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-mono font-semibold">
                &lt; 50 KB
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 font-mono">
              <div>Size: 2.0 cm (H) × 4.5 cm (W) (200 DPI)</div>
              <div>Pixels: approx. 133 × 400 px or 157 × 354 px</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Dark black ink on white paper only.</div>
            </div>
          </div>

          {onLaunchImageResize && (
            <button
              onClick={onLaunchImageResize}
              className="w-full py-2 rounded-xl liquid-glass-sub hover:border-[#0284c7] font-bold text-xs text-[#0284c7] dark:text-sky-300 hover:text-[#0369a1] dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-white/10"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Launch Govt Photo &amp; Signature Resizer</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>100% In-Browser Privacy</span>
        </div>

        <button
          onClick={onOpenFullHub}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md shadow-[#0284c7]/30 transition-all cursor-pointer active:scale-95"
        >
          <span>Open Full PAN Master Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
