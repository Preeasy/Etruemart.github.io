import { prisma } from './prisma';

// Region codes used by shipping templates
export type RegionCode = 'US' | 'CA' | 'EU' | 'AU_NZ' | 'ASIA' | 'GLOBAL';

// Map a country (name or ISO code) to a shipping region.
// Falls back to GLOBAL when no match is found.
const COUNTRY_TO_REGION: Record<string, RegionCode> = {
  // United States
  US: 'US', USA: 'US', 'UNITED STATES': 'US', 'UNITED STATES OF AMERICA': 'US',
  // Canada
  CA: 'CA', CANADA: 'CA',
  // Europe (EU + common non-EU European countries)
  GB: 'EU', UK: 'EU', 'UNITED KINGDOM': 'EU', ENGLAND: 'EU', SCOTLAND: 'EU', WALES: 'EU',
  DE: 'EU', GERMANY: 'EU', FR: 'EU', FRANCE: 'EU', IT: 'EU', ITALY: 'EU', ES: 'EU', SPAIN: 'EU',
  NL: 'EU', 'NETHERLANDS': 'EU', HOLLAND: 'EU', BE: 'EU', BELGIUM: 'EU', PT: 'EU', PORTUGAL: 'EU',
  SE: 'EU', SWEDEN: 'EU', NO: 'EU', NORWAY: 'EU', DK: 'EU', DENMARK: 'EU', FI: 'EU', FINLAND: 'EU',
  IE: 'EU', IRELAND: 'EU', AT: 'EU', AUSTRIA: 'EU', CH: 'EU', SWITZERLAND: 'EU',
  PL: 'EU', POLAND: 'EU', CZ: 'EU', 'CZECH REPUBLIC': 'EU', 'CZECHIA': 'EU',
  GR: 'EU', GREECE: 'EU', HU: 'EU', HUNGARY: 'EU', RO: 'EU', ROMANIA: 'EU',
  BG: 'EU', BULGARIA: 'EU', HR: 'EU', CROATIA: 'EU', SK: 'EU', SLOVAKIA: 'EU', SI: 'EU', SLOVENIA: 'EU',
  LT: 'EU', LITHUANIA: 'EU', LV: 'EU', LATVIA: 'EU', EE: 'EU', ESTONIA: 'EU',
  LU: 'EU', LUXEMBOURG: 'EU', MT: 'EU', CY: 'EU', CYPRUS: 'EU', IS: 'EU', ICELAND: 'EU',
  // Oceania
  AU: 'AU_NZ', AUSTRALIA: 'AU_NZ', NZ: 'AU_NZ', 'NEW ZEALAND': 'AU_NZ',
  // Asia
  JP: 'ASIA', JAPAN: 'ASIA', KR: 'ASIA', 'SOUTH KOREA': 'ASIA', KOREA: 'ASIA',
  SG: 'ASIA', SINGAPORE: 'ASIA', MY: 'ASIA', MALAYSIA: 'ASIA', TH: 'ASIA', THAILAND: 'ASIA',
  ID: 'ASIA', INDONESIA: 'ASIA', PH: 'ASIA', PHILIPPINES: 'ASIA', VN: 'ASIA', VIETNAM: 'ASIA',
  IN: 'ASIA', INDIA: 'ASIA', PK: 'ASIA', PAKISTAN: 'ASIA', BD: 'ASIA', BANGLADESH: 'ASIA',
  HK: 'ASIA', 'HONG KONG': 'ASIA', TW: 'ASIA', TAIWAN: 'ASIA', MO: 'ASIA', MACAO: 'ASIA',
  KH: 'ASIA', CAMBODIA: 'ASIA', LA: 'ASIA', LAOS: 'ASIA', MM: 'ASIA', MYANMAR: 'ASIA',
  LK: 'ASIA', 'SRI LANKA': 'ASIA', NP: 'ASIA', NEPAL: 'ASIA',
  // Middle East (treated as ASIA)
  AE: 'ASIA', 'UNITED ARAB EMIRATES': 'ASIA', UAE: 'ASIA', SA: 'ASIA', 'SAUDI ARABIA': 'ASIA',
  IL: 'ASIA', ISRAEL: 'ASIA', TR: 'ASIA', TURKEY: 'ASIA', QA: 'ASIA', QATAR: 'ASIA',
  KW: 'ASIA', KUWAIT: 'ASIA', BH: 'ASIA', BAHRAIN: 'ASIA', OM: 'ASIA', OMAN: 'ASIA',
  JO: 'ASIA', JORDAN: 'ASIA', LB: 'ASIA', LEBANON: 'ASIA',
};

export function countryToRegion(country: string): RegionCode {
  if (!country) return 'GLOBAL';
  const normalized = country.trim().toUpperCase();
  // Try direct match
  if (COUNTRY_TO_REGION[normalized]) return COUNTRY_TO_REGION[normalized];
  // Try ISO-3
  const iso3ToRegion: Record<string, RegionCode> = {
    USA: 'US', CAN: 'CA', GBR: 'EU', DEU: 'EU', FRA: 'EU', ITA: 'EU', ESP: 'EU',
    NLD: 'EU', BEL: 'EU', PRT: 'EU', SWE: 'EU', NOR: 'EU', DNK: 'EU', FIN: 'EU',
    IRL: 'EU', AUT: 'EU', CHE: 'EU', POL: 'EU', CZE: 'EU', GRC: 'EU', HUN: 'EU',
    ROU: 'EU', BGR: 'EU', HRV: 'EU', SVK: 'EU', SVN: 'EU', LTU: 'EU', LVA: 'EU',
    EST: 'EU', LUX: 'EU', MLT: 'EU', CYP: 'EU', ISL: 'EU',
    AUS: 'AU_NZ', NZL: 'AU_NZ',
    JPN: 'ASIA', KOR: 'ASIA', SGP: 'ASIA', MYS: 'ASIA', THA: 'ASIA', IDN: 'ASIA',
    PHL: 'ASIA', VNM: 'ASIA', IND: 'ASIA', PAK: 'ASIA', BGD: 'ASIA', HKG: 'ASIA',
    TWN: 'ASIA', MAC: 'ASIA', KHM: 'ASIA', LAO: 'ASIA', MMR: 'ASIA', LKA: 'ASIA', NPL: 'ASIA',
    ARE: 'ASIA', SAU: 'ASIA', ISR: 'ASIA', TUR: 'ASIA', QAT: 'ASIA', KWT: 'ASIA',
    BHR: 'ASIA', OMN: 'ASIA', JOR: 'ASIA', LBN: 'ASIA',
  };
  if (iso3ToRegion[normalized]) return iso3ToRegion[normalized];
  return 'GLOBAL';
}

export interface ParsedTemplate {
  id: string;
  name: string;
  regions: RegionCode[];
  basePrice: number;
  weightRate: number;
  volumeRate: number;
  freeThreshold: number | null;
  minDays: number;
  maxDays: number;
  isActive: boolean;
}

export function parseTemplate(t: any): ParsedTemplate {
  let regions: RegionCode[] = ['GLOBAL'];
  try {
    const parsed = typeof t.regions === 'string' ? JSON.parse(t.regions) : t.regions;
    if (Array.isArray(parsed) && parsed.length > 0) regions = parsed;
  } catch (e: any) { if (typeof console !== 'undefined') console.warn('[shipping.ts] regions JSON parse failed:', e?.message || e); }
  return {
    id: t.id,
    name: t.name,
    regions,
    basePrice: Number(t.basePrice) || 0,
    weightRate: Number(t.weightRate) || 0,
    volumeRate: Number(t.volumeRate) || 0,
    freeThreshold: t.freeThreshold === null || t.freeThreshold === undefined ? null : Number(t.freeThreshold),
    minDays: Number(t.minDays) || 7,
    maxDays: Number(t.maxDays) || 21,
    isActive: !!t.isActive,
  };
}

// Find the best matching active template for a given region.
// Preference: exact region match > GLOBAL fallback.
export async function getTemplateForRegion(region: RegionCode): Promise<ParsedTemplate | null> {
  const templates = await prisma.shippingTemplate.findMany({ where: { isActive: true } });
  const parsed = templates.map(parseTemplate);
  // Exact region match first
  const exact = parsed.find((t) => t.regions.includes(region) && !t.regions.includes('GLOBAL' as any) || (t.regions.includes(region) && region !== 'GLOBAL'));
  if (exact) return exact;
  // Region match (could include GLOBAL)
  const match = parsed.find((t) => t.regions.includes(region));
  if (match) return match;
  // Global fallback
  const global = parsed.find((t) => t.regions.includes('GLOBAL'));
  return global || null;
}

export interface ShippingCalcInput {
  // Cart item weights & dimensions
  items: Array<{
    quantity: number;
    pkgWeight?: number | null; // grams
    pkgLength?: number | null; // cm
    pkgWidth?: number | null; // cm
    pkgHeight?: number | null; // cm
  }>;
  country: string;
  orderSubtotal: number;
}

export interface ShippingCalcResult {
  cost: number;
  isFree: boolean;
  minDays: number;
  maxDays: number;
  templateName: string;
  region: RegionCode;
  weightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
}

// Calculate shipping cost based on region, actual weight and volumetric weight.
// Volumetric weight = (L × W × H) / 5000  (standard IATA divisor for cm→kg).
// Chargeable weight = max(actual weight, volumetric weight).
// Cost = basePrice + chargeableWeightKg × weightRate, minus free-shipping eligibility.
export async function calculateShipping(input: ShippingCalcInput): Promise<ShippingCalcResult> {
  const region = countryToRegion(input.country);
  const template = await getTemplateForRegion(region);

  // Aggregate weight & volume across all line items
  let actualWeightGrams = 0;
  let volumeCm3 = 0;
  for (const item of input.items) {
    const qty = Math.max(1, item.quantity || 1);
    if (item.pkgWeight && item.pkgWeight > 0) {
      actualWeightGrams += item.pkgWeight * qty;
    }
    if (item.pkgLength && item.pkgWidth && item.pkgHeight &&
        item.pkgLength > 0 && item.pkgWidth > 0 && item.pkgHeight > 0) {
      volumeCm3 += item.pkgLength * item.pkgWidth * item.pkgHeight * qty;
    }
  }

  const weightKg = actualWeightGrams / 1000;
  const volumetricWeightKg = volumeCm3 / 5000;
  const chargeableWeightKg = Math.max(weightKg, volumetricWeightKg);

  // Default fallback when no template configured
  if (!template) {
    const fallbackCost = input.orderSubtotal >= 50 ? 0 : 5.99;
    return {
      cost: fallbackCost,
      isFree: fallbackCost === 0,
      minDays: 7,
      maxDays: 21,
      templateName: 'Standard Shipping',
      region,
      weightKg,
      volumetricWeightKg,
      chargeableWeightKg,
    };
  }

  // Free shipping threshold check
  let isFree = false;
  if (template.freeThreshold !== null && input.orderSubtotal >= template.freeThreshold) {
    isFree = true;
  }

  // First 0.5kg is covered by base price, then weightRate applies per kg beyond that.
  // This mirrors typical cross-border parcel pricing (首重 + 续重).
  const BASE_INCLUDED_KG = 0.5;
  const extraKg = Math.max(0, chargeableWeightKg - BASE_INCLUDED_KG);
  const variableCost = extraKg * template.weightRate;
  let cost = template.basePrice + variableCost;
  if (isFree) cost = 0;

  return {
    cost: Math.round(cost * 100) / 100,
    isFree,
    minDays: template.minDays,
    maxDays: template.maxDays,
    templateName: template.name,
    region,
    weightKg: Math.round(weightKg * 1000) / 1000,
    volumetricWeightKg: Math.round(volumetricWeightKg * 1000) / 1000,
    chargeableWeightKg: Math.round(chargeableWeightKg * 1000) / 1000,
  };
}

// Reasonable AI-analyzed default shipping templates for cross-border e-commerce
// shipping from Yiwu, China. Rates reflect 2024-2026 market averages for
// ePacket / EMS / Standard Air Mail lanes.
export const DEFAULT_SHIPPING_TEMPLATES = [
  {
    name: 'Standard Shipping to United States',
    regions: JSON.stringify(['US']),
    basePrice: 6.99,        // First 0.5kg
    weightRate: 3.5,        // Per additional kg
    volumeRate: 3.5,        // Per 5000cm³ (1kg volumetric) — kept in sync with weightRate
    freeThreshold: null,    // 全站不免运费
    minDays: 7,
    maxDays: 15,
    isActive: true,
  },
  {
    name: 'Standard Shipping to Canada',
    regions: JSON.stringify(['CA']),
    basePrice: 7.99,
    weightRate: 4.0,
    volumeRate: 4.0,
    freeThreshold: null,
    minDays: 7,
    maxDays: 18,
    isActive: true,
  },
  {
    name: 'Standard Shipping to Europe',
    regions: JSON.stringify(['EU']),
    basePrice: 7.49,
    weightRate: 4.5,
    volumeRate: 4.5,
    freeThreshold: null,
    minDays: 7,
    maxDays: 18,
    isActive: true,
  },
  {
    name: 'Standard Shipping to Australia & New Zealand',
    regions: JSON.stringify(['AU_NZ']),
    basePrice: 6.99,
    weightRate: 4.0,
    volumeRate: 4.0,
    freeThreshold: null,
    minDays: 7,
    maxDays: 18,
    isActive: true,
  },
  {
    name: 'Standard Shipping to Asia-Pacific',
    regions: JSON.stringify(['ASIA']),
    basePrice: 3.99,
    weightRate: 2.5,
    volumeRate: 2.5,
    freeThreshold: null,
    minDays: 5,
    maxDays: 12,
    isActive: true,
  },
  {
    name: 'Standard Shipping to Rest of World',
    regions: JSON.stringify(['GLOBAL']),
    basePrice: 9.99,
    weightRate: 6.0,
    volumeRate: 6.0,
    freeThreshold: null,
    minDays: 15,
    maxDays: 30,
    isActive: true,
  },
] as const;

// Idempotently seed default shipping templates if none exist.
export async function seedShippingTemplatesIfEmpty() {
  const count = await prisma.shippingTemplate.count();
  if (count > 0) return;
  for (const t of DEFAULT_SHIPPING_TEMPLATES) {
    await prisma.shippingTemplate.create({ data: { ...t } as any });
  }
}
