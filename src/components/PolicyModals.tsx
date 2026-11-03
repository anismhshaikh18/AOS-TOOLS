import React from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl liquid-glass rounded-2xl shadow-2xl overflow-hidden my-8 border border-white/20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 liquid-glass-sub">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Privacy &amp; Security Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs text-slate-200 space-y-4 leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">
              1. Local-First Browser Processing
            </h3>
            <p className="text-slate-300">
              AOS Tools is architected around client-side execution. When you upload a PDF, image, or document, the file is loaded into your browser's private memory sandbox via the standard HTML5 File and FileReader APIs. Processing algorithms (including merging, splitting, watermarking, resizing, and rotation) are executed directly on your device's CPU through WebAssembly and JavaScript engines (such as pdf-lib and HTML5 Canvas).
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">
              2. No Remote Server File Uploads
            </h3>
            <p className="text-slate-300">
              Unlike conventional online conversion websites that transmit your confidential legal contracts, bank statements, and personal identity documents to remote servers in overseas data centers, <strong>AOS Tools never uploads your files to any remote server</strong>. Your files never leave your computer or mobile device.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">
              3. Client Khata Diary Storage
            </h3>
            <p className="text-slate-300">
              All customer ledger entries, tokens, fees, and tracking statuses in the Client Khata Diary are stored strictly in your browser's local sandbox (LocalStorage). No client names or financial balances are transmitted to any cloud database. You can export a CSV backup anytime.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">
              4. Zero Telemetry &amp; Tracking
            </h3>
            <p className="text-slate-300">
              AOS Tools contains zero analytics cookies, tracking pixels, or third-party behavioral telemetry. We do not track what files you process or which citizen services you search for.
            </p>
          </section>
        </div>

        <div className="px-6 py-3 liquid-glass-sub border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export const FreePolicyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl liquid-glass rounded-2xl shadow-2xl overflow-hidden my-8 border border-white/20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 liquid-glass-sub">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-white">
              Strict ₹0 Zero-Cost Architecture Manifesto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs text-slate-200 space-y-4 leading-relaxed">
          <div className="p-3 liquid-glass-sub border border-emerald-500/30 rounded-xl text-emerald-300">
            <strong>Core Principle:</strong> AOS Tools will never charge money, enforce subscription paywalls, or lock features behind premium tiers.
          </div>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">
              1. Zero Paid Dependencies
            </h3>
            <p className="text-slate-300">
              By leveraging the browser's own runtime for document and image processing, we have eliminated high-cost backend server computing clusters. This architecture guarantees that our operational overhead remains virtually zero, allowing us to keep this service completely free forever.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">
              2. Free For Cyber Cafes &amp; Citizens
            </h3>
            <p className="text-slate-300">
              Whether you are an individual citizen processing documents for government examinations or an operator managing an internet cafe / CSC center, AOS Tools is 100% free with unlimited conversions.
            </p>
          </section>
        </div>

        <div className="px-6 py-3 liquid-glass-sub border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
