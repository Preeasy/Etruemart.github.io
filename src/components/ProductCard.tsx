import Link from 'next/link';
import { Package } from 'lucide-react';

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
    material?: string | null;
    plating?: string | null;
    packSize?: number;
    sku?: string | null;
    stockStatus?: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const moq = product.moq || 1;
  const packSize = product.packSize || 1;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : typeof product.category === 'string'
        ? product.category
        : '';

  return (
    <div className="bg-dark-800 rounded-xl overflow-hidden card-hover border border-dark-700/40 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {originalPrice && originalPrice > price && (
            <span className="bg-primary-500 text-dark-900 text-xs font-bold px-2 py-0.5 rounded">
              -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
            </span>
          )}
          {product.stockStatus === 'IN_STOCK' && (
            <span className="bg-dark-900/80 backdrop-blur-sm text-primary-400 text-[10px] font-medium px-2 py-0.5 rounded border border-primary-500/20">
              IN STOCK
            </span>
          )}
        </div>
        {/* SKU tag */}
        {product.sku && (
          <span className="absolute bottom-2 right-2 bg-dark-900/70 backdrop-blur-sm text-dark-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
            {product.sku}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {categoryName && (
          <span className="text-[11px] font-medium text-primary-400 uppercase tracking-wider">
            {categoryName}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product.id}`} className="block mt-1">
          <h3 className="font-medium text-dark-100 text-sm line-clamp-2 hover:text-primary-400 transition-colors min-h-[2.5rem] leading-5">
            {product.name}
          </h3>
        </Link>

        {/* Material / Plating */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {product.material && (
            <span className="inline-flex items-center gap-1 text-[10px] text-dark-300 bg-dark-700/60 px-2 py-0.5 rounded-full border border-dark-600/30">
              {product.material}
            </span>
          )}
          {product.plating && (
            <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {product.plating}
            </span>
          )}
        </div>

        {/* Price + MOQ row */}
        <div className="mt-3 pt-3 border-t border-dark-700/40">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary-400">
                ${price.toFixed(2)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-dark-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-dark-400">
              MOQ: <span className="text-dark-200 font-medium">{moq} pcs</span>
            </span>
            {packSize > 1 && (
              <span className="text-[11px] text-dark-400">
                Pack: <span className="text-dark-200 font-medium">{packSize} pcs</span>
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/products/${product.id}`}
          className="w-full mt-3 flex items-center justify-center gap-2 bg-dark-700 hover:bg-primary-500 text-dark-200 hover:text-dark-900 py-2.5 rounded-lg text-sm font-medium transition-all border border-dark-600/50 hover:border-primary-500"
        >
          <Package className="w-4 h-4" />
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
