import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    salesCount: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-dark-800 rounded-xl overflow-hidden card-hover border border-dark-700/50 group">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-accent-500 text-dark-900 text-sm font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-4">
        <span className="text-xs font-medium text-primary-400">{product.category}</span>
        <Link href={`/products/${product.id}`} className="block mt-1">
          <h3 className="font-semibold text-dark-100 line-clamp-2 hover:text-accent-400 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-dark-600'}`}
              />
            ))}
          </div>
          <span className="text-xs text-dark-400">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-accent-500">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-xs text-dark-500 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button className="w-full mt-3 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-dark-50 py-2 rounded-lg font-medium transition-colors">
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
