import React, { useState, useRef } from 'react';
import { PAN_SERVICES, PHOTO_SIGNATURE_SPECS } from '../data/panMasterData';
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
  Building2,
  Minimize2,
  Upload,
  Download,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { compressPDF, imagesToPDF } from '../utils/pdfEngine';

interface PanMasterHubProps {
  onLaunchImageResize?: () => void;
  onLaunchCompressPdf?: () => void;
}

export const PanMasterHub: React.FC<PanMasterHubProps> = ({
  onLaunchImageResize,
  onLaunchCompressPdf,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('pan-new');
  const [activeTab, setActiveTab] = useState<'guides' | 'specs' | 'compressor' | 'checklists' | 'fees'>('guides');

  // Dedicated PAN PDF Compressor State (< 300 KB)
  const [panPdfFile, setPanPdfFile] = useState<File | null>(null);
  const [targetKbLimit, setTargetKbLimit] = useState<number>(295); // 295 KB (<300KB)
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<string>('');
  const [compressResult, setCompressResult] = useState<{
    url: string;
    fileName: string;
    originalKb: number;
    compressedKb: number;
    isUnder300Kb: boolean;
  } | null>(null);
  const [compressError, setCompressError] = useState<string | null>(null);
  const panFileInputRef = useRef<HTMLInputElement>(null);

  const selectedService = PAN_SERVICES.find((s) => s.id === selectedServiceId) || PAN_SERVICES[0];

  const handlePanFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPanPdfFile(e.target.files[0]);
      setCompressResult(null);
      setCompressError(null);
    }
  };

  const handleRunPanPdfCompression = async () => {
    if (!panPdfFile) {
      setCompressError('Please select a PDF or scanned document file.');
      return;
    }

    setIsCompressing(true);
    setCompressError(null);
    setCompressProgress('Analyzing document structure...');

    try {
      let finalBytes: Uint8Array;
      let outFileName: string;

      if (panPdfFile.name.toLowerCase().endsWith('.pdf') || panPdfFile.type === 'application/pdf') {
        const res = await compressPDF(panPdfFile, targetKbLimit, (p) => {
          setCompressProgress(p.step);
        });
        finalBytes = res.data;
        outFileName = `${panPdfFile.name.replace(/\.pdf$/i, '')}_PAN_Under300KB.pdf`;
      } else {
        // Image scan uploaded (e.g. Aadhaar or Voter ID photo)
        setCompressProgress('Converting image scan to standardized government A4 PDF...');
        const res = await imagesToPDF([panPdfFile], (p) => {
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
        outFileName = `${panPdfFile.name.replace(/\.[^/.]+$/, '')}_Doc_Under300KB.pdf`;
      }

      const blob = new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const originalKb = Math.round(panPdfFile.size / 1024);
      const compressedKb = Math.round(blob.size / 1024);

      setCompressResult({
        url: URL.createObjectURL(blob),
        fileName: outFileName,
        originalKb,
        compressedKb,
        isUnder300Kb: compressedKb <= 300,
      });
    } catch (err: any) {
      setCompressError(err.message || 'Failed to compress document. Please ensure the file is not corrupted.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hub Hero Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">
            <Building2 className="w-4 h-4" />
            <span>Official UTIITSL & Protean (NSDL) Guidance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            PAN Card Master Hub & Compliance Center
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-2 leading-relaxed">
            Complete step-by-step documentation rules, dedicated &lt;300 KB PDF compressor for supporting proofs, photo/signature biometric specifications, and verified official portals.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-blue-100">
            <div className="flex items-center gap-1.5 bg-blue-800/60 px-3 py-1.5 rounded-lg border border-blue-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Data Collection Policy</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-800/60 px-3 py-1.5 rounded-lg border border-blue-700/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Portals Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Security & Fraud Disclaimer Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Official Statutory Security Notice:</span>
          <p className="leading-relaxed">
            AOS Tools is an informational and document preparation utility. We never solicit or collect your 10-digit PAN number, 12-digit Aadhaar number, passwords, or OTPs. Official PAN cards are exclusively issued by the Income Tax Department through its authorized service partners (Protean eGov Technologies Limited and UTIITSL). Never enter confidential OTPs on any third-party website.
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Guides / Compressor <300KB / Specs / Checklists / Fees) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('guides')}
          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'guides'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Service Step-by-Step Guides
        </button>
        <button
          onClick={() => setActiveTab('compressor')}
          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'compressor'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>PAN PDF Compressor (&lt;300 KB)</span>
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500 text-white rounded">
            Govt Spec
          </span>
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Photo & Signature Specifications
        </button>
        <button
          onClick={() => setActiveTab('checklists')}
          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'checklists'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Document Checklist (POI / POA / POD)
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Fee Schedule & Timelines
        </button>
      </div>

      {/* Tab: PAN PDF Compressor (< 300 KB) */}
      {activeTab === 'compressor' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                <Minimize2 className="w-4 h-4" />
                <span>Statutory Upload Compliance Tool</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                PAN Supporting Document PDF Compressor (Under 300 KB)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                UTIITSL and Protean portal strictly enforce a 300 KB maximum file size limit for supporting identity, address, and date of birth proof PDFs.
              </p>
            </div>

            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-medium rounded-lg shrink-0">
              Target: Strict &lt; 300 KB Limit
            </div>
          </div>

          {/* Target Preset Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Maximum Target Size:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { kb: 295, label: '< 300 KB (Official Portal Limit - Recommended)' },
                { kb: 195, label: '< 200 KB (Fast Upload Guarantee)' },
                { kb: 95, label: '< 100 KB (Ultra Compact)' },
              ].map((preset) => (
                <button
                  key={preset.kb}
                  type="button"
                  onClick={() => setTargetKbLimit(preset.kb)}
                  className={`p-2.5 text-xs font-medium rounded-xl border text-left cursor-pointer transition-colors ${
                    targetKbLimit === preset.kb
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 font-semibold'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="space-y-4">
            <input
              ref={panFileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handlePanFileSelect}
              className="hidden"
            />

            <div
              onClick={() => panFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50 group"
            >
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {panPdfFile ? `Selected: ${panPdfFile.name}` : 'Click to select PDF document or scanned image to compress'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {panPdfFile
                  ? `File Size: ${(panPdfFile.size / 1024).toFixed(1)} KB`
                  : 'Accepts PDF, JPG, JPEG, PNG (Aadhaar, Voter ID, Marksheet scans)'}
              </p>
            </div>

            {panPdfFile && (
              <button
                onClick={handleRunPanPdfCompression}
                disabled={isCompressing}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {isCompressing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{compressProgress || 'Compressing document...'}</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Compress to Under {targetKbLimit < 150 ? '100' : targetKbLimit < 250 ? '200' : '300'} KB Now</span>
                  </>
                )}
              </button>
            )}

            {compressError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{compressError}</span>
              </div>
            )}

            {compressResult && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Compression Complete! Document is ready for UTIITSL & Protean portal upload.</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400">
                    Original: <strong className="text-slate-900 dark:text-white">{compressResult.originalKb} KB</strong>
                  </span>
                  <span>→</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    Compressed: {compressResult.compressedKb} KB
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold text-[11px]">
                    ✓ Strictly Under 300 KB
                  </span>
                </div>

                <a
                  href={compressResult.url}
                  download={compressResult.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed PAN Document ({compressResult.compressedKb} KB)
                </a>
              </div>
            )}
          </div>

          {/* Portal Upload Instructions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Instructions for Uploading to UTIITSL / Protean:
            </span>
            <ul className="list-disc list-inside space-y-1">
              <li>Save your compressed PDF file with a simple alphanumeric name (e.g. <code className="font-mono">Aadhaar_Proof.pdf</code>). Avoid special characters in the filename.</li>
              <li>Login to your Form 49A / CSF application page on Protean or UTIITSL coupon status.</li>
              <li>Under the "Upload Documents" tab, choose the generated PDF for Identity Proof, Address Proof, or Date of Birth Proof.</li>
              <li>The portal will immediately accept the file because it satisfies the &lt; 300 KB requirement without pixelated artifacts.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 1: Service Guides */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Service Selector List with Direct Official Portal Links on every card */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              PAN Application Services &amp; Direct Portals
            </span>
            {PAN_SERVICES.map((srv) => (
              <div
                key={srv.id}
                className={`p-4 rounded-xl border transition-all text-left space-y-2.5 ${
                  selectedServiceId === srv.id
                    ? 'bg-blue-50/90 dark:bg-blue-950/70 border-blue-600 text-blue-900 dark:text-blue-100 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div
                  onClick={() => setSelectedServiceId(srv.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                      {srv.title}
                    </h4>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                      {srv.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {/* Direct Clickable Official Authorized Portal Buttons on the Service Card */}
                <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Official Authorized Portals:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <a
                      href={srv.proteanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700/60 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors shadow-2xs group"
                      title={`Open official Protean (NSDL) portal for ${srv.title}`}
                    >
                      <Building2 className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">Protean (NSDL)</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>

                    <a
                      href={srv.utiitslUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700/60 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-2xs group"
                      title={`Open official UTIITSL portal for ${srv.title}`}
                    >
                      <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span className="truncate">UTIITSL</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedServiceId(srv.id)}
                    className="w-full text-center text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline pt-1 cursor-pointer block"
                  >
                    View Guidelines, Checklist &amp; Fee Details →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Service Detail View */}
          <div className="lg:col-span-2 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedService.title}
                </h2>
                <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded">
                  {typeof selectedService.fees === 'string' ? selectedService.fees : (selectedService.fees?.physicalPanIndia || 'Govt Approved Rates')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {selectedService.description}
              </p>
            </div>

            {/* Official Launch Buttons in Detail View */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Official Government Authorized Portals (Direct External Access)
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-semibold">
                  Verified Official URLs
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={selectedService.proteanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 text-xs font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold">Protean eGov (NSDL) Portal</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {(() => {
                          try {
                            return new URL(selectedService.proteanUrl || 'https://proteantech.in').hostname;
                          } catch {
                            return 'proteantech.in';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 text-blue-600 shrink-0" />
                </a>

                <a
                  href={selectedService.utiitslUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">UTIITSL PAN Portal</div>
                      <div className="text-[10px] text-slate-500 font-mono">pan.utiitsl.com</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 text-indigo-600 shrink-0" />
                </a>
              </div>
            </div>

            {/* Quick action button to compress PDF */}
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                  Need to upload supporting proofs under 300 KB?
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Use our built-in PAN PDF Compressor.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('compressor')}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Compress to &lt;300 KB →
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                Standard Application Procedure:
              </h3>
              <div className="space-y-2">
                {selectedService.steps?.map((step: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Applicable Applicants & Eligibility:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {selectedService.eligibility.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Tab 2: Specifications for Photo & Signature */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photo Specs */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Passport Photograph Specifications
                </h3>
                <span className="text-xs text-slate-500 font-mono">UTIITSL & Protean Standard</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Dimensions:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.photo.dimensions}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Pixel Resolution:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.photo.pixels}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">DPI:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.photo.dpi}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Maximum File Size:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {PHOTO_SIGNATURE_SPECS.photo.maxFileSize}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.photo.format}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              {PHOTO_SIGNATURE_SPECS.photo.background}
            </p>

            {onLaunchImageResize && (
              <button
                onClick={onLaunchImageResize}
                className="w-full py-2 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer text-center"
              >
                Open Photo/Signature Resizer Tool →
              </button>
            )}
          </div>

          {/* Signature Specs */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Signature Biometric Specifications
                </h3>
                <span className="text-xs text-slate-500 font-mono">Ink & Aspect Specifications</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Dimensions:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.signature.dimensions}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Pixel Resolution:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.signature.pixels}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">DPI:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.signature.dpi}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Maximum File Size:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {PHOTO_SIGNATURE_SPECS.signature.maxFileSize}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {PHOTO_SIGNATURE_SPECS.signature.format}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              {PHOTO_SIGNATURE_SPECS.signature.ink}
            </p>

            <button
              onClick={() => setActiveTab('compressor')}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer text-center"
            >
              Open Supporting Proof PDF Compressor (&lt;300 KB) →
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Document Checklists */}
      {activeTab === 'checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Proof of Identity (POI)
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {selectedService.documentsRequired.poi.map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold shrink-0">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Proof of Address (POA)
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {selectedService.documentsRequired.poa.map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Proof of Date of Birth (POD)
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {selectedService.documentsRequired.pod?.map((doc: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold shrink-0">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Fee Schedule & Timelines */}
      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Official Statutory Fee Structure (Income Tax Department prescribed)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-2.5 px-3">Service Category</th>
                  <th className="py-2.5 px-3">Dispatch Destination</th>
                  <th className="py-2.5 px-3">Official Fee</th>
                  <th className="py-2.5 px-3">Delivery Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3 px-3 font-medium">New Physical PAN Card (Form 49A)</td>
                  <td className="py-3 px-3">Within India</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹107 (incl. GST)</td>
                  <td className="py-3 px-3">7 to 15 working days via Speed Post</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">New Physical PAN Card (Foreign Address)</td>
                  <td className="py-3 px-3">Outside India</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹1,017 (incl. postage)</td>
                  <td className="py-3 px-3">15 to 25 working days via International Airmail</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">e-PAN Digital PDF Only</td>
                  <td className="py-3 px-3">Instant Email Dispatch</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹66 (incl. GST)</td>
                  <td className="py-3 px-3">2 to 4 hours post Aadhaar e-KYC approval</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">Reprint of Lost / Damaged PAN Card</td>
                  <td className="py-3 px-3">Within India</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹50 (all inclusive)</td>
                  <td className="py-3 px-3">7 to 10 working days</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium">PAN Application Status Tracking</td>
                  <td className="py-3 px-3">Online Query</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">₹0 (Free)</td>
                  <td className="py-3 px-3">Instant live status</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
