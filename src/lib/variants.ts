interface ProductVariant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  color?: string;
  size?: string;
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
    'mint', 'coral', 'navy', 'rose', 'lavender', 'turquoise', 'burgundy'];
  const lower = name.toLowerCase();
  for (const c of colorKeywords) {
    if (lower.startsWith(c + ' ') || lower.startsWith(c + '-')) return c;
    if (lower.includes(c + ' ')) return c;
    if (lower.includes(c + '-')) return c;
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

export function buildVariantGroups(products: any[]): Map<string, VariantGroup> {
  const groups = new Map<string, VariantGroup>();
  const childByParent = new Map<string, ProductVariant[]>();

  for (const p of products) {
    const sku = p.sku || '';
    const parts = sku.split('-');
    if (parts.length >= 4 && parts[0] === 'YCS') {
      const parentSku = parts.slice(0, 3).join('-');
      const variant: ProductVariant = {
        sku,
        name: p.name,
        slug: p.slug || '',
        price: Number(p.price) || 0,
        image: p.image,
        stock: Number(p.stock) || 0,
        color: extractColor(p.name) || undefined,
        size: extractSize(p.name) || undefined,
      };
      if (!childByParent.has(parentSku)) {
        childByParent.set(parentSku, []);
      }
      childByParent.get(parentSku)!.push(variant);
    }
  }

  for (const [parentSku, variants] of childByParent) {
    if (variants.length < 2) continue;

    variants.sort((a, b) => a.price - b.price);

    const baseName = variants[0].name
      .replace(/^(Black|White|Red|Blue|Pink|Green|Purple|Orange|Yellow|Brown|Gray|Grey|Gold|Silver|Beige|Clear|Mint|Navy|Rose|Lavender|Turquoise)\s/i, '')
      .replace(/\d+[-\s]?(?:mm|ml|l|inch|in|cm)/i, '')
      .replace(/\d+[-\s]?(?:layer|tiers?)/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    const parentSlug = parentSku.toLowerCase();
    const prices = variants.map(v => v.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    groups.set(parentSku, {
      parentSku,
      parentSlug,
      baseName,
      categoryId: '',
      variants,
      minPrice,
      maxPrice,
    });
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
