import React, { useState, useRef, useMemo } from 'react';
import {
  Languages,
  Upload,
  ArrowLeftRight,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Sparkles,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import {
  TRANSLATOR_LANGUAGES,
  LayoutPdfPage,
  TranslationMode,
  extractPdfLayoutPages,
  translateLayoutPages,
  renderLayoutPreservedPageCanvas,
  buildLayoutPreservedPdfBlob,
  buildDocumentTextSummaries,
  buildUnicodeWordDocumentBlob,
} from '../utils/pdfTranslatorEngine';

interface PdfTranslatorViewProps {
  onToast?: (msg: string) => void;
}

type WorkspaceTab = 'visual' | 'blocks' | 'text';

export const PdfTranslatorView: React.FC<PdfTranslatorViewProps> = ({ onToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('hi');
  const [translationMode, setTranslationMode] = useState<TranslationMode>('hybrid-smart');
  const [includeBilingualText, setIncludeBilingualText] = useState<boolean>(false);

  const [layoutPages, setLayoutPages] = useState<LayoutPdfPage[]>([]);
  const [hasTranslated, setHasTranslated] = useState<boolean>(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('visual');

  const [detectedSourceLang, setDetectedSourceLang] = useState<string>('');
  const [engineUsed, setEngineUsed] = useState<string>('');
  const [translatedBlockCount, setTranslatedBlockCount] = useState<number>(0);

  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const currentPage = layoutPages[activePageIndex] || null;

  // Live preview of the translated page (auto-rebuilds whenever user edits any text block!)
  const translatedPreviewDataUrl = useMemo(() => {
    if (!currentPage || !hasTranslated) return '';
    try {
      const rendered = renderLayoutPreservedPageCanvas(currentPage, targetLang);
      return rendered.toDataURL('image/jpeg', 0.9);
    } catch {
      return '';
    }
  }, [currentPage, hasTranslated, targetLang]);

  const textSummaries = useMemo(() => {
    if (layoutPages.length === 0) {
      return { sourceFullText: '', translatedFullText: '', bilingualFullText: '' };
    }
    return buildDocumentTextSummaries(layoutPages);
  }, [layoutPages]);

  const activeTextOutput =
    includeBilingualText && textSummaries.bilingualFullText
      ? textSummaries.bilingualFullText
      : hasTranslated
      ? textSummaries.translatedFullText
      : '';

  const totalTranslatableBlocks = useMemo(
    () => layoutPages.reduce((sum, p) => sum + p.blocks.filter((b) => !b.isNonTranslatable).length, 0),
    [layoutPages]
  );

  const handleFileSelect = async (file: File) => {
    abortControllerRef.current?.abort();
    setErrorMsg(null);
    setHasTranslated(false);
    setLayoutPages([]);
    setActivePageIndex(0);
    setSelectedFile(file);
    setIsExtracting(true);
    setProgressPercent(8);
    setProgressMsg('Reading PDF geometry, fonts & layout locally...');

    try {
      const pages = await extractPdfLayoutPages(file, (p) => {
        setProgressMsg(p.step);
        setProgressPercent(p.percent);
      });

      setLayoutPages(pages);
      const totalBlocks = pages.reduce((acc, p) => acc + p.blocks.length, 0);
      if (totalBlocks === 0) {
        setErrorMsg(
          'This PDF appears to be an image-only scan with no selectable text layer. Please upload a digital/text-selectable PDF (e.g., e-certificate, smart card PDF, or receipt) for exact layout translation.'
        );
      }
      setActiveTab('visual');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to read PDF file locally. Please ensure it is a valid, unencrypted PDF.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
    e.target.value = '';
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('en');
    } else {
      const prev = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prev);
    }
  };

  const handleTranslate = async () => {
    if (layoutPages.length === 0) {
      setErrorMsg('Please upload a PDF document first.');
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setErrorMsg(null);
    setIsTranslating(true);
    setProgressPercent(5);
    setProgressMsg('Initializing local layout-preserving translation engine...');

    try {
      const result = await translateLayoutPages(
        layoutPages,
        sourceLang,
        targetLang,
        translationMode,
        (p) => {
          setProgressMsg(p.step);
          setProgressPercent(p.percent);
        },
        controller.signal
      );

      setLayoutPages(result.pages);
      setDetectedSourceLang(result.detectedSourceLang);
      setEngineUsed(result.engineUsed);
      setTranslatedBlockCount(result.translatedBlockCount);
      setHasTranslated(true);
      setActiveTab('visual');
      onToast?.('Exact PDF layout translation complete!');
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to translate PDF layout.');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleUpdateBlockText = (pageNumber: number, blockId: string, newText: string) => {
    setLayoutPages((prev) =>
      prev.map((page) =>
        page.pageNumber !== pageNumber
          ? page
          : {
              ...page,
              blocks: page.blocks.map((blk) =>
                blk.id === blockId ? { ...blk, translatedText: newText } : blk
              ),
            }
      )
    );
  };

  const baseFileName = selectedFile
    ? selectedFile.name.replace(/\.pdf$/i, '')
    : 'AOS_Translated_Document';

  const handleDownloadLayoutPdf = async () => {
    if (layoutPages.length === 0 || !hasTranslated) return;
    setIsExportingPdf(true);
    setProgressPercent(10);
    setProgressMsg('Building exact layout-preserved PDF...');
    try {
      const pdfBlob = await buildLayoutPreservedPdfBlob(layoutPages, targetLang, (p) => {
        setProgressMsg(p.step);
        setProgressPercent(p.percent);
      });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFileName}_${targetLang}_exact_layout.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onToast?.('Layout-preserved translated PDF downloaded!');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to build layout-preserved PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyOutput = async () => {
    if (!activeTextOutput) return;
    try {
      await navigator.clipboard.writeText(activeTextOutput);
      setCopied(true);
      onToast?.('Translated text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast?.('Copy failed — please select text manually.');
    }
  };

  const handleDownloadTxt = () => {
    if (!activeTextOutput) return;
    const blob = new Blob(['\ufeff', activeTextOutput], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}_${targetLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    if (!activeTextOutput) return;
    const blob = buildUnicodeWordDocumentBlob(
      selectedFile?.name || 'Translated Document',
      detectedSourceLang || sourceLang,
      targetLang,
      activeTextOutput
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}_${targetLang}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    setSelectedFile(null);
    setLayoutPages([]);
    setHasTranslated(false);
    setActivePageIndex(0);
    setDetectedSourceLang('');
    setEngineUsed('');
    setTranslatedBlockCount(0);
    setErrorMsg(null);
    setProgressPercent(0);
    setProgressMsg('');
  };

  return (
    <div className="space-y-5">
      {/* Privacy & Local Architecture Banner */}
      <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-[#0B192C]/90 border border-sky-200 dark:border-sky-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-sky-400 shrink-0" />
          <span>
            <strong>Exact Layout-Preserving Engine:</strong> Original seals, photos, QR codes, tables &amp; page dimensions stay untouched. 100% browser processing.
          </span>
        </div>
        {layoutPages.length > 0 && (
          <span className="font-mono text-[11px] font-semibold text-[#0284c7] dark:text-sky-300">
            {layoutPages.length} Page{layoutPages.length > 1 ? 's' : ''} · {totalTranslatableBlocks} Fields Mapped
          </span>
        )}
      </div>

      {/* Upload Dropzone */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#0284c7]/40 dark:border-sky-500/40 hover:border-[#0284c7] dark:hover:border-sky-400 rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-colors bg-sky-50/40 dark:bg-[#0B192C]/70 group"
      >
        <Upload className="w-8 h-8 text-[#0284c7] dark:text-sky-400 group-hover:scale-110 mx-auto mb-2 transition-transform" />
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {selectedFile
            ? `Loaded: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
            : 'Click to Upload PDF (Smart Card, Certificate, Receipt or Notice)'}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
          Preserves exact XY positioning, margins, borders, photos &amp; color bars · Zero file upload to any server
        </p>
      </div>

      {/* Language & Privacy Mode Controls */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B192C]/85 border border-slate-200 dark:border-sky-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-200 mb-1.5">
              Source Document Language
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-[#072642] border border-slate-300 dark:border-sky-500/35 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            >
              <option value="auto">Auto-Detect Language</option>
              {TRANSLATOR_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwapLanguages}
            className="self-center sm:mb-0.5 p-2.5 rounded-xl bg-white dark:bg-[#072642] border border-slate-300 dark:border-sky-500/35 text-[#0284c7] dark:text-sky-300 hover:border-[#0284c7] transition-colors cursor-pointer shrink-0"
            title="Swap Source & Target Languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="flex-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-sky-200 mb-1.5">
              Target Translation Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-[#072642] border border-slate-300 dark:border-sky-500/35 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
            >
              {TRANSLATOR_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Mode Selector & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-sky-500/20">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTranslationMode('hybrid-smart')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                translationMode === 'hybrid-smart'
                  ? 'bg-[#0284c7] text-white border-[#0284c7]'
                  : 'bg-white dark:bg-[#072642] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-sky-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart High-Accuracy Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTranslationMode('strict-offline')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                translationMode === 'strict-offline'
                  ? 'bg-[#0B192C] text-sky-300 border-sky-400'
                  : 'bg-white dark:bg-[#072642] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-sky-500/30'
              }`}
              title="Uses built-in civic dictionary, phonetic Indian transliterator & on-device engine only — zero external requests"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>100% Offline Dictionary Mode</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 bg-white dark:bg-[#072642] border border-slate-300 dark:border-sky-500/25 rounded-xl cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleTranslate}
              disabled={isExtracting || isTranslating || totalTranslatableBlocks === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] disabled:opacity-50 rounded-xl shadow-md shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Translating Layout...</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>Translate Exact PDF Layout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {(isExtracting || isTranslating || isExportingPdf) && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B192C]/85 border border-slate-200 dark:border-sky-500/30 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-700 dark:text-sky-200 font-medium">
            <span>{progressMsg}</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-[#072642] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0284c7] transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Error / Notice */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Workspace Tabs & Previews (Visible once a PDF is parsed) */}
      {layoutPages.length > 0 && currentPage && (
        <div className="space-y-4">
          {/* Tab Switcher + Page Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/25">
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-[#0284c7] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visual Layout Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blocks')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'blocks'
                    ? 'bg-[#0284c7] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Edit Fields ({currentPage.blocks.filter((b) => !b.isNonTranslatable).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'text'
                    ? 'bg-[#0284c7] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text View</span>
              </button>
            </div>

            {layoutPages.length > 1 && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0B192C] border border-slate-200 dark:border-sky-500/25 text-xs font-semibold text-slate-700 dark:text-sky-200">
                <button
                  type="button"
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex((i) => Math.max(0, i - 1))}
                  className="p-1 disabled:opacity-35 hover:text-[#0284c7] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono">
                  Page {activePageIndex + 1} / {layoutPages.length}
                </span>
                <button
                  type="button"
                  disabled={activePageIndex === layoutPages.length - 1}
                  onClick={() => setActivePageIndex((i) => Math.min(layoutPages.length - 1, i + 1))}
                  className="p-1 disabled:opacity-35 hover:text-[#0284c7] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Side-by-Side Visual PDF Page Comparison */}
          {activeTab === 'visual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original Page */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B192C]/85 border border-slate-200 dark:border-sky-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                  <span>Original PDF Page {currentPage.pageNumber}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-sky-300/80">
                    {Math.round(currentPage.widthPt)} × {Math.round(currentPage.heightPt)} pt
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-sky-500/25 bg-white flex items-center justify-center max-h-[480px]">
                  <img
                    src={currentPage.originalDataUrl}
                    alt={`Original Page ${currentPage.pageNumber}`}
                    className="max-h-[460px] w-auto object-contain"
                  />
                </div>
              </div>

              {/* Exact Layout-Preserved Translated Page */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B192C]/85 border border-slate-200 dark:border-sky-500/25 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
                    <span>
                      {hasTranslated
                        ? `Translated Exact Layout (${targetLang.toUpperCase()})`
                        : 'Translated Layout Preview'}
                    </span>
                  </span>
                  {hasTranslated && detectedSourceLang && (
                    <span className="text-[11px] font-mono text-[#0284c7] dark:text-sky-300">
                      {detectedSourceLang.toUpperCase()} → {targetLang.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-sky-500/25 bg-white dark:bg-[#072642]/60 flex items-center justify-center min-h-[260px] max-h-[480px]">
                  {hasTranslated && translatedPreviewDataUrl ? (
                    <img
                      src={translatedPreviewDataUrl}
                      alt={`Translated Page ${currentPage.pageNumber}`}
                      className="max-h-[460px] w-auto object-contain"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-2 max-w-xs">
                      <Languages className="w-8 h-8 text-[#0284c7] dark:text-sky-400 mx-auto opacity-80" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Click &ldquo;Translate Exact PDF Layout&rdquo; above to reconstruct this page in{' '}
                        {TRANSLATOR_LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang.toUpperCase()} while keeping every border, seal, photo &amp; margin intact.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Interactive Block Inspector (Live Edit Updates Exact PDF Preview) */}
          {activeTab === 'blocks' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B192C]/85 border border-slate-200 dark:border-sky-500/25 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Positioned Fields on Page {currentPage.pageNumber} — Edits Update Visual Layout Instantly
                </p>
                <span className="text-[11px] text-slate-500 dark:text-sky-200/80">
                  Numeric IDs, dates &amp; codes stay pixel-original automatically
                </span>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {currentPage.blocks
                  .filter((b) => !b.isNonTranslatable)
                  .map((blk) => (
                    <div
                      key={blk.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2.5 rounded-xl bg-white dark:bg-[#072642]/80 border border-slate-200 dark:border-sky-500/20"
                    >
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center">
                        <span className="break-words">{blk.sourceText}</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={blk.translatedText}
                          onChange={(e) =>
                            handleUpdateBlockText(currentPage.pageNumber, blk.id, e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/35 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: Text Comparison View */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeBilingualText}
                    onChange={(e) => setIncludeBilingualText(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7]"
                  />
                  <span>Include Bilingual Reference in Text / Word Exports</span>
                </label>

                {activeTextOutput && (
                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#072642] border border-slate-300 dark:border-sky-500/35 rounded-lg text-slate-700 dark:text-sky-200 hover:border-[#0284c7] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                  readOnly
                  rows={10}
                  value={textSummaries.sourceFullText}
                  className="w-full p-3 text-xs leading-relaxed bg-white dark:bg-[#072642]/80 border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-slate-100"
                />
                <textarea
                  readOnly
                  rows={10}
                  value={activeTextOutput}
                  placeholder="Translate document to view formatted text output..."
                  className="w-full p-3 text-xs leading-relaxed bg-white dark:bg-[#072642]/80 border border-slate-300 dark:border-sky-500/30 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download Strip */}
      {hasTranslated && layoutPages.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-[#072642]/95 border border-emerald-200 dark:border-sky-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-emerald-800 dark:text-white flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Exact Layout Translation Ready ({translatedBlockCount} fields ·{' '}
                {engineUsed === 'offline-dictionary'
                  ? '100% Offline Local Engine'
                  : engineUsed === 'browser-native'
                  ? 'On-Device Browser Engine'
                  : 'Smart Local + Browser Engine'}
                )
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-sky-200/80">
              Downloads preserve exact original PDF dimensions, stamps, photos, QR codes &amp; margins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/40 hover:border-[#0284c7] rounded-xl cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
              <span>.TXT</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-[#0B192C] border border-slate-300 dark:border-sky-500/40 hover:border-[#0284c7] rounded-xl cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
              <span>Word (.DOC)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadLayoutPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0284c7] to-[#0d4775] hover:from-[#38bdf8] hover:to-[#0284c7] disabled:opacity-60 rounded-xl shadow-md shadow-sky-500/25 cursor-pointer transition-all"
            >
              {isExportingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rendering PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Layout-Preserved PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
