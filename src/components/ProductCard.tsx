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
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 group hover:border-gold-400 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23f9fafb' width='200' height='200'/%3E%3C/svg%3E"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              -{discount}%
            </span>
          )}
          {product.stockStatus === 'IN_STOCK' && (
            <span className="absolute top-2 right-2 bg-white/95 text-gold-700 text-[10px] font-semibold px-2 py-1 rounded-md border border-gold-200 shadow-sm uppercase tracking-wide">
              In Stock
            </span>
          )}
        </div>

        <div className="p-3.5">
          {categoryName && (
            <span className="text-[11px] font-semibold text-gold-600 uppercase tracking-wider">
              {categoryName}
            </span>
          )}

          <h3 className="mt-1 font-medium text-gray-900 text-sm line-clamp-2 hover:text-gold-700 transition-colors leading-5 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gold-600">${price.toFixed(2)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">MOQ: <span className="text-gray-700 font-medium">{moq}</span></span>
            {product.sku && (
              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[80px]">{product.sku}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
