import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
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
  price: number | string;
  originalPrice?: number | string;
  image: string;
  images: string[];
  categoryId: string;
  category?: { id: string; name: string; slug: string } | string;
  stock: number;
  rating: number | string;
  reviewCount: number;
  salesCount: number;
  author: { id: string; name: string };
  variants: { id: string; color: string; size: string; price: number | string; stock: number }[];
  reviews: { id: string; user: { name: string }; rating: number; title: string; content: string; createdAt: string }[];
  aplus?: any;
  material?: string;
  plating?: string;
  process?: string;
  color?: string;
  size?: string;
  packSize?: number;
  moq?: number;
  sku?: string;
  origin?: string;
  supplierCity?: string;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  const price = Number(product.price);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const rating = Number(product.rating);
  const variants = product.variants || [];
  const uniqueVariants = [...new Map(variants.map(v => [v.color, v])).values()];
  const currentVariant = uniqueVariants.find(v => v.color === selectedVariantColor) || variants[0];
  const currentVariantPrice = currentVariant ? Number(currentVariant.price) : price;
  
  const discount = originalPrice && originalPrice > currentVariantPrice
    ? Math.round(((originalPrice - currentVariantPrice) / originalPrice) * 100)
    : 0;

  const allImages = [product.image, ...(product.images || [])].filter(img => img && img.trim());

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
            <Link href="/" className="hover:text-gold-500 transition-colors">Home</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link href="/products" className="hover:text-gold-500 transition-colors">Products</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-dark-100 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700/50">
              <div className="relative aspect-square bg-dark-900 rounded-xl overflow-hidden">
                <Image
                  src={allImages[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  quality={80}
                />
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-gold-500 ring-2 ring-gold-500/30' : 'border-dark-700/50 hover:border-gold-500/50'}`}
                  >
                    <Image src={img} alt={`View ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block bg-gold-500/15 text-gold-400 text-sm font-medium px-3 py-1 rounded-full border border-gold-500/20">
                {typeof product.category === 'object' && product.category !== null ? product.category.name : typeof product.category === 'string' ? product.category : ''}
              </span>
              {product.sku && (
                <span className="text-xs text-dark-500 font-mono">{product.sku}</span>
              )}
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-dark-100 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-gold-500 fill-gold-500' : 'text-dark-600'}`} />
                ))}
              </div>
              <span className="text-dark-400 text-sm">{rating.toFixed(1)} ({product.reviewCount} reviews)</span>
              <span className="text-dark-600">|</span>
              <span className="text-dark-400 text-sm">{product.salesCount} sold</span>
            </div>

            <div className="bg-dark-800 rounded-xl p-4 mb-5 border border-dark-700/50">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gold-500">${currentVariantPrice.toFixed(2)}</span>
                {originalPrice && originalPrice > currentVariantPrice && (
                  <>
                    <span className="text-lg text-dark-500 line-through">${originalPrice.toFixed(2)}</span>
                    <span className="bg-gold-500 text-dark-900 text-sm font-bold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-dark-300 text-sm mb-5 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              {product.material && (
                <div className="flex items-center gap-2 text-dark-400">
                  <span className="text-gold-400 font-medium">Material:</span>
                  <span className="text-dark-200">{product.material}</span>
                </div>
              )}
              {product.plating && (
                <div className="flex items-center gap-2 text-dark-400">
                  <span className="text-gold-400 font-medium">Plating:</span>
                  <span className="text-dark-200">{product.plating}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-2 text-dark-400">
                  <span className="text-gold-400 font-medium">Color:</span>
                  <span className="text-dark-200">{product.color}</span>
                </div>
              )}
              {product.size && (
                <div className="flex items-center gap-2 text-dark-400">
                  <span className="text-gold-400 font-medium">Size:</span>
                  <span className="text-dark-200">{product.size}</span>
                </div>
              )}
            </div>

            {uniqueVariants.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold text-dark-100 mb-2 text-sm">Color Options</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantColor(variant.color)}
                      className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${selectedVariantColor === variant.color ? 'border-gold-500 bg-gold-500/10 text-gold-500 font-medium' : 'border-dark-700/50 text-dark-300 hover:border-gold-500/50'}`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="font-semibold text-dark-100 mb-2 text-sm">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-dark-700/50 rounded-lg bg-dark-800">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-dark-700 transition-colors text-dark-300">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-semibold text-dark-100">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-dark-700 transition-colors text-dark-300">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-dark-500 text-xs">
                  <span className="text-gold-400 font-medium">In Stock</span> ({currentVariant?.stock || product.stock} available)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 py-3 rounded-xl font-bold transition-colors">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gold-600 hover:bg-gold-500 text-dark-50 py-3 rounded-xl font-bold transition-colors">
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsFavorite(!isFavorite)} className="flex-1 p-3 border border-dark-700/50 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors text-dark-400">
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="flex-1 p-3 border border-dark-700/50 rounded-xl hover:border-gold-500 hover:text-gold-500 transition-colors text-dark-400">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="bg-dark-800 rounded-xl p-3 text-center border border-dark-700/50">
                <Truck className="w-5 h-5 text-gold-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-dark-200">Free Shipping</p>
                <p className="text-[10px] text-dark-500">Orders over $50</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-3 text-center border border-dark-700/50">
                <ShieldCheck className="w-5 h-5 text-gold-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-dark-200">Secure Payment</p>
                <p className="text-[10px] text-dark-500">100% protected</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-3 text-center border border-dark-700/50">
                <RotateCcw className="w-5 h-5 text-gold-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-dark-200">Easy Returns</p>
                <p className="text-[10px] text-dark-500">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="border-b border-dark-700/50 mb-5">
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('description')} className={`pb-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'description' ? 'border-gold-500 text-gold-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Description
              </button>
              <button onClick={() => setActiveTab('specs')} className={`pb-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'specs' ? 'border-gold-500 text-gold-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Specifications
              </button>
              <button onClick={() => setActiveTab('reviews')} className={`pb-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'reviews' ? 'border-gold-500 text-gold-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Reviews ({product.reviewCount})
              </button>
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700/50">
              <h2 className="text-lg font-bold text-dark-100 mb-3">Product Description</h2>
              <p className="text-dark-300 text-sm leading-relaxed">{product.description}</p>
              {product.aplus && Array.isArray(product.aplus) && (
                <div className="mt-5">
                  {product.aplus.map((section: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      {section.heading && (
                        <h3 className="text-sm font-semibold text-dark-100 mb-2">{section.heading}</h3>
                      )}
                      {section.text && (
                        <p className="text-dark-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: section.text }} />
                      )}
                      {section.image && section.image.trim() && (
                        <div className="mt-3">
                          <Image src={section.image} alt={section.heading || 'Product image'} className="w-full rounded-lg" width={800} height={600} objectFit="cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700/50">
              <h2 className="text-lg font-bold text-dark-100 mb-4">Product Specifications</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-dark-700/30">
                  <span className="text-dark-400">MOQ</span>
                  <span className="text-dark-100 font-medium">{product.moq || 1} pcs</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dark-700/30">
                  <span className="text-dark-400">Pack Size</span>
                  <span className="text-dark-100 font-medium">{product.packSize || 1} pcs</span>
                </div>
                {product.material && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Material</span>
                    <span className="text-dark-100 font-medium">{product.material}</span>
                  </div>
                )}
                {product.plating && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Plating</span>
                    <span className="text-dark-100 font-medium">{product.plating}</span>
                  </div>
                )}
                {product.process && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Process</span>
                    <span className="text-dark-100 font-medium">{product.process}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Color</span>
                    <span className="text-dark-100 font-medium">{product.color}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Size</span>
                    <span className="text-dark-100 font-medium">{product.size}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Origin</span>
                    <span className="text-dark-100 font-medium">{product.origin}</span>
                  </div>
                )}
                {product.supplierCity && (
                  <div className="flex justify-between py-2 border-b border-dark-700/30">
                    <span className="text-dark-400">Supplier City</span>
                    <span className="text-dark-100 font-medium">{product.supplierCity}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700/50">
              <div className="flex items-center gap-6 mb-5 pb-5 border-b border-dark-700/30">
                <div>
                  <div className="text-3xl font-bold text-dark-100 mb-1">{rating.toFixed(1)}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-gold-500 fill-gold-500' : 'text-dark-600'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-dark-400">
                  <p className="text-sm font-semibold text-dark-100">{product.reviewCount} customer reviews</p>
                </div>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-5">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="pb-5 border-b border-dark-700/30 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gold-800/50 rounded-full flex items-center justify-center text-gold-400 font-bold text-sm">
                          {review.user?.name ? review.user.name[0] : 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-dark-100 text-sm">{review.user?.name || 'Anonymous'}</h4>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-gold-500 fill-gold-500' : 'text-dark-600'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <h5 className="font-medium text-dark-100 text-sm mb-1">{review.title}</h5>
                      <p className="text-dark-400 text-sm">{review.content}</p>
                      <p className="text-xs text-dark-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-dark-500">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No reviews yet. Be the first to review!</p>
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