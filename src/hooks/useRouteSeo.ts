import { useEffect } from 'react';
import { ToolItem } from '../types';

const DEFAULT_TITLE = 'AOS Tools - Free, Secure & Mobile-Friendly Online Tools';
const DEFAULT_DESCRIPTION =
  'Free browser-side AOS Tools: PAN Master Hub, Client Diary, Passport Photo Studio, QR Code Generator, PDF tools, and verified citizen utilities.';

const TAB_SEO_MAP: Record<string, { title: string; description: string }> = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  pan: {
    title: 'PAN Master Hub – Form 49A, Correction & <300KB PDF | AOS Tools',
    description:
      'Access Protean (NSDL) and UTIITSL PAN services, Form 49A applications, PAN corrections, Aadhaar-PAN linking, and photo/PDF specs locally.',
  },
  khata: {
    title: 'Client Diary & Customer Ledger – Token & Fee Tracker | AOS Tools',
    description:
      'Track daily customer tokens, government portal fees, service charges, balances, receipts, and encrypted cloud backups in Client Diary.',
  },
  portals: {
    title: 'Government Portals Hub – 50+ Verified Indian Portals | AOS Tools',
    description:
      'Direct verified routes to Central Ministries, State e-Governance, TNPDS Smart Card, Banking & DBT, and essential Indian citizen utilities.',
  },
  pdf: {
    title: '19+ Free Browser PDF Tools – Compress, Merge & Convert | AOS Tools',
    description:
      'Compress PDFs under 300KB, merge, split, rotate, watermark, and convert PDF files 100% locally in your browser with zero uploads.',
  },
  image: {
    title: 'Image Utilities & Passport Photo Studio – Browser-Side | AOS Tools',
    description:
      'Create 35x45mm passport photo print sheets, resize exam photos and signatures to exact KB limits, and optimize images privately.',
  },
  special: {
    title: 'Smart ID Card, QR Code Generator & Citizen Utilities | AOS Tools',
    description:
      'Design CR80 PVC ID cards, generate QR codes and barcodes, calculate exam cutoffs, manage cloud notes, and use offline utilities.',
  },
  checklists: {
    title: 'Document Checklists & Eligibility Guides (PoI / PoA) | AOS Tools',
    description:
      'Interactive document checklists and eligibility rules for PAN Card, Aadhaar update, Ration Card, Income Certificate, Passport, and exams.',
  },
  tools: {
    title: 'All Free Online Tools Directory – 40+ Local Utilities | AOS Tools',
    description:
      'Browse all 40+ browser-side PDF, image, Passport Photo Studio, Smart ID Card, QR Code, productivity, and security tools in AOS Tools.',
  },
  card: {
    title: 'Anis Online Services – Official Digital Business Card | AOS Tools',
    description:
      'View and share the official Anis Online Services digital visiting card with instant QR code, WhatsApp helpdesk, and one-tap vCard contact.',
  },
  about: {
    title: 'About AOS Tools & Anis Online Services',
    description:
      'Learn about AOS Tools by Anis Online Services — a 100% free, private, zero-upload browser workstation built for citizens and digital counters.',
  },
  privacy: {
    title: 'Privacy & Zero-Upload Local Processing Policy | AOS Tools',
    description:
      'Read how AOS Tools processes photos, ID cards, and PDFs 100% locally inside browser memory without uploading sensitive files to external servers.',
  },
};

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Lightweight client-side SEO hook that keeps <title>, meta description,
 * canonical URL, OpenGraph, and Twitter card tags synchronized with the
 * active route or tool without affecting layout or runtime performance.
 */
export function useRouteSeo(activeTab: string, selectedTool: ToolItem | null): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const meta = selectedTool
      ? {
          title: `${selectedTool.name} – Free Online Tool | AOS Tools`,
          description: selectedTool.shortDesc || DEFAULT_DESCRIPTION,
        }
      : TAB_SEO_MAP[activeTab] || TAB_SEO_MAP.home;

    const canonicalUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;

    document.title = meta.title;
    upsertMetaTag('name', 'description', meta.description);
    upsertMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    upsertMetaTag('property', 'og:title', meta.title);
    upsertMetaTag('property', 'og:description', meta.description);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('name', 'twitter:title', meta.title);
    upsertMetaTag('name', 'twitter:description', meta.description);
    upsertCanonicalLink(canonicalUrl);
  }, [activeTab, selectedTool]);
}
