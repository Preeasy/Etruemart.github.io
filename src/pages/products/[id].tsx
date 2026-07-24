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
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
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
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1400px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gold-600 transition-colors">Home</Link>
            <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
            <Link href="/products" className="hover:text-gold-600 transition-colors">Products</Link>
            <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1400px] mx-auto py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
                  <Image
                    src={allImages[selectedImage] || product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    quality={85}
                  />
                </div>
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-gold-500 ring-2 ring-gold-500/30' : 'border-gray-200 hover:border-gold-500/50'}`}
                    >
                      <Image src={img} alt={`View ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-block bg-gold-50 text-gold-700 text-sm font-medium px-3 py-1 rounded-full border border-gold-200">
                {typeof product.category === 'object' && product.category !== null ? product.category.name : typeof product.category === 'string' ? product.category : ''}
              </span>
              {product.sku && (
                <span className="text-xs text-gray-500 font-mono">SKU: {product.sku}</span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-gold-600 fill-gold-500' : 'text-gray-400'}`} />
                ))}
              </div>
              <span className="text-gray-600 text-sm">{rating.toFixed(1)} ({product.reviewCount} reviews)</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 text-sm">{product.salesCount} sold</span>
            </div>

            <div className="bg-gradient-to-r from-gold-50 to-white rounded-xl p-4 mb-5 border border-gold-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gold-600">${currentVariantPrice.toFixed(2)}</span>
                {originalPrice && originalPrice > currentVariantPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                    <span className="bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              {product.material && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gold-700 font-medium">Material:</span>
                  <span className="text-gray-800">{product.material}</span>
                </div>
              )}
              {product.plating && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gold-700 font-medium">Plating:</span>
                  <span className="text-gray-800">{product.plating}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gold-700 font-medium">Color:</span>
                  <span className="text-gray-800">{product.color}</span>
                </div>
              )}
              {product.size && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-gold-700 font-medium">Size:</span>
                  <span className="text-gray-800">{product.size}</span>
                </div>
              )}
            </div>

            {uniqueVariants.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Color Options</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantColor(variant.color)}
                      className={`px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${selectedVariantColor === variant.color ? 'border-gold-500 bg-gold-50 text-gold-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gold-500/50'}`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 transition-colors text-gray-600" aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-semibold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors text-gray-600" aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-600 text-xs">
                  <span className="text-gold-700 font-medium">In Stock</span> ({currentVariant?.stock || product.stock} available)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white py-3 rounded-xl font-bold transition-colors shadow-md shadow-gold-500/20">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold transition-colors shadow-sm">
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsFavorite(!isFavorite)} className="flex-1 p-3 border border-gray-200 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors text-gray-600" aria-label="Add to favorites">
                <Heart className={`w-5 h-5 mx-auto ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <button className="flex-1 p-3 border border-gray-200 rounded-xl hover:border-gold-500 hover:text-gold-600 transition-colors text-gray-600" aria-label="Share product">
                <Share2 className="w-5 h-5 mx-auto" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <Truck className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-800">Free Shipping</p>
                <p className="text-[10px] text-gray-500">Orders over $50</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <ShieldCheck className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-800">Secure Payment</p>
                <p className="text-[10px] text-gray-500">100% protected</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                <RotateCcw className="w-5 h-5 text-gold-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-800">Easy Returns</p>
                <p className="text-[10px] text-gray-500">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="border-b border-gray-200 mb-5">
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('description')} className={`pb-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'description' ? 'border-gold-500 text-gold-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                Description
              </button>
              <button onClick={() => setActiveTab('specs')} className={`pb-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'specs' ? 'border-gold-500 text-gold-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                Specifications
              </button>
              <button onClick={() => setActiveTab('reviews')} className={`pb-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'reviews' ? 'border-gold-500 text-gold-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                Reviews ({product.reviewCount})
              </button>
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Product Description</h2>
              </div>
              <div className="p-5">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
              </div>
              {product.aplus && Array.isArray(product.aplus) && product.aplus.length > 0 && (
                <div className="border-t border-gray-100">
                  {product.aplus.map((section: any, index: number) => {
                    const hasImage = section.image && section.image.trim();
                    const hasText = section.text && section.text.trim();
                    const hasHeading = section.heading && section.heading.trim();
                    const type = section.type || 'text';

                    if (type === 'hero' && hasImage) {
                      return (
                        <div key={index} className="relative w-full bg-gray-50">
                          <div className="relative h-48 md:h-64 overflow-hidden">
                            <Image src={section.image} alt={section.heading || 'Hero'} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            {hasHeading && (
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">{section.heading}</h3>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (type === 'imageText' && hasImage && hasText) {
                      return (
                        <div key={index} className="grid md:grid-cols-2 gap-6 p-5 border-b border-gray-100 last:border-b-0 items-center">
                          <div className="order-1 md:order-1">
                            <div className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
                              <Image src={section.image} alt={section.heading || 'Product image'} fill className="object-contain p-3" />
                            </div>
                          </div>
                          <div className="order-2 md:order-2">
                            {hasHeading && <h3 className="text-base font-bold text-gray-900 mb-3">{section.heading}</h3>}
                            <div className="text-sm text-gray-600 leading-relaxed aplus-content" dangerouslySetInnerHTML={{ __html: section.text }} />
                          </div>
                        </div>
                      );
                    }

                    if (type === 'textImage' && hasImage && hasText) {
                      return (
                        <div key={index} className="grid md:grid-cols-2 gap-6 p-5 border-b border-gray-100 last:border-b-0 items-center">
                          <div className="order-2 md:order-1">
                            {hasHeading && <h3 className="text-base font-bold text-gray-900 mb-3">{section.heading}</h3>}
                            <div className="text-sm text-gray-600 leading-relaxed aplus-content" dangerouslySetInnerHTML={{ __html: section.text }} />
                          </div>
                          <div className="order-1 md:order-2">
                            <div className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
                              <Image src={section.image} alt={section.heading || 'Product image'} fill className="object-contain p-3" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (type === 'text' || !hasImage) {
                      return (
                        <div key={index} className="p-5 border-b border-gray-100 last:border-b-0">
                          {hasHeading && <h3 className="text-base font-bold text-gray-900 mb-3">{section.heading}</h3>}
                          {hasText && (
                            <div className="text-sm text-gray-600 leading-relaxed aplus-content" dangerouslySetInnerHTML={{ __html: section.text }} />
                          )}
                        </div>
                      );
                    }

                    if (type === 'image' || (!hasText && hasImage)) {
                      return (
                        <div key={index} className="p-5 border-b border-gray-100 last:border-b-0 flex justify-center">
                          <div className="relative w-full max-w-lg aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden">
                            <Image src={section.image} alt={section.heading || 'Product image'} fill className="object-contain p-3" />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={index} className="p-5 border-b border-gray-100 last:border-b-0">
                        {hasHeading && <h3 className="text-sm font-semibold text-gray-900 mb-2">{section.heading}</h3>}
                        {hasText && <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: section.text }} />}
                        {hasImage && (
                          <div className="mt-3 flex justify-center">
                            <Image src={section.image} alt={section.heading || 'Product image'} className="max-w-md rounded-lg shadow-sm" width={500} height={400} objectFit="contain" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Product Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 text-sm">
                <div className="flex justify-between py-2.5 border-b border-gray-100">
                  <span className="text-gray-600">MOQ</span>
                  <span className="text-gray-900 font-medium">{product.moq || 1} pcs</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-gray-100">
                  <span className="text-gray-600">Pack Size</span>
                  <span className="text-gray-900 font-medium">{product.packSize || 1} pcs</span>
                </div>
                {product.material && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Material</span>
                    <span className="text-gray-900 font-medium">{product.material}</span>
                  </div>
                )}
                {product.plating && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Plating</span>
                    <span className="text-gray-900 font-medium">{product.plating}</span>
                  </div>
                )}
                {product.process && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Process</span>
                    <span className="text-gray-900 font-medium">{product.process}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Color</span>
                    <span className="text-gray-900 font-medium">{product.color}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Size</span>
                    <span className="text-gray-900 font-medium">{product.size}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Origin</span>
                    <span className="text-gray-900 font-medium">{product.origin}</span>
                  </div>
                )}
                {product.supplierCity && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-gray-600">Supplier City</span>
                    <span className="text-gray-900 font-medium">{product.supplierCity}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center gap-6 mb-5 pb-5 border-b border-gray-100">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{rating.toFixed(1)}</div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-gold-600 fill-gold-500' : 'text-gray-400'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{product.reviewCount} customer reviews</p>
                </div>
              </div>

              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-5">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center text-gold-700 font-bold text-sm">
                          {review.user?.name ? review.user.name[0] : 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{review.user?.name || 'Anonymous'}</h4>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-gold-600 fill-gold-500' : 'text-gray-400'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <h5 className="font-medium text-gray-900 text-sm mb-1">{review.title}</h5>
                      <p className="text-gray-600 text-sm">{review.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
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