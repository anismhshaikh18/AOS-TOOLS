import React from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Privacy & Security Policy
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Local-First Browser Processing
            </h3>
            <p>
              AOS Tools is architected around client-side execution. When you upload a PDF, image, or document, the file is loaded into your browser's private memory sandbox via the standard HTML5 File and FileReader APIs. Processing algorithms (including merging, splitting, watermarking, resizing, and rotation) are executed directly on your device's CPU through WebAssembly and JavaScript engines (such as pdf-lib and HTML5 Canvas).
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. No Remote Server File Uploads
            </h3>
            <p>
              Unlike conventional online conversion websites that transmit your confidential legal contracts, bank statements, and personal identity documents to remote servers in overseas data centers, <strong>AOS Tools never uploads your files to any remote server</strong>. Your files never leave your computer or mobile device.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              3. Client Khata Diary Storage
            </h3>
            <p>
              All customer ledger entries, tokens, fees, and tracking statuses in the Client Khata Diary are stored strictly in your browser's local sandbox (LocalStorage). No client names or financial balances are transmitted to any cloud database. You can export a CSV backup anytime.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              4. Zero Telemetry & Tracking
            </h3>
            <p>
              AOS Tools contains zero analytics cookies, tracking pixels, or third-party behavioral telemetry. We do not track what files you process or which citizen services you search for.
            </p>
          </section>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Strict ₹0 Zero-Cost Architecture Manifesto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300">
            <strong>Core Principle:</strong> AOS Tools will never charge money, enforce subscription paywalls, or lock features behind premium tiers.
          </div>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1. Zero Paid Dependencies
            </h3>
            <p>
              By leveraging the browser's own runtime for document and image processing, we have eliminated high-cost backend server computing clusters. This architecture guarantees that our operational overhead remains virtually zero, allowing us to keep this service completely free forever.
            </p>
          </section>

          <section className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              2. Free For Cyber Cafes & Citizens
            </h3>
            <p>
              Whether you are an individual citizen processing documents for government examinations or an operator managing an internet cafe / CSC center, AOS Tools is 100% free with unlimited conversions.
            </p>
          </section>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
