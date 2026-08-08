import { memo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { getAltExtensionCdnUrl } from '@/lib/image-utils';

interface VariantPreview {
  id: string;
  sku?: string | null;
  slug?: string;
  color?: string | null;
  colorHex?: string | null;
  size?: string | null;
  capacity?: string | null;
  layer?: string | null;
  pack?: string | null;
  price?: number;
  image?: string;
}

interface ProductCardProps {
  product: {
    id: number | string;
    slug?: string;
    name: string;
    category?: { name: string; slug: string } | string | null | undefined;
    price?: number;
    priceMin?: number;
    priceMax?: number | null;
    image: string;
    moq?: number;
    packSize?: number;
    sku?: string | null;
    stockStatus?: string;
    isParent?: boolean;
    parentId?: string | null;
    variants?: VariantPreview[];
  };
  editUrl?: string;
}

// Common color name → hex mapping for swatches
const COLOR_HEX_MAP: Record<string, string> = {
  red: '#ef4444', '红': '#ef4444',
  blue: '#3b82f6', '蓝': '#3b82f6',
  navy: '#1e3a5f', '藏青': '#1e3a5f',
  black: '#1f2937', '黑': '#1f2937',
  white: '#f9fafb', '白': '#f9fafb',
  green: '#22c55e', '绿': '#22c55e',
  yellow: '#eab308', '黄': '#eab308',
  pink: '#ec4899', '粉': '#ec4899',
  purple: '#a855f7', '紫': '#a855f7',
  orange: '#f97316', '橙': '#f97316',
  gold: '#d4af37', '金': '#d4af37',
  silver: '#c0c0c0', '银': '#c0c0c0',
  rose: '#f43f5e', '玫瑰金': '#f43f5e',
  brown: '#92400e', '棕': '#92400e',
  gray: '#6b7280', '灰': '#6b7280',
  grey: '#6b7280',
  beige: '#e7d4b5', '米': '#e7d4b5',
  cream: '#fef3c7',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  multicolor: 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
  'mixed': 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
  '彩色': 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e,#eab308)',
};

function getColorHex(color?: string | null): string | null {
  if (!color) return null;
  const lower = color.toLowerCase().trim();
  // Direct match
  if (COLOR_HEX_MAP[lower]) return COLOR_HEX_MAP[lower];
  // Partial match (e.g. "Rose Gold" → match "rose")
  for (const key of Object.keys(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return COLOR_HEX_MAP[key];
  }
  // If it looks like a hex color already
  if (/^#[0-9a-f]{6}$/i.test(lower)) return lower;
  return null;
}

const FALLBACK_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><rect x="30" y="50" width="140" height="100" rx="8" fill="white" stroke="#d1d5db" stroke-width="2"/><circle cx="70" cy="80" r="10" fill="#fcd34d"/><path d="M50 140 L80 105 L100 125 L125 95 L160 140 Z" fill="#d1d5db"/></svg>`
)}`;

const ProductCard = ({ product, editUrl }: ProductCardProps) => {
  const price = Number(product.price || product.priceMin || 0);
  const moq = product.moq || 1;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : typeof product.category === 'string'
        ? product.category
        : '';

  const imageUrl = product.image;
  const triedRef = useRef<Set<string> | null>(null);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (!triedRef.current) triedRef.current = new Set();
    const tried = triedRef.current;
    // Track which extension we have attempted already from the current src
    const extMatch = el.src.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)(?:[?#]|$)/i);
    if (extMatch) tried.add(extMatch[1].toLowerCase());
    // Try alternate extension if available
    const alt = getAltExtensionCdnUrl(el.src, tried);
    if (alt) {
      el.src = alt;
      return;
    }
    // Fallback to placeholder
    el.src = FALLBACK_SVG;
  }, []);

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-ink-200 hover:border-accent-300 hover:shadow-card-hover transition-all duration-300 relative hover:-translate-y-0.5">
      {editUrl && (
        <Link
          href={editUrl}
          className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2 py-1 bg-accent-500 hover:bg-accent-600 text-white text-[10px] font-bold rounded-md shadow-sm transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit3 className="w-3 h-3" />
          编辑
        </Link>
      )}
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl || FALLBACK_SVG}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/0 group-hover:from-navy-900/10 transition-all duration-300 pointer-events-none" />
          {product.stockStatus === 'IN_STOCK' && (
            <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-navy-800 text-[9px] font-bold px-2 py-1 rounded-md border border-ink-200/50 uppercase tracking-wider shadow-sm">
              In Stock
            </span>
          )}
        </div>

        <div className="p-3.5">
          {/* Row 1: Category + SKU on same line */}
          <div className="flex items-center justify-between gap-2">
            {categoryName && (
              <span className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.1em] truncate">
                {categoryName}
              </span>
            )}
            {product.sku && (
              <span className="text-[10px] text-ink-400 font-mono truncate flex-shrink-0">
                {product.sku}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="mt-1 font-semibold text-navy-900 text-sm line-clamp-2 group-hover:text-accent-600 transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Variant preview — color swatches & size tags */}
          {product.isParent && product.variants && product.variants.length > 1 && (() => {
            const variants = product.variants!;
            // Extract unique colors and sizes
            const colors = variants.filter(v => v.color).map(v => ({ color: v.color!, hex: v.colorHex || getColorHex(v.color) }));
            const uniqueColors = colors.filter((c, i, arr) => arr.findIndex(x => x.color === c.color) === i).slice(0, 6);
            const sizes = variants.filter(v => v.size).map(v => v.size!);
            const uniqueSizes = [...new Set(sizes)].slice(0, 4);
            const hasColors = uniqueColors.length > 0;
            const hasSizes = uniqueSizes.length > 0;
            const extraCount = variants.length - uniqueColors.length;

            if (!hasColors && !hasSizes) return null;

            return (
              <div className="mt-1.5 space-y-1">
                {hasColors && (
                  <div className="flex items-center gap-1">
                    {uniqueColors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-ink-200 shadow-sm flex-shrink-0"
                        style={{ background: c.hex || '#ccc' }}
                        title={c.color}
                      />
                    ))}
                    {extraCount > 0 && (
                      <span className="text-[9px] text-ink-400 font-medium ml-0.5">+{extraCount}</span>
                    )}
                    <span className="text-[9px] text-ink-400 ml-auto font-medium">{variants.length} styles</span>
                  </div>
                )}
                {hasSizes && !hasColors && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {uniqueSizes.map((s, i) => (
                      <span key={i} className="text-[9px] text-ink-600 bg-ink-100 px-1.5 py-0.5 rounded font-medium">
                        {s}
                      </span>
                    ))}
                    <span className="text-[9px] text-ink-400 ml-auto font-medium">{variants.length} styles</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Row 2: Price + MOQ on same line */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink-100/60">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-ink-400 font-medium">$</span>
              <span className="text-base font-bold text-navy-900">{price.toFixed(2)}</span>
            </div>
            <span className="text-[11px] text-ink-500 flex-shrink-0">
              MOQ: <span className="text-navy-800 font-semibold">{moq}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default memo(ProductCard);
