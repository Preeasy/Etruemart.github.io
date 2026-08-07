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

function parseVariantOptions(p: any): { color?: string; colorHex?: string | null; size?: string; capacity?: string; layer?: string; pack?: string; material?: string } {
  let opts: any = {};
  if (p.variantOptions) {
    try { opts = typeof p.variantOptions === 'string' ? JSON.parse(p.variantOptions) : p.variantOptions; } catch {}
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
    if (p.parentId) {
      const parent = parentById.get(String(p.parentId));
      if (parent) {
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
    }
  }

  // ========== Phase 2: Legacy SKU-prefix grouping (backward compat) ==========
  const childByParent = new Map<string, ProductVariant[]>();
  for (const p of products) {
    // Skip if already handled by parentId
    if (p.parentId) continue;
    const sku = p.sku || '';
    const parts = sku.split('-');
    if (parts.length >= 4 && parts[0] === 'YCS') {
      const parentSku = parts.slice(0, 3).join('-');
      if (!childByParent.has(parentSku)) childByParent.set(parentSku, []);
      childByParent.get(parentSku)!.push(toVariant(p));
    }
  }
  for (const [parentSku, variants] of childByParent) {
    if (variants.length < 2) continue;
    // Skip if already have a group for this parentSku
    for (const [, g] of groups) {
      if (g.parentSku === parentSku) continue;
    }
    variants.sort((a, b) => a.price - b.price);
    const baseName = variants[0].name
      .replace(/^(Black|White|Red|Blue|Pink|Green|Purple|Orange|Yellow|Brown|Gray|Grey|Gold|Silver|Beige|Clear|Mint|Navy|Rose|Lavender|Turquoise)\s/i, '')
      .replace(/\d+[-\s]?(?:mm|ml|l|inch|in|cm)/i, '')
      .replace(/\d+[-\s]?(?:layer|tiers?)/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    const prices = variants.map(v => v.price).filter(p => p > 0);
    groups.set(parentSku, {
      parentSku,
      parentSlug: parentSku.toLowerCase(),
      baseName,
      categoryId: '',
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
