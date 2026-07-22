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
  Check,
  Minus,
  Plus,
  MessageSquare,
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
}

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', content: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => setProduct(data));
    }
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-dark-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  const currentVariant = product.variants[selectedVariant];
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/login');
      return;
    }
    fetch(`/api/reviews/${product.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewForm),
    }).then(() => {
      setSubmitted(true);
    });
  };

  return (
    <Layout>
      <div className="bg-dark-800 border-b border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-dark-400">
            <Link href="/" className="hover:text-accent-500">Home</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link href="/products" className="hover:text-accent-500">Products</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-dark-50 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="bg-dark-800 rounded-2xl p-4 shadow-lg mb-4 border border-dark-500/20">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[product.image, ...product.images].map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-dark-500/30 hover:border-dark-500/60'}`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="inline-block bg-primary-800/50 text-accent-500 text-sm font-medium px-3 py-1 rounded-full mb-4 border border-primary-700/30">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-dark-50 mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-dark-500'}`} />
                ))}
              </div>
              <span className="text-dark-300">{product.rating} ({product.reviewCount} reviews)</span>
              <span className="text-dark-500">|</span>
              <span className="text-dark-300">{product.salesCount} sold</span>
            </div>

            <div className="bg-dark-700/50 rounded-xl p-4 mb-6 border border-dark-500/20">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-accent-500">${currentVariant?.price || product.price}</span>
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

            <p className="text-dark-300 mb-6">{product.description}</p>

            {product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-dark-50 mb-3">Color</h3>
                <div className="flex gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedVariant === index ? 'border-accent-500 bg-primary-800/30 text-accent-500 font-medium' : 'border-dark-500/30 text-dark-300 hover:border-dark-500/60'}`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-dark-50 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-dark-500/30 rounded-lg bg-dark-800">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-dark-700 transition-colors text-dark-50">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-semibold text-lg text-dark-50">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-dark-700 transition-colors text-dark-50">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-dark-400 text-sm">
                  <span className="text-green-500 font-medium">In Stock</span> ({currentVariant?.stock || product.stock} available)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 text-dark-900 py-4 rounded-xl font-bold text-lg transition-colors">
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button className="flex-1 bg-primary-600 hover:bg-primary-500 text-dark-50 py-4 rounded-xl font-bold text-lg transition-colors">
                Buy Now
              </button>
              <button className="sm:w-14 p-4 border-2 border-dark-500/30 rounded-xl hover:border-accent-500 hover:text-accent-500 transition-colors text-dark-50">
                <Heart className="w-6 h-6" />
              </button>
              <button className="sm:w-14 p-4 border-2 border-dark-500/30 rounded-xl hover:border-primary-400 hover:text-primary-400 transition-colors text-dark-50">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-800 rounded-xl p-4 text-center shadow-lg border border-dark-500/20">
                <Truck className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-50">Free Shipping</p>
                <p className="text-xs text-dark-400">Orders over $50</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center shadow-lg border border-dark-500/20">
                <ShieldCheck className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-50">Secure Payment</p>
                <p className="text-xs text-dark-400">100% protected</p>
              </div>
              <div className="bg-dark-800 rounded-xl p-4 text-center shadow-lg border border-dark-500/20">
                <RotateCcw className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-dark-50">Easy Returns</p>
                <p className="text-xs text-dark-400">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="border-b border-dark-500/30 mb-8">
            <div className="flex gap-8">
              <button onClick={() => setActiveTab('description')} className={`pb-4 font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-accent-500 text-accent-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Description
              </button>
              <button onClick={() => setActiveTab('reviews')} className={`pb-4 font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-accent-500 text-accent-500' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
                Reviews ({product.reviewCount})
              </button>
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="bg-dark-800 rounded-2xl p-8 shadow-lg border border-dark-500/20">
              <h2 className="text-2xl font-bold text-dark-50 mb-4">Product Description</h2>
              <p className="text-dark-300 mb-6 leading-relaxed">{product.description}</p>
              <h3 className="text-lg font-semibold text-dark-50 mb-3">What&apos;s in the box:</h3>
              <ul className="list-disc list-inside text-dark-300 space-y-2">
                <li>1 x {product.name}</li>
                <li>User Manual</li>
                <li>Warranty Card</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-dark-800 rounded-2xl p-8 shadow-lg border border-dark-500/20">
              <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-dark-500/30">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-dark-50 mb-2">{product.rating}</div>
                  <div className="flex justify-center md:justify-start mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < Math.floor(product.rating) ? 'text-accent-500 fill-accent-500' : 'text-dark-500'}`} />
                    ))}
                  </div>
                  <p className="text-dark-400">{product.reviewCount} reviews</p>
                </div>
              </div>

              {product.reviews.length > 0 ? (
                <div className="space-y-8">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-dark-500/20 pb-8 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-800/50 rounded-full flex items-center justify-center text-accent-500 font-bold border border-primary-700/30">
                          {review.user.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-dark-50">{review.user.name}</h4>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-dark-500'}`} />
                              ))}
                            </div>
                            <span className="text-sm text-dark-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h5 className="font-medium text-dark-50 mb-2">{review.title}</h5>
                          <p className="text-dark-300">{review.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-400 mb-4">No reviews yet. Be the first to review!</p>
                </div>
              )}

              {!submitted ? (
                <div className="mt-8 pt-8 border-t border-dark-500/30">
                  <h3 className="text-lg font-semibold text-dark-50 mb-4">Write a Review</h3>
                  {session ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="p-2"
                            >
                              <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-accent-500 fill-accent-500' : 'text-dark-500'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Title</label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-dark-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">Review</label>
                        <textarea
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-dark-50"
                          required
                        />
                      </div>
                      <button type="submit" className="btn-primary">Submit Review</button>
                    </form>
                  ) : (
                    <p className="text-dark-400 mb-4">Please <Link href="/login" className="text-accent-500 hover:underline">login</Link> to write a review.</p>
                  )}
                </div>
              ) : (
                <div className="mt-8 pt-8 border-t border-dark-500/30 text-center">
                  <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark-50 mb-2">Review submitted!</h3>
                  <p className="text-dark-400">Thank you for your review.</p>
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
