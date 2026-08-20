import { memo, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { getAltExtensionCdnUrl } from '@/lib/image-utils';
import { getColorHex } from '@/lib/colors';

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
    slug?: string | null;
    name: string;
    category?: { name: string; slug: string } | string | null | undefined;
    price?: number;
    priceMin?: number;
    priceMax?: number | null;
    image: string;
    moq?: number | null;
    packSize?: number | null;
    sku?: string | null;
    stockStatus?: string | null;
    isParent?: boolean;
    parentId?: string | null;
    variants?: VariantPreview[] | null;
  };
  editUrl?: string;
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
          <Image
            src={imageUrl || FALLBACK_SVG}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const el = e.currentTarget as unknown as HTMLImageElement;
              if (!el.dataset.fallback) {
                el.dataset.fallback = "1";
                (el as any).src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f3f4f6" width="400" height="300"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#9ca3af">${(product.name || '').slice(0,20)}</text></svg>`);
              }
            }}
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
          <div className="flex items-end justify-between mt-2.5 pt-2.5 border-t border-ink-100/60">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-accent-600 mb-0.5">Wholesale</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-[10px] text-ink-400 font-medium">$</span>
                <span className="text-lg font-extrabold text-navy-900 leading-none">{price.toFixed(2)}</span>
                {(() => {
                  const pmax = Number(product.priceMax || 0);
                  if (pmax > price) return <span className="text-[10px] text-ink-400 font-medium ml-1">– ${pmax.toFixed(2)}</span>;
                  return null;
                })()}
              </div>
            </div>
            <span className="text-[11px] text-ink-500 flex-shrink-0 mb-0.5">
              MOQ <span className="text-navy-800 font-bold">{moq}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default memo(ProductCard);
