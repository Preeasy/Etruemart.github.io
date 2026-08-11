// 全站 SEO / GEO 共享工具 — 产品详情页、列表页、首页复用
// 避免 inline 逻辑散落在各页面，关键词策略与GEO定位信息单一来源
import { SITE_URL, SITE_NAME, SITE_COMPANY, SITE_ADDRESS, SITE_PHONE, SITE_EMAIL } from '@/lib/site';

/** 核心业务关键词 —— 以义乌小商品批发为语义中心的词簇（Google SEO / GEO 双重作用） */
export const SEO_KEYWORD_CLUSTERS = {
  location: ['Yiwu', 'Yiwu China', 'Yiwu Zhejiang', 'China wholesale', 'Yiwu market'],
  business: ['wholesale supplier', 'bulk order', 'factory direct', 'B2B sourcing', 'MOQ'],
  shipping: ['global shipping', 'DHL FedEx sea air freight', '7-15 days lead time'],
  quality: ['trade assurance', 'quality guarantee', 'OEM ODM', 'private label', 'custom packaging'],
  category_aliases: {
    'jewelry': ['fashion jewelry', 'costume jewelry', 'bulk jewelry', 'wholesale jewelry'],
    'hair': ['hair accessories', 'hair clips', 'headbands', 'hair pins wholesale'],
    'bag': ['bag accessories', 'handbag charms', 'keychains wholesale'],
    'garment': ['garment accessories', 'lace trim', 'zippers', 'buttons wholesale'],
    'home': ['home decor', 'home crafts', 'decorative items wholesale'],
    'toy': ['toys', 'gift items', 'promotional gifts wholesale'],
    'seasonal': ['seasonal gifts', 'festival decorations', 'party supplies'],
    'fashion': ['fashion accessories', 'trendy accessories', 'retail boutique stock'],
  } as Record<string, string[]>,
} as const;

/** 从 category.name + keywords 推断附加同义词关键词 */
export function inferCategoryKeyterms(category?: { name?: string } | null, productKeywords?: string[] | null): string[] {
  const out: string[] = [];
  const cname = (category?.name || '').toLowerCase();
  for (const [key, alist] of Object.entries(SEO_KEYWORD_CLUSTERS.category_aliases)) {
    if (cname.includes(key)) out.push(...alist);
  }
  if (Array.isArray(productKeywords)) {
    for (const k of productKeywords) {
      if (typeof k === 'string' && k.length > 2) out.push(k.trim());
    }
  }
  // 去重并保留顺序
  const seen = new Set<string>();
  return out.filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 14);
}

/** 构造 SEO 标题（Google SERP 推荐 ~55-60 字符） */
export function buildSeoTitle(
  product: { name: string; priceMin?: number | null; price?: number | null; category?: { name?: string } | null; moq?: number | null },
  opts?: { maxLen?: number }
): string {
  const maxLen = opts?.maxLen ?? 68;
  const catName = product.category?.name ? ` in ${product.category.name}` : '';
  const price = Number(product.priceMin || product.price || 0);
  const pricePart = price > 0 ? ` | $${price.toFixed(2)} Bulk` : '';
  const moq = product.moq ? ` MOQ ${product.moq}` : '';
  const base = `${product.name}${catName}${pricePart}${moq} | Yiwu Wholesale Supplier | ${SITE_NAME}`;
  if (base.length <= maxLen) return base;
  const noSite = `${product.name}${catName}${pricePart}${moq} | Yiwu China Wholesale`;
  if (noSite.length <= maxLen) return noSite;
  // 再退：只保留 name+cat+站点
  const minimal = `${product.name}${catName} | ${SITE_NAME}`;
  return minimal.length > maxLen ? minimal.slice(0, maxLen - 3) + '...' : minimal;
}

/** 构造 SEO meta description（Google SERP 推荐 ~155-160 字符，必须自然植入 GEO 定位） */
export function buildSeoDescription(
  product: {
    name: string;
    description?: string | null;
    material?: string | null;
    color?: string | null;
    origin?: string | null;
    supplierCity?: string | null;
    category?: { name?: string } | null;
    moq?: number | null;
    priceMin?: number | null;
    price?: number | null;
    keywords?: string[] | null;
  },
  opts?: { maxLen?: number }
): string {
  const maxLen = opts?.maxLen ?? 160;
  const price = Number(product.priceMin || product.price || 0);
  const catName = product.category?.name ? product.category.name : '';
  const city = (product.supplierCity && product.supplierCity.toLowerCase() !== 'unknown')
    ? product.supplierCity
    : (product.origin && product.origin.toLowerCase() !== 'unknown' ? product.origin : 'Yiwu');
  const moq = product.moq ? `MOQ ${product.moq}. ` : '';
  const priceStr = price > 0 ? `From $${price.toFixed(2)}. ` : '';
  const materialStr = product.material ? `${product.material}. ` : '';

  // 优先：用户 description 的前 100 字符 + 义乌/GEO 后缀
  const plainDesc = stripHtmlToPlain(product.description || '').slice(0, 90).trim();
  const keyterms = inferCategoryKeyterms(product.category, product.keywords).slice(0, 3).join(', ');
  const keytermsStr = keyterms ? ` Top terms: ${keyterms}.` : '';

  let draft = '';
  if (plainDesc.length > 30) {
    draft = `${plainDesc}. ${priceStr}${moq}${materialStr}Factory direct ${catName ? catName + ' ' : ''}wholesale from ${city}, Zhejiang, China. Global shipping. OEM/ODM.${keytermsStr}`;
  } else {
    draft = `${product.name}${catName ? ` - ${catName}` : ''}. ${priceStr}${moq}${materialStr}Factory direct wholesale from ${city}, Zhejiang, China. Bulk discounts, global shipping, OEM/ODM & private label available.${keytermsStr}`;
  }
  if (draft.length <= maxLen) return draft;
  // 降级：去掉关键词段
  const noKeys = `${product.name}. ${priceStr}${moq}${materialStr}Wholesale from Yiwu, Zhejiang, China. Factory direct, global shipping, OEM/ODM available.`;
  if (noKeys.length <= maxLen) return noKeys;
  return noKeys.length > maxLen ? noKeys.slice(0, maxLen - 3) + '...' : noKeys;
}

/** 构造 Open Graph / Twitter Card 的描述（稍长，200 字符） */
export function buildOgDescription(product: Parameters<typeof buildSeoDescription>[0]): string {
  return buildSeoDescription(product, { maxLen: 200 });
}

/** 产品 Schema.org JSON-LD 关键词字符串（逗号分隔，注入义乌/GEO 关键词） */
export function buildSchemaKeywords(
  product: {
    name: string;
    category?: { name?: string } | null;
    keywords?: string[] | null;
    material?: string | null;
    color?: string | null;
  }
): string {
  const parts: string[] = [];
  parts.push(product.name);
  if (product.category?.name) parts.push(product.category.name);
  if (product.material) parts.push(product.material);
  if (product.color) parts.push(product.color);
  // GEO/语义增强必选词
  parts.push('Yiwu', 'Yiwu China', 'China wholesale', 'factory direct', 'bulk order', 'B2B sourcing', 'OEM ODM', 'global shipping');
  // 类目同义词
  const cats = inferCategoryKeyterms(product.category, product.keywords).slice(0, 6);
  parts.push(...cats);
  const seen = new Set<string>();
  return parts
    .map(x => String(x).trim())
    .filter(x => {
      if (!x) return false;
      const k = x.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .join(', ');
}

/** FAQ → Schema.org FAQPage 条目 */
export function buildFaqSchema(faqs: { q: string; a: string }[]) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Organization Schema（含 GEO Place + 联系方式），用于 seller/brand 及全站 Organization 声明 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_COMPANY,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Yiwu',
      addressRegion: 'Zhejiang',
      addressCountry: 'CN',
      streetAddress: 'Yiwu International Trade City',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '29.3086',
      longitude: '120.0756',
    },
    areaServed: 'Worldwide',
    sameAs: [
      SITE_URL,
    ],
  };
}

/** 将 HTML → 纯文本（用于 meta description / schema description） */
export function stripHtmlToPlain(html: string): string {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
