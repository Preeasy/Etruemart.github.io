'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, ShoppingCart, Share2, Truck, Shield, ChevronLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getSession, useSession } from 'next-auth/react';

interface ProductVariation {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  image: string | null;
  skuSuffix: string;
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  helpfulCount: number;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  orderItem: {
    variation: ProductVariation;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  description: string;
  material: string | null;
  moq: number;
  priceMin: number;
  priceMax: number;
  mainImage: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
  variations: ProductVariation[];
  reviews: Review[];
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [country, setCountry] = useState('US');
  const [shippingQuotes, setShippingQuotes] = useState<{ provider: string; cost: number; estimatedDays: string }[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [selectedOrderItem, setSelectedOrderItem] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (country && product) {
      calculateShipping();
    }
  }, [country, product]);

  useEffect(() => {
    if (session && product) {
      checkReviewPermission();
    }
  }, [session, product]);

  const checkReviewPermission = async () => {
    if (!session?.user?.id) return;
    const response = await fetch(`/api/products/${params.slug}/reviews/check`);
    const data = await response.json();
    if (data.success) {
      setCanReview(data.data.canReview);
      if (data.data.orderItemIds.length > 0) {
        setSelectedOrderItem(data.data.orderItemIds[0]);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);

    if (!reviewTitle.trim()) {
      setReviewError('Please enter a title');
      setSubmittingReview(false);
      return;
    }

    if (!reviewContent.trim()) {
      setReviewError('Please enter your review content');
      setSubmittingReview(false);
      return;
    }

    if (!selectedOrderItem) {
      setReviewError('Please select an order item');
      setSubmittingReview(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${params.slug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItemId: selectedOrderItem,
          rating: reviewRating,
          title: reviewTitle,
          content: reviewContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReviewSuccess(true);
        setReviewTitle('');
        setReviewContent('');
        setReviewRating(5);
        fetchProduct();
        checkReviewPermission();
      } else {
        setReviewError(data.error?.message || 'Failed to submit review');
      }
    } catch {
      setReviewError('Something went wrong');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    const response = await fetch(`/api/products/${params.slug}`);
    const data = await response.json();

    if (data.success) {
      setProduct(data.data);
      if (data.data.variations.length > 0) {
        setSelectedColor(data.data.variations[0].color);
        setSelectedSize(data.data.variations[0].size);
      }
    } else {
      router.push('/products');
    }
    setLoading(false);
  };

  const calculateShipping = async () => {
    const response = await fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country,
        weight: 0.5,
        dimensions: { length: 20, width: 15, height: 10 },
      }),
    });
    const data = await response.json();
    if (data.success) {
      setShippingQuotes(data.data);
    }
  };

  const getSelectedVariation = () => {
    if (!product) return null;
    return product.variations.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  };

  const getAvailableColors = () => {
    if (!product) return [];
    return Array.from(new Set(product.variations.map((v) => v.color)));
  };

  const getAvailableSizes = () => {
    if (!product) return [];
    return Array.from(new Set(product.variations.filter((v) => v.color === selectedColor).map((v) => v.size)));
  };

  const handleAddToCart = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const variation = getSelectedVariation();
    if (!variation) {
      setError('Please select a variation');
      return;
    }

    if (variation.stock < quantity) {
      setError('Insufficient stock');
      return;
    }

    const moq = product?.moq ?? 1;
    if (quantity < moq) {
      setError(`Minimum order quantity is ${moq}`);
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          variationId: variation.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/cart');
      } else {
        setError(data.error?.message || 'Failed to add to cart');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const variation = getSelectedVariation();
  const colors = getAvailableColors();
  const sizes = getAvailableSizes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={variation?.image || product.mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-gray-500 mb-4">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">{product.rating}</span>
              <span className="text-gray-400">({product.reviewCount} reviews)</span>
            </div>
            <span className="text-gray-500">|</span>
            <span className="text-gray-500">{product.salesCount} sold</span>
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-blue-600">
              {formatPrice(variation?.price || product.priceMin)}
            </span>
            {product.priceMin !== product.priceMax && (
              <span className="text-gray-400">
                - {formatPrice(product.priceMax)}
              </span>
            )}
            <span className="text-sm text-gray-500">/ piece</span>
          </div>

          <div className="space-y-4 mb-6">
            {colors.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        const sizes = getAvailableSizes();
                        if (sizes.length > 0) {
                          setSelectedSize(sizes[0]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (MOQ: {product.moq})
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Stock: <span className={variation?.stock && variation.stock > 10 ? 'text-green-600' : 'text-orange-600'}>
                {variation?.stock || 0} available
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={isAdding}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center text-center">
              <Truck className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Fast Shipping</p>
              <p className="text-xs text-gray-500">3-15 days</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Secure Payment</p>
              <p className="text-xs text-gray-500">SSL encrypted</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Share2 className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Earn 5%</p>
              <p className="text-xs text-gray-500">Affiliate program</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4">Shipping Options</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
              <div className="space-y-2">
                {shippingQuotes.map((quote) => (
                  <div key={quote.provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{quote.provider}</span>
                      <span className="text-sm text-gray-500 ml-2">{quote.estimatedDays}</span>
                    </div>
                    <span className="font-semibold text-blue-600">{formatPrice(quote.cost)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews ({product.reviewCount})</h2>

        {session && (
          <Card className="mb-6">
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
              
              {!canReview ? (
                <p className="text-gray-500">You must purchase this product before you can review it.</p>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {reviewSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                      Thank you for your review!
                    </div>
                  )}
                  
                  {reviewError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`p-2 rounded-lg transition-colors ${
                            reviewRating >= star
                              ? 'text-yellow-500 hover:bg-yellow-50'
                              : 'text-gray-300 hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-6 h-6" fill={reviewRating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Title"
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Summarize your experience"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Write your review..."
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {product.reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {review.user.name || review.user.email.split('@')[0]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      <p className="text-gray-600 mb-2">{review.content}</p>
                      {review.orderItem && (
                        <p className="text-sm text-gray-500">
                          Purchased: {review.orderItem.variation.color} / {review.orderItem.variation.size}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}