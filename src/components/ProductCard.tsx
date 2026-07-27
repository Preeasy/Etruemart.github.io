import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: number | string;
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
}

const ProductCard = ({ product }: ProductCardProps) => {
  const price = Number(product.price || product.priceMin || 0);
  const originalPrice = product.priceMax && product.priceMax > price ? Number(product.priceMax * 1.3) : undefined;
  const moq = product.moq || 1;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : typeof product.category === 'string'
        ? product.category
        : '';

  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-ink-200 hover:border-accent-300 hover:shadow-medium transition-all duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {discount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-accent-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-accent-glow uppercase tracking-wide">
              -{discount}%
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/0 group-hover:from-navy-900/5 transition-all pointer-events-none" />
          {product.stockStatus === 'IN_STOCK' && (
            <span className="absolute top-2.5 right-2.5 bg-white/95 text-navy-800 text-[9px] font-bold px-2 py-1 rounded-md border border-ink-200 shadow-sm uppercase tracking-wider">
              In Stock
            </span>
          )}
        </div>

        <div className="p-4">
          {categoryName && (
            <span className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.12em]">
              {categoryName}
            </span>
          )}

          <h3 className="mt-1.5 font-semibold text-navy-800 text-sm line-clamp-2 group-hover:text-accent-600 transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-2.5">
            <span className="text-lg font-bold text-navy-800">${price.toFixed(2)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-ink-400 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-ink-100">
            <span className="text-[11px] text-ink-500">MOQ: <span className="text-navy-800 font-semibold">{moq}</span></span>
            {product.sku && (
              <span className="text-[10px] text-ink-400 font-mono truncate max-w-[80px]">{product.sku}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
