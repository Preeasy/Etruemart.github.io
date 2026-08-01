import Link from 'next/link';
import { Edit3 } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number | string;
    slug?: string;
    name: string;
    category?: { name: string; slug: string } | string;
    price?: number;
    priceMin?: number;
    priceMax?: number;
    image: string;
    moq?: number;
    packSize?: number;
    sku?: string | null;
    stockStatus?: string;
  };
  editUrl?: string;
  isOwner?: boolean;
}

const ProductCard = ({ product, editUrl, isOwner }: ProductCardProps) => {
  const price = Number(product.price || product.priceMin || 0);
  const moq = product.moq || 1;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : typeof product.category === 'string'
        ? product.category
        : '';

  const fallbackSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><rect x="30" y="50" width="140" height="100" rx="8" fill="white" stroke="#d1d5db" stroke-width="2"/><circle cx="70" cy="80" r="10" fill="#fcd34d"/><path d="M50 140 L80 105 L100 125 L125 95 L160 140 Z" fill="#d1d5db"/></svg>`)}`;

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-ink-200 hover:border-accent-300 hover:shadow-medium transition-all duration-300 relative">
      {editUrl && (
        <Link
          href={editUrl}
          className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-1 bg-accent-500 hover:bg-accent-600 text-white text-[10px] font-bold rounded-md shadow-sm transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit3 className="w-3 h-3" />
          编辑
        </Link>
      )}
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== fallbackSvg) el.src = fallbackSvg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/0 group-hover:from-navy-900/5 transition-all pointer-events-none" />
          {product.stockStatus === 'IN_STOCK' && (
            <span className="absolute top-2.5 right-2.5 bg-white/95 text-navy-800 text-[9px] font-bold px-2 py-1 rounded-md border border-ink-200 uppercase tracking-wider">
              In Stock
            </span>
          )}
        </div>

        <div className="p-3.5">
          {/* Row 1: Category + SKU on same line */}
          <div className="flex items-center justify-between gap-2">
            {categoryName && (
              <span className="text-[10px] font-bold text-accent-700 uppercase tracking-[0.1em] truncate">
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
          <h3 className="mt-1 font-semibold text-navy-800 text-sm line-clamp-2 group-hover:text-accent-700 transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Row 2: Price + MOQ on same line */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-navy-800">${price.toFixed(2)}</span>
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

export default ProductCard;
