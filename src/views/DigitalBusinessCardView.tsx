import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Download,
  Copy,
  Check,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { AosLogoSvg } from '../components/AosLogoSvg';
import { buildWhatsAppShareUrl } from '../utils/shareUtils';

interface DigitalBusinessCardViewProps {
  onBackHome: () => void;
}

const FOUNDER_NAME = 'Anis Mohd Hanif Shaikh';
const BUSINESS_NAME = 'Anis Online Services';
const BRAND_SUBTITLE = 'AOS Tools · Digital Citizen Services & CSC Solutions';
const PHONE_DISPLAY = '+91 93423 37626';
const PHONE_E164 = '+919342337626';
const EMAIL = 'anis.onlineservices@gmail.com';
const PORTAL_URL = 'https://anis-online-services.pages.dev/';
const CARD_CANONICAL_URL = 'https://aos-tools.anismhshaikh18.workers.dev/card';

export const DigitalBusinessCardView: React.FC<DigitalBusinessCardViewProps> = ({
  onBackHome,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl =
    typeof window !== 'undefined' && window.location.origin.startsWith('http')
      ? `${window.location.origin}/card`
      : CARD_CANONICAL_URL;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0B192C',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        // Ignore QR fallback error
      });

    return () => {
      active = false;
    };
  }, [shareUrl]);

  const handleDownloadVCard = () => {
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Shaikh;Anis Mohd Hanif;;;',
      `FN:${FOUNDER_NAME}`,
      `ORG:${BUSINESS_NAME} (AOS Tools)`,
      'TITLE:Founder & Digital Citizen Services Consultant',
      `TEL;TYPE=CELL,VOICE,WHATSAPP:${PHONE_E164}`,
      `EMAIL;TYPE=INTERNET:${EMAIL}`,
      `URL:${CARD_CANONICAL_URL}`,
      `URL:${PORTAL_URL}`,
      'ADR;TYPE=WORK:;;Anis Online Services;Hosur / Krishnagiri;Tamil Nadu;635113;India',
      'NOTE:PAN Card Services, Aadhaar Support, Smart Ration Card (TNPDS), Passport Photo Studio & AOS Tools Browser Utilities.',
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vcardLines], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Anis_Online_Services_AOS.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCardLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const whatsappDirectUrl = buildWhatsAppShareUrl(
    `Hello ${FOUNDER_NAME} (Anis Online Services), I visited your AOS Digital Business Card and would like service assistance.`,
    '919342337626'
  );

  const shareCardOnWhatsApp = buildWhatsAppShareUrl(
    `*${BUSINESS_NAME} · Digital Business Card*\nFounder: ${FOUNDER_NAME}\nPhone / WhatsApp: ${PHONE_DISPLAY}\nEmail: ${EMAIL}\nDigital Card: ${shareUrl}`
  );

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackHome}
          className="aos-btn-soft inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#0284c7] dark:text-sky-300" />
          <span>Back to AOS Tools</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500 dark:text-sky-300/80">
          /card · Verified Digital vCard
        </span>
      </div>

      {/* Main Executive Card */}
      <article className="rounded-3xl overflow-hidden bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/30 shadow-2xl">
        {/* Deep Blue Corporate Identity Header */}
        <div className="guide-banner-dark relative bg-gradient-to-br from-[#0B192C] via-[#072642] to-[#0d4775] px-6 sm:px-10 py-8 border-b border-sky-400/25 overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-400/15 blur-3xl"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white p-1.5 ring-4 ring-sky-400/60 shadow-xl shrink-0 flex items-center justify-center">
              <AosLogoSvg className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Citizen Services Center</span>
              </div>
              <h1 className="guide-banner-title text-2xl sm:text-3xl font-black text-white tracking-tight">
                {FOUNDER_NAME}
              </h1>
              <p className="text-sm font-bold text-sky-200">{BUSINESS_NAME}</p>
              <p className="text-xs text-sky-100/85">{BRAND_SUBTITLE}</p>
            </div>
          </div>
        </div>

        {/* Contact & QR Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            {/* Primary CTAs */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="aos-btn-emerald min-h-[44px] py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${PHONE_E164}`}
                className="aos-btn-primary min-h-[44px] py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>

            {/* Direct Info List */}
            <div className="space-y-2.5 text-xs">
              <a
                href={`tel:${PHONE_E164}`}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#072642]/70 border border-slate-200 dark:border-sky-500/20 flex items-center gap-3 hover:border-[#0284c7] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Mobile &amp; WhatsApp
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {PHONE_DISPLAY}
                  </span>
                </div>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#072642]/70 border border-slate-200 dark:border-sky-500/20 flex items-center gap-3 hover:border-[#0284c7] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Official Email
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {EMAIL}
                  </span>
                </div>
              </a>

              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#072642]/70 border border-slate-200 dark:border-sky-500/20 flex items-center justify-between gap-3 hover:border-[#0284c7] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Globe className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Anis Online Services Portal
                    </span>
                    <span className="font-bold text-[#0284c7] dark:text-sky-300 truncate block">
                      anis-online-services.pages.dev
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#072642]/70 border border-slate-200 dark:border-sky-500/20 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#0284c7] dark:text-sky-300 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Service Region &amp; Desk
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    Krishnagiri District, Tamil Nadu · All-India Online Citizen Desk
                  </span>
                </div>
              </div>
            </div>

            {/* Save Contact & Share Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadVCard}
                className="aos-btn-primary flex-1 min-w-[160px] min-h-[44px] py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save Contact (.vcf)</span>
              </button>

              <button
                type="button"
                onClick={() => void handleCopyCardLink()}
                className="aos-btn-soft min-h-[42px] py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300" />
                )}
                <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
              </button>

              <a
                href={shareCardOnWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="aos-btn-soft min-h-[42px] py-2.5 px-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </a>
            </div>
          </div>

          {/* QR Code & Services Summary */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-[#072642]/70 border border-slate-200 dark:border-sky-500/25 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-white shadow-md border border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan to open AOS Digital Business Card"
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                Scan to Save &amp; Share Card
              </div>
              <p className="text-[11px] text-slate-500 dark:text-sky-200/80 mt-0.5 leading-relaxed">
                PAN Card (UTIITSL / Protean) · TNPDS Smart Card · Aadhaar · Passport Photos · PDF Suite · Client Diary
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};
