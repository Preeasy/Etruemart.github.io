import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Globe,
} from 'lucide-react';
import { products } from '../data/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <Link to="/products" className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - currentVariant.price) / product.originalPrice) * 100)
    : 0;

  const reviews = [
    {
      id: 1,
      name: 'Jessica W.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
      rating: 5,
      date: '2 weeks ago',
      title: 'Absolutely love it!',
      content: 'Great quality product, exactly as described. Shipping was fast and packaging was good. Will definitely buy again.',
      verified: true,
    },
    {
      id: 2,
      name: 'David K.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
      rating: 4,
      date: '1 month ago',
      title: 'Good value for money',
      content: 'Product works well. Build quality is solid. Shipping took a bit longer than expected but overall happy with purchase.',
      verified: true,
    },
    {
      id: 3,
      name: 'Maria S.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
      rating: 5,
      date: '1 month ago',
      title: 'Best purchase this year!',
      content: 'Exceeded my expectations. The quality is amazing and the customer service was very helpful when I had questions.',
      verified: true,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <Link to="/products" className="hover:text-primary-600">Products</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-xl"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviewCount.toLocaleString()} reviews)
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{product.salesCount.toLocaleString()} sold</span>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-accent-600">${currentVariant.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                    <span className="bg-accent-500 text-white text-sm font-bold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Color Variants */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
              <div className="flex gap-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(index)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedVariant === index ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-gray-500 text-sm">
                  <span className="text-green-600 font-medium">In Stock</span> ({product.stock} available)
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white py-4 rounded-xl font-semibold text-lg transition-colors">
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
              <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors">
                Buy Now
              </button>
              <button className="sm:w-14 p-4 border-2 border-gray-200 rounded-xl hover:border-accent-400 hover:text-accent-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button className="sm:w-14 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:text-primary-600 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-600" />
                Worldwide Shipping
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">🇺🇸 United States</span>
                  <span className="font-medium">{product.shippingInfo.us}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">🇨🇦 Canada</span>
                  <span className="font-medium">{product.shippingInfo.ca}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">🇬🇧 United Kingdom</span>
                  <span className="font-medium">{product.shippingInfo.uk}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-500">Orders over $50</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <ShieldCheck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <RotateCcw className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${product.reviewCount})` },
                { id: 'shipping', label: 'Shipping & Returns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description} Experience the perfect blend of quality, style, and functionality with our premium {product.name}.
                Crafted with attention to detail and using only the finest materials, this product is designed to exceed your expectations.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Whether you're treating yourself or looking for the perfect gift, this product offers exceptional value and performance.
                Backed by our quality guarantee and shipped worldwide with reliable delivery.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's in the box:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>1 x {product.name}</li>
                <li>User Manual</li>
                <li>Warranty Card</li>
                <li>Premium Packaging</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b">
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{product.rating}</div>
                  <div className="flex justify-center md:justify-start mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-500">{product.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>

              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-8 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900">{review.name}</h4>
                          {review.verified && (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <Check className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                        <p className="text-gray-600">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
                  <MessageSquare className="w-5 h-5" />
                  Write a Review
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping & Returns</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary-600" />
                    Shipping Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">🇺🇸 United States</span>
                      <span className="font-medium">{product.shippingInfo.us}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">🇨🇦 Canada</span>
                      <span className="font-medium">{product.shippingInfo.ca}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">🇬🇧 United Kingdom</span>
                      <span className="font-medium">{product.shippingInfo.uk}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="text-gray-600">🌍 Rest of World</span>
                      <span className="font-medium">7-14 business days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-primary-600" />
                    Return Policy
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      30-day hassle-free return policy
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Free returns for defective items
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Full refund or exchange available
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      Items must be unused and in original packaging
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-primary-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Guarantee</h3>
                <p className="text-gray-600">
                  We partner with trusted global carriers including DHL, FedEx, UPS, and YunExpress to ensure your order
                  arrives safely and on time. All shipments are fully tracked and insured for your peace of mind.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
