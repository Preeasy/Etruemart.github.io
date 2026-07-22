import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

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
    <div className="bg-dark-800 rounded-xl shadow-lg overflow-hidden card-hover group border border-dark-500/20">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-accent-500 text-dark-900 text-sm font-bold px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-dark-800/80 rounded-full p-2 shadow-md hover:bg-accent-500 hover:text-dark-900 transition-colors text-dark-50">
            <Heart className="w-5 h-5" />
          </button>
          <button className="bg-dark-800/80 rounded-full p-2 shadow-md hover:bg-accent-500 hover:text-dark-900 transition-colors text-dark-50">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <span className="text-xs text-primary-400 font-medium">{product.category}</span>
        <Link href={`/products/${product.id}`} className="block mt-1">
          <h3 className="font-semibold text-dark-50 line-clamp-2 hover:text-accent-500 transition-colors min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-dark-500'}`}
              />
            ))}
          </div>
          <span className="text-sm text-dark-400">({product.reviewCount})</span>
        </div>

        <div className="mt-2 text-sm text-dark-400">
          <span className="font-medium text-dark-200">{product.salesCount}</span> sold
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-accent-500">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-dark-500 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-dark-50 py-2.5 rounded-lg font-bold transition-colors">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
