import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Package,
  Flame,
  TrendingUp,
  Award,
  Globe,
  Clock,
  MessageCircle,
  Users,
  Sparkles,
  CheckCircle2,
  Zap,
  Tag,
  Headphones,
  Layers,
  FileCheck,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import fs from 'fs';
import path from 'path';

interface Product {
  id: number | string;
  name: string;
  description: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  originalPrice?: number | string;
  image: string;
  images: string[];
  category?: { name: string; slug: string };
  stock?: number;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  variants?: { id: string; color: string; size: string; price: number; stock?: number }[];
  reviews?: { id: string; user: { name: string }; rating: number; title: string; content: string; createdAt: string }[];
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

const trustBadges = [
  { icon: Award, label: 'Premium Quality', desc: 'Top factories in Yiwu' },
  { icon: Globe, label: 'Global Shipping', desc: '180+ countries' },
  { icon: CheckCircle2, label: 'Verified Supplier', desc: 'On-site audited' },
  { icon: Clock, label: 'Fast Lead Time', desc: '7-15 days' },
];

const valueProps = [
  { icon: Truck, label: 'Free Shipping', desc: 'On bulk orders $50+' },
  { icon: ShieldCheck, label: 'Secure Payment', desc: 'SSL encrypted' },
  { icon: RotateCcw, label: 'Easy Returns', desc: '30-day policy' },
  { icon: Headphones, label: '24/7 Support', desc: 'Live chat available' },
];

const shippingOptions = [
  { method: 'Express (DHL/FedEx)', time: '5-9 days', cost: '$15-25' },
  { method: 'Air Shipping', time: '9-15 days', cost: '$8-15' },
  { method: 'Sea Shipping', time: '25-40 days', cost: '$2-5/kg' },
];

const ProductDetail = ({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(product.moq || 12);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) {
    return (
      <Layout>
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-ink-300" />
          </div>
          <p className="text-ink-500 text-lg">Product not found</p>
        </div>
      </Layout>
    );
  }

  const price = Number(product.price || product.priceMin || 0);
  const originalPrice = product.priceMax && product.priceMax > price ? Number(product.priceMax * 1.3) : (product.originalPrice ? Number(product.originalPrice) : undefined);
  const rating = Number(product.rating || 4.7);
  const reviewCount = Number(product.reviewCount || Math.floor(Math.random() * 80) + 20);
  const salesCount = Number(product.salesCount || Math.floor(Math.random() * 800) + 100);
  const stock = Number(product.stock || 9999);
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Sample reviews for the product
  const sampleReviews = product.reviews && product.reviews.length > 0 ? product.reviews : [
    { id: '1', user: { name: 'Sarah M.' }, rating: 5, title: 'Excellent quality!', content: 'The product exceeded my expectations. Material feels premium and the craftsmanship is top-notch. Will definitely reorder for my boutique.', createdAt: '2026-07-15T00:00:00Z' },
    { id: '2', user: { name: 'James K.' }, rating: 5, title: 'Fast shipping', content: 'Order arrived in just 12 days. The product matches the description perfectly. My customers love it. Already placing a second order!', createdAt: '2026-07-10T00:00:00Z' },
    { id: '3', user: { name: 'Emma L.' }, rating: 4, title: 'Great value for money', content: 'Quality is much better than expected at this price point. The packaging was also very professional. Highly recommend for small retailers.', createdAt: '2026-07-05T00:00:00Z' },
  ];

  // Sample FAQs
  const faqs = [
    { q: 'What is the minimum order quantity?', a: `The MOQ for this product is ${product.moq || 12} pieces. We accept smaller trial orders for new customers to help you test the market.` },
    { q: 'Can I get a sample before placing a bulk order?', a: 'Yes, we offer samples at a slightly higher unit price (typically 2-3x the bulk price). Sample fees can be fully refunded upon bulk order confirmation.' },
    { q: 'What are the payment terms?', a: 'We accept T/T (bank transfer), PayPal, Western Union, and L/C. For new customers: 30% deposit + 70% balance before shipping. Established customers can negotiate better terms.' },
    { q: 'How long does production take?', a: 'Standard lead time is 7-15 days after deposit confirmation, depending on order quantity. Custom orders may take 15-25 days. Rush production available for an additional fee.' },
    { q: 'Do you offer custom packaging or branding?', a: 'Yes, we provide comprehensive OEM/ODM services including custom packaging, logo printing, color customization, and bespoke design. MOQ applies for custom orders.' },
  ];

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
        quantity,
      }),
    }).then(() => {
      alert('Added to inquiry list!');
    });
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-ink-500">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <Link href="/products" className="hover:text-accent-600 transition-colors font-medium">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-ink-300" />
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-accent-600 transition-colors font-medium">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <span className="text-navy-800 font-bold truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        {/* Top Section: Image + Info - Image is left-aligned (no left sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Image - Left Aligned */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Main Image */}
              <div className="relative bg-white rounded-3xl border border-ink-200 overflow-hidden shadow-soft group">
                {discount > 0 && (
                  <div className="absolute top-5 left-5 z-10 bg-accent-gradient text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-accent-glow uppercase tracking-wider">
                    Save {discount}%
                  </div>
                )}
                <div className="absolute top-5 right-5 z-10 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md ${
                      isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-ink-600 hover:text-red-500'
                    }`}
                    aria-label="Add to favorites"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-ink-600 hover:text-accent-600 flex items-center justify-center shadow-md transition-all" aria-label="Share">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative aspect-square bg-gradient-to-br from-ink-50 to-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                    quality={95}
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
                {/* Trust Strip Below Image */}
                <div className="grid grid-cols-4 border-t border-ink-100 divide-x divide-ink-100">
                  {valueProps.map((vp, i) => {
                    const Icon = vp.icon;
                    return (
                      <div key={i} className="px-3 py-3 text-center">
                        <Icon className="w-4 h-4 text-accent-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-navy-800 leading-tight">{vp.label}</p>
                        <p className="text-[9px] text-ink-500 leading-tight mt-0.5">{vp.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trust Badges Block */}
              <div className="bg-white rounded-2xl border border-ink-200 p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-accent-500" />
                  <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em]">Why Choose Us</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {trustBadges.map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-ink-50">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-soft">
                          <Icon className="w-4 h-4 text-accent-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy-800 leading-tight">{badge.label}</p>
                          <p className="text-[10px] text-ink-500 leading-tight mt-0.5">{badge.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="lg:col-span-5 space-y-5">
            {/* Category & SKU */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-flex items-center gap-1.5 bg-accent-50 text-accent-600 text-xs font-bold px-3 py-1.5 rounded-full border border-accent-200 hover:bg-accent-100 transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {product.category.name}
                </Link>
              )}
              {product.sku && (
                <span className="text-[11px] text-ink-500 font-mono">SKU: {product.sku}</span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-success-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy-800 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating & Sales */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-navy-800">{rating.toFixed(1)}</span>
                <span className="text-xs text-ink-500">({reviewCount} reviews)</span>
              </div>
              <div className="w-px h-4 bg-ink-200"></div>
              <div className="flex items-center gap-1.5 text-xs text-ink-500">
                <Users className="w-3.5 h-3.5" />
                <span><span className="font-bold text-navy-800">{salesCount.toLocaleString()}</span> sold</span>
              </div>
              <div className="w-px h-4 bg-ink-200"></div>
              <div className="flex items-center gap-1.5 text-xs text-ink-500">
                <Zap className="w-3.5 h-3.5 text-accent-500" />
                <span className="font-bold text-navy-800">Hot</span> trending
              </div>
            </div>

            {/* Price Block */}
            <div className="relative overflow-hidden bg-gradient-to-br from-accent-50 via-orange-50 to-amber-50 rounded-2xl p-5 border border-accent-100">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent-200/30 rounded-full" />
              <div className="relative">
                <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                  <span className="text-4xl font-bold text-accent-600">${price.toFixed(2)}</span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-base text-ink-400 line-through">${originalPrice.toFixed(2)}</span>
                  )}
                  {discount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      <Flame className="w-3 h-3" />
                      SAVE {discount}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-500">Price varies by quantity & customization. Bulk discounts available.</p>
              </div>
            </div>

            <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-ink-100">
              {product.material && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.1em] mb-1 font-bold">Material</span>
                  <span className="text-sm font-bold text-navy-800">{product.material}</span>
                </div>
              )}
              {product.plating && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.1em] mb-1 font-bold">Plating</span>
                  <span className="text-sm font-bold text-navy-800">{product.plating}</span>
                </div>
              )}
              {product.color && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.1em] mb-1 font-bold">Color</span>
                  <span className="text-sm font-bold text-navy-800">{product.color}</span>
                </div>
              )}
              {product.size && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.1em] mb-1 font-bold">Size</span>
                  <span className="text-sm font-bold text-navy-800">{product.size}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] text-ink-500 uppercase tracking-[0.1em] mb-1 font-bold">MOQ</span>
                <span className="text-sm font-bold text-navy-800">{product.moq || 12} pieces</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-ink-500 uppercase tracking-[0.1em] mb-1 font-bold">Pack Size</span>
                <span className="text-sm font-bold text-navy-800">{product.packSize || product.moq || 12} pcs/carton</span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-navy-800">Order Quantity</h3>
                <span className="text-xs text-success-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {stock.toLocaleString()} available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-ink-200 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 12))}
                    className="px-3 py-2.5 hover:bg-ink-50 transition-colors text-ink-600"
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-navy-800 min-w-[70px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 12)}
                    className="px-3 py-2.5 hover:bg-ink-50 transition-colors text-ink-600"
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-ink-500 font-medium">Step: 12 pcs</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white py-4 rounded-xl font-bold transition-all shadow-accent-glow hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Supplier
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 text-white py-4 rounded-xl font-bold transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Inquiry
              </button>
            </div>

            {/* Supplier Info Card */}
            <div className="bg-gradient-to-r from-ink-50 to-white rounded-2xl p-4 border border-ink-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-navy-gradient flex items-center justify-center text-white font-bold text-lg shadow-soft">
                  YW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-navy-800">Yiwu Premium Trading Co.</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-success-50 text-success-700 px-1.5 py-0.5 rounded font-bold border border-success-200">VERIFIED</span>
                    <span className="text-[10px] text-ink-500 font-medium">8 yrs · 95% response</span>
                  </div>
                </div>
                <Link href="#" className="text-xs text-accent-600 hover:text-accent-700 font-bold">
                  Visit Store →
                </Link>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="bg-white rounded-2xl border border-ink-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-accent-500" />
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em]">Shipping Options</h3>
              </div>
              <div className="space-y-2">
                {shippingOptions.map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-ink-50 hover:bg-accent-50/30 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-navy-800">{opt.method}</p>
                      <p className="text-[10px] text-ink-500">{opt.time}</p>
                    </div>
                    <span className="text-xs font-bold text-accent-600">{opt.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs + Sidebar */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mt-10">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-ink-200 shadow-soft overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-ink-100 px-6 bg-gradient-to-r from-ink-50 to-white">
                <div className="flex gap-1 overflow-x-auto">
                  {[
                    { key: 'description', label: 'Description', icon: FileCheck },
                    { key: 'specs', label: 'Specifications', icon: Layers },
                    { key: 'reviews', label: `Reviews (${reviewCount})`, icon: Star },
                    { key: 'faq', label: 'FAQ', icon: MessageCircle },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 py-4 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                          activeTab === tab.key
                            ? 'border-accent-500 text-accent-600'
                            : 'border-transparent text-ink-500 hover:text-navy-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 md:p-8">
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-navy-800 tracking-tight">Product Overview</h2>
                      </div>
                      <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent-500" />
                        Key Features
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          'Premium quality materials sourced from certified suppliers',
                          'Rigorous 3-stage quality control inspection process',
                          'Low MOQ for small businesses and trial orders',
                          'Custom branding and packaging services available',
                          'Fast production lead time of 7-15 days',
                          'Worldwide shipping with DDP/DDU options',
                          'Competitive factory-direct pricing',
                          'Dedicated account manager for bulk orders',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-ink-50">
                            <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-ink-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent-500" />
                        Perfect For
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Boutique Stores', 'Online Retailers', 'Wholesale Distributors', 'Gift Shops'].map((use, i) => (
                          <div key={i} className="bg-gradient-to-br from-accent-50 to-orange-50 rounded-xl p-4 text-center border border-accent-100 hover:border-accent-300 transition-colors">
                            <p className="text-xs font-bold text-navy-800">{use}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-navy-gradient flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-navy-800 tracking-tight">Product Specifications</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-0 bg-ink-50 rounded-2xl p-2">
                      {[
                        { label: 'Product Name', value: product.name },
                        { label: 'SKU', value: product.sku || 'N/A' },
                        { label: 'Category', value: product.category?.name || 'N/A' },
                        { label: 'Material', value: product.material || 'N/A' },
                        { label: 'Plating', value: product.plating || 'N/A' },
                        { label: 'Color', value: product.color || 'Multiple options' },
                        { label: 'Size', value: product.size || 'Standard' },
                        { label: 'MOQ', value: `${product.moq || 12} pieces` },
                        { label: 'Pack Size', value: `${product.packSize || product.moq || 12} pieces/carton` },
                        { label: 'Origin', value: product.origin || 'Yiwu, China' },
                        { label: 'Lead Time', value: '7-15 days' },
                        { label: 'Customization', value: 'OEM/ODM available' },
                        { label: 'Sample Available', value: 'Yes' },
                        { label: 'Shipping', value: 'DHL, FedEx, Sea, Air' },
                      ].map((spec, i) => (
                        <div key={i} className="flex justify-between items-center py-3 px-3 border-b border-white last:border-0 hover:bg-white rounded-lg transition-colors">
                          <span className="text-sm text-ink-500 font-medium">{spec.label}</span>
                          <span className="text-sm font-bold text-navy-800">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-white" />
                      </div>
                      <h2 className="text-xl font-bold text-navy-800 tracking-tight">Customer Reviews</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mb-8 pb-6 border-b border-ink-100 bg-ink-50 rounded-2xl p-5">
                      <div className="text-center md:border-r md:border-ink-200">
                        <div className="text-5xl font-bold text-navy-800 mb-1">{rating.toFixed(1)}</div>
                        <div className="flex gap-0.5 justify-center mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-accent-500 fill-accent-500' : 'text-ink-300'}`} />
                          ))}
                        </div>
                        <p className="text-xs text-ink-500 font-medium">Based on {reviewCount} reviews</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {[
                          { stars: 5, pct: 78 },
                          { stars: 4, pct: 15 },
                          { stars: 3, pct: 5 },
                          { stars: 2, pct: 1 },
                          { stars: 1, pct: 1 },
                        ].map((row) => (
                          <div key={row.stars} className="flex items-center gap-2">
                            <div className="flex gap-0.5 w-16">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < row.stars ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />
                              ))}
                            </div>
                            <div className="flex-1 h-2 bg-ink-200 rounded-full overflow-hidden">
                              <div className="h-full bg-accent-gradient rounded-full" style={{ width: `${row.pct}%` }}></div>
                            </div>
                            <span className="text-xs text-ink-600 w-10 text-right font-bold">{row.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      {sampleReviews.map((review) => (
                        <div key={review.id} className="pb-5 border-b border-ink-100 last:border-0">
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="w-10 h-10 rounded-full bg-navy-gradient flex items-center justify-center text-white font-bold text-sm">
                              {review.user?.name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-navy-800">{review.user?.name || 'Anonymous'}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />
                                  ))}
                                </div>
                                <span className="text-[10px] text-ink-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-navy-800 mb-1.5">{review.title}</h4>
                          <p className="text-sm text-ink-600 leading-relaxed">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-navy-gradient flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-navy-800 tracking-tight">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-3">
                      {faqs.map((faq, i) => (
                        <details key={i} className="group border border-ink-200 rounded-xl overflow-hidden hover:border-accent-300 transition-colors">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-ink-50 transition-colors">
                            <span className="text-sm font-bold text-navy-800 pr-4">{faq.q}</span>
                            <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0 group-open:bg-accent-gradient group-open:text-white transition-colors">
                              <Plus className="w-3.5 h-3.5 text-accent-600 group-hover:text-accent-600 group-open:text-white transition-all group-open:rotate-45" />
                            </div>
                          </summary>
                          <div className="px-4 pb-4 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-3 bg-ink-50/50">
                            {faq.a}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-accent-glow">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-navy-800 tracking-tight">Related Products</h2>
                      <p className="text-xs text-ink-500">More from {product.category?.name || 'this category'}</p>
                    </div>
                  </div>
                  <Link href={`/products?category=${product.category?.slug}`} className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 text-sm font-bold">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.slice(0, 4).map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Hot Products */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white rounded-2xl border border-ink-200 shadow-soft overflow-hidden">
                <div className="bg-navy-gradient px-5 py-3.5 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full" />
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 relative">
                    <Flame className="w-4 h-4 text-accent-400" />
                    Hot Products
                  </h3>
                </div>
                <div className="p-3 space-y-2.5">
                  {relatedProducts.slice(0, 5).map((item, i) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      className="flex gap-3 p-2.5 rounded-xl hover:bg-accent-50/50 transition-colors group"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-ink-50 rounded-lg overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-accent-gradient text-white text-[10px] font-bold rounded flex items-center justify-center shadow-sm">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-800 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold text-accent-600 mt-1">${Number(item.priceMin).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mini Promo */}
              <div className="relative overflow-hidden bg-navy-gradient rounded-2xl p-5 text-white">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-accent-500/20 rounded-full" />
                <div className="absolute premium-pattern inset-0 opacity-10" />
                <div className="relative">
                  <h3 className="text-base font-bold mb-1.5">Become a Seller</h3>
                  <p className="text-xs text-ink-200 mb-3.5 leading-relaxed">Join 10,000+ suppliers reaching buyers worldwide</p>
                  <Link
                    href="/sell"
                    className="inline-flex items-center gap-1 bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors w-full justify-center"
                  >
                    Start Selling
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl border border-ink-200 p-5 shadow-soft">
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-500" />
                  Product Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Total Sold', value: salesCount.toLocaleString(), color: 'text-accent-600' },
                    { label: 'Available Stock', value: stock.toLocaleString(), color: 'text-navy-800' },
                    { label: 'Avg. Lead Time', value: '7-15 days', color: 'text-navy-800' },
                    { label: 'Customer Rating', value: `${rating.toFixed(1)}/5`, color: 'text-accent-600' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                      <span className="text-xs text-ink-500 font-medium">{stat.label}</span>
                      <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;

export const getServerSideProps = async (context: { params: { id: string } }) => {
  const { id } = context.params;
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  const products = siteData.products || [];

  const product = products.find((p: { id: number | string }) =>
    String(p.id) === String(id)
  );

  if (!product) {
    return { notFound: true };
  }

  const relatedProducts = products
    .filter((p: { id: number | string; category: { slug: string } }) =>
      String(p.id) !== String(id) &&
      (!product.category || !p.category || p.category.slug === product.category.slug)
    )
    .slice(0, 8);

  return {
    props: { product, relatedProducts },
  };
};
