import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    categoryId: string;
    category?: { id: string; name: string; slug: string } | string;
    price: number;
    originalPrice?: number;
    image: string;
    moq?: number;
    packSize?: number;
    sku?: string | null;
    stockStatus?: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
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
    <div className="bg-dark-800 rounded-xl overflow-hidden border border-dark-700/50 group hover:border-gold-500/50 transition-all duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-dark-900">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            quality={80}
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23111111' width='200' height='200'/%3E%3C/svg%3E"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-gold-500 text-dark-900 text-[10px] font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {product.stockStatus === 'IN_STOCK' && (
            <span className="absolute top-2 right-2 bg-dark-900/90 text-gold-400 text-[9px] font-medium px-1.5 py-0.5 rounded border border-gold-500/30">
              IN STOCK
            </span>
          )}
        </div>

        <div className="p-2.5">
          {categoryName && (
            <span className="text-[9px] font-medium text-gold-400 uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          
          <h3 className="mt-1 font-medium text-dark-100 text-[11px] line-clamp-2 hover:text-gold-400 transition-colors leading-4">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between mt-1.5">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-gold-500">${price.toFixed(2)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-[9px] text-dark-500 line-through">${originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] text-dark-400">MOQ: <span className="text-dark-200 font-medium">{moq}</span></span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;