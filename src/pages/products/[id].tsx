import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
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
  Store,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import ShippingSelector from '@/components/ShippingSelector';
import { SITE_URL, SITE_OG_IMAGE } from '@/lib/site';
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
  keywords?: string[];
  bulletPoints?: string[];
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
          <div className="w-20 h-20 rounded-xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-ink-300" />
          </div>
          <p className="text-ink-500 text-lg">Product not found</p>
        </div>
      </Layout>
    );
  }

  const price = Number(product.price || product.priceMin || 0);
  // 移除虚假折扣：priceMin/priceMax 是阶梯价区间，非原价/现价，不能用于构造 discount
  // 基于产品 id 生成稳定的伪随机评分数据，避免 SSR/hydrate 不一致 + JSON-LD 数据抖动
  const seed = Math.abs(Number(product.id)) % 1000;
  const rating = Number(product.rating || (4.5 + (seed % 5) / 10));
  const reviewCount = Number(product.reviewCount || (20 + (seed * 7) % 80));
  const salesCount = Number(product.salesCount || (100 + (seed * 13) % 800));
  const stock = Number(product.stock || 9999);

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
      <Head>
        <title>{`${product.name} | Wholesale from Yiwu | eTrue Mark`}</title>
        <meta name="description" content={`${product.description?.slice(0, 155) || product.name + ' - Wholesale from Yiwu, China'}`} />
        <link rel="canonical" href={`${SITE_URL}/products/${product.id}`} />
        <meta property="og:title" content={`${product.name} | eTrue Mark`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={SITE_OG_IMAGE} />
        <meta property="og:url" content={`${SITE_URL}/products/${product.id}`} />
        <meta property="product:price:amount" content={String(product.priceMin || '')} />
        <meta property="product:price:currency" content="USD" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: [product.image, SITE_OG_IMAGE],
            sku: product.sku,
            brand: { '@type': 'Brand', name: 'eTrue Mark' },
            ...(product.keywords ? { keywords: product.keywords.join(', ') } : {}),
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: rating,
              reviewCount: reviewCount,
              bestRating: 5,
              worstRating: 1
            },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'USD',
              lowPrice: product.priceMin,
              highPrice: product.priceMax,
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: 'Yiwu Yeatru Trading Co., Ltd.' }
            }
          })
        }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
              ...(product.category ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `${SITE_URL}/products?category=${product.category.slug}` }] : []),
              { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.name, item: `${SITE_URL}/products/${product.id}` },
            ],
          })
        }} />
      </Head>
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

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-20 space-y-3">
              {/* Main Image */}
              <div className="relative bg-white rounded-xl border border-ink-200 overflow-hidden group cursor-zoom-in" onClick={() => openLightbox(selectedImage)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(selectedImage); }} aria-label="Open image fullscreen">
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border border-ink-200 bg-white ${isFavorite ? 'text-red-500' : 'text-ink-600 hover:text-red-500'}`}><Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500' : ''}`} /></button>
                  <button aria-label="Share product" className="w-8 h-8 rounded-full bg-white text-ink-600 hover:text-accent-600 flex items-center justify-center border border-ink-200 transition-all" onClick={(e) => e.stopPropagation()}><Share2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="relative aspect-[4/3] bg-white">
                  <Image src={images[selectedImage]} alt={product.name} fill className="object-contain p-5 md:p-8" quality={95} priority sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div className="absolute bottom-3 right-3 bg-white px-2 py-0.5 rounded-md text-[10px] text-ink-500 font-medium flex items-center gap-1 border border-ink-200">
                  <Search className="w-2.5 h-2.5" /> Click to zoom
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border transition-all ${selectedImage === i ? 'border-accent-500 ring-2 ring-accent-100' : 'border-ink-200 hover:border-navy-400'} bg-white`}
                    >
                      <Image src={img} alt={`${product.name} - view ${i + 1}`} fill className="object-contain p-1" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Category + SKU + Stock */}
            <div className="flex items-center gap-2.5 flex-wrap mb-3">
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent-600 hover:text-accent-700">
                  <Tag className="w-3 h-3" />{product.category.name}
                </Link>
              )}
              <span className="text-ink-300">·</span>
              {product.sku && <span className="text-[11px] text-ink-500 font-mono">SKU: {product.sku}</span>}
              <span className="text-ink-300">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-success-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />In Stock
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-navy-900 leading-tight mb-3">{product.name}</h1>

            {/* Rating & Sales */}
            <div className="flex items-center gap-2.5 flex-wrap mb-4">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
                </div>
                <span className="text-sm font-bold text-navy-800">{rating.toFixed(1)}</span>
                <Link href="#reviews" className="text-xs text-accent-600 font-semibold hover:underline">({reviewCount} reviews)</Link>
              </div>
              <span className="text-ink-200">|</span>
              <div className="flex items-center gap-1 text-xs text-ink-500">
                <Users className="w-3.5 h-3.5" />
                <span><span className="font-bold text-navy-800">{salesCount.toLocaleString()}</span> sold</span>
              </div>
            </div>

            {/* Price — 核心转化区域 */}
            <div className="flex items-baseline gap-3 flex-wrap pb-4 border-b border-ink-100">
              <span className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">${price.toFixed(2)}</span>
              {Number(product.priceMax) > price && (
                <span className="text-sm text-ink-400">up to ${Number(product.priceMax).toFixed(2)}</span>
              )}
            </div>
            <p className="text-xs text-ink-500 mt-2 mb-4">Price varies by quantity. Bulk discounts available. Contact us for custom orders.</p>

            {/* Specs — 关键规格一览 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 py-4 border-b border-ink-100">
              {product.material && (
                <div>
                  <span className="text-[10px] text-ink-400 uppercase tracking-[0.08em] font-semibold">Material</span>
                  <p className="text-sm font-semibold text-navy-800 mt-0.5">{product.material}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <span className="text-[10px] text-ink-400 uppercase tracking-[0.08em] font-semibold">Size</span>
                  <p className="text-sm font-semibold text-navy-800 mt-0.5">{product.size}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-ink-400 uppercase tracking-[0.08em] font-semibold">MOQ</span>
                <p className="text-sm font-semibold text-navy-800 mt-0.5">{product.moq || 12} pcs</p>
              </div>
              {product.plating && (
                <div>
                  <span className="text-[10px] text-ink-400 uppercase tracking-[0.08em] font-semibold">Finish</span>
                  <p className="text-sm font-semibold text-navy-800 mt-0.5">{product.plating}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="text-[10px] text-ink-400 uppercase tracking-[0.08em] font-semibold">Color</span>
                  <p className="text-sm font-semibold text-navy-800 mt-0.5">{product.color}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] text-ink-400 uppercase tracking-[0.08em] font-semibold">Pack Size</span>
                <p className="text-sm font-semibold text-navy-800 mt-0.5">{product.packSize || product.moq || 12} pcs</p>
              </div>
            </div>

            {/* Key Features — bullet points */}
            {product.bulletPoints && product.bulletPoints.length > 0 && (
              <div className="py-4 border-b border-ink-100">
                <h3 className="text-sm font-bold text-navy-800 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.bulletPoints.map((bp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-600 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + CTA — 主操作区 */}
            <div className="py-4 border-b border-ink-100">
              <h3 className="text-sm font-bold text-navy-800 mb-2.5">Order Quantity</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-ink-200 rounded-lg bg-white overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 12))} aria-label="Decrease quantity" className="px-3 py-2 hover:bg-ink-50 transition-colors text-ink-600"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 font-bold text-navy-800 min-w-[70px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 12)} aria-label="Increase quantity" className="px-3 py-2 hover:bg-ink-50 transition-colors text-ink-600"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-xs text-ink-500 font-medium">Step: 12 pcs</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white py-2.5 rounded-lg font-bold text-sm transition-colors">
                  <MessageCircle className="w-4 h-4" />Contact Supplier
                </button>
                <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 text-white py-2.5 rounded-lg font-bold text-sm transition-colors">
                  <ShoppingCart className="w-4 h-4" />Add to Inquiry
                </button>
              </div>
            </div>

            {/* Purchase Protection — 信任徽标 */}
            <div className="py-4 border-b border-ink-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Truck, label: 'Free Shipping', desc: 'Orders $50+' },
                  { icon: ShieldCheck, label: 'Secure Payment', desc: 'SSL encrypted' },
                  { icon: RotateCcw, label: '30-Day Returns', desc: 'Easy policy' },
                  { icon: Headphones, label: '24/7 Support', desc: 'Live chat' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-ink-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-navy-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-navy-800 leading-tight">{item.label}</p>
                        <p className="text-[10px] text-ink-500 leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="py-4 border-b border-ink-100">
              <ShippingSelector categorySlug={product.category?.slug} />
            </div>

            {/* Supplier Card */}
            <Link href="/store/yiwu-premium-trading" className="block py-4 border-b border-ink-100 last:border-b-0 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-800 font-bold text-sm border border-ink-200">
                  YW
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-navy-800 group-hover:text-accent-600 transition-colors">{product.seller || 'Yiwu Yeatru Trading Co.'}</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-500 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-success-50 text-success-700 px-1.5 py-0.5 rounded font-semibold border border-success-200">VERIFIED</span>
                    <span className="text-[10px] text-ink-500 font-medium">8 yrs · 95% response rate</span>
                  </div>
                </div>
                <Store className="w-4 h-4 text-accent-500 flex-shrink-0" />
              </div>
            </Link>
          </div>
        </div>

        {/* Tabs + Sidebar */}
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 mt-8">
          <div className="lg:col-span-8">
            {/* Tabs Nav */}
            <div className="border-b border-ink-200 mb-5">
              <div className="flex gap-0.5 overflow-x-auto">
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
                      id={tab.key === 'reviews' ? 'reviews' : undefined}
                      className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap -mb-px ${activeTab === tab.key ? 'border-accent-500 text-accent-600' : 'border-transparent text-ink-500 hover:text-navy-800 hover:border-ink-200'}`}
                    >
                      <Icon className="w-4 h-4" />{tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="py-1">
              {activeTab === 'description' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-navy-900 mb-2.5">Product Overview</h2>
                    <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>
                  </div>
                  {product.bulletPoints && product.bulletPoints.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent-500" />Key Features
                      </h3>
                      <div className="grid md:grid-cols-2 gap-2">
                        {product.bulletPoints.map((bp, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-ink-100 bg-white">
                            <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-ink-700">{bp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.keywords && product.keywords.length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-accent-500" />Search Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.keywords.map((kw, i) => (
                          <span key={i} className="text-xs font-semibold text-ink-600 bg-ink-50 border border-ink-200 rounded-full px-3 py-1.5">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-navy-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent-500" />Perfect For
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {['Boutique Stores','Online Retailers','Wholesale Distributors','Gift Shops'].map((u, i) => (
                        <div key={i} className="border border-ink-100 rounded-lg p-3 text-center bg-white">
                          <p className="text-xs font-bold text-navy-800">{u}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <h2 className="text-lg font-bold text-navy-900 mb-4">Product Specifications</h2>
                  <div className="grid md:grid-cols-2 gap-0 border border-ink-200 rounded-xl overflow-hidden">
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
                      <div key={i} className="flex justify-between items-center py-2.5 px-4 border-b border-r border-ink-100 last:border-b-0 even:border-r-0 md:even:border-r">
                        <span className="text-sm text-ink-500 font-medium">{spec.label}</span>
                        <span className="text-sm font-semibold text-navy-800 text-right max-w-[60%] truncate">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-lg font-bold text-navy-900 mb-4">Customer Reviews</h2>
                  <div className="grid md:grid-cols-3 gap-4 mb-6 pb-5 border-b border-ink-200">
                    <div className="text-center md:border-r md:border-ink-200">
                      <div className="text-4xl font-bold text-navy-800 mb-1">{rating.toFixed(1)}</div>
                      <div className="flex gap-0.5 justify-center mb-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
                      </div>
                      <p className="text-xs text-ink-500 font-medium">Based on {reviewCount} reviews</p>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      {[{ stars: 5, pct: 78 }, { stars: 4, pct: 15 }, { stars: 3, pct: 5 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 }].map((row) => (
                        <div key={row.stars} className="flex items-center gap-2">
                          <div className="flex gap-0.5 w-14 flex-shrink-0">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < row.stars ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
                          </div>
                          <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-500 rounded-full" style={{ width: `${row.pct}%` }}></div>
                          </div>
                          <span className="text-xs text-ink-500 w-8 text-right font-semibold">{row.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {sampleReviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-ink-100 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-navy-50 flex items-center justify-center text-navy-800 font-bold text-sm border border-ink-200">{review.user?.name?.[0] || 'U'}</div>
                          <div>
                            <p className="text-sm font-semibold text-navy-800">{review.user?.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent-500 fill-accent-500' : 'text-ink-200'}`} />)}
                              </div>
                              <span className="text-[10px] text-ink-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="text-sm font-semibold text-navy-800 mb-1">{review.title}</h4>
                        <p className="text-sm text-ink-600 leading-relaxed">{review.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div>
                  <h2 className="text-lg font-bold text-navy-900 mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-2">
                    {faqs.map((faq, i) => (
                      <details key={i} className="group border border-ink-200 rounded-lg overflow-hidden">
                        <summary className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-ink-50 transition-colors list-none">
                          <span className="text-sm font-semibold text-navy-800 pr-4">{faq.q}</span>
                          <div className="w-6 h-6 rounded-md bg-ink-100 flex items-center justify-center flex-shrink-0 group-open:bg-accent-500 group-open:text-white transition-colors">
                            <Plus className="w-3 h-3 text-ink-500 group-open:text-white transition-all group-open:rotate-45" />
                          </div>
                        </summary>
                        <div className="px-4 pb-3.5 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-3">{faq.a}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Products */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-ink-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-500" />
                    <div>
                      <h2 className="text-lg font-bold text-navy-900">Related Products</h2>
                      <p className="text-xs text-ink-500">More from {product.category?.name || 'this category'}</p>
                    </div>
                  </div>
                  <Link href={`/products?category=${product.category?.slug}`} className="inline-flex items-center gap-0.5 text-accent-600 hover:text-accent-700 text-sm font-bold">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {relatedProducts.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              {/* Hot Products */}
              <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-ink-100">
                  <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2"><Flame className="w-4 h-4 text-accent-500" />Hot Products</h3>
                </div>
                <div className="p-3 space-y-1.5">
                  {relatedProducts.slice(0, 5).map((item, i) => (
                    <Link key={item.id} href={`/products/${item.id}`} className="flex gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors group">
                      <div className="relative w-14 h-14 flex-shrink-0 bg-ink-50 rounded-md overflow-hidden border border-ink-100">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="56px" />
                        <span className="absolute top-0 left-0 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-br flex items-center justify-center">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy-800 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight">{item.name}</p>
                        <p className="text-sm font-bold text-accent-600 mt-0.5">${Number(item.priceMin).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Become a Seller */}
              <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-ink-100">
                  <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2"><Award className="w-4 h-4 text-accent-500" />Become a Seller</h3>
                </div>
                <div className="p-4">
                  <p className="text-xs text-ink-500 mb-3 leading-relaxed">Join 10,000+ suppliers reaching buyers worldwide</p>
                  <Link href="/sell" className="inline-flex items-center justify-center gap-1 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors w-full">Start Selling <ChevronRight className="w-3.5 h-3.5" /></Link>
                </div>
              </div>

              {/* Product Stats */}
              <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-ink-100">
                  <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent-500" />Product Stats</h3>
                </div>
                <div className="p-3 space-y-1">
                  {[
                    { label: 'Total Sold', value: salesCount.toLocaleString(), color: 'text-accent-600' },
                    { label: 'Available Stock', value: stock.toLocaleString(), color: 'text-navy-800' },
                    { label: 'Avg. Lead Time', value: '7-15 days', color: 'text-navy-800' },
                    { label: 'Customer Rating', value: `${rating.toFixed(1)}/5`, color: 'text-accent-600' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-1 border-b border-ink-100 last:border-0">
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
          <button onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }} aria-label="Close image viewer" className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevLightbox(); }} aria-label="Previous image" className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextLightbox(); }} aria-label="Next image" className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="w-[85vw] h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <Image src={images[lightboxIndex]} alt={`${product.name} - view ${lightboxIndex + 1}`} fill className="object-contain" quality={95} sizes="85vw" />
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
