import { GovernmentPortal, ToolItem } from '../types';
import { PDF_TOOLS } from '../data/pdfTools';
import { IMAGE_TOOLS } from '../data/imageTools';
import { SPECIAL_TOOLS } from '../data/specialTools';
import { GOVERNMENT_PORTALS } from '../data/governmentPortals';
import { PAN_SERVICES } from '../data/panMasterData';
import { DOCUMENT_CHECKLIST_GUIDES } from '../data/documentChecklists';
import { LanguageCode, getTranslatedTool } from './translations';
import { matchesMultilingualQuery } from './multilingualSearch';
import { resolvePortalRoute } from './portalRedirectRegistry';

export type UniversalResultKind = 'tool' | 'portal' | 'utility' | 'diary';

export interface DiaryRecordSummary {
  id: string;
  date: string;
  clientName: string;
  services: string;
  tokenNum: string;
  government: string;
  totalPrice: number;
  status: 'Completed' | 'Pending';
  notes?: string;
  createdAt: number;
}

export interface UniversalSearchItem {
  key: string;
  kind: UniversalResultKind;
  title: string;
  subtitle: string;
  metaLeft: string;
  metaRight?: string;
  iconName: string;
  searchFields: string[];
  /** Action payload */
  tool?: ToolItem;
  portal?: GovernmentPortal;
  portalUrl?: string;
  targetTab?: string;
  isLocked?: boolean;
}

export interface ScoredSearchResult {
  item: UniversalSearchItem;
  score: number;
  resolvedPortalUrl?: string;
  wasLegacyRedirect?: boolean;
  legacySourceMatched?: string | null;
}

const RECORDS_STORAGE_PREFIX = 'aos_tools_khata_records_v1';

const getRecordsStorageKey = (uid: string | null) =>
  uid ? `${RECORDS_STORAGE_PREFIX}::${uid}` : `${RECORDS_STORAGE_PREFIX}::guest`;

function readClientDiaryRecordsSafe(uid: string | null): DiaryRecordSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getRecordsStorageKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (rec): rec is DiaryRecordSummary =>
          Boolean(rec && typeof rec.id === 'string' && typeof rec.clientName === 'string')
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 150);
  } catch {
    return [];
  }
}

const QUICK_UTILITIES: Array<{
  id: string;
  title: string;
  subtitle: string;
  metaLeft: string;
  metaRight?: string;
  iconName: string;
  targetTab?: string;
  toolId?: string;
  keywords: string[];
}> = [
  {
    id: 'util-pan-hub',
    title: 'PAN Master Hub',
    subtitle: 'Official Form 49A New PAN, CSF Corrections, Aadhaar-PAN Linking & Document Specs',
    metaLeft: 'Utility Hub · Central PAN Guide',
    metaRight: 'UTIITSL & Protean',
    iconName: 'ShieldAlert',
    targetTab: 'pan',
    keywords: ['pan', '49a', 'csf', 'correction', 'aadhaar link', 'utiitsl', 'protean', 'nsdl'],
  },
  {
    id: 'util-portals-hub',
    title: 'Government Portals Hub',
    subtitle: 'Central, State (TNPDS Smart Card), Banking & National Citizen Utilities Directory',
    metaLeft: 'Utility Hub · 61 Official Portals',
    metaRight: 'Permanent Links',
    iconName: 'Globe',
    targetTab: 'portals',
    keywords: ['portals', 'government', 'tnpds', 'central', 'state', 'banking', 'utility'],
  },
  {
    id: 'util-doc-checklists',
    title: 'Document Checklist & Eligibility Guide Hub',
    subtitle: 'Interactive PoI/PoA checklists & eligibility rules for PAN, Aadhaar, Smart Ration Card, Certificates & Exams',
    metaLeft: 'Guide Hub · 10 Citizen Workflows',
    metaRight: 'PoI / PoA Ready',
    iconName: 'CheckSquare',
    targetTab: 'checklists',
    keywords: [
      'checklist',
      'document checklist',
      'eligibility',
      'poi',
      'poa',
      'required documents',
      'pan documents',
      'aadhaar address',
      'ration card documents',
      'income certificate',
      'community certificate',
      'passport documents',
    ],
  },
  {
    id: 'util-client-diary',
    title: 'Client Diary (Customer Ledger)',
    subtitle: 'Manage daily customer tokens, government fees, service charges & WhatsApp summaries',
    metaLeft: 'Utility Hub · Digital Ledger',
    metaRight: 'Cloud Sync Ready',
    iconName: 'BookMarked',
    targetTab: 'khata',
    keywords: ['khata', 'client diary', 'ledger', 'token', 'fees', 'whatsapp bill'],
  },
  {
    id: 'util-digital-card',
    title: 'AOS Digital Business Card (/card)',
    subtitle: 'Share Anis Online Services digital visiting card with live QR & one-tap vCard (.vcf)',
    metaLeft: 'Utility · Official Identity',
    metaRight: '/card Route',
    iconName: 'CreditCard',
    targetTab: 'card',
    keywords: ['card', 'visiting card', 'business card', 'vcard', 'vcf', 'contact', 'anis'],
  },
  {
    id: 'util-calc-age',
    title: 'Exam Age Calculator (SSC / UPSC / Govt Cutoffs)',
    subtitle: 'Calculate exact chronological age as on custom exam cutoff dates in years, months & days',
    metaLeft: 'Quick Calculator · Utility',
    metaRight: 'Quick Calculators',
    iconName: 'Calculator',
    toolId: 'quick-calculator-suite',
    keywords: ['exam age', 'cutoff', 'ssc age', 'upsc age', 'date of birth', 'dob'],
  },
  {
    id: 'util-calc-word',
    title: 'Real-Time Word, Character & UTF-8 Byte Counter',
    subtitle: 'Count words, lines, paragraphs & UTF-8 form input byte limits instantly',
    metaLeft: 'Quick Calculator · Utility',
    metaRight: 'Quick Calculators',
    iconName: 'Type',
    toolId: 'quick-calculator-suite',
    keywords: ['word counter', 'character count', 'byte limit', 'utf-8', 'typing'],
  },
  {
    id: 'util-calc-fee',
    title: 'Cyber Cafe Fee & Commission Calculator',
    subtitle: 'Split government portal fee, operator service charge, GST % & customer profit summary',
    metaLeft: 'Quick Calculator · Utility',
    metaRight: 'Quick Calculators',
    iconName: 'Receipt',
    toolId: 'quick-calculator-suite',
    keywords: ['fee calculator', 'commission', 'csc fee', 'operator charge', 'profit'],
  },
  {
    id: 'util-tools-directory',
    title: 'All Working Tools Directory',
    subtitle: 'Browse all 40+ browser-side PDF, Image, Passport Photo, Smart ID & Utility engines',
    metaLeft: 'Directory · Full Suite',
    metaRight: '100% Free',
    iconName: 'LayoutGrid',
    targetTab: 'tools',
    keywords: ['all tools', 'directory', 'catalog', 'pdf suite', 'image tools'],
  },
  {
    id: 'util-privacy',
    title: 'Privacy & Zero-Upload Guarantee',
    subtitle: 'Read how AOS Tools processes photos, IDs & PDFs 100% privately inside browser memory',
    metaLeft: 'Policy · Zero Uploads',
    iconName: 'Lock',
    targetTab: 'privacy',
    keywords: ['privacy', 'policy', 'local', 'zero upload', 'security'],
  },
  {
    id: 'util-about',
    title: 'About AOS Tools & Anis Online Services',
    subtitle: 'Mission, offline architecture & citizen center digital toolkit overview',
    metaLeft: 'Information · AOS Suite',
    iconName: 'BookOpen',
    targetTab: 'about',
    keywords: ['about', 'anis', 'mission', 'aos tools'],
  },
];

export function buildUniversalIndex(params: {
  lang: LanguageCode;
  userId: string | null;
  isToolLocked: (toolId: string) => boolean;
}): UniversalSearchItem[] {
  const { lang, userId, isToolLocked } = params;
  const items: UniversalSearchItem[] = [];
  const rawTools = [...PDF_TOOLS, ...IMAGE_TOOLS, ...SPECIAL_TOOLS];
  const seenToolIds = new Set<string>();

  // 1. All Tools & Pro Studios
  const EXTRA_TOOL_KEYWORDS: Record<string, string[]> = {
    'typing-test': ['typing', 'wpm', 'cpm', 'speed test', 'keyboard', 'accuracy', 'productivity'],
    'todo-list': ['todo', 'tasks', 'checklist', 'planner', 'reminder', 'productivity'],
    'notes-app': [
      'notes',
      'google notes',
      'google keep',
      'keep',
      'cloud sync',
      'checklist',
      'notepad',
      'scratchpad',
      'memo',
      'local storage',
      'productivity',
    ],
    stopwatch: ['stopwatch', 'timer', 'lap', 'chronometer', 'clock', 'productivity'],
    'password-generator': ['password', 'passphrase', 'strong', 'random', 'security', 'entropy'],
    'url-encoder-decoder': ['url', 'encode', 'decode', 'uri', 'query', 'percent', 'security', 'dev'],
  };

  for (const rawTool of rawTools) {
    if (seenToolIds.has(rawTool.id)) continue;
    seenToolIds.add(rawTool.id);
    const t = getTranslatedTool(rawTool, lang);
    const catLabel =
      t.category === 'pdf'
        ? 'PDF Utility'
        : t.category === 'image'
        ? 'Image Studio'
        : rawTool.utilityGroup === 'productivity'
        ? 'Productivity Utility'
        : rawTool.utilityGroup === 'security'
        ? 'Security & Web Utility'
        : 'AOS Pro Tool';

    items.push({
      key: `tool:${t.id}`,
      kind: 'tool',
      title: t.name,
      subtitle: t.shortDesc,
      metaLeft: `Tool · ${catLabel}`,
      metaRight: t.badge || (t.acceptedFormats ? t.acceptedFormats : 'In-Browser'),
      iconName: t.iconName,
      searchFields: [
        t.name,
        rawTool.name,
        t.shortDesc,
        rawTool.shortDesc,
        t.category,
        rawTool.utilityGroup || '',
        t.id,
        t.badge || '',
        ...(EXTRA_TOOL_KEYWORDS[t.id] || []),
      ],
      tool: t,
      isLocked: isToolLocked(t.id),
    });
  }

  // 2. All Government Portals (Central, State, TNPDS, Banking, Utility)
  const portalsLocked = isToolLocked('gov-portals');
  for (const portal of GOVERNMENT_PORTALS) {
    items.push({
      key: `portal:${portal.id}`,
      kind: 'portal',
      title: portal.name,
      subtitle: portal.description,
      metaLeft: `Govt Portal · ${portal.hubGroup}${portal.state ? ` · ${portal.state}` : ''}`,
      metaRight: portal.officialDomain,
      iconName: 'Globe',
      searchFields: [
        portal.name,
        portal.description,
        portal.category,
        portal.hubGroup,
        portal.officialDomain,
        portal.portalUrl,
        portal.state || '',
        ...(portal.legacyAliases || []),
      ],
      portal,
      portalUrl: portal.portalUrl,
      targetTab: 'portals',
      isLocked: portalsLocked,
    });
  }

  // 3. Quick Utility Sections & PAN Master Hub Guides
  for (const util of QUICK_UTILITIES) {
    const linkedTool = util.toolId ? rawTools.find((t) => t.id === util.toolId) : undefined;
    const translatedLinkedTool = linkedTool ? getTranslatedTool(linkedTool, lang) : undefined;
    const gateId =
      util.targetTab === 'pan'
        ? 'pan-master-hub'
        : util.targetTab === 'khata'
        ? 'khata-diary'
        : util.targetTab === 'portals'
        ? 'gov-portals'
        : util.toolId;

    items.push({
      key: `utility:${util.id}`,
      kind: 'utility',
      title: util.title,
      subtitle: util.subtitle,
      metaLeft: util.metaLeft,
      metaRight: util.metaRight,
      iconName: util.iconName,
      searchFields: [util.title, util.subtitle, util.metaLeft, ...util.keywords],
      tool: translatedLinkedTool,
      targetTab: util.targetTab,
      isLocked: gateId ? isToolLocked(gateId) : false,
    });
  }

  const panLocked = isToolLocked('pan-master-hub');
  for (const guide of PAN_SERVICES) {
    items.push({
      key: `utility:pan-${guide.id}`,
      kind: 'utility',
      title: guide.title,
      subtitle: guide.description,
      metaLeft: `PAN Master Hub · ${guide.type} Guide`,
      metaRight: typeof guide.fees === 'string' ? guide.fees.slice(0, 28) : 'Official Guide',
      iconName: 'ShieldAlert',
      searchFields: [
        guide.title,
        guide.description,
        guide.type,
        'pan master hub',
        ...guide.eligibility,
      ],
      targetTab: 'pan',
      isLocked: panLocked,
    });
  }

  for (const checklist of DOCUMENT_CHECKLIST_GUIDES) {
    items.push({
      key: `utility:checklist-${checklist.id}`,
      kind: 'utility',
      title: checklist.title,
      subtitle: checklist.summary,
      metaLeft: `Document Checklist · ${checklist.categoryLabel}`,
      metaRight: `${checklist.checklist.length} Docs · PoI/PoA`,
      iconName: 'CheckSquare',
      searchFields: [
        checklist.title,
        checklist.shortTitle,
        checklist.summary,
        checklist.categoryLabel,
        checklist.portalMode,
        'checklist eligibility documents poi poa',
        ...checklist.keywords,
        ...checklist.eligibilityRules,
        ...checklist.checklist.map((c) => `${c.label} ${c.tag}`),
      ],
      targetTab: `checklists:${checklist.id}`,
      isLocked: false,
    });
  }

  // 4. Client Diary Records (strictly read ONLY when Client Diary is unlocked!)
  if (!isToolLocked('khata-diary')) {
    const records = readClientDiaryRecordsSafe(userId);
    for (const rec of records) {
      items.push({
        key: `diary:${rec.id}`,
        kind: 'diary',
        title: rec.clientName,
        subtitle: `${rec.services}${rec.notes ? ` — ${rec.notes}` : ''}`,
        metaLeft: `Client Diary · Token #${rec.tokenNum || '—'} · ${rec.date}`,
        metaRight: `₹${rec.totalPrice} · ${rec.status}`,
        iconName: 'BookMarked',
        searchFields: [
          rec.clientName,
          rec.services,
          rec.tokenNum,
          rec.government,
          rec.date,
          rec.status,
          rec.notes || '',
          'client diary khata',
        ],
        targetTab: 'khata',
        isLocked: false,
      });
    }
  }

  return items;
}

export function searchUniversalIndex(
  items: UniversalSearchItem[],
  rawQuery: string,
  kindFilter: 'all' | UniversalResultKind = 'all',
  limit = 28
): ScoredSearchResult[] {
  const q = rawQuery.trim().toLowerCase();

  const pool =
    kindFilter === 'all' ? items : items.filter((item) => item.kind === kindFilter);

  if (!q) {
    // Curated starter set across all sectors
    const featuredKeys = new Set([
      'tool:passport-photo-studio',
      'tool:smart-id-card-studio',
      'tool:typing-test',
      'tool:todo-list',
      'tool:notes-app',
      'tool:stopwatch',
      'tool:password-generator',
      'tool:url-encoder-decoder',
      'tool:photo-signature-resize',
      'tool:compress-pdf',
      'tool:qr-code-generator',
      'portal:tnpds-tamil-nadu',
      'portal:utiitsl-pan',
      'utility:util-pan-hub',
      'utility:util-doc-checklists',
      'utility:util-client-diary',
    ]);
    const featured = pool.filter((it) => featuredKeys.has(it.key));
    const diaryTop = pool.filter((it) => it.kind === 'diary').slice(0, 3);
    const combined = [...featured, ...diaryTop];
    const used = new Set(combined.map((c) => c.key));
    for (const it of pool) {
      if (combined.length >= limit) break;
      if (!used.has(it.key)) {
        combined.push(it);
        used.add(it.key);
      }
    }
    return combined.slice(0, limit).map((item) => ({
      item,
      score: 10,
      resolvedPortalUrl: item.portalUrl,
    }));
  }

  const results: ScoredSearchResult[] = [];

  for (const item of pool) {
    const titleLower = item.title.toLowerCase();
    const subtitleLower = item.subtitle.toLowerCase();
    const metaRightLower = (item.metaRight || '').toLowerCase();

    let score = 0;

    if (titleLower === q) score = 100;
    else if (titleLower.startsWith(q)) score = 85;
    else if (titleLower.includes(q)) score = 70;
    else if (metaRightLower.includes(q)) score = 60;
    else if (subtitleLower.includes(q)) score = 45;
    else if (matchesMultilingualQuery(q, item.searchFields)) score = 30;

    if (score > 0) {
      if (item.portal) {
        const route = resolvePortalRoute(item.portal, q);
        results.push({
          item,
          score: route.wasLegacyRedirect ? score + 15 : score,
          resolvedPortalUrl: route.primaryUrl,
          wasLegacyRedirect: route.wasLegacyRedirect,
          legacySourceMatched: route.legacySourceMatched,
        });
      } else {
        results.push({ item, score });
      }
    }
  }

  results.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return results.slice(0, limit);
}

export function getUniversalKindCounts(
  items: UniversalSearchItem[],
  rawQuery: string
): Record<'all' | UniversalResultKind, number> {
  const q = rawQuery.trim().toLowerCase();
  const counts: Record<'all' | UniversalResultKind, number> = {
    all: 0,
    tool: 0,
    portal: 0,
    utility: 0,
    diary: 0,
  };

  if (!q) {
    for (const item of items) {
      counts.all++;
      counts[item.kind]++;
    }
    return counts;
  }

  for (const item of items) {
    const matched =
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      (item.metaRight || '').toLowerCase().includes(q) ||
      matchesMultilingualQuery(q, item.searchFields);
    if (matched) {
      counts.all++;
      counts[item.kind]++;
    }
  }

  return counts;
}
