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
  ChevronLeft,
  Minus,
  Plus,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
  Headphones,
  Layers,
  FileCheck,
  X,
  Search,
  CheckCircle2,
  MessageCircle,
  Users,
  Flame,
  TrendingUp,
  Award,
  Globe,
  Clock,
  BadgeCheck,
  Shield,
  Store,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import ShippingSelector from '@/components/ShippingSelector';
import siteDataJson from '../../../site-data.json';

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
  seller?: string;
}

export default function ProductDetail({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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
  const originalPrice = product.priceMax && product.priceMax > price ? Number(product.priceMax * 1.3) : undefined;
  const rating = Number(product.rating || 4.7);
  const reviewCount = Number(product.reviewCount || Math.floor(Math.random() * 80) + 20);
  const salesCount = Number(product.salesCount || Math.floor(Math.random() * 800) + 100);
  const stock = Number(product.stock || 9999);
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const images = product.images?.length >= 2 ? product.images : [product.image];

  const sampleReviews = [
    { id: '1', user: { name: 'Sarah M.' }, rating: 5, title: 'Excellent quality!', content: 'The product exceeded my expectations. Material feels premium and the craftsmanship is top-notch. Will definitely reorder for my boutique.', createdAt: '2026-07-15T00:00:00Z' },
    { id: '2', user: { name: 'James K.' }, rating: 5, title: 'Fast shipping', content: 'Order arrived in just 12 days. The product matches the description perfectly. My customers love it. Already placing a second order!', createdAt: '2026-07-10T00:00:00Z' },
    { id: '3', user: { name: 'Emma L.' }, rating: 4, title: 'Great value for money', content: 'Quality is much better than expected at this price point. The packaging was also very professional. Highly recommend for small retailers.', createdAt: '2026-07-05T00:00:00Z' },
  ];

  const faqs = [
    { q: 'What is the minimum order quantity?', a: `The MOQ for this product is ${product.moq || 12} pieces. We accept smaller trial orders for new customers to help you test the market.` },
    { q: 'Can I get a sample before placing a bulk order?', a: 'Yes, we offer samples at a slightly higher unit price. Sample fees can be fully refunded upon bulk order confirmation.' },
    { q: 'What are the payment terms?', a: 'We accept T/T, PayPal, Western Union, and L/C. For new customers: 30% deposit + 70% balance before shipping.' },
    { q: 'How long does production take?', a: 'Standard lead time is 7-15 days after deposit confirmation. Custom orders may take 15-25 days.' },
    { q: 'Do you offer custom packaging or branding?', a: 'Yes, we provide comprehensive OEM/ODM services including custom packaging, logo printing, and color customization.' },
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);

  const handleAddToCart = () => {
    if (!session) { router.push('/login'); return; }
    fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, quantity }) }).then(() => alert('Added to inquiry list!'));
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-ink-500">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <Link href="/products" className="hover:text-accent-600 transition-colors font-medium">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-ink-300" />
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-accent-600 transition-colors font-medium">{product.category.name}</Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <span className="text-navy-800 font-bold truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-24 space-y-3">
              {/* Main Image */}
              <div className="relative bg-white rounded-2xl border border-ink-100 overflow-hidden shadow-sm group cursor-zoom-in" onClick={() => openLightbox(selectedImage)}>
                {discount > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-accent-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Save {discount}%
                  </span>
                )}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-ink-600 hover:text-red-500'}`}><Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} /></button>
                  <button className="w-9 h-9 rounded-full bg-white/90 text-ink-600 hover:text-accent-600 flex items-center justify-center shadow-sm transition-all" onClick={(e) => e.stopPropagation()}><Share2 className="w-4 h-4" /></button>
                </div>
                <div className="relative aspect-[4/3] bg-ink-50">
                  <Image src={images[selectedImage]} alt={product.name} fill className="object-contain p-6" quality={95} priority sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 px-2.5 py-1 rounded-lg text-[10px] text-ink-500 font-medium flex items-center gap-1 shadow-sm border border-ink-100">
                  <Search className="w-3 h-3" /> Click to zoom
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-accent-500' : 'border-ink-100 hover:border-accent-300'} bg-white`}
                    >
                      <Image src={img} alt={`${product.name} - view ${i + 1}`} fill className="object-contain p-1.5" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            {/* Category + SKU + Stock */}
            <div className="flex items-center gap-3 flex-wrap">
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`} className="inline-flex items-center gap-1.5 bg-navy-50 text-navy-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-navy-200 hover:bg-navy-100 transition-colors">
                  <Tag className="w-3 h-3" />{product.category.name}
                </Link>
              )}
              {product.sku && <span className="text-[11px] text-ink-500 font-mono">SKU: {product.sku}</span>}
              <span className="inline-flex items-center gap-1 text-[11px] text-success-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />In Stock ({stock.toLocaleString()})
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-navy-900 leading-tight">{product.name}</h1>

            {/* Rating & Sales */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
                </div>
                <span className="text-sm font-bold text-navy-800">{rating.toFixed(1)}</span>
                <Link href="#reviews" className="text-xs text-accent-600 font-semibold hover:underline">({reviewCount} reviews)</Link>
              </div>
              <span className="text-ink-300">|</span>
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <Users className="w-3.5 h-3.5" />
                <span><span className="font-bold text-navy-800">{salesCount.toLocaleString()}</span> sold</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white border border-ink-100 rounded-2xl p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-navy-900">${price.toFixed(2)}</span>
                {originalPrice && originalPrice > price && (
                  <span className="text-base text-ink-400 line-through">${originalPrice.toFixed(2)}</span>
                )}
                {discount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-600 text-[10px] font-bold px-2 py-0.5 rounded">
                    <Flame className="w-3 h-3" />SAVE {discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-1.5">Price varies by quantity & customization. Bulk discounts available.</p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 py-3 border-y border-ink-100">
              {product.material && (
                <div>
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.08em] font-bold">Material</span>
                  <p className="text-sm font-bold text-navy-800 mt-0.5">{product.material}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.08em] font-bold">Size</span>
                  <p className="text-sm font-bold text-navy-800 mt-0.5">{product.size}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-ink-500 uppercase tracking-[0.08em] font-bold">MOQ</span>
                <p className="text-sm font-bold text-navy-800 mt-0.5">{product.moq || 12} pcs</p>
              </div>
              {product.plating && (
                <div>
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.08em] font-bold">Finish</span>
                  <p className="text-sm font-bold text-navy-800 mt-0.5">{product.plating}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-[10px] text-ink-500 uppercase tracking-[0.08em] font-bold">Color</span>
                  <p className="text-sm font-bold text-navy-800 mt-0.5">{product.color}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-ink-500 uppercase tracking-[0.08em] font-bold">Pack</span>
                <p className="text-sm font-bold text-navy-800 mt-0.5">{product.packSize || product.moq || 12} pcs</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>

            {/* Quantity + CTA */}
            <div className="bg-white rounded-2xl border border-ink-100 p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-navy-800">Order Quantity</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-ink-200 rounded-xl bg-white overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 12))} className="px-3 py-2.5 hover:bg-ink-50 transition-colors text-ink-600"><Minus className="w-4 h-4" /></button>
                    <span className="px-5 font-bold text-navy-800 min-w-[70px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 12)} className="px-3 py-2.5 hover:bg-ink-50 transition-colors text-ink-600"><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-xs text-ink-500 font-medium">Step: 12 pcs</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white py-3.5 rounded-xl font-bold transition-colors">
                  <MessageCircle className="w-5 h-5" />Contact Supplier
                </button>
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 text-white py-3.5 rounded-xl font-bold transition-colors">
                  <ShoppingCart className="w-5 h-5" />Add to Inquiry
                </button>
              </div>
            </div>

            {/* Purchase Protection */}
            <div className="bg-white rounded-2xl border border-ink-100 p-5">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent-500" />
                Purchase Protection
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Truck, label: 'Free Shipping', desc: 'Orders $50+' },
                  { icon: ShieldCheck, label: 'Secure Payment', desc: 'SSL encrypted' },
                  { icon: RotateCcw, label: 'Easy Returns', desc: '30-day policy' },
                  { icon: Headphones, label: '24/7 Support', desc: 'Live chat' },
                  { icon: Award, label: 'Premium Quality', desc: 'Top factories' },
                  { icon: Globe, label: 'Global Shipping', desc: '180+ countries' },
                  { icon: Clock, label: 'Fast Lead Time', desc: '7-15 days' },
                  { icon: BadgeCheck, label: 'Verified Supplier', desc: 'On-site audited' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-navy-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-navy-800 leading-tight">{item.label}</p>
                        <p className="text-[10px] text-ink-500 leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Info */}
            <ShippingSelector categorySlug={product.category?.slug} />

            {/* Supplier Card */}
            <Link href="/store/yiwu-premium-trading" className="block bg-white rounded-2xl p-4 border border-ink-100 hover:border-accent-300 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center text-white font-bold text-lg">
                  YW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-navy-800 group-hover:text-accent-600 transition-colors">{product.seller || 'Yiwu Yeatru trading company'}</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-success-50 text-success-700 px-1.5 py-0.5 rounded font-bold border border-success-200">VERIFIED</span>
                    <span className="text-[10px] text-ink-500 font-medium">8 yrs · 95% response</span>
                  </div>
                </div>
                <Store className="w-5 h-5 text-accent-500" />
              </div>
            </Link>
          </div>
        </div>

        {/* Tabs + Sidebar */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mt-10">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-ink-100 px-6 bg-ink-50">
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
                        className={`flex items-center gap-2 py-4 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key ? 'border-accent-500 text-accent-600' : 'border-transparent text-ink-500 hover:text-navy-800'}`}
                      >
                        <Icon className="w-4 h-4" />{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 md:p-8">
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-navy-900 mb-3">Product Overview</h2>
                      <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent-500" />Key Features
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2.5">
                        {['Premium quality materials from certified suppliers','Rigorous 3-stage quality control','Low MOQ for small businesses','Custom branding & packaging available','Fast production: 7-15 days lead time','Worldwide shipping with DDP/DDU','Competitive factory-direct pricing','Dedicated account manager for bulk'].map((f, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-ink-50">
                            <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-ink-700">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent-500" />Perfect For
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Boutique Stores','Online Retailers','Wholesale Distributors','Gift Shops'].map((u, i) => (
                          <div key={i} className="bg-ink-50 rounded-xl p-4 text-center">
                            <p className="text-xs font-bold text-navy-800">{u}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h2 className="text-xl font-bold text-navy-900 mb-4">Product Specifications</h2>
                    <div className="grid md:grid-cols-2 gap-x-8 bg-ink-50 rounded-2xl p-2">
                      {[
                        { label: 'Product Name', value: product.name },
                        { label: 'SKU', value: product.sku || 'N/A' },
                        { label: 'Category', value: product.category?.name || 'N/A' },
                        { label: 'Material', value: product.material || 'N/A' },
                        { label: 'Plating', value: product.plating || 'N/A' },
                        { label: 'Color', value: product.color || 'Multiple options' },
                        { label: 'Size', value: product.size || 'Standard' },
                        { label: 'MOQ', value: `${product.moq || 12} pieces` },
                        { label: 'Pack Size', value: `${product.packSize || product.moq || 12} pcs/carton` },
                        { label: 'Origin', value: product.origin || 'Yiwu, China' },
                        { label: 'Lead Time', value: '7-15 days' },
                        { label: 'Customization', value: 'OEM/ODM available' },
                        { label: 'Sample', value: 'Yes' },
                        { label: 'Shipping', value: 'DHL, FedEx, Sea, Air' },
                      ].map((spec, i) => (
                        <div key={i} className="flex justify-between items-center py-3 px-3 border-b border-white last:border-0">
                          <span className="text-sm text-ink-500 font-medium">{spec.label}</span>
                          <span className="text-sm font-bold text-navy-800 text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <h2 className="text-xl font-bold text-navy-900">Customer Reviews</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mb-8 pb-6 border-b border-ink-100 bg-ink-50 rounded-2xl p-5">
                      <div className="text-center md:border-r md:border-ink-200">
                        <div className="text-5xl font-bold text-navy-800 mb-1">{rating.toFixed(1)}</div>
                        <div className="flex gap-0.5 justify-center mb-1.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-accent-500 fill-accent-500' : 'text-ink-300'}`} />)}
                        </div>
                        <p className="text-xs text-ink-500 font-medium">Based on {reviewCount} reviews</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {[{ stars: 5, pct: 78 }, { stars: 4, pct: 15 }, { stars: 3, pct: 5 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 }].map((row) => (
                          <div key={row.stars} className="flex items-center gap-2">
                            <div className="flex gap-0.5 w-16">
                              {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < row.stars ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
                            </div>
                            <div className="flex-1 h-2 bg-ink-200 rounded-full overflow-hidden">
                              <div className="h-full bg-accent-500 rounded-full" style={{ width: `${row.pct}%` }}></div>
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
                            <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-white font-bold text-sm">{review.user?.name?.[0] || 'U'}</div>
                            <div>
                              <p className="text-sm font-bold text-navy-800">{review.user?.name || 'Anonymous'}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
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
                    <h2 className="text-xl font-bold text-navy-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                      {faqs.map((faq, i) => (
                        <details key={i} className="group border border-ink-100 rounded-xl overflow-hidden hover:border-accent-300 transition-colors">
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-ink-50 transition-colors">
                            <span className="text-sm font-bold text-navy-800 pr-4">{faq.q}</span>
                            <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0 group-open:bg-accent-600 group-open:text-white transition-colors">
                              <Plus className="w-3.5 h-3.5 text-ink-500 group-open:text-white transition-all group-open:rotate-45" />
                            </div>
                          </summary>
                          <div className="px-4 pb-4 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-3 bg-ink-50/50">{faq.a}</div>
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
                    <div className="w-10 h-10 rounded-xl bg-accent-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-navy-900">Related Products</h2>
                      <p className="text-xs text-ink-500">More from {product.category?.name || 'this category'}</p>
                    </div>
                  </div>
                  <Link href={`/products?category=${product.category?.slug}`} className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 text-sm font-bold">View All <ChevronRight className="w-4 h-4" /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
                <div className="bg-navy-800 px-5 py-3.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Flame className="w-4 h-4 text-accent-400" />Hot Products</h3>
                </div>
                <div className="p-3 space-y-2.5">
                  {relatedProducts.slice(0, 5).map((item, i) => (
                    <Link key={item.id} href={`/products/${item.id}`} className="flex gap-3 p-2.5 rounded-xl hover:bg-ink-50 transition-colors group">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-ink-50 rounded-lg overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                        <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-accent-600 text-white text-[10px] font-bold rounded flex items-center justify-center">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-800 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight">{item.name}</p>
                        <p className="text-sm font-bold text-accent-600 mt-1">${Number(item.priceMin).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-navy-800 rounded-2xl p-5 text-white">
                <h3 className="text-base font-bold mb-1.5">Become a Seller</h3>
                <p className="text-xs text-ink-300 mb-3.5 leading-relaxed">Join 10,000+ suppliers reaching buyers worldwide</p>
                <Link href="/sell" className="inline-flex items-center gap-1 bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors w-full justify-center">Start Selling <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>

              <div className="bg-white rounded-2xl border border-ink-100 p-5">
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-500" />Product Stats
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

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevLightbox(); }} className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextLightbox(); }} className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="max-w-[80vw] max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image src={images[lightboxIndex]} alt={`${product.name} - view ${lightboxIndex + 1}`} width={800} height={600} className="max-w-full max-h-[80vh] object-contain" quality={95} />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }} className={`w-2.5 h-2.5 rounded-full transition-all ${lightboxIndex === i ? 'bg-white w-6' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

export async function getStaticPaths() {
  const products = (siteDataJson as any).products || [];
  return {
    paths: products.map((p: { id: number | string }) => ({ params: { id: String(p.id) } })),
    fallback: false,
  };
}

export const getStaticProps = async (context: { params: { id: string } }) => {
  const { id } = context.params;
  const products = (siteDataJson as any).products || [];
  const product = products.find((p: { id: number | string }) => String(p.id) === String(id));
  if (!product) return { notFound: true };
  const relatedProducts = products.filter((p: { id: number | string; category: { slug: string } }) => String(p.id) !== String(id) && (!product.category || !p.category || p.category.slug === product.category.slug)).slice(0, 8);
  return { props: { product, relatedProducts } };
};
