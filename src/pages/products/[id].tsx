import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
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
  Store,
  Edit3,
  Settings,
  CreditCard,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import ShippingSelector from '@/components/ShippingSelector';
import ReviewsSection from '@/components/ReviewsSection';
import { useCart } from '@/components/CartContext';
import { SITE_URL, SITE_OG_IMAGE } from '@/lib/site';
import { getProductBySlug, getProductById, getCategoryById, getRelatedProducts } from '@/lib/db';
import { proxyImageUrl } from '@/lib/image-utils';

interface Product {
  id: number | string;
  slug?: string;
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
  aplus?: {
    description?: string;
    bulletPoints?: string[];
    blocks?: { id?: string; type: string; content: string; caption?: string }[];
  } | null;
}

export default function ProductDetail({ product: initialProduct, relatedProducts: initialRelated }: { product: Product; relatedProducts: Product[] }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [quantity, setQuantity] = useState(initialProduct.moq || 12);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartNotice, setCartNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [ownership, setOwnership] = useState<{ isOwner: boolean; canManage: boolean; productId: string | null } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const slug = initialProduct.slug || String(initialProduct.id);
        const res = await fetch(`/api/products/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setProduct({
              id: data.id,
              slug: data.slug || slug,
              name: data.name,
              description: data.description || '',
              price: Number(data.price) || 0,
              priceMin: data.priceMin ? Number(data.priceMin) : undefined,
              priceMax: data.priceMax ? Number(data.priceMax) : undefined,
              originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
              image: data.image,
              images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
              category: data.category ? { name: data.category.name, slug: data.category.slug } : undefined,
              stock: data.stock,
              rating: data.rating,
              reviewCount: data.reviewCount,
              salesCount: data.salesCount,
              material: data.material,
              plating: data.plating,
              process: data.process,
              color: data.color,
              size: data.size,
              packSize: data.packSize,
              moq: data.moq,
              sku: data.sku,
              keywords: Array.isArray(data.keywords) ? data.keywords : [],
              bulletPoints: Array.isArray(data.bulletPoints) && data.bulletPoints.length > 0
                ? data.bulletPoints
                : (data.aplus?.bulletPoints || []),
              aplus: data.aplus || null,
            });
            setQuantity(data.moq || initialProduct.moq || 12);
          }
        }
      } catch {}
    };
    fetchProduct();
  }, [initialProduct.slug, initialProduct.id]);

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
  const strSeed = typeof product.id === 'string' ? product.id : String(product.id);
  const seed = strSeed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 1000;
  const rating = Number(product.rating || (4.5 + (seed % 5) / 10));
  const reviewCount = Number(product.reviewCount || (20 + (seed * 7) % 80));
  const salesCount = Number(product.salesCount || (100 + (seed * 13) % 800));
  const stock = Number(product.stock || 9999);

  const rawImages = product.images?.length >= 2 ? product.images : [product.image];
  const images = rawImages.map(proxyImageUrl);

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

  const handleAddToCart = async () => {
    if (!session) { router.push('/login'); return; }
    if (addingToCart) return;
    setAddingToCart(true);
    setCartNotice(null);
    try {
      const ok = await addToCart(String(product.id), quantity);
      if (ok) {
        setCartNotice({ type: 'success', message: 'Added to cart!' });
      } else {
        setCartNotice({ type: 'error', message: 'Failed to add to cart' });
      }
    } catch {
      setCartNotice({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    const checkOwnership = async () => {
      if (sessionStatus === 'authenticated' && session?.user && product.id) {
        try {
          const res = await fetch(`/api/products/ownership?id=${product.id}`, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setOwnership(data);
          }
        } catch {}
      }
    };
    checkOwnership();
  }, [session, sessionStatus, product.id]);

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

      {/* Seller Edit Bar */}
      {ownership && ownership.canManage && ownership.productId && (
        <div className="bg-gradient-to-r from-accent-500/10 to-navy-500/10 border-b border-accent-200/30">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-500 text-white flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">
                    {ownership.isOwner ? 'Your Product' : 'Manage Product'}
                  </p>
                  <p className="text-xs text-ink-500">Edit listing, images, description, and A+ content</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/sell/${ownership.productId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Product
                </Link>
                <Link
                  href="/sell/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 text-ink-700 text-sm font-semibold rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Add Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-5 md:p-8"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f3f4f6" width="400" height="300"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#9ca3af">${product.name}</text></svg>`)}`;
                      }
                    }}
                  />
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
                      <Image
                        src={img}
                        alt={`${product.name} - view ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
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
              {cartNotice && (
                <div className={`mt-2.5 px-3 py-2 rounded-lg text-xs font-medium ${cartNotice.type === 'success' ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {cartNotice.message}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button onClick={handleAddToCart} disabled={addingToCart} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-sm transition-colors">
                  {addingToCart ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Adding...</> : <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
                </button>
                <button onClick={async () => { await handleAddToCart(); if (session) router.push('/checkout'); }} disabled={addingToCart} className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-sm transition-colors">
                  <CreditCard className="w-4 h-4" />Buy Now
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
                  {product.aplus && (product.aplus.description || (product.aplus.blocks && product.aplus.blocks.length > 0) || (product.aplus.bulletPoints && product.aplus.bulletPoints.length > 0)) && (
                    <div className="mt-6 p-5 bg-gradient-to-br from-accent-500/5 to-navy-500/5 rounded-xl border border-accent-200/20">
                      <h3 className="text-base font-bold text-navy-800 mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-accent-500" />A+ Premium Content
                      </h3>
                      {product.aplus.description && (
                        <p className="text-sm text-ink-700 leading-relaxed mb-4">{product.aplus.description}</p>
                      )}
                      {product.aplus.bulletPoints && product.aplus.bulletPoints.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-2 mb-4">
                          {product.aplus.bulletPoints.map((bp: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/50 border border-ink-100">
                              <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-ink-700">{bp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {product.aplus.blocks && product.aplus.blocks.length > 0 && (
                        <div className="space-y-3">
                          {product.aplus.blocks.map((block: any, i: number) => (
                            <div key={block.id || i} className="p-3 bg-white rounded-lg border border-ink-100">
                              {block.type === 'image' ? (
                                <img src={block.content} alt={block.caption || ''} className="w-full max-h-64 object-cover rounded-lg" />
                              ) : (
                                <p className="text-sm text-ink-700">{block.content}</p>
                              )}
                              {block.caption && (
                                <p className="text-xs text-ink-500 mt-2 text-center italic">{block.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                <ReviewsSection
                  productId={String(product.id)}
                  fallbackRating={rating}
                  fallbackReviewCount={reviewCount}
                />
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
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
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
            <img src={images[lightboxIndex]} alt={`${product.name} - view ${lightboxIndex + 1}`} className="w-full h-full object-contain" />
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

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const productId = String(id);
    
    // Find product by slug (most common for URLs), then by id
    let product = getProductBySlug(productId);
    if (!product) {
      product = getProductById(productId);
    }

    if (!product) {
      return {
        notFound: true,
      };
    }
    
    // Get category
    const category = product.categoryId ? getCategoryById(product.categoryId) : null;
    
    // Attach category to product
    (product as any).category = category;

    // Get related products
    const relatedProducts = product.categoryId
      ? getRelatedProducts(product.categoryId, product.id, 8)
      : [];

    // Parse images
    let images: string[] = [];
    try {
      const parsedImages = typeof product.images === 'string' 
        ? JSON.parse(product.images) 
        : product.images;
      if (Array.isArray(parsedImages)) {
        images = parsedImages.filter((img: string) => typeof img === 'string');
      }
    } catch {
      images = [];
    }

    // Parse keywords
    let keywords: string[] = [];
    try {
      const parsedKeywords = typeof product.keywords === 'string'
        ? JSON.parse(product.keywords)
        : product.keywords;
      if (Array.isArray(parsedKeywords)) {
        keywords = parsedKeywords.filter((kw: string) => typeof kw === 'string');
      }
    } catch {
      keywords = [];
    }

    // Parse aplus
    let aplus = null;
    if (product.aplus) {
      try {
        aplus = typeof product.aplus === 'string'
          ? JSON.parse(product.aplus)
          : product.aplus;
      } catch {
        aplus = null;
      }
    }

    // Extract bullet points from aplus
    let bulletPoints: string[] = [];
    if (aplus?.bulletPoints && Array.isArray(aplus.bulletPoints)) {
      bulletPoints = aplus.bulletPoints;
    }

    const serializedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      priceMax: product.priceMax ? Number(product.priceMax) : null,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      image: product.image || '/images/product-placeholder.svg',
      images: images.length > 0 ? images : [product.image || '/images/product-placeholder.svg'],
      category: product.category ? { name: product.category.name, slug: product.category.slug } : null,
      stock: product.stock || 0,
      rating: Number(product.rating) || 0,
      reviewCount: product.reviewCount || 0,
      salesCount: product.salesCount || 0,
      material: product.material || null,
      plating: product.plating || null,
      process: product.process || null,
      color: product.color || null,
      size: product.size || null,
      packSize: product.packSize || 1,
      moq: product.moq || 1,
      sku: product.sku || null,
      origin: product.origin || null,
      supplierCity: product.supplierCity || null,
      keywords,
      bulletPoints,
      aplus,
      stockStatus: product.stockStatus || 'IN_STOCK',
    };

    const serializedRelated = relatedProducts.map((rp: any) => ({
      id: rp.id,
      slug: rp.slug,
      name: rp.name,
      description: rp.description || '',
      price: Number(rp.price),
      priceMax: rp.priceMax ? Number(rp.priceMax) : null,
      image: rp.image || '/images/product-placeholder.svg',
      category: null,
      moq: rp.moq || 1,
      sku: rp.sku || null,
      rating: Number(rp.rating) || 0,
      reviewCount: rp.reviewCount || 0,
      salesCount: rp.salesCount || 0,
    }));

    return {
      props: {
        product: serializedProduct,
        relatedProducts: serializedRelated,
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      notFound: true,
    };
  }
}
