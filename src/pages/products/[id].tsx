import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
import { SITE_URL, SITE_OG_IMAGE, SITE_COMPANY, SITE_NAME, SITE_ADDRESS, SITE_PHONE, SITE_EMAIL } from '@/lib/site';
import {
  buildSeoTitle,
  buildSeoDescription,
  buildOgDescription,
  buildSchemaKeywords,
  buildFaqSchema,
  buildOrganizationSchema,
  stripHtmlToPlain as seoStripHtml,
} from '@/lib/seo';
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
  priceMax?: number | null;
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
  // SEO / Schema optional extras
  brand?: string;
  mpn?: string;
  gtin?: string | null;
  availability?: string | null; // 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder'
  datePublished?: string | null;
  productCondition?: string | null; // e.g. 'https://schema.org/NewCondition'
}


// Strip HTML tags and entities for plain-text meta descriptions
function stripHtmlToPlainText(s: string): string {
  if (!s) return '';
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
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


  // ✅ Removed duplicate client refetch: trust SSR initialProduct fully (saves ~1 network roundtrip)



  // ✅ Removed full-product-list fallback (SSR always injects variantGroup now — avoids over-fetch)
  //  clientVariantGroup initializes from props variantGroup via useState initializer above.


  const price = Number(product.price || product.priceMin || 0);
  // 移除虚假折扣：priceMin/priceMax 是阶梯价区间，非原价/现价，不能用于构造 discount
  // 仅使用真实评分/销量/评论数据（SEO合规：禁止在AggregateRating输出伪造用户评价）
  const hasRealRating = Number(product.rating) > 0 && Number(product.reviewCount) > 0;
  const rating = hasRealRating ? Number(product.rating) : 0;
  const reviewCount = hasRealRating ? Number(product.reviewCount) : 0;
  const hasRealSales = Number(product.salesCount) > 0;
  const salesCount = hasRealSales ? Number(product.salesCount) : 0;
  const stock = Number(product.stock || 9999);

  const images = variantImages 
    ? variantImages 
    : (() => {
        const raw = product.images?.length >= 2 ? product.images : [product.image];
        return raw.map(proxyImageUrlDirect);
      })();

  const faqs = [
    { q: 'What is the minimum order quantity?', a: `The MOQ for this product is ${product.moq || 12} pieces. We accept smaller trial orders for new customers to help you test the market.` },
    { q: 'Can I get a sample before placing a bulk order?', a: 'Yes, we offer samples at a slightly higher unit price. Sample fees can be fully refunded upon bulk order confirmation. Samples are usually ready in 2-3 days and shipped via DHL/FedEx from Yiwu, Zhejiang, China.' },
    { q: 'What are the payment terms?', a: 'We accept T/T, PayPal, Western Union, L/C, and Trade Assurance. For new customers: 30% deposit + 70% balance before shipping from our factory in Zhejiang, China.' },
    { q: 'How long does production and shipping take?', a: 'Standard production lead time is 7-15 days after deposit confirmation. Custom OEM/ODM orders may take 15-25 days. Express shipping (DHL/FedEx) to the US/EU takes 5-8 days; sea freight takes 25-40 days.' },
    { q: 'Do you offer custom packaging or branding?', a: 'Yes, we provide comprehensive OEM/ODM services including custom retail packaging, private label, logo printing (silk screen / laser / UV), and color customization, all managed from our Yiwu, Zhejiang (义乌浙江) operations.' },
    { q: 'Where is your factory / warehouse located? Can we visit?', a: `Our sourcing office and quality-control team are based in ${SITE_ADDRESS}. We welcome buyer audits and factory visits — contact us to schedule an appointment at the Yiwu International Trade City showroom.` },
    { q: 'What quality guarantees do you offer?', a: 'Every order undergoes 3-stage QC (pre-production, in-line, final random inspection before container loading) plus optional third-party inspection by SGS / Intertek / BV. Defective units are replaced free of charge within 30 days of delivery.' },
  ];

  // Esc 关闭灯箱/模态（键盘可达性）
  useEffect(() => {
    if (!isLightboxOpen && !isQuoteModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setIsQuoteModalOpen(false);
        setQuoteNotice(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLightboxOpen, isQuoteModalOpen]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);

  const handleAddToCart = async (): Promise<boolean> => {
    if (!session) {
      const loginHref = `/login?callbackUrl=${encodeURIComponent(router.asPath || router.pathname)}`;
      setCartNotice({ type: 'error', message: 'Please login to continue. Redirecting...' });
      setTimeout(() => router.push(loginHref), 600);
      return false;
    }
    if (addingToCart) return false;
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
      } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail] silent error caught:', e); }
      if (!ok) {
        if (res.status === 401) {
          const loginHref = `/login?callbackUrl=${encodeURIComponent(router.asPath || router.pathname)}`;
          setCartNotice({ type: 'error', message: 'Session expired. Redirecting to login...' });
          setTimeout(() => router.push(loginHref), 600);
          setAddingToCart(false);
          return false;
        }
        if (res.status === 400) {
          setCartNotice({ type: 'error', message: msg || 'Invalid product. Please refresh and try again.' });
        } else {
          setCartNotice({ type: 'error', message: msg || `Failed (${res.status}). Please try again.` });
        }
        setAddingToCart(false);
        return false;
      }
      // Manually trigger cart refresh by calling refresh() via context event
      window.dispatchEvent(new CustomEvent('cart:updated'));
      setCartNotice({ type: 'success', message: `Added ${payload.quantity} pcs to cart!` });
      return true;
    } catch (e: any) {
      setCartNotice({ type: 'error', message: 'Network error. Please check your connection and try again.' });
      return false;
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
        } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail] silent error caught:', e); }
      }
    };
    checkOwnership();
  }, [sessionStatus, session?.user?.id, product.id]); // ✅ Optimized: depend on user.id instead of full session object ref

  // ===== SEO / GEO DERIVED VALUES (computed before render for stable refs) =====
  const seoProductForMeta = {
    name: product.name,
    description: product.description || null,
    material: product.material || null,
    color: product.color || null,
    origin: product.origin || null,
    supplierCity: product.supplierCity || null,
    category: product.category || null,
    moq: product.moq || null,
    priceMin: product.priceMin ?? null,
    price: product.price ?? null,
    keywords: product.keywords ?? null,
  };
  const seoTitle = buildSeoTitle(seoProductForMeta);
  const seoMetaDesc = buildSeoDescription(seoProductForMeta);
  const seoOgDesc = buildOgDescription(seoProductForMeta);
  const seoKeywords = buildSchemaKeywords(seoProductForMeta);
  const canonicalUrl = `${SITE_URL}/products/${product.slug || product.id}`;
  const resolvedImageUrl =
    product.image && product.image.startsWith('http')
      ? product.image
      : (product.image ? `${SITE_URL}${product.image}` : SITE_OG_IMAGE);
  const resolvedImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
        .map((im: string) => (im && im.startsWith('http') ? im : (im ? `${SITE_URL}${im}` : '')))
        .filter(Boolean)
    : [];
  const schemaImages = [resolvedImageUrl, ...resolvedImages].filter(Boolean).slice(0, 12);
  const faqSchema = buildFaqSchema(faqs);
  const orgSchema = buildOrganizationSchema();
  // GEO inventory place: product-origin / yiwu fallback
  const geoPlaceName = (product.supplierCity && product.supplierCity.toLowerCase() !== 'unknown')
    ? product.supplierCity
    : ((product.origin && product.origin.toLowerCase() !== 'unknown') ? product.origin : 'Yiwu');
  const inventoryGeo = {
    '@type': 'Place' as const,
    name: `${geoPlaceName} Warehouse`,
    address: {
      '@type': 'PostalAddress' as const,
      addressLocality: geoPlaceName,
      addressRegion: geoPlaceName.toLowerCase().includes('yiwu') ? 'Zhejiang' : (geoPlaceName.includes('Guangzhou') ? 'Guangdong' : ''),
      addressCountry: 'CN',
    },
    ...(geoPlaceName.toLowerCase().includes('yiwu') ? {
      geo: { '@type': 'GeoCoordinates' as const, latitude: '29.3086', longitude: '120.0756' },
    } : {}),
  };

  return (
    <Layout>
      <Head>
        {/* ===== Primary SEO Meta ===== */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoMetaDesc} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="author" content={SITE_COMPANY} />
        <meta name="geo.region" content="CN-ZJ" />
        <meta name="geo.placename" content={geoPlaceName} />
        <meta name="geo.position" content={geoPlaceName.toLowerCase().includes('yiwu') ? '29.3086;120.0756' : '29.3086;120.0756'} />
        <meta name="ICBM" content={geoPlaceName.toLowerCase().includes('yiwu') ? '29.3086, 120.0756' : '29.3086, 120.0756'} />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />

        {/* ===== Open Graph ===== */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoOgDesc} />
        <meta property="og:type" content="product" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={resolvedImageUrl} />
        <meta property="og:image:secure_url" content={resolvedImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        {resolvedImages.length > 0 && resolvedImages.slice(0, 5).map((im: string, i: number) => (
          <meta key={`ogi-${i}`} property="og:image:alt" content={`${product.name} - image ${i + 1}`} />
        ))}

        {/* ===== Facebook Product / Price ===== */}
        <meta property="product:price:amount" content={String(product.priceMin || product.price || '')} />
        <meta property="product:price:currency" content="USD" />
        {product.availability && <meta property="product:availability" content={stock > 0 ? 'in stock' : 'out of stock'} />}
        {product.category?.name && <meta property="product:category" content={product.category.name} />}
        {product.material && <meta property="product:material" content={product.material} />}
        {product.color && <meta property="product:color" content={product.color} />}
        {product.sku && <meta property="product:retailer_item_id" content={product.sku} />}
        {product.brand && typeof product.brand === 'string' && <meta property="product:brand" content={product.brand} />}

        {/* ===== Twitter Card ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@etruemark" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoMetaDesc} />
        <meta name="twitter:image" content={resolvedImageUrl} />
        <meta name="twitter:image:alt" content={product.name} />
        <meta name="twitter:label1" content="Price" />
        <meta name="twitter:data1" content={product.priceMin || product.price ? `$${Number(product.priceMin || product.price).toFixed(2)}+` : 'Contact for quote'} />
        <meta name="twitter:label2" content="MOQ" />
        <meta name="twitter:data2" content={`${product.moq || 12} pcs (${geoPlaceName})`} />

        {/* ===== Schema.org: Product + AggregateOffer + GEO Place ===== */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: seoOgDesc,
            image: schemaImages.length > 0 ? schemaImages : [SITE_OG_IMAGE],
            sku: product.sku || String(product.id),
            mpn: product.sku || String(product.id),
            brand: { '@type': 'Brand', name: SITE_NAME },
            manufacturer: { '@type': 'Organization', name: SITE_COMPANY, address: { '@type': 'PostalAddress', addressLocality: geoPlaceName, addressCountry: 'CN' } },
            category: product.category?.name || undefined,
            material: product.material || undefined,
            color: product.color || undefined,
            keywords: seoKeywords,
            productID: product.sku || String(product.id),
            ...(rating > 0 && reviewCount > 0 ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: Number(rating) || 0,
                reviewCount: Number(reviewCount) || 0,
                bestRating: 5,
                worstRating: 1,
              }
            } : {}),
            additionalProperty: [
              ...(product.moq ? [{ '@type': 'PropertyValue' as const, name: 'Minimum Order Quantity', value: String(product.moq) }] : []),
              ...(product.origin || product.supplierCity ? [{ '@type': 'PropertyValue' as const, name: 'Country of Origin', value: product.supplierCity || product.origin || SITE_ADDRESS }] : []),
              ...(product.size ? [{ '@type': 'PropertyValue' as const, name: 'Size', value: product.size }] : []),
            ],
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'USD',
              ...(Number(product.priceMin || product.price) > 0 ? { lowPrice: Number(product.priceMin || product.price) } : {}),
              ...(Number(product.priceMax) > 0 ? { highPrice: Number(product.priceMax) } : {
                ...(Number(product.priceMin || product.price) > 0 ? { highPrice: Number(product.priceMin || product.price) } : {}),
              }),
              offerCount: Math.max(1, (effectiveVariantGroup?.variants?.length || 0) || 1),
              availability: stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
              businessFunction: 'https://schema.org/Sell',
              availabilityStarts: new Date().toISOString().split('T')[0],
              validFrom: new Date().toISOString().split('T')[0],
              seller: { '@type': 'Organization', name: SITE_COMPANY, telephone: SITE_PHONE, email: SITE_EMAIL, url: SITE_URL },
              availableAtOrFrom: inventoryGeo,
              areaServed: [
                { '@type': 'AdministrativeArea' as const, name: 'Worldwide' },
              ],
              shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingRate: { '@type': 'MonetaryAmount' as const, value: '0.00', currency: 'USD' },
                shippingDestination: { '@type': 'DefinedRegion' as const, addressCountry: 'US', addressRegion: ['CA', 'NY', 'TX', 'FL', 'WA'] },
                deliveryTime: {
                  '@type': 'ShippingDeliveryTime' as const,
                  handlingTime: { '@type': 'QuantitativeValue' as const, value: '2', unitCode: 'DAY' },
                  transitTime: { '@type': 'QuantitativeValue' as const, value: '5', unitCode: 'DAY' },
                },
              },
              hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 30,
                returnMethod: 'https://schema.org/ReturnByMail',
                returnFees: 'https://schema.org/FreeReturn',
                applicableCountry: { '@type': 'Country' as const, name: 'US' },
              },
            },
          })
        }} />

        {/* ===== Schema.org: BreadcrumbList ===== */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Wholesale Products', item: `${SITE_URL}/products` },
              ...((product.categoryPath && product.categoryPath.length > 0)
                ? product.categoryPath.map((c: { name: string; slug: string }, i: number) => ({
                    '@type': 'ListItem' as const,
                    position: 3 + i,
                    name: c.name,
                    item: `${SITE_URL}/products?category=${c.slug}`,
                  }))
                : (product.category && product.category.name ? [{
                    '@type': 'ListItem' as const,
                    position: 3,
                    name: product.category.name,
                    item: `${SITE_URL}/products?category=${product.category.slug}`,
                  }] : [])
              ),
              {
                '@type': 'ListItem' as const,
                position: (product.categoryPath?.length || (product.category ? 1 : 0)) + 3,
                name: product.name,
                item: canonicalUrl,
              },
            ],
          })
        }} />

        {/* ===== Schema.org: FAQPage ===== */}
        {faqSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        )}

        {/* ===== Schema.org: Organization (GEO + contact) ===== */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

        {/* ===== Structured Data: Product Listing Page hint (for crawler) ===== */}
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      </Head>
      {/* Breadcrumb */}
      <div className="bg-ink-50/70 border-b border-ink-100">
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
                  {/* ✅ Replaced native <img> with next/Image for optimized formats + lazy */}
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-5 md:p-8"
                    onError={(e) => {
                      const el = e.currentTarget as unknown as HTMLImageElement;
                      if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        (el as any).src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="#f3f4f6" width="400" height="300"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#9ca3af">${product.name}</text></svg>`)}`;
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
                      {/* ✅ next/Image thumbnail with lazy loading.
                           The first thumbnail shares its src with the main
                           LCP image, so it must also carry `priority` —
                           otherwise Next.js flags that src as an unprioritized
                           LCP candidate. */}
                      <Image
                        src={img}
                        alt={`${product.name} - view ${i + 1}`}
                        fill
                        sizes="64px"
                        priority={i === 0}
                        className="!object-contain !p-1"
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

            {/* Wholesale price block — 365nails-inspired, honest (no fake retail price) */}
            <div className="mb-5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-accent-600 mb-1.5">
                <Tag className="w-3.5 h-3.5" /> Wholesale unit price
              </div>
              {(() => {
                const hasVariants = effectiveVariantGroup && effectiveVariantGroup.variants.length > 1;
                if (hasVariants) {
                  const group = effectiveVariantGroup!;
                  const validPrices = group.variants.map(v => v.price).filter(p => p > 0);
                  const minP = group.minPrice ?? (validPrices.length > 0 ? Math.min(...validPrices) : price);
                  const maxP = group.maxPrice ?? (validPrices.length > 0 ? Math.max(...validPrices) : price);

                  if (hasSelectedVariant) {
                    const showPrice = price > 0 ? `$${price.toFixed(2)}` : 'Contact for price';
                    return (
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className={`text-3xl md:text-4xl font-extrabold tracking-tight ${price > 0 ? 'text-navy-900' : 'text-amber-600'}`}>{showPrice}</span>
                        {minP !== maxP && (
                          <span className="text-[11px] text-ink-400 font-medium">
                            (Range: ${minP.toFixed(2)} – ${maxP.toFixed(2)})
                          </span>
                        )}
                      </div>
                    );
                  }
                  if (minP > 0 && maxP > 0 && minP !== maxP) {
                    return (
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm text-ink-500 font-medium">From</span>
                        <span className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">${minP.toFixed(2)}</span>
                        <span className="text-sm text-ink-500 font-medium">to</span>
                        <span className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">${maxP.toFixed(2)}</span>
                        <span className="text-xs text-ink-400 ml-1">· select variant for exact price</span>
                      </div>
                    );
                  }
                }
                return (
                  <span className="text-3xl md:text-4xl font-extrabold text-navy-900 tracking-tight">${price.toFixed(2)}</span>
                );
              })()}

              {/* Wholesale purchase decision strip — 365nails-style B2B info band */}
              {(() => {
                const unitPrice = Number(product.priceMin || product.price || 0);
                const moq = product.moq || 12;
                const startingTotal = unitPrice > 0 ? unitPrice * moq : 0;
                const inStock = stock > 0;
                const availabilityLabel = product.availability === 'PreOrder' ? 'Pre-order'
                  : product.availability === 'BackOrder' ? 'Back-order'
                  : inStock ? 'In stock' : 'Out of stock';
                const items = [
                  { label: 'Wholesale unit price', value: unitPrice > 0 ? `$${unitPrice.toFixed(2)}` : 'Contact', icon: Tag },
                  { label: 'Product MOQ', value: `${moq} pcs`, icon: Package },
                  { label: 'Starting total', value: startingTotal > 0 ? `$${startingTotal.toFixed(2)}` : '—', icon: TrendingUp },
                  { label: 'Availability', value: availabilityLabel, icon: inStock ? CheckCircle2 : Clock, highlight: 'avail' },
                ];
                return (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-100 rounded-xl overflow-hidden border border-ink-200">
                    {items.map(it => {
                      const Icon = it.icon;
                      const isAvail = it.highlight === 'avail';
                      return (
                        <div key={it.label} className="bg-white px-3 py-2.5">
                          <div className="flex items-center gap-1 text-[10px] text-ink-400 uppercase tracking-wider font-semibold mb-0.5">
                            <Icon className="w-3 h-3" />{it.label}
                          </div>
                          <div className={`text-sm font-bold ${isAvail ? (inStock ? 'text-success-600' : 'text-amber-600') : 'text-navy-900'}`}>{it.value}</div>
                        </div>
                      );
                    })}
                  </div>
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

            {/* Variant matrix table — 365nails-style spec grid */}
            {effectiveVariantGroup && effectiveVariantGroup.variants.length > 1 && (
              <div className="mb-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-500 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent-600" /> Variant specifications
                </div>
                <div className="rounded-xl border border-ink-200 overflow-hidden">
                  <div className="grid grid-cols-[1fr_5rem_6rem] bg-ink-50 text-[10px] uppercase tracking-wider font-bold text-ink-500 px-3 py-2">
                    <span>Specification</span>
                    <span className="text-right">Stock</span>
                    <span className="text-right">Unit price</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-ink-100">
                    {effectiveVariantGroup.variants.map(v => {
                      const selected = product.sku === v.sku;
                      const spec = v.size || v.color || v.capacity || v.material || v.name;
                      const inStock = v.stock > 0;
                      return (
                        <button
                          key={v.sku}
                          type="button"
                          onClick={() => handleVariantSelect({ image: v.image, name: v.name, sku: v.sku, price: v.price, stock: v.stock, moq: v.moq, packagingInfo: v.packagingInfo })}
                          className={`w-full grid grid-cols-[1fr_5rem_6rem] items-center px-3 py-2.5 text-left transition-colors ${selected ? 'bg-accent-50 ring-1 ring-inset ring-accent-300' : 'bg-white hover:bg-ink-50'}`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            {v.image ? (
                              <img src={proxyImageUrlDirect(v.image)} alt="" className="w-7 h-7 rounded-md object-cover border border-ink-200 shrink-0" loading="lazy" />
                            ) : (
                              <span className="w-7 h-7 rounded-md bg-ink-100 shrink-0" />
                            )}
                            <span className={`text-xs truncate ${selected ? 'text-accent-700 font-bold' : 'text-navy-800 font-medium'}`}>{spec}</span>
                          </span>
                          <span className={`text-right text-xs font-medium ${inStock ? 'text-success-600' : 'text-ink-400'}`}>{inStock ? `${v.stock}` : 'Out'}</span>
                          <span className="text-right text-xs font-bold text-navy-900">{v.price > 0 ? `$${v.price.toFixed(2)}` : '—'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="mb-4">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[11px] text-ink-500 font-medium">Qty:</span>
                <div className="flex items-center border border-ink-200 rounded-lg bg-white overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(product.moq || 1, quantity - (product.packSize || product.moq || 1)))} aria-label="Decrease quantity" className="px-3 py-1.5 hover:bg-ink-50 transition-colors text-ink-600"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="px-4 font-bold text-navy-800 min-w-[60px] text-center text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + (product.packSize || product.moq || 1))} aria-label="Increase quantity" className="px-3 py-1.5 hover:bg-ink-50 transition-colors text-ink-600"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <span className="text-[10px] text-ink-400">MOQ: {product.moq || 12} · Step: {product.packSize || product.moq || 1}</span>
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
                    // Reuse handleAddToCart (returns boolean) — ONLY push checkout on success
                    const ok = await handleAddToCart();
                    if (ok && session) router.push('/checkout');
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
              {/* Ready-stock wholesale status strip — 365nails-style */}
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-success-50 to-transparent border border-success-200">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success-700">
                  <span className={`w-1.5 h-1.5 rounded-full ${stock > 0 ? 'bg-success-500 animate-pulse' : 'bg-amber-500'}`} />
                  {stock > 0 ? 'Ready-stock wholesale' : 'Made-to-order'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-ink-500 font-medium">
                  <Clock className="w-3 h-3" />
                  Processing 3-5 business days
                </span>
              </div>
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
                                    <div className="relative w-full max-h-64 rounded-lg overflow-hidden"><Image src={block.content} alt={block.caption || ''} fill sizes="(max-width: 1024px) 100vw, 60vw" className="!object-cover !static !w-full !relative !h-auto !max-h-64" /></div>
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

                  {/* ===== GEO Sourcing & Shipping Block (Yiwu Zhejiang China, for local search + crawler) ===== */}
                  <div className="rounded-2xl overflow-hidden border border-ink-200 bg-gradient-to-br from-white via-ink-50/40 to-white shadow-sm">
                    <div className="bg-gradient-to-r from-navy-800 to-navy-700 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">Sourcing Directly From {geoPlaceName}, Zhejiang, China</h3>
                          <p className="text-[11px] text-white/75 leading-tight">Factory-direct wholesale · Yiwu International Trade City · 180+ countries served</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-[11px] font-semibold text-white/85">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Lead Time 7-15d</span>
                        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" />DHL/FedEx/Sea</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Trade Assurance</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-px bg-ink-200/70">
                      <div className="bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Store className="w-4 h-4 text-accent-600" />
                          <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wide">Supplier</h4>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 leading-tight">{SITE_COMPANY}</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">{SITE_NAME} · Verified Wholesale Supplier</p>
                        <div className="mt-3 pt-3 border-t border-ink-100 space-y-1.5">
                          <p className="text-[11px] text-ink-600 flex items-center gap-1.5"><Building2 className="w-3 h-3 text-ink-400" /> Yiwu, Zhejiang, CN (29.31°N, 120.08°E)</p>
                          <p className="text-[11px] text-ink-600 flex items-center gap-1.5"><Phone className="w-3 h-3 text-ink-400" /> {SITE_PHONE}</p>
                          <p className="text-[11px] text-ink-600 flex items-center gap-1.5"><Tag className="w-3 h-3 text-ink-400" /> 8+ years export experience</p>
                        </div>
                      </div>
                      <div className="bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-accent-600" />
                          <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wide">Product Origin</h4>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 leading-tight">{geoPlaceName}, Zhejiang Province</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">{product.category?.name || product.name} wholesale hub in China</p>
                        <div className="mt-3 pt-3 border-t border-ink-100 space-y-1.5">
                          <p className="text-[11px] text-ink-600"><span className="font-semibold text-navy-800">Factory Inspection:</span> On-site QC available</p>
                          <p className="text-[11px] text-ink-600"><span className="font-semibold text-navy-800">Certifications:</span> ISO, BSCI, CE/RoHS, FSC (per product)</p>
                          <p className="text-[11px] text-ink-600"><span className="font-semibold text-navy-800">Private Label:</span> Logo printing, custom packaging, OEM/ODM</p>
                        </div>
                      </div>
                      <div className="bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-4 h-4 text-accent-600" />
                          <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wide">Global Shipping</h4>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 leading-tight">DHL · FedEx · UPS · Air · Sea Freight</p>
                        <p className="text-[11px] text-ink-500 mt-0.5">Express to 180+ countries · Door-to-door delivery</p>
                        <div className="mt-3 pt-3 border-t border-ink-100 space-y-1.5">
                          <p className="text-[11px] text-ink-600 flex justify-between"><span>🇺🇸 US / CA / UK / EU:</span><span className="font-semibold text-navy-800">5-8 days</span></p>
                          <p className="text-[11px] text-ink-600 flex justify-between"><span>🌏 AU / NZ / ME / SA:</span><span className="font-semibold text-navy-800">7-10 days</span></p>
                          <p className="text-[11px] text-ink-600 flex justify-between"><span>🚢 Sea Freight (LCL/ FCL):</span><span className="font-semibold text-navy-800">25-40 days</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-ink-50/80 px-5 py-3 border-t border-ink-200 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] text-ink-500 leading-tight">
                        <span className="font-bold text-navy-800">Search terms buyers use:</span> {buildSchemaKeywords(seoProductForMeta).split(', ').filter((_, i) => i < 8).join(' · ')}
                      </p>
                      <Link href="/products" className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-600 hover:text-accent-700 shrink-0">
                        Browse all products →
                      </Link>
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
                      { label: 'Country of Origin', value: product.supplierCity && product.supplierCity.toLowerCase() !== 'unknown'
                        ? `${product.supplierCity}, Zhejiang, China`
                        : ((product.origin && product.origin.toLowerCase() !== 'unknown')
                          ? `${product.origin}, Zhejiang, China`
                          : 'Yiwu, Zhejiang, China (义乌浙江)') },
                      { label: 'Supplier Location', value: `${geoPlaceName}, Zhejiang Province, P.R. China` },
                      { label: 'MOQ', value: `${product.moq || 12} pieces` },
                      { label: 'Pack Size', value: effectivePackagingInfo?.pcsPerCtn ? `${effectivePackagingInfo.pcsPerCtn} pcs/carton` : `${product.packSize || product.moq || 12} pcs/carton` },
                      ...(effectivePackagingInfo?.boxLength ? [{ label: 'Carton Dimensions', value: `${effectivePackagingInfo.boxLength} × ${effectivePackagingInfo.boxWidth} × ${effectivePackagingInfo.boxHeight} cm (L×W×H)` }] : []),
                      ...(effectivePackagingInfo?.grossWeight ? [{ label: 'Gross Weight', value: `${effectivePackagingInfo.grossWeight} kg/carton` }] : []),
                      ...(effectivePackagingInfo?.volumeCBM ? [{ label: 'Carton Volume', value: `${effectivePackagingInfo.volumeCBM} m³` }] : []),
                      { label: 'Lead Time', value: '7-15 days (samples 2-3 days)' },
                      { label: 'Shipping Ports', value: 'Ningbo / Shanghai / Yiwu ICD' },
                      { label: 'Customization', value: 'OEM / ODM, logo printing, custom packaging' },
                      { label: 'Sample', value: 'Yes — fees refundable on bulk order' },
                      { label: 'Shipping Methods', value: 'DHL, FedEx, UPS, Air Freight, Sea (LCL/FCL)' },
                      { label: 'Payment Terms', value: 'T/T, PayPal, Western Union, L/C, Trade Assurance' },
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
                  fallbackRating={0}
                  fallbackReviewCount={0}
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
                        {/* ✅ next/Image hot-products with lazy loading */}
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="!object-contain !p-1"
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
        <div role="dialog" aria-modal="true" aria-label="Request a quote" className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsQuoteModalOpen(false); setQuoteNotice(null); }} onKeyDown={(e) => { if (e.key === 'Escape') { setIsQuoteModalOpen(false); setQuoteNotice(null); } }} tabIndex={-1}>
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
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-ink-100 bg-white flex-shrink-0">
                  <Image
                    src={images[0] || product.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22400%22%20height%3D%22300%22/%3E%3Crect%20x%3D%2260%22%20y%3D%2275%22%20width%3D%22280%22%20height%3D%22150%22%20rx%3D%2212%22%20fill%3D%22white%22%20stroke%3D%22%23d1d5db%22%20stroke-width%3D%222%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%3EProduct%20Image%3C/text%3E%3C/svg%3E'}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover rounded-lg"
                    onError={(e) => { (e.currentTarget as unknown as HTMLImageElement).style.visibility = 'hidden'; }}
                  />
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
        <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)} onKeyDown={(e) => { if (e.key === 'Escape') setIsLightboxOpen(false); }} tabIndex={-1}>
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
            <Image
              src={images[lightboxIndex] || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22400%22%20height%3D%22300%22/%3E%3Crect%20x%3D%2260%22%20y%3D%2275%22%20width%3D%22280%22%20height%3D%22150%22%20rx%3D%2212%22%20fill%3D%22white%22%20stroke%3D%22%23d1d5db%22%20stroke-width%3D%222%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22160%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%3EProduct%20Lightbox%3C/text%3E%3C/svg%3E'}
              alt={`${product.name} - view ${lightboxIndex + 1}`}
              fill
              sizes="85vw"
              className="object-contain"
              onError={(e) => { (e.currentTarget as unknown as HTMLImageElement).style.visibility = 'hidden'; }}
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
  // Helper: resolve root category for any product's categoryId/slug
  const resolveCatForProduct = (catRef: string): { name: string; slug: string } | null => {
    let c = idToCat.get(catRef) || slugToCat.get(catRef);
    while (c && c.parentId) {
      const p = idToCat.get(c.parentId) || slugToCat.get(c.parentId);
      if (!p) break;
      c = p;
    }
    return c ? { name: c.name, slug: c.slug } : null;
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
  // ✅ Fixed: compare proxyImageUrlDirect(product.image) with already-proxied images array (was mixing raw vs proxied -> always duplicated)
  const proxiedMain = proxyImageUrlDirect(product.image || '');
  if (proxiedMain && !images.includes(proxiedMain)) {
    images = [proxiedMain, ...images];
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
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail/unknown] silent error:', e);
      aplus = null;
    }
  }

  // ✅ Use shared bullet point helper (was ~110 lines of inlined logic)
  const bulletPoints: string[] = (() => {
    try {
      // computeBulletPoints is already imported from @/lib/bullet-points — prefer it over in-house helper
      if (typeof computeBulletPoints === 'function') {
        const fromLib = computeBulletPoints(product);
        if (Array.isArray(fromLib) && fromLib.length >= 3) return fromLib;
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail] silent error caught:', e); }
    return ['Factory-direct pricing from Yiwu, China', 'Global shipping to 180+ countries', 'Custom packaging & private label available', 'Trade assurance with quality guarantee'];
  })();

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
      price: Number(rp.price) || 0,
      priceMax: rp.priceMax ? Number(rp.priceMax) : null,
      image: proxyImageUrlDirect(rp.image || ''),
      category: resolveCatForProduct(rp.categoryId || ''),
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
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail/JSON.parse] silent error:', e);
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
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail/JSON.parse] silent error:', e);
      keywords = [];
    }

    // Parse aplus
    let aplus = null;
    if (product.aplus) {
      try {
        aplus = typeof product.aplus === 'string'
          ? JSON.parse(product.aplus)
          : product.aplus;
      } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail/JSON.parse] silent error:', e);
        aplus = null;
      }
    }

    // ✅ Use shared bullet point helper (was ~110 lines of inlined logic)
    const bulletPoints: string[] = (() => {
      try {
        if (typeof computeBulletPoints === 'function') {
          const fromLib = computeBulletPoints(product);
          if (Array.isArray(fromLib) && fromLib.length >= 3) return fromLib;
        }
      } catch (e: any) { if (typeof console !== 'undefined') console.warn('[ProductDetail] silent error caught:', e); }
      return ['Factory-direct pricing from Yiwu, China', 'Global shipping to 180+ countries', 'Custom packaging & private label available', 'Trade assurance with quality guarantee'];
    })();

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

        // Resolve root category display for each related product
    const resolveRelatedCat = (rpCatId: string) => {
      if (!rpCatId) return null;
      const direct = getCategoryById(rpCatId);
      if (!direct) return null;
      let root = direct;
      while (root && root.parentId) {
        const p = getCategoryById(root.parentId);
        if (!p) break;
        root = p;
      }
      return root ? { name: root.name, slug: root.slug } : null;
    };
    const serializedRelated = relatedProducts.map((rp: any) => ({
      id: rp.id,
      slug: rp.slug,
      name: rp.name,
      price: Number(rp.price) || 0,
      priceMax: rp.priceMax ? Number(rp.priceMax) : null,
      image: proxyImageUrlDirect(rp.image || ''),
      category: resolveRelatedCat(rp.categoryId || ''),
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
