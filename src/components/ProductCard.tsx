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
    <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover group">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-accent-50 hover:text-accent-500 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-accent-50 hover:text-accent-500 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <span className="text-xs text-primary-600 font-medium">{product.category}</span>
        <Link href={`/products/${product.id}`} className="block mt-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          <span className="font-medium text-gray-900">{product.salesCount}</span> sold
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-accent-600">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-colors">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
