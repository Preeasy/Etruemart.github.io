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
  const moq = product.moq || 1;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : typeof product.category === 'string'
        ? product.category
        : '';

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-ink-200 hover:border-accent-300 hover:shadow-medium transition-all duration-300">
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
