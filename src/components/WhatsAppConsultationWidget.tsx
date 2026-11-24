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
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
      {isOpen && (
        <div
          role="dialog"
          aria-label="AOS Direct WhatsApp Consultation"
          className="pointer-events-auto w-[min(21rem,calc(100vw-2rem))] sm:w-88 rounded-[20px] bg-white dark:bg-[#0B192C] border border-slate-200/80 dark:border-sky-400/35 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
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
                  className={`px-3 py-1.5 text-[11px] font-bold cursor-pointer ${
                    message === tpl.text ? 'aos-btn-soft-active' : 'aos-btn-soft'
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
                className="aos-btn-emerald flex-1 min-h-[42px] py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+919342337626"
                aria-label="Call Anis Online Services"
                title="Call +91 9342337626"
                className="aos-btn-primary w-10 h-10 flex items-center justify-center shrink-0"
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
                className="aos-btn-soft w-full min-h-[40px] py-2 px-3 text-xs font-bold text-[#0284c7] dark:text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open AOS Digital Business Card (/card)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Soft-UI Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Close WhatsApp consultation' : 'Open Direct WhatsApp Consultation'}
        title="Direct WhatsApp Consultation (+91 9342337626)"
        className="pointer-events-auto min-w-[48px] min-h-[48px] h-12 sm:h-12 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-[#0B192C] via-[#0d4775] to-emerald-600 hover:brightness-110 text-white border border-emerald-300/50 shadow-[0_12px_28px_-6px_rgba(16,185,129,0.45),0_4px_12px_rgba(11,25,44,0.3)] flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
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
