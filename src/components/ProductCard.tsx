import { memo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit3, Heart, Eye, ShoppingCart, ChevronRight, Package } from 'lucide-react';

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

export interface ProductCardProps {
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
    salesCount?: number | null;
  };
  editUrl?: string;
  /** show compact layout for horizontal lists */
  compact?: boolean;
  /** badge override */
  badge?: string | null;
  /** badge variant */
  badgeTone?: 'gold' | 'coral' | 'green' | 'navy' | 'sand';
}

const FALLBACK_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FBF7EC"/><stop offset="100%" stop-color="#F3EDDF"/></linearGradient></defs><rect fill="url(#g)" width="400" height="400"/><rect x="70" y="100" width="260" height="200" rx="14" fill="white" stroke="#E8DEC4" stroke-width="3"/><circle cx="140" cy="160" r="20" fill="#DFB860"/><path d="M100 270 L155 210 L200 240 L255 195 L320 270 Z" fill="#D9C89A"/><text x="200" y="340" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="15" fill="#9F9C93" font-weight="600">Product Image</text></svg>`
)}`;

const fmt = (n: number) => {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return '$' + n.toFixed(n < 5 ? 3 : n < 50 ? 2 : 2).replace(/\.?0+$/, '');
};

function ProductCardInner({ product, editUrl, compact, badge, badgeTone = 'gold' }: ProductCardProps) {
  const price = Number(product.price || product.priceMin || 0);
  const priceMax = Number(product.priceMax || price || 0);
  const hasRange = priceMax - price > 0.01;
  const moq = product.moq || 12;

  const catObj =
    typeof product.category === 'object' && product.category !== null
      ? product.category
      : null;
  const categoryName = catObj?.name || (typeof product.category === 'string' ? product.category : '');
  const categorySlug = catObj?.slug || '';

  const href = product.slug
    ? `/product/${encodeURIComponent(product.slug)}`
    : `/product/${encodeURIComponent(String(product.id))}`;

  const triedRef = useRef<Set<string>>(new Set());
  const safeSrc = product.image || FALLBACK_SVG;

  const toneClasses: Record<string, string> = {
    gold:  'tag-gold',
    coral: 'tag-coral',
    green: 'tag-green',
    navy:  'tag-navy',
    sand:  'tag-sand',
  };

  return (
    <div className={`panel-hover group relative overflow-hidden ${compact ? 'flex gap-3 p-3' : 'p-0'} rounded-2xl`}>
      {/* ---- Image block ---- */}
      <Link href={href} className={`block relative overflow-hidden ${compact ? 'shrink-0 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-xl' : 'aspect-square w-full'}`}>
        {/* Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-white to-sand-100">
          <Image
            src={safeSrc}
            alt={product.name || 'Product image'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-all duration-500 group-hover:scale-[1.06] group-hover:rotate-[0.3deg]"
            onError={(e) => {
              const el = e.currentTarget as unknown as HTMLImageElement;
              const key = el.src || '';
              if (!triedRef.current.has(key)) {
                triedRef.current.add(key);
                (el as any).src = FALLBACK_SVG;
              }
            }}
          />
        </div>

        {/* Subtle hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/20 via-navy-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badge (top-left) */}
        {(badge || product.isParent) && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
            {badge && <span className={toneClasses[badgeTone]}>{badge}</span>}
            {product.isParent && product.variants && product.variants.length > 1 && (
              <span className="tag-navy">
                <Package className="w-2.5 h-2.5" />
                {product.variants.length} Variants
              </span>
            )}
          </div>
        )}

        {/* Hover quick actions (desktop) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
          <button
            type="button"
            aria-label="Save product"
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm text-navy-700 hover:text-coral-500 hover:scale-105 shadow-card border border-sand-200 flex items-center justify-center pointer-events-auto"
          >
            <Heart className="w-4 h-4" />
          </button>
          <Link
            href={href}
            aria-label="View product"
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm text-navy-700 hover:text-gold-600 hover:scale-105 shadow-card border border-sand-200 flex items-center justify-center pointer-events-auto"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        {/* Bottom "Quick Add to Cart" reveal (only non-compact) */}
        {!compact && (
          <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none">
            <Link
              href={href}
              className="btn-cta w-full !py-2.5 !rounded-xl !text-xs pointer-events-auto shadow-coral-glow justify-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              View Details &amp; Quote
            </Link>
          </div>
        )}
      </Link>

      {/* ---- Info block ---- */}
      <div className={`flex flex-col ${compact ? 'min-w-0 flex-1 py-0.5' : 'p-3.5 pt-3.5'}`}>
        {/* Category tag + MOQ row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {categoryName ? (
            <Link
              href={categorySlug ? `/products?category=${categorySlug}` : '/products'}
              className="text-[10.5px] font-bold tracking-wide uppercase text-gold-700 hover:text-gold-800 truncate"
            >
              {categoryName}
            </Link>
          ) : <span className="flex-1" />}
          <span className="text-[10.5px] font-semibold text-ink-400 whitespace-nowrap tabular">
            MOQ <span className="text-navy-700">{moq}</span>
          </span>
        </div>

        {/* Title */}
        <Link href={href} className={`group/title line-clamp-2 ${compact ? 'text-sm' : 'text-[14px] sm:text-[15px]'} font-bold text-navy-900 leading-snug hover:text-gold-700 transition-colors mb-2`}>
          {product.name || 'Untitled Product'}
        </Link>

        {/* SKU (compact only) */}
        {compact && product.sku && (
          <p className="text-[10.5px] font-mono text-ink-400 mb-1.5 truncate">SKU: <span className="text-ink-500">{product.sku}</span></p>
        )}

        {/* Variant color swatches (if any) */}
        {!compact && product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-1 mb-2.5 min-h-[18px]">
            {product.variants.slice(0, 6).map((v, i) => (
              <span
                key={v.id || i}
                title={v.color || v.size || `Variant ${i + 1}`}
                className="w-[15px] h-[15px] rounded-full border-2 border-white shadow-paper ring-1 ring-sand-200"
                style={{
                  background: v.colorHex ||
                    ['#DFB860', '#2A4469', '#E84A1E', '#ABE8BB', '#9FB6D4', '#7A5908'][i % 6],
                }}
              />
            ))}
            {product.variants.length > 6 && (
              <span className="text-[10.5px] font-semibold text-ink-400 ml-1">+{product.variants.length - 6}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          {/* Price block */}
          <div className="min-w-0">
            <p className="text-[10.5px] font-bold tracking-wider uppercase text-ink-400 mb-0.5">
              Wholesale {hasRange ? 'from' : 'price'}
            </p>
            <div className="flex items-baseline gap-1.5 tabular flex-wrap">
              {hasRange ? (
                <>
                  <span className="price-range text-lg sm:text-xl leading-none">{fmt(price)}</span>
                  <span className="text-ink-300 text-xs leading-none">—</span>
                  <span className="price-range text-sm sm:text-base text-navy-700 leading-none">{fmt(priceMax)}</span>
                </>
              ) : (
                <span className="price-current text-lg sm:text-[22px] leading-none tabular">{fmt(price)}</span>
              )}
              <span className="text-[10.5px] font-semibold text-ink-400">
                / {product.packSize ? `${product.packSize}pcs` : 'piece'}
              </span>
            </div>
          </div>

          {/* Arrow CTA */}
          <Link
            href={href}
            aria-label="View product details"
            className="shrink-0 w-9 h-9 rounded-xl border border-sand-200 bg-white text-navy-700 group-hover:bg-gradient-to-b group-hover:from-gold-400 group-hover:to-gold-600 group-hover:border-gold-500 group-hover:text-white group-hover:shadow-gold-glow flex items-center justify-center transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Admin edit */}
      {editUrl && (
        <Link
          href={editUrl}
          className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-navy-800/95 text-white hover:bg-gold-500 hover:shadow-gold-glow items-center justify-center hidden md:group-hover:flex transition-all z-10"
          aria-label="Edit product"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

export default memo(ProductCardInner, (a, b) =>
  a.product.id === b.product.id &&
  Number(a.product.price || a.product.priceMin || 0) === Number(b.product.price || b.product.priceMin || 0) &&
  a.compact === b.compact
);
