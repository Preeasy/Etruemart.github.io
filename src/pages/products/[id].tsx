import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Package,
} from 'lucide-react';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  author: { id: string; name: string };
  variants: { id: string; color: string; size: string; price: number; stock: number }[];
  reviews: { id: string; user: { name: string }; rating: number; title: string; content: string; createdAt: string }[];
  aplus?: { features?: string[]; specifications?: { label: string; value: string }[]; images?: string[] };
}

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantColor, setSelectedVariantColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setProduct(data);
            if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
              setSelectedVariantColor(data.variants[0].color || '');
            }
          }
        })
        .catch(err => {
          console.error('Failed to fetch product:', err);
        });
    }
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  const variants = product.variants || [];
  const uniqueVariants = [...new Map(variants.map(v => [v.color, v])).values()];
  const currentVariant = uniqueVariants.find(v => v.color === selectedVariantColor) || variants[0];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - (currentVariant?.price || product.price)) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        variantId: currentVariant?.id,
        quantity,
      }),
    }).then(() => {
      alert('Added to cart!');
    });
  };

  return (
    <Layout>
      <div className="bg-dark-800 border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-dark-400">
            <Link href="/" className="hover:text-accent-500 transition-colors">Home</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link href="/products" className="hover:text-accent-500 transition-colors">Products</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-dark-100 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700/50">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-80 lg:h-[450px] object-cover rounded-xl"
              />
            </div>
            {([product.image, ...product.images]).length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {[product.image, ...product.images].map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-dark-700/50 hover:border-accent-500/50'}`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block bg-primary-800/50 text-primary-400 text-sm font-medium px-3 py-1 rounded-full border border-primary-700/30">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-dark-100 mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-dark-600'}`} />
                ))}
              </div>
              <span className="text-dark-400">{product.rating} ({product.reviewCount} reviews)</span>
              <span className="text-dark-600">|</span>
              <span className="text-dark-400">{product.salesCount} sold</span>
            </div>

            <div className="bg-dark-800 rounded-xl p-5 mb-6 border border-dark-700/50">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-accent-500">${(currentVariant?.price || product.price).toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-dark-500 line-through">${product.originalPrice}</span>
                    <span className="bg-accent-500 text-dark-900 text-sm font-bold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-dark-300 mb-6 line-clamp-3">{product.description}</p>

            {uniqueVariants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-dark-100 mb-3">Color Options</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueVariants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantColor(variant.color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedVariantColor === variant.color ? 'border-accent-500 bg-accent-500/10 text-accent-500 font-medium' : 'border-dark-700/50 text-dark-300 hover:border-accent-500/50'}`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-dark-100 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-dark-700/50 rounded-lg bg-dark-800">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-dark-700 transition-colors text-dark-300">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-semibold text-lg text-dark-100">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-dark-700 transition-colors text-dark-300">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-dark-500 text-sm">
                  <span className="text-primary-400 font-medium">In Stock</span> ({currentVariant?.stock || product.stock} available)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 text-dark-900 py-3 rounded-xl font-bold transition-colors">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="flex-1 bg-primary-600 hover:bg-primary-500 text-dark-50 py-3 rounded-xl font-bold transition-colors">
                Buy Now
              </button>
              <button onClick={() => setIsFavorite(!isFavorite)} className="sm:w-12 p-3 border border-dark-700/50 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors text-dark-400">
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="sm:w-12 p-3 border border-dark-700/50 rounded-xl hover:border-accent-500 hover:text-accent-500 transition-colors text-dark-400">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700/50">
                <Truck className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-200">Free Shipping</p>
                <p className="text-xs text-dark-500">Orders over $50</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700/50">
                <ShieldCheck className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-200">Secure Payment</p>
                <p className="text-xs text-dark-500">100% protected</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700/50">
                <RotateCcw className="w-6 h-6 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-200">Easy Returns</p>
                <p className="text-xs text-dark-500">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="border-b border-dark-700/50 mb-6">
            <div className="flex gap-6">
              <button onClick={() => setActiveTab('description')} className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-accent-500 text-accent-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Description
              </button>
              <button onClick={() => setActiveTab('specs')} className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === 'specs' ? 'border-accent-500 text-accent-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Specifications
              </button>
              <button onClick={() => setActiveTab('reviews')} className={`pb-3 font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-accent-500 text-accent-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Reviews ({product.reviewCount})
              </button>
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700/50">
              <h2 className="text-xl font-bold text-dark-100 mb-4">Product Description</h2>
              <p className="text-dark-300 leading-relaxed">{product.description}</p>
              {product.aplus?.features && product.aplus.features.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-dark-100 mt-6 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.aplus.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-dark-300">
                        <span className="text-accent-500 mt-1">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {product.aplus?.images && product.aplus.images.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-dark-100 mt-6 mb-3">Additional Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {product.aplus.images.map((img, index) => (
                      <img key={index} src={img} alt={`A+ image ${index + 1}`} className="rounded-lg w-full h-48 object-cover" />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700/50">
              <h2 className="text-xl font-bold text-dark-100 mb-4">Product Specifications</h2>
              {product.aplus?.specifications && product.aplus.specifications.length > 0 ? (
                <div className="space-y-3">
                  {product.aplus.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-dark-700/30 last:border-0">
                      <span className="text-dark-400">{spec.label}</span>
                      <span className="text-dark-100 font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-dark-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No specifications available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700/50">
              <div className="flex items-center gap-8 mb-6 pb-6 border-b border-dark-700/30">
                <div>
                  <div className="text-4xl font-bold text-dark-100 mb-2">{product.rating}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-dark-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-dark-400">
                  <p className="text-lg font-semibold text-dark-100">{product.reviewCount} customer reviews</p>
                </div>
              </div>

              {product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-dark-700/30 last:border-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-800/50 rounded-full flex items-center justify-center text-primary-400 font-bold">
                          {review.user.name[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark-100">{review.user.name}</h4>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-dark-600'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <h5 className="font-medium text-dark-100 mb-1">{review.title}</h5>
                      <p className="text-dark-400">{review.content}</p>
                      <p className="text-xs text-dark-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-dark-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;

export const getServerSideProps = () => ({ props: {} });
