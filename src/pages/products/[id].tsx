import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
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
  Clock,
  Send,
  Building2,
  Phone,
  Globe,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import ShippingSelector from '@/components/ShippingSelector';
import ReviewsSection from '@/components/ReviewsSection';
import { useCart } from '@/components/CartContext';
import { SITE_URL, SITE_OG_IMAGE } from '@/lib/site';
import { getProductBySlug, getProductById, getCategoryById, getRelatedProducts } from '@/lib/db';
import { proxyImageUrl as proxyImageUrlDirect } from '@/lib/image-utils';
import { computeBulletPoints } from '@/lib/bullet-points';
import { buildVariantGroups, getVariantGroupForProductId } from '@/lib/variants';
import VariantSelector from '@/components/VariantSelector';
import AplusRenderer from '@/components/AplusRenderer';

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
  category?: { name: string; slug: string } | null | undefined;
  categoryPath?: { name: string; slug: string }[];
  categoryId?: string;
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
  aplusBlocks?: { type: string; heading?: string; text?: string; image?: string }[];
  packagingInfo?: {
    summary?: string;
    pcsPerCtn?: number | null;
    boxLength?: number | null;
    boxWidth?: number | null;
    boxHeight?: number | null;
    grossWeight?: number | null;
    volumeCBM?: number | null;
  };
}

function cleanDescription(desc: string): string {
  if (!desc) return '';
  // Remove spec paragraphs that duplicate sidebar/spec-tab content
  return desc
    .replace(/<p><strong>Item No:<\/strong>[^<]*<\/p>\s*/g, '')
    .replace(/<p><strong>Price:<\/strong>[^<]*<\/p>\s*/g, '')
    .replace(/<p><strong>MOQ:<\/strong>[^<]*<\/p>\s*/g, '')
    .replace(/<p><strong>Lead Time:<\/strong>[^<]*<\/p>\s*/g, '')
    .replace(/<p><strong>Shipping:<\/strong>[^<]*<\/p>\s*/g, '')
    .replace(/<p><strong>Packaging:<\/strong>[^<]*<\/p>\s*/g, '')
    .replace(/<p><strong>装箱数[\s\S]*?<\/p>\s*/g, '')
    .replace(/<p><strong>箱规[\s\S]*?<\/p>\s*/g, '')
    .trim();
}

// Truncate HTML description to a character limit while preserving tags
function truncateDescriptionHtml(html: string, maxLength: number = 200): { __html: string; truncated: boolean } {
  if (!html) return { __html: '', truncated: false };
  // First strip to plain text for fallback
  const stripHtml = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
  const clean = cleanDescription(html);
  // Short description: remove Chinese and duplicate meta info (中文名, Category etc)
  // Keep only the first meaningful paragraph for the preview
  const processed = clean
    .replace(/<p><strong>中文名:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>Category:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>Item No:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>Price:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>MOQ:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>Lead Time:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>Shipping:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .replace(/<p><strong>Packaging:<\/strong>[\s\S]*?<\/p>\s*/gi, '')
    .trim();
  
  const plainText = stripHtml(processed);
  if (plainText.length <= maxLength) {
    return { __html: processed, truncated: false };
  }
  
  // Truncate by plain text length, but keep HTML structure
  // Simple approach: slice the clean HTML and strip unclosed tags
  let remaining = maxLength;
  let result = '';
  // Parse character by character, skipping tags
  let i = 0;
  const src = processed;
  const openTags: string[] = [];
  
  while (i < src.length && remaining > 0) {
    if (src[i] === '<') {
      // Find end of tag
      const end = src.indexOf('>', i);
      if (end === -1) break;
      const tag = src.slice(i, end + 1);
      result += tag;
      
      // Track tag stack (handle self-closing and closing tags)
      const tagMatch = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
      if (tagMatch) {
        const isClosing = tag[1] === '/';
        const tagName = tagMatch[1].toLowerCase();
        const isSelfClosing = tag.slice(-2) === '/>' || /^<(br|hr|img|input|meta|link)$/i.test('<' + tagName);
        if (!isSelfClosing) {
          if (isClosing) {
            const idx = openTags.lastIndexOf(tagName);
            if (idx !== -1) openTags.splice(idx, 1);
          } else {
            openTags.push(tagName);
          }
        }
      }
      i = end + 1;
    } else {
      result += src[i];
      remaining -= 1;
      i += 1;
    }
  }
  
  // Close any remaining open tags
  for (let j = openTags.length - 1; j >= 0; j--) {
    result += `</${openTags[j]}>`;
  }
  
  if (plainText.length > maxLength) {
    // Append ellipsis after removing trailing </p> or whitespace
    result = result.replace(/(<\/p>|<\/br>|<br\s*\/?>|<\/?span>|<\/?strong>|\s)*$/i, '') + '...';
    // Re-close open tags that we may have stripped
    if (openTags.length > 0 && !/<\/p>$/.test(result)) {
      for (let j = openTags.length - 1; j >= 0; j--) {
        if (!new RegExp(`<\/${openTags[j]}>$`, 'i').test(result)) {
          result += `</${openTags[j]}>`;
        }
      }
    }
  }
  
  return { __html: result, truncated: true };
}

// Fallback plain text description when no valid HTML exists
function getDescriptionFallback(product: { name: string }): string {
  return `${product.name}. Wholesale from Yiwu, China. Bulk discounts available.`;
}

interface ProductVariant {
  sku: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  stock: number;
  moq?: number;
  color?: string | null;
  colorHex?: string | null;
  size?: string | null;
  capacity?: string | null;
  layer?: string | null;
  pack?: string | null;
  material?: string | null;
  packagingInfo?: {
    pcsPerCtn?: number | null;
    boxLength?: number | null;
    boxWidth?: number | null;
    boxHeight?: number | null;
    grossWeight?: number | null;
    volumeCBM?: number | null;
  } | null;
}

interface VariantGroupProp {
  parentSku: string;
  baseName: string;
  variants: ProductVariant[];
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductDetail({ product: initialProduct, relatedProducts: initialRelated, variantGroup }: { product: Product; relatedProducts: Product[]; variantGroup?: VariantGroupProp | null }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelated);
  const [clientVariantGroup, setClientVariantGroup] = useState<VariantGroupProp | null>(variantGroup || null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variantImages, setVariantImages] = useState<string[] | null>(null);
  const [hasSelectedVariant, setHasSelectedVariant] = useState(false);
  
  const handleVariantSelect = (variant: { image: string; name: string; images?: string[]; sku: string; price: number; stock: number; moq?: number; packagingInfo?: any }) => {
    if (variant.image) {
      const variantImg = proxyImageUrlDirect(variant.image);
      setVariantImages([variantImg]);
      setSelectedImage(0);
    }
    // Update product state with variant data
    setProduct(prev => ({
      ...prev,
      sku: variant.sku || prev.sku,
      price: variant.price ?? prev.price,
      stock: variant.stock ?? prev.stock,
      packagingInfo: variant.packagingInfo ?? prev.packagingInfo,
    }));
    setHasSelectedVariant(true);
    setQuantity(variant.moq || Math.floor(variant.price > 0 ? 1 : (initialProduct.moq || 12)));
  };
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [quantity, setQuantity] = useState(initialProduct.moq || 12);
  const [activeTab, setActiveTab] = useState('specs');
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartNotice, setCartNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [ownership, setOwnership] = useState<{ isOwner: boolean; canManage: boolean; productId: string | null } | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    quantity: String(initialProduct.moq || 12),
    message: '',
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteNotice, setQuoteNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Variant group — passed from server or computed on client
  const effectiveVariantGroup = clientVariantGroup || variantGroup || null;

  // Derive packagingInfo: use product's own, or fall back to first variant's
  const effectivePackagingInfo = product.packagingInfo || (() => {
    if (effectiveVariantGroup && effectiveVariantGroup.variants.length > 0) {
      return effectiveVariantGroup.variants.find(v => v.packagingInfo)?.packagingInfo || null;
    }
    return null;
  })();

  const filteredAplusBlocks = (product.aplus?.blocks || []).filter((block: any) => {
    const content = String(block.content || '');
    const isKeyFeaturesBlock = content.includes('<h3>Key Features</h3>');
    const isSpecsBlock = block.type === 'specs';
    return !isKeyFeaturesBlock && !isSpecsBlock;
  });
  const hasAplusContent = !!(product.aplus && (product.aplus.description || filteredAplusBlocks.length > 0));
  // New format: flat array of {type, heading, text, image} blocks
  const aplusBlocks = product.aplusBlocks || [];
  const hasNewAplus = aplusBlocks.length > 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const slug = initialProduct.slug || String(initialProduct.id);
        const res = await fetch(`/api/products/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setProduct(prev => ({
              ...prev,
              id: data.id,
              slug: data.slug || slug,
              name: data.name,
              description: data.description || prev.description || '',
              price: Number(data.price) ?? prev.price ?? 0,
              priceMin: data.priceMin !== undefined ? Number(data.priceMin) : prev.priceMin,
              priceMax: data.priceMax !== undefined ? Number(data.priceMax) : prev.priceMax,
              originalPrice: data.originalPrice ? Number(data.originalPrice) : prev.originalPrice,
              image: data.image || prev.image,
              images: Array.isArray(data.images) && data.images.length > 0 ? data.images : prev.images,
              // Preserve SSR category (and categoryPath + categoryId from server) unless API has valid one
              category: (data.category && data.category.name)
                ? { name: data.category.name, slug: data.category.slug }
                : (prev.category && prev.category.name ? prev.category : null),
              // Keep SSR categoryPath unless API has a valid non-empty one
              categoryPath: (Array.isArray(data.categoryPath) && data.categoryPath.length > 0)
                ? data.categoryPath
                : (Array.isArray(prev.categoryPath) && prev.categoryPath.length > 0 ? prev.categoryPath : []),
              categoryId: prev.categoryId || data.categoryId,
              stock: data.stock ?? prev.stock,
              rating: data.rating ?? prev.rating,
              reviewCount: data.reviewCount ?? prev.reviewCount,
              salesCount: data.salesCount ?? prev.salesCount,
              material: data.material ?? prev.material,
              plating: data.plating ?? prev.plating,
              process: data.process ?? prev.process,
              color: data.color ?? prev.color,
              size: data.size ?? prev.size,
              packSize: data.packSize ?? prev.packSize,
              moq: data.moq ?? prev.moq,
              sku: data.sku ?? prev.sku,
              keywords: Array.isArray(data.keywords) && data.keywords.length > 0 ? data.keywords : prev.keywords,
              bulletPoints: Array.isArray(data.bulletPoints) && data.bulletPoints.length > 0
                ? data.bulletPoints
                : (prev.bulletPoints?.length ? prev.bulletPoints : (data.aplus?.bulletPoints || [])),
              aplus: data.aplus ?? prev.aplus,
              aplusBlocks: Array.isArray(data.aplusBlocks) && data.aplusBlocks.length > 0 ? data.aplusBlocks : prev.aplusBlocks,
              packagingInfo: data.packagingInfo ?? prev.packagingInfo,
            }));
            setQuantity(data.moq || initialProduct.moq || 12);
          }
        }
      } catch {}
    };
    fetchProduct();
  }, [initialProduct.slug, initialProduct.id]);

  // Compute variant group on client side as fallback
  useEffect(() => {
    if (variantGroup && variantGroup.variants.length > 0) {
      setClientVariantGroup(variantGroup);
      return;
    }
    const fetchVariants = async () => {
      try {
        const res = await fetch('/api/products?includeChildren=true');
        if (res.ok) {
          const data = await res.json();
          const products = Array.isArray(data) ? data : [];
          if (products.length > 0) {
            const groups = buildVariantGroups(products);
            const g = getVariantGroupForProductId(groups, String(initialProduct.id), initialProduct.sku, (initialProduct as any).parentId);
            if (g && g.variants.length >= 1) {
              setClientVariantGroup({ 
                parentSku: g.parentSku, 
                baseName: g.baseName, 
                minPrice: g.minPrice,
                maxPrice: g.maxPrice,
                variants: g.variants.map(v => ({
                  ...v,
                  image: proxyImageUrlDirect(v.image),
                }))
              });
            }
          }
        }
      } catch {}
    };
    fetchVariants();
  }, [initialProduct.id, variantGroup]);

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

  const images = variantImages 
    ? variantImages 
    : (() => {
        const raw = product.images?.length >= 2 ? product.images : [product.image];
        return raw.map(proxyImageUrlDirect);
      })();

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
    if (!session) {
      const loginHref = `/login?callbackUrl=${encodeURIComponent(router.asPath || router.pathname)}`;
      setCartNotice({ type: 'error', message: 'Please login to continue. Redirecting...' });
      setTimeout(() => router.push(loginHref), 600);
      return;
    }
    if (addingToCart) return;
    setAddingToCart(true);
    setCartNotice(null);
    try {
      const payload: { productId: string; quantity: number; variantId?: string } = {
        productId: String(product.id),
        quantity: Math.max(1, parseInt(String(quantity)) || 1),
      };
      // If viewing a variant SKU that matches the product's own SKU, include variantId from effectiveVariantGroup
      if (effectiveVariantGroup && product.sku) {
        const match = effectiveVariantGroup.variants.find(v => v.sku === product.sku);
        if (match && (match as any).id) payload.variantId = String((match as any).id);
      }
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      let ok = res.ok;
      let msg = '';
      try {
        const data = await res.json().catch(() => ({}));
        if (data && data.error) msg = data.error;
      } catch {}
      if (!ok) {
        if (res.status === 401) {
          const loginHref = `/login?callbackUrl=${encodeURIComponent(router.asPath || router.pathname)}`;
          setCartNotice({ type: 'error', message: 'Session expired. Redirecting to login...' });
          setTimeout(() => router.push(loginHref), 600);
          setAddingToCart(false);
          return;
        }
        if (res.status === 400) {
          setCartNotice({ type: 'error', message: msg || 'Invalid product. Please refresh and try again.' });
        } else {
          setCartNotice({ type: 'error', message: msg || `Failed (${res.status}). Please try again.` });
        }
        setAddingToCart(false);
        return;
      }
      // Manually trigger cart refresh by calling refresh() via context event
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setCartNotice({ type: 'success', message: `Added ${payload.quantity} pcs to cart!` });
    } catch (e: any) {
      setCartNotice({ type: 'error', message: 'Network error. Please check your connection and try again.' });
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
              ...((product.category && product.category.name) ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `${SITE_URL}/products?category=${product.category.slug}` }] : []),
              { '@type': 'ListItem', position: product.category ? 4 : 3, name: product.name, item: `${SITE_URL}/products/${product.id}` },
            ],
          })
        }} />
      </Head>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-ink-500 flex-wrap">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium shrink-0">Home</Link>
            <ChevronRight className="w-4 h-4 text-ink-300 shrink-0" />
            <Link href="/products" className="hover:text-accent-600 transition-colors font-medium shrink-0">Products</Link>
            {/* Category path (root → sub → product) */}
            {(() => {
              // Build the effective category path: prefer categoryPath, fallback to single category
              let effectivePath: { name: string; slug: string }[] = [];
              if (Array.isArray(product.categoryPath) && product.categoryPath.length > 0) {
                effectivePath = product.categoryPath;
              } else if (product.category && product.category.name) {
                effectivePath = [product.category];
              }
              if (effectivePath.length === 0) return null;
              return effectivePath.map((cat, i) => (
                <span key={i} className="flex items-center gap-2 shrink-0">
                  <ChevronRight className="w-4 h-4 text-ink-300" />
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="hover:text-accent-600 transition-colors font-medium"
                  >
                    {cat.name}
                  </Link>
                </span>
              ));
            })()}
            <ChevronRight className="w-4 h-4 text-ink-300 shrink-0" />
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

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-20 space-y-2">
              {/* Main Image */}
              <div className="relative bg-white rounded-xl border border-ink-200 overflow-hidden group cursor-zoom-in" onClick={() => openLightbox(selectedImage)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(selectedImage); }} aria-label="Open image fullscreen">
                <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }} aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border border-ink-200 bg-white ${isFavorite ? 'text-red-500' : 'text-ink-600 hover:text-red-500'}`}><Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500' : ''}`} /></button>
                  <button aria-label="Share product" className="w-8 h-8 rounded-full bg-white text-ink-600 hover:text-accent-600 flex items-center justify-center border border-ink-200 transition-all" onClick={(e) => e.stopPropagation()}><Share2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="relative aspect-[4/3] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-5 md:p-8"
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
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border transition-all ${selectedImage === i ? 'border-accent-500 ring-2 ring-accent-100' : 'border-ink-200 hover:border-navy-400'} bg-white`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.name} - view ${i + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-ink-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-success-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-success-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-ink-800 leading-tight">Trade Assurance</p>
                    <p className="text-[9px] text-ink-500 leading-tight">Payment protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-ink-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-ink-800 leading-tight">Global Shipping</p>
                    <p className="text-[9px] text-ink-500 leading-tight">180+ countries</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-ink-200 bg-white">
                  <div className="w-7 h-7 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-3.5 h-3.5 text-accent-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-ink-800 leading-tight">Quality Checked</p>
                    <p className="text-[9px] text-ink-500 leading-tight">Factory verified</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-6">
            {/* Get a Quote button */}
            <button
              onClick={() => {
                setQuoteForm(f => ({ ...f, quantity: String(quantity || f.quantity) }));
                setIsQuoteModalOpen(true);
              }}
              className="mb-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-xl border border-accent-300 text-[13px] font-bold text-accent-700 hover:bg-accent-50 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Get a Quote
            </button>

            {/* Title */}
            <h1 className="text-2xl md:text-[28px] font-bold text-navy-900 leading-tight mb-2.5">{product.name}</h1>

            {/* Category | SKU */}
            <div className="flex items-center gap-2.5 flex-wrap mb-6">
              {(() => {
                // Resolve category: prefer product.category, fallback to first entry of categoryPath
                const cat = (product.category && product.category.name)
                  ? product.category
                  : (Array.isArray(product.categoryPath) && product.categoryPath.length > 0
                      ? product.categoryPath[0]
                      : null);
                if (cat && cat.name) {
                  return (
                    <Link href={`/products?category=${cat.slug}`} className="text-xs text-ink-500 hover:text-accent-600 transition-colors">
                      Category: <span className="font-semibold text-navy-800">{cat.name}</span>
                    </Link>
                  );
                }
                return (
                  <span className="text-xs text-ink-500">
                    Category: <span className="font-semibold text-navy-800">General</span>
                  </span>
                );
              })()}
              {product.sku && (
                <>
                  <span className="text-ink-300">|</span>
                  <span className="text-xs text-ink-500">SKU: <span className="font-mono font-semibold text-navy-800">{product.sku}</span></span>
                </>
              )}
            </div>

            {/* Price display: show interval when variants exist, specific price when selected */}
            <div className="mb-5">
              {(() => {
                const hasVariants = effectiveVariantGroup && effectiveVariantGroup.variants.length > 1;
                if (hasVariants) {
                  const group = effectiveVariantGroup!;
                  const validPrices = group.variants.map(v => v.price).filter(p => p > 0);
                  const minP = group.minPrice ?? (validPrices.length > 0 ? Math.min(...validPrices) : price);
                  const maxP = group.maxPrice ?? (validPrices.length > 0 ? Math.max(...validPrices) : price);
                  
                  // If user has explicitly clicked a variant, always show exact price + range hint
                  if (hasSelectedVariant) {
                    const showPrice = price > 0 ? `$${price.toFixed(2)}` : 'Contact for price';
                    return (
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className={`text-2xl md:text-3xl font-extrabold tracking-tight ${price > 0 ? 'text-navy-900' : 'text-amber-600'}`}>{showPrice}</span>
                        {minP !== maxP && (
                          <span className="text-[11px] text-ink-400 font-medium">
                            (Range: ${minP.toFixed(2)} – ${maxP.toFixed(2)})
                          </span>
                        )}
                      </div>
                    );
                  }
                  // Initial view — show range if min != max
                  if (minP > 0 && maxP > 0 && minP !== maxP) {
                    return (
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm text-ink-500 font-medium">From</span>
                        <span className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">${minP.toFixed(2)}</span>
                        <span className="text-sm text-ink-500 font-medium">to</span>
                        <span className="text-2xl md:text-3xl font-extrabold text-navy-900 tracking-tight">${maxP.toFixed(2)}</span>
                        <span className="text-xs text-ink-400 ml-1">· select variant for exact price</span>
                      </div>
                    );
                  }
                  // Single price, show it
                }
                // Fallback: single price (no variants or single variant)
                return (
                  <span className="text-3xl font-extrabold text-navy-900 tracking-tight">${price.toFixed(2)}</span>
                );
              })()}
            </div>

            {/* Description Preview */}
            {(() => {
              const hasHtml = product.description && (product.description.includes('<') || product.description.includes('&'));
              if (hasHtml) {
                const { __html } = truncateDescriptionHtml(product.description!, 260);
                const hasContent = __html && __html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
                if (!hasContent) {
                  return (
                    <p className="text-sm text-ink-600 leading-relaxed mb-5 line-clamp-4">
                      {getDescriptionFallback(product)}
                    </p>
                  );
                }
                return (
                  <div
                    className="text-sm text-ink-600 leading-relaxed mb-5 line-clamp-4 [&_p]:!m-0 [&_p]:!mb-0 [&_strong]:text-ink-700 [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html }}
                  />
                );
              }
              return (
                <p className="text-sm text-ink-600 leading-relaxed mb-5 line-clamp-4">
                  {product.description?.slice(0, 260) || getDescriptionFallback(product)}
                </p>
              );
            })()}

            {/* Variants — pill-style chips */}
            {effectiveVariantGroup && effectiveVariantGroup.variants.length >= 1 && (
              <div className="mb-5">
                <VariantSelector
                  variants={effectiveVariantGroup.variants}
                  currentSku={product.sku || ''}
                  baseName={effectiveVariantGroup.baseName}
                  parentSku={effectiveVariantGroup.parentSku}
                  onVariantSelect={handleVariantSelect}
                />
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="mb-4">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] text-ink-500 font-medium">Qty:</span>
                <div className="flex items-center border border-ink-200 rounded-lg bg-white overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 12))} aria-label="Decrease quantity" className="px-3 py-1.5 hover:bg-ink-50 transition-colors text-ink-600"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="px-4 font-bold text-navy-800 min-w-[60px] text-center text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 12)} aria-label="Increase quantity" className="px-3 py-1.5 hover:bg-ink-50 transition-colors text-ink-600"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-[10px] text-ink-400">MOQ: {product.moq || 12} · Step: 12</span>
              </div>
              {cartNotice && (
                <div className={`mb-2.5 px-3 py-2 rounded-lg text-xs font-medium ${cartNotice.type === 'success' ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {cartNotice.message}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={handleAddToCart} disabled={addingToCart} className="flex-1 flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm">
                  {addingToCart ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Adding...</> : <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
                </button>
                <button
                  onClick={async () => {
                    if (!session) {
                      setCartNotice({ type: 'error', message: 'Please login to continue. Redirecting...' });
                      const loginHref = `/login?callbackUrl=${encodeURIComponent('/checkout')}`;
                      setTimeout(() => router.push(loginHref), 600);
                      return;
                    }
                    if (addingToCart) return;
                    setAddingToCart(true);
                    setCartNotice(null);
                    try {
                      const payload = {
                        productId: String(product.id),
                        quantity: Math.max(1, parseInt(String(quantity)) || 1),
                      };
                      await fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload),
                      }).catch(() => {});
                      window.dispatchEvent(new CustomEvent('cart:updated'));
                    } catch { /* ignore */ } finally {
                      setAddingToCart(false);
                    }
                    router.push('/checkout');
                  }}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />Buy Now
                </button>
              </div>
            </div>

            {/* Packaging & Shipping Info */}
            <div className="border-t border-ink-100 pt-3 space-y-3">
              {effectivePackagingInfo && (effectivePackagingInfo.boxLength || effectivePackagingInfo.grossWeight) && (
                <div className="bg-ink-50 rounded-lg p-3 border border-ink-100">
                  <h4 className="text-xs font-bold text-navy-800 mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-accent-600" />
                    Packaging Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {effectivePackagingInfo.pcsPerCtn && (
                      <div className="flex justify-between">
                        <span className="text-ink-500">Pcs/Carton:</span>
                        <span className="font-semibold text-navy-800">{effectivePackagingInfo.pcsPerCtn}</span>
                      </div>
                    )}
                    {effectivePackagingInfo.boxLength && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-ink-500">Carton Size:</span>
                        <span className="font-semibold text-navy-800">{effectivePackagingInfo.boxLength}×{effectivePackagingInfo.boxWidth}×{effectivePackagingInfo.boxHeight} cm</span>
                      </div>
                    )}
                    {effectivePackagingInfo.grossWeight && (
                      <div className="flex justify-between">
                        <span className="text-ink-500">Gross Weight:</span>
                        <span className="font-semibold text-navy-800">{effectivePackagingInfo.grossWeight} kg</span>
                      </div>
                    )}
                    {effectivePackagingInfo.volumeCBM && (
                      <div className="flex justify-between">
                        <span className="text-ink-500">Volume:</span>
                        <span className="font-semibold text-navy-800">{effectivePackagingInfo.volumeCBM} m³</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  { key: 'specs', label: 'Specifications', icon: Layers },
                  { key: 'description', label: 'Description', icon: FileCheck },
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
                <div className="space-y-6">
                  {/* A+ Content (new format) — rich blocks from site-data.json */}
                  {hasNewAplus ? (
                    <AplusRenderer blocks={aplusBlocks} />
                  ) : (
                    <>
                      <div>
                        <h2 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-accent-500" />
                          Product Overview
                        </h2>
                        <div className="text-sm text-ink-700 leading-relaxed prose prose-sm max-w-none [&_p]:mb-3 [&_strong]:text-navy-800 [&_a]:text-accent-600 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy-800 [&_h3]:mb-2" dangerouslySetInnerHTML={{ __html: cleanDescription(product.description || '') }} />
                      </div>

                      {product.bulletPoints && product.bulletPoints.length > 0 && (
                        <div className="bg-gradient-to-br from-ink-50 to-white rounded-xl p-5 border border-ink-100">
                          <h3 className="text-base font-bold text-navy-800 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-accent-500" />
                            Key Features
                          </h3>
                          <ul className="space-y-2.5">
                            {product.bulletPoints.map((bp, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-accent-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-600" />
                                </div>
                                <span className="text-sm text-ink-700 leading-relaxed font-medium">{bp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {hasAplusContent && (
                        <div className="p-5 bg-gradient-to-br from-accent-500/5 to-navy-500/5 rounded-xl border border-accent-200/20">
                          <h3 className="text-base font-bold text-navy-800 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-accent-500" />
                            Premium Product Content
                          </h3>
                          {product.aplus?.description && (
                            <p className="text-sm text-ink-700 leading-relaxed mb-4">{product.aplus.description}</p>
                          )}
                          {filteredAplusBlocks.length > 0 && (
                            <div className="space-y-3">
                              {filteredAplusBlocks.map((block: any, i: number) => (
                                <div key={block.id || i} className="p-4 bg-white rounded-lg border border-ink-100">
                                  {block.type === 'image' ? (
                                    <img src={block.content} alt={block.caption || ''} className="w-full max-h-64 object-cover rounded-lg" />
                                  ) : (
                                    <div className="text-sm text-ink-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: block.content || '' }} />
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
                    </>
                  )}

                  {product.keywords && product.keywords.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-navy-800 mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-accent-500" />
                        Related Search Terms
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {product.keywords.slice(0, 10).map((kw, i) => (
                          <span key={i} className="text-xs font-medium text-ink-600 bg-ink-50 border border-ink-200 rounded-full px-3 py-1">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-navy-800 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent-500" />
                      Perfect For
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['Boutique Stores','Online Retailers','Wholesale Distributors','Gift Shops'].map((u, i) => (
                        <div key={i} className="border border-ink-100 rounded-lg p-3 text-center bg-white hover:border-accent-200 hover:bg-accent-50/30 transition-colors">
                          <p className="text-xs font-bold text-navy-800">{u}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-accent-500" />
                    Product Specifications
                  </h2>
                  <div className="grid md:grid-cols-2 gap-0 border border-ink-200 rounded-xl overflow-hidden bg-white">
                    {[
                      { label: 'Product Name', value: product.name },
                      { label: 'SKU', value: product.sku || 'N/A' },
                      { label: 'Category', value: (product.categoryPath && product.categoryPath.length > 0)
                        ? product.categoryPath.map(c => c.name).join(' › ')
                        : ((product.category && product.category.name) || 'N/A') },
                      { label: 'Material', value: product.material || 'N/A' },
                      { label: 'Plating / Finish', value: product.plating || 'N/A' },
                      { label: 'Color', value: product.color || 'Multiple options' },
                      { label: 'Size', value: product.size || 'Standard' },
                      { label: 'MOQ', value: `${product.moq || 12} pieces` },
                      { label: 'Pack Size', value: effectivePackagingInfo?.pcsPerCtn ? `${effectivePackagingInfo.pcsPerCtn} pcs/carton` : `${product.packSize || product.moq || 12} pcs/carton` },
                      ...(effectivePackagingInfo?.boxLength ? [{ label: 'Carton Dimensions', value: `${effectivePackagingInfo.boxLength} × ${effectivePackagingInfo.boxWidth} × ${effectivePackagingInfo.boxHeight} cm (L×W×H)` }] : []),
                      ...(effectivePackagingInfo?.grossWeight ? [{ label: 'Gross Weight', value: `${effectivePackagingInfo.grossWeight} kg/carton` }] : []),
                      ...(effectivePackagingInfo?.volumeCBM ? [{ label: 'Carton Volume', value: `${effectivePackagingInfo.volumeCBM} m³` }] : []),
                      { label: 'Lead Time', value: '7-15 days' },
                      { label: 'Customization', value: 'OEM/ODM available' },
                      { label: 'Sample', value: 'Yes — contact us' },
                      { label: 'Shipping Methods', value: 'DHL, FedEx, Sea, Air' },
                      { label: 'Payment Terms', value: 'T/T, PayPal, Western Union, L/C' },
                    ].map((spec, i) => (
                      <div key={i} className="flex justify-between items-center py-3 px-4 border-b border-r border-ink-100 last:border-b-0 even:border-r-0 md:even:border-r hover:bg-ink-50/50 transition-colors">
                        <span className="text-sm text-ink-500 font-medium">{spec.label}</span>
                        <span className="text-sm font-semibold text-navy-800 text-right max-w-[60%] truncate">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-r from-accent-500/5 to-navy-500/5 rounded-xl border border-ink-100">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-accent-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy-800">Need More Details?</h4>
                        <p className="text-xs text-ink-600 mt-0.5">Contact our sales team for complete specifications, CAD drawings, and customization options.</p>
                      </div>
                    </div>
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
                      <p className="text-xs text-ink-500">More from {(product.category && product.category.name) || 'this category'}</p>
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
                    <Link key={item.id} href={`/products/${item.slug || item.id}`} className="flex gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors group">
                      <div className="relative w-14 h-14 flex-shrink-0 bg-ink-50 rounded-md overflow-hidden border border-ink-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                        <span className="absolute top-0 left-0 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-br flex items-center justify-center">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy-800 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight">{item.name}</p>
                        <p className="text-sm font-bold text-accent-600 mt-0.5">{"$" + (Number(item.price) || 0).toFixed(2)}</p>
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

      {/* Get a Quote Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsQuoteModalOpen(false); setQuoteNotice(null); }}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-ink-100 bg-gradient-to-r from-accent-500/5 to-navy-500/5">
              <div>
                <h3 className="text-lg font-bold text-navy-900">Request a Quote</h3>
                <p className="text-xs text-ink-500 mt-1">Fill in the form and we'll email our best wholesale offer to you.</p>
              </div>
              <button
                onClick={() => { setIsQuoteModalOpen(false); setQuoteNotice(null); }}
                aria-label="Close quote form"
                className="p-2 rounded-lg text-ink-500 hover:text-navy-900 hover:bg-ink-100 transition-colors -mt-1 -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product summary */}
            <div className="px-6 py-4 border-b border-ink-100 bg-ink-50/50">
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-ink-100 bg-white flex-shrink-0">
                  <img src={images[0] || product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-navy-900 truncate">{product.name}</div>
                  <div className="text-[11px] text-ink-500 font-mono mt-0.5">SKU: {product.sku || 'N/A'}</div>
                  {(() => {
                    const g = effectiveVariantGroup;
                    if (g && g.variants.length > 1) {
                      const ps = g.variants.map(v => v.price).filter(p => p > 0);
                      if (ps.length > 0) {
                        const mn = Math.min(...ps).toFixed(2);
                        const mx = Math.max(...ps).toFixed(2);
                        return <div className="text-[11px] text-accent-700 font-semibold mt-0.5">From ${mn} – ${mx}</div>;
                      }
                    }
                    if (price > 0) return <div className="text-[11px] text-accent-700 font-semibold mt-0.5">${price.toFixed(2)}</div>;
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Notice */}
            {quoteNotice && (
              <div className={`mx-6 mt-4 px-3.5 py-2.5 rounded-lg text-xs font-semibold ${quoteNotice.type === 'success' ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {quoteNotice.message}
              </div>
            )}

            {/* Form */}
            <form
              className="px-6 py-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setQuoteSubmitting(true);
                setQuoteNotice(null);
                try {
                  const f = quoteForm;
                  const productLink = typeof window !== 'undefined' ? window.location.href : '';
                  const variantLabel = hasSelectedVariant && effectiveVariantGroup
                    ? effectiveVariantGroup.variants.find(v => v.price === price)?.name || ''
                    : '';
                  // Build a structured subject
                  const subject = encodeURIComponent(
                    `[Quote Request] ${f.name || 'Customer'} - ${product.sku || product.name.slice(0, 40)}`
                  );
                  // Build email body template
                  const body = encodeURIComponent(
`Hi Etruemart Sales Team,

I'm interested in the following product and would like a wholesale quote:

━━━━━━━━━━━━━━━━━━━━━━
PRODUCT DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Product Name: ${product.name}
SKU: ${product.sku || 'N/A'}
Category: ${(product.category && product.category.name) || 'N/A'}
${variantLabel ? `Selected Variant: ${variantLabel}
` : ''}Quantity: ${f.quantity || 'TBD'} pcs
Unit Price (displayed): ${price > 0 ? '$' + price.toFixed(2) : 'Contact for price'}
Page URL: ${productLink}

━━━━━━━━━━━━━━━━━━━━━━
BUYER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━
Full Name: ${f.name || '—'}
Company: ${f.company || '—'}
Email: ${f.email || '—'}
Phone: ${f.phone || '—'}
Country / Region: ${f.country || '—'}

━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━
${f.message || '(no additional message)'}

━━━━━━━━━━━━━━━━━━━━━━
Please reply with:
  • Ex-factory unit price at the requested quantity
  • Any bulk tier pricing
  • MOQ / MOQ flexibility
  • Lead time (production + sample if applicable)
  • Packing details & carton specs
  • Shipping options to ${f.country || 'our country'}
  • Payment terms

Thank you,
${f.name || 'Customer'}
${f.company ? f.company + '\n' : ''}`
                  );

                  const mailto = `mailto:info@yeatru.com?subject=${subject}&body=${body}`;

                  // Open the user's email client with the pre-filled message
                  window.location.href = mailto;

                  // Show success message and close after a short delay
                  setQuoteNotice({ type: 'success', message: 'Your email client has been opened with the pre-filled quote request. Please review and send to info@yeatru.com. Thank you!' });
                } catch (err: any) {
                  setQuoteNotice({ type: 'error', message: 'Unable to open email client. Please send your request directly to info@yeatru.com.' });
                } finally {
                  setQuoteSubmitting(false);
                }
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-800 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="text"
                    value={quoteForm.name}
                    onChange={(e) => setQuoteForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-800 mb-1.5 flex items-center gap-1"><Building2 className="w-3 h-3" />Company</label>
                  <input
                    type="text"
                    value={quoteForm.company}
                    onChange={(e) => setQuoteForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Your company name"
                    className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-800 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-800 mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" />Phone</label>
                  <input
                    type="tel"
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 (optional)"
                    className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-800 mb-1.5 flex items-center gap-1"><Globe className="w-3 h-3" />Country</label>
                  <input
                    type="text"
                    value={quoteForm.country}
                    onChange={(e) => setQuoteForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="United States"
                    className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy-800 mb-1.5">Qty (pcs) <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={quoteForm.quantity}
                    onChange={(e) => setQuoteForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder="12"
                    className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-800 mb-1.5">Message</label>
                <textarea
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm(f => ({ ...f, message: e.target.value }))}
                  rows={3}
                  placeholder="Tell us about your needs: target price, customization, lead time, sample request, etc."
                  className="w-full px-3 py-2.5 rounded-lg border border-ink-200 bg-white text-sm text-navy-900 placeholder:text-ink-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition resize-none"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
                >
                  {quoteSubmitting ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" />Send Quote Request to info@yeatru.com</>
                  )}
                </button>
                <p className="mt-3 text-[10px] text-ink-400 text-center leading-relaxed">
                  By clicking "Send Quote Request", your email client will open with a pre-filled message addressed to info@yeatru.com. Simply review and press send.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <img
              src={images[lightboxIndex]}
              alt={`${product.name} - view ${lightboxIndex + 1}`}
              className="w-full h-full object-contain"
            />
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

// Seed data cache for server-side rendering
let seedDataCache: { categories: any[]; products: any[] } | null = null;

function loadSeedData(): { categories: any[]; products: any[] } | null {
  if (seedDataCache) return seedDataCache;

  const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    return null;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    seedDataCache = {
      categories: raw.categories || [],
      products: raw.products || [],
    };
    return seedDataCache;
  } catch (e) {
    return null;
  }
}

function findProductFromSeed(productId: string) {
  const seedData = loadSeedData();
  if (!seedData) return null;

  const { products, categories } = seedData;

  // Build category lookup with root resolution
  const slugToCat = new Map();
  const idToCat = new Map();
  for (const cat of categories) {
    slugToCat.set(cat.slug, cat);
    idToCat.set(cat.id, cat);
  }

  // Resolve a category slug to its root category
  const getRootCat = (catIdOrSlug: string) => {
    let current = idToCat.get(catIdOrSlug) || slugToCat.get(catIdOrSlug);
    while (current && current.parentId) {
      const parent = idToCat.get(current.parentId) || slugToCat.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current;
  };

  // Find product by slug, then by id, then by sku
  const product =
    products.find((p: any) => String(p.slug) === String(productId)) ||
    products.find((p: any) => String(p.id) === String(productId)) ||
    products.find((p: any) => String(p.sku) === String(productId));

  if (!product) return null;

  // Get category - use root category for breadcrumb and navigation
  let breadcrumbCatId = product.categoryId || '';

  // Fallback: if product has no categoryId but is a parent with children,
  // try to get category from the first child
  if (!breadcrumbCatId && product.isParent === true) {
    const child = products.find((p: any) => p.parentId === product.id && p.categoryId);
    if (child) breadcrumbCatId = child.categoryId;
  }
  // Fallback: if product is a child (has parentId), inherit parent's category
  if (!breadcrumbCatId && product.parentId) {
    const parent = products.find((p: any) => p.id === product.parentId);
    if (parent && parent.categoryId) breadcrumbCatId = parent.categoryId;
  }

  const rootCat = getRootCat(breadcrumbCatId);
  const directCat = idToCat.get(breadcrumbCatId) || slugToCat.get(breadcrumbCatId);
  const category = rootCat || directCat || null;

  // Find related products - same root category (including sub-categories)
  const rootSlug = rootCat ? rootCat.slug : breadcrumbCatId;
  // Get all descendant slugs for the root category
  const getDescendantSlugs = (catIdOrSlug: string): string[] => {
    const result = [catIdOrSlug];
    const cat = idToCat.get(catIdOrSlug) || slugToCat.get(catIdOrSlug);
    if (!cat) return result;
    const children = categories.filter(c => c.parentId === cat.id);
    for (const child of children) {
      result.push(...getDescendantSlugs(child.slug));
    }
    return result;
  };
  const validSlugs = new Set(getDescendantSlugs(rootSlug));
  const pid = String(product.id);
  // 1) Same category + price > 0
  let sameCat: any[] = products.filter((p: any) =>
    validSlugs.has(p.categoryId) && String(p.id) !== pid &&
    (Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0)
  );
  // 2) Fill with any products price > 0 if same category isn't enough
  let relatedProducts = [...sameCat];
  if (relatedProducts.length < 8) {
    const existingIds = new Set([pid, ...relatedProducts.map((p: any) => String(p.id))]);
    const rest = products.filter((p: any) =>
      !existingIds.has(String(p.id)) &&
      (Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0)
    );
    for (const p of rest) {
      if (relatedProducts.length >= 8) break;
      relatedProducts.push(p);
    }
  }
  relatedProducts = relatedProducts.slice(0, 8);

  // Parse images
  let images: string[] = [];
  if (product.images) {
    let parsed = product.images;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { parsed = []; }
    }
    if (Array.isArray(parsed)) {
      images = parsed.filter((img: string) => typeof img === 'string').map(proxyImageUrlDirect);
    }
  }
  if (product.image && !images.includes(product.image)) {
    images = [proxyImageUrlDirect(product.image), ...images];
  }

  // Parse keywords
  let keywords: string[] = [];
  if (product.keywords) {
    let parsed = product.keywords;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { parsed = []; }
    }
    if (Array.isArray(parsed)) {
      keywords = parsed.filter((kw: string) => typeof kw === 'string');
    }
  }

  // Parse aplus — supports both old format ({blocks:[]}) and new flat array format.
  // A+ content renders TEXT ONLY (heading + text); image fields are dropped and
  // <img> tags inside text are stripped at render time.
  let aplus = null;
  let aplusBlocks: { type: string; heading?: string; text?: string }[] = [];
  if (product.aplus) {
    try {
      const parsed = typeof product.aplus === 'string'
        ? JSON.parse(product.aplus)
        : product.aplus;
      // New format: flat array of {type, heading, text, image}
      if (Array.isArray(parsed)) {
        aplusBlocks = parsed
          .filter((b: any) => b && typeof b.type === 'string')
          .map((b: any) => ({
            type: b.type,
            heading: b.heading,
            text: b.text,
          }));
      } else if (parsed && typeof parsed === 'object') {
        // Old format: {description, bulletPoints, blocks:[]}
        aplus = parsed;
      }
    } catch {
      aplus = null;
    }
  }

  // Smart key features extraction — generates meaningful features from product data
  let bulletPoints: string[] = [];

  const allFeatures: string[] = [];
  const addFeature = (f: string) => {
    const clean = f.trim();
    if (clean && clean.length > 3) allFeatures.push(clean);
  };

  // Extract useful data from specs block
  let specsMaterial: string | null = null;
  let specsPackaging: string | null = null;
  let specsMoq: number | null = null;

  if (aplus?.blocks && Array.isArray(aplus.blocks)) {
    for (const block of aplus.blocks) {
      if (block.type === 'specs' && block.content) {
        const html = String(block.content);
        const matMatch = html.match(/<strong>Material:<\/strong>\s*([^<]+)/i);
        if (matMatch) specsMaterial = matMatch[1].trim();
        const packMatch = html.match(/<strong>Packaging:<\/strong>\s*([^<]+)/i);
        if (packMatch) specsPackaging = packMatch[1].trim();
        const moqMatch = html.match(/<strong>MOQ:<\/strong>\s*(\d+)/i);
        if (moqMatch) specsMoq = parseInt(moqMatch[1]);
      }
    }
  }

  // 1. Material feature (from product or specs)
  const material = product.material || specsMaterial;
  if (material) {
    addFeature(`Crafted from ${material}`);
  }

  // 2. Product name analysis — extract set size, color, key product type
  const name = product.name || '';
  const setMatch = name.match(/(\d+)[-\s]?(?:piece|pc|pack|pcs|count|set)/i);
  if (setMatch) {
    addFeature(`Set of ${setMatch[1]} pieces`);
  }
  const colorMatch = name.match(/^(Black|White|Blue|Red|Pink|Gold|Silver|Green|Purple|Orange|Yellow|Brown|Gray|Grey)\s/i);
  if (colorMatch) {
    addFeature(`Color: ${colorMatch[1]}`);
  }

  // 3. MOQ feature (use product.moq or specs.moq)
  const moq = Number(product.moq) || specsMoq || 1;
  if (moq <= 10) addFeature(`Low MOQ: ${moq} pcs — start small, scale as needed`);
  else if (moq <= 50) addFeature(`Flexible MOQ: ${moq} pcs for growing businesses`);
  else addFeature(`Wholesale MOQ: ${moq} pcs | Volume pricing available`);

  // 4. Packaging info (from specs)
  if (specsPackaging) {
    const weightMatch = specsPackaging.match(/G\.W\.\s*([\d.]+)\s*kg/i);
    const qtyMatch = specsPackaging.match(/(\d+)\s*pcs?\/ctn/i);
    if (weightMatch && qtyMatch) {
      addFeature(`${qtyMatch[1]} pcs per carton | G.W. ${weightMatch[1]} kg`);
    } else if (weightMatch) {
      addFeature(`Packaging: G.W. ${weightMatch[1]} kg per carton`);
    }
  }

  // 5. Category-specific features
  const catSlug = product.categoryId || '';
  const categoryFeatureMap: Record<string, string[]> = {
    'fashion-jewelry': ['Hypoallergenic materials', 'Elegant design for any occasion'],
    'bags': ['Stylish and functional design', 'Multiple compartments for organization'],
    'electronics': ['Reliable performance with quality components', 'Tested and certified for safety'],
    'beauty-personal-care': ['Gentle formula suitable for daily use', 'Quality ingredients for effective results'],
    'home-living': ['Durable construction for everyday use', 'Modern design to complement any decor'],
    'home-decor-crafts': ['Handcrafted quality with attention to detail', 'Unique piece to enhance your space'],
    'toys': ['Safe and durable materials for kids', 'Educational and fun for all ages'],
    'sports-outdoor': ['Built for performance and durability', 'Weather-resistant for outdoor use'],
    'accessories': ['Versatile accessory for any outfit', 'Premium finish and construction'],
    'auto-tools': ['Professional-grade quality tools', 'Heat-treated steel for durability'],
    'garment-accessories': ['Sewing-grade quality materials', 'Perfect for garments and crafts'],
    'gift': ['Beautifully packaged, ready to gift', 'Premium quality for special occasions'],
    'pet-supplies': ['Pet-safe, non-toxic materials', 'Durable construction for daily use'],
    'kitchen-supplies': ['Food-safe, BPA-free materials', 'Heat-resistant and durable'],
    'hardware-home': ['Heavy-duty steel construction', 'Corrosion-resistant finish'],
    'apparel-shoes': ['Comfortable fit for all-day wear', 'Breathable and durable materials'],
    'phone-accessories': ['Precision-engineered for perfect fit', 'Durable build quality'],
    'stationery-office': ['Premium quality for professional use', 'Eco-friendly materials'],
    'mother-baby-toys': ['Non-toxic, baby-safe materials', 'Educational and developmental'],
    'musical-instruments': ['Tuned and ready to play', 'Quality craftsmanship'],
    'home-appliances': ['Energy-efficient operation', 'Built to last with quality components'],
    'other': ['Premium quality materials', 'Factory-direct pricing'],
  };

  const catFeatures = categoryFeatureMap[catSlug];
  if (catFeatures && catFeatures.length > 0) {
    addFeature(catFeatures[0]);
    if (catFeatures[1]) addFeature(catFeatures[1]);
  }

  // 6. Universal value props
  addFeature('Factory-direct pricing from Yiwu, China');
  addFeature('Global shipping to 180+ countries');
  addFeature('Custom packaging & private label available');
  addFeature('Trade assurance with quality guarantee');

  // Deduplicate and cap at 6
  const seen = new Set<string>();
  for (const f of allFeatures) {
    const key = f.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      bulletPoints.push(f.trim());
    }
    if (bulletPoints.length >= 6) break;
  }

  // Ensure at least 4 features
  if (bulletPoints.length < 4) {
    const fallbacks = [
      'Premium quality materials and construction',
      'Factory-direct pricing from Yiwu, China',
      'Global shipping to 180+ countries',
      'Custom packaging & private label available',
      'Trade assurance with quality guarantee',
      'Flexible MOQ for businesses of all sizes',
    ];
    for (const fb of fallbacks) {
      if (bulletPoints.length >= 6) break;
      if (!seen.has(fb.toLowerCase())) {
        seen.add(fb.toLowerCase());
        bulletPoints.push(fb);
      }
    }
  }

  // Compute variant group
  let variantGroupData: VariantGroupProp | null = null;
  {
    const groups = buildVariantGroups(products);
    const g = getVariantGroupForProductId(groups, String(product.id), product.sku, product.parentId);
    if (g && g.variants.length >= 1) {
      variantGroupData = { 
        parentSku: g.parentSku, 
        baseName: g.baseName, 
        minPrice: g.minPrice,
        maxPrice: g.maxPrice,
        variants: g.variants.map(v => ({
          ...v,
          image: proxyImageUrlDirect(v.image),
        }))
      };
    }
  }

  // Compute full category breadcrumb path (for nested categories)
  const categoryPath: { name: string; slug: string }[] = [];
  if (category) {
    categoryPath.push({ name: category.name, slug: category.slug });
    // If product is in a sub-category, add it too
    if (directCat && directCat.id !== rootCat?.id) {
      categoryPath.push({ name: directCat.name, slug: directCat.slug });
    }
  }

  return {
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      priceMax: product.priceMax ? Number(product.priceMax) : null,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      image: proxyImageUrlDirect(product.image || ''),
      images: images.length > 0 ? images : [proxyImageUrlDirect(product.image || '')],
      category: category ? { name: category.name, slug: category.slug } : null,
      categoryPath,
      categoryId: breadcrumbCatId,
      stock: Number(product.stock) || 0,
      rating: Number(product.rating) || 0,
      reviewCount: Number(product.reviewCount) || 0,
      salesCount: Number(product.salesCount) || 0,
      material: product.material || null,
      plating: product.plating || null,
      process: product.process || null,
      color: product.color || null,
      size: product.size || null,
      packSize: Number(product.packSize) || 1,
      moq: Number(product.moq) || 1,
      sku: product.sku || null,
      origin: product.origin || null,
      supplierCity: product.supplierCity || null,
      keywords,
      bulletPoints,
      aplus,
      aplusBlocks,
      stockStatus: product.stockStatus || 'IN_STOCK',
      packagingInfo: product.packagingInfo || null,
    },
    relatedProducts: relatedProducts.map((rp: any) => ({
      id: rp.id,
      slug: rp.slug,
      name: rp.name,
      description: rp.description || '',
      price: Number(rp.price) || 0,
      priceMax: rp.priceMax ? Number(rp.priceMax) : null,
      image: proxyImageUrlDirect(rp.image || ''),
      category: category ? { name: category.name, slug: category.slug } : null,
      moq: Number(rp.moq) || 1,
      sku: rp.sku || null,
      rating: Number(rp.rating) || 0,
      reviewCount: Number(rp.reviewCount) || 0,
      salesCount: Number(rp.salesCount) || 0,
    })),
    variantGroup: variantGroupData,
  };
}

export async function getServerSideProps(context: { params: { id: string } }) {
  const { id } = context.params;
  const productId = String(id);

  // On Vercel (or when SQLite has no matching product), use seed-data.json
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    const result = findProductFromSeed(productId);
    if (!result) {
      return { notFound: true };
    }
    return { props: result };
  }

  try {
    // Find product by slug (most common for URLs), then by id
    let product = getProductBySlug(productId);
    if (!product) {
      product = getProductById(productId);
    }

    if (!product) {
      // Fallback to seed-data.json on local dev too
      const result = findProductFromSeed(productId);
      if (!result) {
        return { notFound: true };
      }
      return { props: result };
    }
    
    // Get category - resolve to root for display, keep direct for path
    const directCat = product.categoryId ? getCategoryById(product.categoryId) : null;
    let rootCat = directCat;
    if (directCat && directCat.parentId) {
      const parent = getCategoryById(directCat.parentId);
      if (parent) rootCat = parent;
    }
    const category = rootCat || directCat || null;
    
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
        images = parsedImages.filter((img: string) => typeof img === 'string').map(proxyImageUrlDirect);
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

    // Smart key features extraction — generates meaningful features from product data
    let bulletPoints: string[] = [];

    const allFeatures: string[] = [];
    const addFeature = (f: string) => {
      const clean = f.trim();
      if (clean && clean.length > 3) allFeatures.push(clean);
    };

    // Extract useful data from specs block
    let specsMaterial: string | null = null;
    let specsPackaging: string | null = null;
    let specsMoq: number | null = null;

    if (aplus?.blocks && Array.isArray(aplus.blocks)) {
      for (const block of aplus.blocks) {
        if (block.type === 'specs' && block.content) {
          const html = String(block.content);
          const matMatch = html.match(/<strong>Material:<\/strong>\s*([^<]+)/i);
          if (matMatch) specsMaterial = matMatch[1].trim();
          const packMatch = html.match(/<strong>Packaging:<\/strong>\s*([^<]+)/i);
          if (packMatch) specsPackaging = packMatch[1].trim();
          const moqMatch = html.match(/<strong>MOQ:<\/strong>\s*(\d+)/i);
          if (moqMatch) specsMoq = parseInt(moqMatch[1]);
        }
      }
    }

    // 1. Material feature (from product or specs)
    const material = product.material || specsMaterial;
    if (material) {
      addFeature(`Crafted from ${material}`);
    }

    // 2. Product name analysis
    const name = product.name || '';
    const setMatch = name.match(/(\d+)[-\s]?(?:piece|pc|pack|pcs|count|set)/i);
    if (setMatch) {
      addFeature(`Set of ${setMatch[1]} pieces`);
    }
    const colorMatch = name.match(/^(Black|White|Blue|Red|Pink|Gold|Silver|Green|Purple|Orange|Yellow|Brown|Gray|Grey)\s/i);
    if (colorMatch) {
      addFeature(`Color: ${colorMatch[1]}`);
    }

    // 3. MOQ feature
    const moq = Number(product.moq) || specsMoq || 1;
    if (moq <= 10) addFeature(`Low MOQ: ${moq} pcs — start small, scale as needed`);
    else if (moq <= 50) addFeature(`Flexible MOQ: ${moq} pcs for growing businesses`);
    else addFeature(`Wholesale MOQ: ${moq} pcs | Volume pricing available`);

    // 4. Packaging info
    if (specsPackaging) {
      const weightMatch = specsPackaging.match(/G\.W\.\s*([\d.]+)\s*kg/i);
      const qtyMatch = specsPackaging.match(/(\d+)\s*pcs?\/ctn/i);
      if (weightMatch && qtyMatch) {
        addFeature(`${qtyMatch[1]} pcs per carton | G.W. ${weightMatch[1]} kg`);
      } else if (weightMatch) {
        addFeature(`Packaging: G.W. ${weightMatch[1]} kg per carton`);
      }
    }

    // 5. Category-specific features
    const catSlug = product.categoryId || '';
    const categoryFeatureMap: Record<string, string[]> = {
      'fashion-jewelry': ['Hypoallergenic materials', 'Elegant design for any occasion'],
      'bags': ['Stylish and functional design', 'Multiple compartments for organization'],
      'electronics': ['Reliable performance with quality components', 'Tested and certified for safety'],
      'beauty-personal-care': ['Gentle formula suitable for daily use', 'Quality ingredients for effective results'],
      'home-living': ['Durable construction for everyday use', 'Modern design to complement any decor'],
      'home-decor-crafts': ['Handcrafted quality with attention to detail', 'Unique piece to enhance your space'],
      'toys': ['Safe and durable materials for kids', 'Educational and fun for all ages'],
      'sports-outdoor': ['Built for performance and durability', 'Weather-resistant for outdoor use'],
      'accessories': ['Versatile accessory for any outfit', 'Premium finish and construction'],
      'auto-tools': ['Professional-grade quality tools', 'Heat-treated steel for durability'],
      'garment-accessories': ['Sewing-grade quality materials', 'Perfect for garments and crafts'],
      'gift': ['Beautifully packaged, ready to gift', 'Premium quality for special occasions'],
      'pet-supplies': ['Pet-safe, non-toxic materials', 'Durable construction for daily use'],
      'kitchen-supplies': ['Food-safe, BPA-free materials', 'Heat-resistant and durable'],
      'hardware-home': ['Heavy-duty steel construction', 'Corrosion-resistant finish'],
      'apparel-shoes': ['Comfortable fit for all-day wear', 'Breathable and durable materials'],
      'phone-accessories': ['Precision-engineered for perfect fit', 'Durable build quality'],
      'stationery-office': ['Premium quality for professional use', 'Eco-friendly materials'],
      'mother-baby-toys': ['Non-toxic, baby-safe materials', 'Educational and developmental'],
      'musical-instruments': ['Tuned and ready to play', 'Quality craftsmanship'],
      'home-appliances': ['Energy-efficient operation', 'Built to last with quality components'],
      'other': ['Premium quality materials', 'Factory-direct pricing'],
    };

    const catFeatures = categoryFeatureMap[catSlug];
    if (catFeatures && catFeatures.length > 0) {
      addFeature(catFeatures[0]);
      if (catFeatures[1]) addFeature(catFeatures[1]);
    }

    // 6. Universal value props
    addFeature('Factory-direct pricing from Yiwu, China');
    addFeature('Global shipping to 180+ countries');
    addFeature('Custom packaging & private label available');
    addFeature('Trade assurance with quality guarantee');

    // Deduplicate and cap at 6
    const seen = new Set<string>();
    for (const f of allFeatures) {
      const key = f.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        bulletPoints.push(f.trim());
      }
      if (bulletPoints.length >= 6) break;
    }

    // Ensure at least 4 features
    if (bulletPoints.length < 4) {
      const fallbacks = [
        'Premium quality materials and construction',
        'Factory-direct pricing from Yiwu, China',
        'Global shipping to 180+ countries',
        'Custom packaging & private label available',
        'Trade assurance with quality guarantee',
        'Flexible MOQ for businesses of all sizes',
      ];
      for (const fb of fallbacks) {
        if (bulletPoints.length >= 6) break;
        if (!seen.has(fb.toLowerCase())) {
          seen.add(fb.toLowerCase());
          bulletPoints.push(fb);
        }
      }
    }

    // Build category path for breadcrumb (root → sub)
    const categoryPath: { name: string; slug: string }[] = [];
    if (category) {
      categoryPath.push({ name: category.name, slug: category.slug });
      if (directCat && directCat.id !== rootCat?.id) {
        categoryPath.push({ name: directCat.name, slug: directCat.slug });
      }
    }

    const serializedProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      priceMax: product.priceMax ? Number(product.priceMax) : null,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      image: proxyImageUrlDirect(product.image || ''),
      images: images.length > 0 ? images : [proxyImageUrlDirect(product.image || '')],
      category: category ? { name: category.name, slug: category.slug } : null,
      categoryPath,
      categoryId: product.categoryId || '',
      stock: Number(product.stock) || 0,
      rating: Number(product.rating) || 0,
      reviewCount: Number(product.reviewCount) || 0,
      salesCount: Number(product.salesCount) || 0,
      material: product.material || null,
      plating: product.plating || null,
      process: product.process || null,
      color: product.color || null,
      size: product.size || null,
      packSize: Number(product.packSize) || 1,
      moq: Number(product.moq) || 1,
      sku: product.sku || null,
      origin: product.origin || null,
      supplierCity: product.supplierCity || null,
      keywords,
      bulletPoints,
      aplus,
      stockStatus: product.stockStatus || 'IN_STOCK',
      packagingInfo: (product as any).packagingInfo || null,
    };

    const serializedRelated = relatedProducts.map((rp: any) => ({
      id: rp.id,
      slug: rp.slug,
      name: rp.name,
      description: rp.description || '',
      price: Number(rp.price) || 0,
      priceMax: rp.priceMax ? Number(rp.priceMax) : null,
      image: proxyImageUrlDirect(rp.image || ''),
      category: null,
      moq: Number(rp.moq) || 1,
      sku: rp.sku || null,
      rating: Number(rp.rating) || 0,
      reviewCount: rp.reviewCount || 0,
      salesCount: rp.salesCount || 0,
    }));

    // Compute variant group from seed data
    let ssVariantGroup: VariantGroupProp | null = null;
    {
      const sd = loadSeedData();
      if (sd) {
        const groups = buildVariantGroups(sd.products);
        const g = getVariantGroupForProductId(groups, String(product.id), product.sku, (product as any).parentId);
        if (g && g.variants.length >= 1) {
          ssVariantGroup = { 
            parentSku: g.parentSku, 
            baseName: g.baseName, 
            minPrice: g.minPrice,
            maxPrice: g.maxPrice,
            variants: g.variants.map(v => ({
              ...v,
              image: proxyImageUrlDirect(v.image),
            }))
          };
        }
      }
    }

    return {
      props: {
        product: serializedProduct,
        relatedProducts: serializedRelated,
        variantGroup: ssVariantGroup,
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Last resort: try seed-data.json
    const result = findProductFromSeed(productId);
    if (result) {
      return { props: result };
    }
    
    return {
      notFound: true,
    };
  }
}
