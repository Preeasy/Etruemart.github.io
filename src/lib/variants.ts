interface ProductVariant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  moq?: number;
  color?: string | null;
  colorHex?: string | null;
  size?: string | null;
  capacity?: string | null;
  layer?: string | null;
  pack?: string | null;
  material?: string | null;
  packagingInfo?: {
    pcsPerCtn?: number | null;
    boxLength?: number | null;
    boxWidth?: number | null;
    boxHeight?: number | null;
    grossWeight?: number | null;
    volumeCBM?: number | null;
  } | null;
}

interface VariantGroup {
  parentSku: string;
  parentSlug: string;
  baseName: string;
  categoryId: string;
  variants: ProductVariant[];
  minPrice: number;
  maxPrice: number;
}

function extractColor(name: string): string | null {
  const colorKeywords = ['black', 'white', 'red', 'blue', 'pink', 'green', 'purple', 'orange',
    'yellow', 'brown', 'gray', 'grey', 'gold', 'silver', 'beige', 'clear',
    'mint', 'coral', 'navy', 'rose', 'lavender', 'turquoise', 'burgundy',
    'khaki', 'cream', 'ivory', 'tan', 'teal', 'olive'];
  const lower = name.toLowerCase();
  for (const c of colorKeywords) {
    const pattern = new RegExp('\\b' + c + '\\b', 'i');
    if (pattern.test(lower)) return c;
  }
  return null;
}

function extractSize(name: string): string | null {
  const sizeMatch = name.match(/(\d+)(?:mm|ml|l|inch|in|cm|layer|tiers?)/i);
  if (sizeMatch) return sizeMatch[0];
  const sizeKeywords = ['5"', '10"', '12"', '16"', '18"', '20"', '24"', '50l', '75l', '100l', '140l', '180l'];
  const lower = name.toLowerCase();
  for (const s of sizeKeywords) {
    if (lower.includes(s)) return s;
  }
  return null;
}

// Stop-words excluded when computing name similarity so that generic / category-neutral
// tokens (colors, sizes, material words, etc.) do not dominate the score.
const SIM_STOP_WORDS = new Set([
  'with', 'from', 'that', 'this', 'have', 'were', 'been', 'they', 'them', 'their',
  'what', 'when', 'your', 'each', 'other', 'than', 'into', 'only', 'over', 'such',
  'also', 'made', 'make', 'like', 'just', 'more', 'some', 'very', 'much', 'many',
  'various', 'different', 'special', 'unique', 'quality', 'design', 'style', 'color',
  'size', 'material', 'feature', 'product', 'item', 'piece', 'pieces', 'set', 'pack',
  'include', 'handle', 'cover', 'case', 'bag', 'box', 'kit', 'tool', 'device',
  'equipment', 'accessory', 'supplies', 'supply', 'container', 'package', 'packaging',
  'women', 'woman', 'men', 'mans', 'kids', 'kid', 'baby', 'adult',
  'red', 'blue', 'green', 'black', 'white', 'pink', 'purple', 'orange', 'yellow',
  'brown', 'gray', 'grey', 'gold', 'silver', 'beige', 'clear', 'mint', 'navy', 'rose',
  'lavender', 'turquoise', 'burgundy', 'khaki', 'cream', 'ivory', 'tan', 'teal', 'olive',
  'cotton', 'floral', 'pattern', 'doctor', 'educational', 'role', 'play', 'pretend',
  'breathable', 'glass', 'water', 'bottle', 'cup', 'tea', 'beverage', 'portable',
  'heat', 'resistant', 'plastic', 'steel', 'metal', 'wooden',
]);

function tokenize(name: string): string[] {
  return (name || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !SIM_STOP_WORDS.has(w));
}

// Jaccard similarity between two product names. Used to reject cross-category
// or semantically unrelated children that were accidentally attached via parentId
// or SKU-prefix grouping. Returns 0..1.
export function nameSimilarity(a: string, b: string): number {
  const wa = tokenize(a);
  const wb = tokenize(b);
  if (wa.length === 0 || wb.length === 0) return 0;
  const setB = new Set(wb);
  const intersection = wa.filter((w) => setB.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union > 0 ? intersection / union : 0;
}

function parseVariantOptions(p: any): { color?: string; colorHex?: string | null; size?: string; capacity?: string; layer?: string; pack?: string; material?: string } {
  let opts: any = {};
  if (p.variantOptions) {
    try { opts = typeof p.variantOptions === 'string' ? JSON.parse(p.variantOptions) : p.variantOptions; } catch (e: any) { if (typeof console !== 'undefined') console.warn('[variants.ts] variantOptions JSON failed:', e?.message || e); }
  }
  const rawSize = opts.size || p.size || extractSize(p.name) || undefined;
  const rawCapacity = opts.capacity || undefined;
  // De-dupe: if size and capacity are identical values, keep only SIZE
  const dupCapacity = rawSize && rawCapacity && String(rawSize).toLowerCase() === String(rawCapacity).toLowerCase();
  
  // Extract color: priority = variantOptions > product.color > name analysis
  // Also try to extract from the variant name by removing known size/capacity words
  let extractedColor = opts.color || p.color || null;
  if (!extractedColor) {
    // Try extracting from name after removing size/capacity words
    const cleanedName = (p.name || '')
      .replace(/\d+[\s-]?(?:ml|l|mm|cm|inch|in|layer|tiers?|pack|pcs?|pieces?|set|count)/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    extractedColor = extractColor(cleanedName) || extractColor(p.name) || undefined;
  }
  
  return {
    color: extractedColor || undefined,
    colorHex: opts.colorHex || null,
    size: rawSize,
    capacity: dupCapacity ? undefined : rawCapacity,
    layer: opts.layer || undefined,
    pack: opts.pack || undefined,
    material: opts.material || p.material || undefined,
  };
}

function toVariant(p: any): ProductVariant {
  const opts = parseVariantOptions(p);
  return {
    sku: p.sku || '',
    name: p.name,
    slug: p.slug || '',
    price: Number(p.priceMin ?? p.price) || 0,
    image: p.image || '',
    stock: Number(p.stock) || 0,
    moq: Number(p.moq) || undefined,
    color: opts.color ?? null,
    colorHex: opts.colorHex || null,
    size: opts.size ?? null,
    capacity: opts.capacity ?? null,
    layer: opts.layer ?? null,
    pack: opts.pack ?? null,
    material: opts.material ?? null,
    packagingInfo: p.packagingInfo || null,
  };
}

// Minimum name similarity required for a child product to be considered a real
// variant of its parent. Values below this threshold are treated as unrelated
// products (wrong parentId / accidental SKU-prefix collision) and skipped.
const VARIANT_NAME_SIMILARITY_THRESHOLD = 0.25;

export function buildVariantGroups(products: any[]): Map<string, VariantGroup> {
  const groups = new Map<string, VariantGroup>();

  // ========== Phase 1: New parentId/isParent structure ==========
  // Build parent → children map using parentId field
  const parentById = new Map<string, any>();
  for (const p of products) {
    if (p.isParent === true && !p.parentId) {
      parentById.set(String(p.id), p);
    }
  }
  for (const p of products) {
    if (!p.parentId) continue;
    const parent = parentById.get(String(p.parentId));
    if (!parent) continue;

    // Validation 1: category consistency — skip children that belong to a
    // different category than their parent.
    if (p.categoryId && parent.categoryId && p.categoryId !== parent.categoryId) {
      if (typeof console !== 'undefined') {
        console.warn(`[buildVariantGroups] skipping cross-category child: ${p.sku} (cat:${p.categoryId}) → parent ${parent.sku} (cat:${parent.categoryId})`);
      }
      continue;
    }

    // Validation 2: name similarity — require child name to share enough
    // content-bearing tokens with its parent to be considered a real variant.
    const sim = nameSimilarity(parent.name, p.name);
    if ((parent.name || p.name) && sim < VARIANT_NAME_SIMILARITY_THRESHOLD) {
      if (typeof console !== 'undefined') {
        console.warn(`[buildVariantGroups] skipping mismatched child: ${p.sku} (${p.name}) → parent ${parent.sku} (${parent.name}), sim=${sim.toFixed(2)}`);
      }
      continue;
    }

    const key = String(p.parentId);
    if (!groups.has(key)) {
      const parentSku = parent.sku || key;
      // Build color map from parent's variantChildren if available
      const colorMap = new Map<string, string>();
      const sizeMap = new Map<string, string>();
      if (parent.variantChildren && Array.isArray(parent.variantChildren)) {
        for (const vc of parent.variantChildren) {
          if (vc.sku && vc.color) colorMap.set(vc.sku, vc.color);
          if (vc.sku && vc.size) sizeMap.set(vc.sku, vc.size);
        }
      }
      groups.set(key, {
        parentSku,
        parentSlug: parent.slug || parentSku.toLowerCase(),
        baseName: parent.name,
        categoryId: parent.categoryId || '',
        variants: [],
        minPrice: Infinity,
        maxPrice: 0,
        _colorMap: colorMap,
        _sizeMap: sizeMap,
      } as any);
    }
    const g = groups.get(key)!;
    const v = toVariant(p);
    // Override with parent's variantChildren data if available
    const gAny = g as any;
    if (gAny._colorMap && gAny._colorMap.has(p.sku)) {
      v.color = gAny._colorMap.get(p.sku)!;
    }
    if (gAny._sizeMap && gAny._sizeMap.has(p.sku)) {
      v.size = gAny._sizeMap.get(p.sku)!;
    }
    // Also try parent-level color lookup by SKU suffix
    if (!v.color && gAny._colorMap) {
      for (const [sku, color] of gAny._colorMap) {
        if (p.sku && p.sku.endsWith(sku.split('-').pop())) {
          v.color = color;
          break;
        }
      }
    }
    g.variants.push(v);
    if (v.price > 0) {
      g.minPrice = Math.min(g.minPrice, v.price);
      g.maxPrice = Math.max(g.maxPrice, v.price);
    }
  }

  // ========== Phase 2: Legacy SKU-prefix grouping (backward compat) ==========
  // Collect child candidates grouped by SKU prefix, but only keep groups whose
  // members share a category and have sufficient name similarity with the rest.
  const candidateBuckets = new Map<string, any[]>();
  const candidateMeta = new Map<string, { categoryId: string; name: string }>();
  for (const p of products) {
    // Skip if already handled by parentId
    if (p.parentId) continue;
    const sku = p.sku || '';
    const parts = sku.split('-');
    if (parts.length >= 4 && parts[0] === 'YCS') {
      const parentSku = parts.slice(0, 3).join('-');
      if (!candidateBuckets.has(parentSku)) {
        candidateBuckets.set(parentSku, []);
      }
      candidateBuckets.get(parentSku)!.push(p);
    }
  }

  for (const [parentSku, candidates] of candidateBuckets) {
    if (candidates.length < 2) continue;

    // Skip if Phase 1 already produced a group for this parentSku
    let alreadyHasGroup = false;
    for (const g of groups.values()) {
      if (g.parentSku === parentSku) { alreadyHasGroup = true; break; }
    }
    if (alreadyHasGroup) continue;

    // Category consistency: pick the most common categoryId; drop candidates
    // that belong to a different category.
    const catCounts = new Map<string, number>();
    for (const c of candidates) {
      const cat = String(c.categoryId || '');
      if (!cat) continue;
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    }
    let dominantCat = '';
    let maxCount = 0;
    for (const [cat, count] of catCounts) {
      if (count > maxCount) { dominantCat = cat; maxCount = count; }
    }

    // Name-based filtering against a representative base name (the candidate
    // with the shortest name is usually the "parent" item in legacy data).
    const sortedByName = [...candidates].sort((a, b) =>
      String(a.name || '').length - String(b.name || '').length
    );
    const baseName = sortedByName[0]?.name || '';

    const filtered = candidates.filter((c) => {
      if (dominantCat && c.categoryId && c.categoryId !== dominantCat) {
        if (typeof console !== 'undefined') {
          console.warn(`[buildVariantGroups] Phase 2 category mismatch: skipping ${c.sku} (${c.categoryId}) for group ${parentSku} (${dominantCat})`);
        }
        return false;
      }
      const sim = nameSimilarity(baseName, c.name);
      if (baseName && c.name && sim < VARIANT_NAME_SIMILARITY_THRESHOLD) {
        if (typeof console !== 'undefined') {
          console.warn(`[buildVariantGroups] Phase 2 name mismatch: skipping ${c.sku} (${c.name}) for group ${parentSku}, sim=${sim.toFixed(2)}`);
        }
        return false;
      }
      return true;
    });

    if (filtered.length < 2) continue;

    const variants = filtered.map(toVariant);
    variants.sort((a, b) => a.price - b.price);
    const derivedBaseName = variants[0].name
      .replace(/^(Black|White|Red|Blue|Pink|Green|Purple|Orange|Yellow|Brown|Gray|Grey|Gold|Silver|Beige|Clear|Mint|Navy|Rose|Lavender|Turquoise)\s/i, '')
      .replace(/\d+[-\s]?(?:mm|ml|l|inch|in|cm)/i, '')
      .replace(/\d+[-\s]?(?:layer|tiers?)/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    const prices = variants.map((v) => v.price).filter((p) => p > 0);
    groups.set(parentSku, {
      parentSku,
      parentSlug: parentSku.toLowerCase(),
      baseName: derivedBaseName,
      categoryId: dominantCat,
      variants,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    });
  }

  // Sort variants within each group by price
  for (const g of groups.values()) {
    if (g.variants.length > 0) g.variants.sort((a, b) => a.price - b.price);
    if (g.minPrice === Infinity) g.minPrice = 0;
  }

  return groups;
}

export function getParentSku(sku: string): string | null {
  const parts = sku.split('-');
  if (parts.length >= 4 && parts[0] === 'YCS') {
    return parts.slice(0, 3).join('-');
  }
  return null;
}

export function getVariantGroupForSku(
  groups: Map<string, VariantGroup>,
  sku: string
): VariantGroup | null {
  const parentSku = getParentSku(sku);
  if (!parentSku) return null;
  return groups.get(parentSku) || null;
}

export function getVariantGroupForProductId(
  groups: Map<string, VariantGroup>,
  productId: string,
  sku?: string | null,
  parentId?: string | null
): VariantGroup | null {
  // Try productId directly (when the product IS the parent)
  if (productId) {
    const g = groups.get(String(productId));
    if (g) return g;
  }
  // Try parentId first (child product)
  if (parentId) {
    const g = groups.get(String(parentId));
    if (g) return g;
  }
  // Try matching by parent SKU: if product's SKU matches a group's parentSku
  if (sku) {
    const skuLower = String(sku).toLowerCase();
    for (const g of groups.values()) {
      if (g.parentSku.toLowerCase() === skuLower) return g;
    }
    // Also try SKU-prefix matching (legacy)
    const parentSku = getParentSku(sku);
    if (parentSku) {
      const g = groups.get(parentSku);
      if (g) return g;
    }
  }
  return null;
}
