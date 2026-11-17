import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone, CreditCard } from 'lucide-react';
import { buildWhatsAppShareUrl } from '../utils/shareUtils';

const AOS_CONSULTATION_PHONE = '919342337626';

const QUICK_TOPICS = [
  'Hello Anis Online Services! I need assistance with a PAN Card application / correction.',
  'Hello! I need help with Aadhaar Update, Smart Ration Card (TNPDS) or Certificates.',
  'Hi Anis! I want guidance on using AOS Tools / Client Diary setup.',
];

interface WhatsAppConsultationWidgetProps {
  onOpenDigitalCard?: () => void;
}

export const WhatsAppConsultationWidget: React.FC<WhatsAppConsultationWidgetProps> = ({
  onOpenDigitalCard,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(QUICK_TOPICS[0]);

  const whatsappUrl = buildWhatsAppShareUrl(message, AOS_CONSULTATION_PHONE);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
      {isOpen && (
        <div
          role="dialog"
          aria-label="AOS Direct WhatsApp Consultation"
          className="w-80 sm:w-88 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/35 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Deep Blue Header */}
          <div className="guide-banner-dark bg-gradient-to-r from-[#0B192C] to-[#072642] px-4 py-3.5 flex items-center justify-between border-b border-sky-400/20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="guide-banner-title text-xs sm:text-sm font-extrabold text-white truncate">
                  AOS Direct Consultation
                </h3>
                <p className="text-[11px] text-sky-200/90 truncate">
                  Anis Online Services · +91 93423 37626
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp widget"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <div className="text-[11px] font-semibold text-slate-600 dark:text-sky-200">
              Quick Inquiry Templates:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'PAN Card Help', text: QUICK_TOPICS[0] },
                { label: 'Smart Card / Certs', text: QUICK_TOPICS[1] },
                { label: 'AOS Tools Setup', text: QUICK_TOPICS[2] },
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => setMessage(tpl.text)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    message === tpl.text
                      ? 'bg-[#0284c7] text-white border-[#0284c7]'
                      : 'bg-slate-100 dark:bg-[#072642] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-sky-500/25 hover:border-[#0284c7]'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Your Message:
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#071322] border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
              />
            </div>

            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+919342337626"
                aria-label="Call Anis Online Services"
                title="Call +91 9342337626"
                className="p-2.5 rounded-xl bg-[#072642] hover:bg-[#0d4775] text-white border border-sky-400/30 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {onOpenDigitalCard && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDigitalCard();
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#072642] hover:bg-slate-200 dark:hover:bg-[#0d4775]/60 border border-slate-200 dark:border-sky-500/20 text-xs font-bold text-[#0284c7] dark:text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open AOS Digital Business Card (/card)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close WhatsApp consultation' : 'Open Direct WhatsApp Consultation'}
        title="Direct WhatsApp Consultation (+91 9342337626)"
        className="h-12 sm:h-13 px-4 rounded-full bg-gradient-to-r from-[#0B192C] via-[#072642] to-emerald-600 hover:brightness-110 text-white border border-emerald-400/50 shadow-2xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
      >
        {isOpen ? (
          <X className="w-5 h-5 shrink-0" />
        ) : (
          <MessageCircle className="w-5 h-5 text-emerald-300 shrink-0" />
        )}
        <span className="hidden sm:inline text-xs font-extrabold tracking-tight whitespace-nowrap">
          WhatsApp Helpdesk
        </span>
      </button>
    </div>
  );
};
