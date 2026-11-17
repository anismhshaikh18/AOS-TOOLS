import { GovernmentPortal } from '../types';

export interface ResolvedPortalRoute {
  primaryUrl: string;
  rootGatewayUrl: string;
  fallbackUrls: string[];
  canonicalDomain: string;
  wasLegacyRedirect: boolean;
  legacySourceMatched?: string;
}

/**
 * Maps legacy, retired, or frequently changed government sub-domains/paths
 * onto their verified permanent root entry URLs so bookmarks and links
 * never land on expired endpoints.
 */
export const LEGACY_PORTAL_REDIRECT_MAP: Record<string, string> = {
  'onlineservices.nsdl.com': 'https://www.protean-tinpan.com',
  'tin-nsdl.com': 'https://www.protean-tinpan.com',
  'www.tin-nsdl.com': 'https://www.protean-tinpan.com',
  'pan.utiitsl.com': 'https://www.utiitsl.com',
  'www.pan.utiitsl.com': 'https://www.utiitsl.com',
  'nvsp.in': 'https://voters.eci.gov.in',
  'www.nvsp.in': 'https://voters.eci.gov.in',
  'tnpds.com': 'https://www.tnpds.gov.in/pages/home',
  'www.tnpds.com': 'https://www.tnpds.gov.in/pages/home',
  'edistrict.tn.gov.in': 'https://www.tnesevai.tn.gov.in',
  'unifiedportal-mem.epfindia.gov.in': 'https://www.epfindia.gov.in',
  'incometaxindiaefiling.gov.in': 'https://www.incometax.gov.in',
  'www.incometaxindiaefiling.gov.in': 'https://www.incometax.gov.in',
  'resident.uidai.gov.in': 'https://myaadhaar.uidai.gov.in',
  'mera.pmjay.gov.in': 'https://beneficiary.nha.gov.in',
  'npscra.nsdl.co.in': 'https://www.npscra.nsdl.co.in',
  'bharatgas.com': 'https://www.mylpg.in',
  'indane.co.in': 'https://www.mylpg.in',
  'ceir.gov.in': 'https://ceir.sancharsaathi.gov.in/',
  'www.ceir.gov.in': 'https://ceir.sancharsaathi.gov.in/',
};

/**
 * Extracts a clean HTTPS root domain (scheme + host) as a guaranteed permanent gateway fallback.
 */
export function extractRootGateway(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}

/**
 * Resolves a GovernmentPortal record through the permanent redirect & fallback registry,
 * returning an unbreakable primary HTTPS URL, clean root domain gateway, and ordered backups.
 */
export function resolvePortalRoute(
  portal: GovernmentPortal,
  searchQuery?: string
): ResolvedPortalRoute {
  let primaryUrl = portal.portalUrl.trim();
  if (!/^https?:\/\//i.test(primaryUrl)) {
    primaryUrl = `https://${primaryUrl}`;
  }

  let wasLegacyRedirect = false;
  let legacySourceMatched: string | undefined;

  try {
    const host = new URL(primaryUrl).hostname.toLowerCase();
    if (LEGACY_PORTAL_REDIRECT_MAP[host]) {
      legacySourceMatched = host;
      primaryUrl = LEGACY_PORTAL_REDIRECT_MAP[host];
      wasLegacyRedirect = true;
    }
  } catch {
    // Keep sanitized primaryUrl
  }

  if (searchQuery && portal.legacyAliases?.length) {
    const q = searchQuery.trim().toLowerCase();
    const matchedAlias = portal.legacyAliases.find(
      (alias) => q.length >= 3 && alias.toLowerCase().includes(q)
    );
    if (matchedAlias) {
      wasLegacyRedirect = true;
      legacySourceMatched = matchedAlias;
    }
  }

  const rootGatewayUrl = extractRootGateway(primaryUrl);
  const uniqueFallbacks: string[] = [];
  const seen = new Set<string>([primaryUrl.replace(/\/+$/, '')]);

  for (const candidate of [rootGatewayUrl, ...(portal.fallbackUrls || [])]) {
    const clean = candidate.trim().replace(/\/+$/, '');
    if (clean && /^https?:\/\//i.test(candidate) && !seen.has(clean)) {
      seen.add(clean);
      uniqueFallbacks.push(candidate.trim());
    }
  }

  return {
    primaryUrl,
    rootGatewayUrl,
    fallbackUrls: uniqueFallbacks,
    canonicalDomain: portal.officialDomain,
    wasLegacyRedirect,
    legacySourceMatched,
  };
}
