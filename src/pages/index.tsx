import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import {
  ChevronRight,
  ArrowRight,
  Gem,
  Scissors,
  ShoppingBag,
  Home as HomeIcon,
  Gift,
  Gamepad2,
  Flame,
  Tag,
  Package,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  Award,
  SlidersHorizontal,
  X,
  Shirt,
  Cpu,
  Laptop,
  ChefHat,
  Dumbbell,
  Wrench,
  Music,
  Sparkle,
  Baby,
  Factory,
  Boxes,
  Plane,
} from 'lucide-react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import ProductCard from '@/components/ProductCard';
import { resolveImageUrlServerSide } from '@/lib/image-utils';
import { SITE_URL, SITE_OG_IMAGE, SITE_NAME, SITE_DESCRIPTION, SITE_COMPANY } from '@/lib/site';
interface ProductVariantPreview {
  id: string;
  sku?: string | null;
  slug?: string;
  color?: string | null;
  colorHex?: string | null;
  size?: string | null;
  capacity?: string | null;
  layer?: string | null;
  pack?: string | null;
  price?: number;
  image?: string;
}
interface Product {
  id: number | string;
  slug?: string;
  name: string;
  description?: string;
  category: { name: string; slug: string };
  priceMin: number;
  price?: number;
  priceMax: number;
  image: string;
  material?: string | null;
  moq?: number;
  sku?: string | null;
  color?: string | null;
  keywords?: string[];
  bulletPoints?: string[];
  createdAt?: string;
  // ===== 变体扩展 =====
  isParent?: boolean;
  parentId?: string | null;
  variants?: ProductVariantPreview[];
  variantOptions?: any;
}

interface CategoryInfo {
  id: string | number;
  name: string;
  slug: string;
  productCount: number;
  icon?: string;
  badge?: string | null;
}

const categoryIconMap: Record<string, any> = {
  'fashion-jewelry': Gem,
  'garment-accessories': Scissors,
  'accessories': Sparkles,
  'bags': ShoppingBag,
  'home-decor-crafts': HomeIcon,
  'toys': Gamepad2,
  'gift': Gift,
  'home-living': HomeIcon,
  'mother-baby-toys': Baby,
  'apparel-shoes': Shirt,
  'electronics': Cpu,
  'phone-accessories': Laptop,
  'kitchen-supplies': ChefHat,
  'beauty-personal-care': Sparkle,
  'sports-outdoor': Dumbbell,
  'auto-tools': Wrench,
  'other': Package,
  'hardware-home': Wrench,
  'stationery-office': Tag,
  'home-appliances': HomeIcon,
  'musical-instruments': Music,
  'pet-supplies': Gamepad2,
};

const valueProps = [
  { icon: Truck, label: 'Global Shipping', desc: 'To 180+ countries' },
  { icon: ShieldCheck, label: 'Secure Payment', desc: '100% protected' },
  { icon: Award, label: 'Premium Quality', desc: 'Verified factories' },
  { icon: Star, label: 'Factory Audited', desc: 'Verified Yiwu suppliers' },
];

function getDynamicBadge(slug: string, index: number, count: number): string | null {
  if (index === 0) return 'Best Seller';
  if (index === 1) return 'Popular';
  if (index === 2) return 'Trending';
  if (count >= 50) return 'Top Rated';
  if (count >= 20) return 'New';
  return null;
}


// Inline SVG placeholder used on next/Image errors (keeps layout stable without extra fetch)
function homePlaceholderSvg(name: string, gradient: [string,string] = ['#f3f4f6','#e5e7eb']) {
  const [a,b] = gradient;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><rect x="30" y="50" width="140" height="100" rx="8" fill="white" stroke="#d1d5db" stroke-width="2"/><circle cx="70" cy="80" r="10" fill="#fcd34d"/><path d="M50 140 L80 105 L100 125 L125 95 L160 140 Z" fill="#d1d5db"/><text x="100" y="178" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#9ca3af">${(name||'').slice(0,18)}</text></svg>`);
}
const HERO_FALLBACK = ['#fef3c7','#fed7aa'] as [string,string];
// ---------------------------
// INLINE HELPERS
// ---------------------------
function catImgBg(slug: string): string {
  // Consistent palette per category slug
  const palettes: Array<[string, string, string]> = [
    ['#FBF7EC', '#F3EDDF', '#DFB860'],
    ['#F3F6FB', '#E5ECF5', '#6D8EBA'],
    ['#FFF5F0', '#FFE3D4', '#F46C38'],
    ['#EEFBF2', '#D5F6DE', '#3EB55F'],
    ['#F5EBCF', '#EBD59B', '#B8860B'],
  ];
  let h = 0; for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const [a, b, accent] = palettes[h % palettes.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

const MARKETS = [
  { flag: '🇺🇸', name: 'United States' },
  { flag: '🇬🇧', name: 'United Kingdom' },
  { flag: '🇩🇪', name: 'Germany' },
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇮🇹', name: 'Italy' },
  { flag: '🇪🇸', name: 'Spain' },
  { flag: '🇦🇪', name: 'UAE · Dubai' },
  { flag: '🇸🇦', name: 'Saudi Arabia' },
  { flag: '🇶🇦', name: 'Qatar' },
  { flag: '🇪🇬', name: 'Egypt' },
  { flag: '🇳🇬', name: 'Nigeria' },
  { flag: '🇰🇪', name: 'Kenya' },
  { flag: '🇿🇦', name: 'South Africa' },
  { flag: '🇲🇽', name: 'Mexico' },
  { flag: '🇧🇷', name: 'Brazil' },
  { flag: '🇮🇳', name: 'India' },
  { flag: '🇮🇩', name: 'Indonesia' },
  { flag: '🇦🇺', name: 'Australia' },
  { flag: '🇨🇦', name: 'Canada' },
  { flag: '🇳🇱', name: 'Netherlands' },
];

const SOURCING_STEPS = [
  { n: '01', title: 'Send Inquiry', desc: 'Pick products or submit your list with target quantity & destination.', icon: '📝' },
  { n: '02', title: 'Get Quote in 2h', desc: 'Factory-direct price sheet, MOQ confirmation & shipping options.', icon: '💰' },
  { n: '03', title: 'Quality Inspected', desc: 'Pre-shipment QC with photos · Third-party inspection accepted.', icon: '🔍' },
  { n: '04', title: 'Ship Worldwide', desc: 'Sea · Air · Express · Door-to-door to 180+ countries.', icon: '🚢' },
];

const Home = ({ products, newArrivals, categories, categoryProductsMap }: { products: Product[]; newArrivals: Product[]; categories: CategoryInfo[]; categoryProductsMap: Record<string, Product[]> }) => {
  const featured = products.slice(0, 16);
  const topDeals = products.slice(0, 8);
  const effectiveNewArrivals = (newArrivals && newArrivals.length > 0 ? newArrivals : products.slice(0, 6));

  return (
    <Layout>
      <Head>
        <title>{SITE_NAME + " | B2B Wholesale · Yiwu Factory-Direct — Jewelry, Bags, Home & 964+ SKUs"}</title>
        <meta name="description" content={SITE_DESCRIPTION + " — Low MOQ from 12 pcs, 12+ years Yiwu sourcing, shipping to 180+ countries. Factory-direct prices for importers, retailers & distributors worldwide."} />
        <meta name="keywords" content="wholesale yiwu, b2b sourcing china, yiwu agent, fashion jewelry wholesale, bag bulk order, low moq supplier, yiwu market, import from china, private label manufacturer, etruemart" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={SITE_URL + "/"} />
        <meta property="og:title" content={SITE_NAME + " | B2B Wholesale · Yiwu Factory-Direct"} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL + "/"} />
        <meta property="og:image" content={SITE_OG_IMAGE} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME + " | B2B Wholesale · Yiwu Factory-Direct"} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={SITE_OG_IMAGE} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL + "/",
            description: SITE_DESCRIPTION,
            inLanguage: 'en-US',
            publisher: {
              '@type': 'Organization',
              name: SITE_COMPANY,
              url: SITE_URL,
              logo: { '@type': 'ImageObject', url: SITE_OG_IMAGE },
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Yiwu, Jinhua',
                addressRegion: 'Zhejiang',
                addressCountry: 'CN',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+86-18767960499',
                email: 'yeatrusourcing@gmail.com',
                contactType: 'customer service',
                areaServed: 'Worldwide',
                availableLanguage: ['English', 'Chinese', 'Arabic', 'French', 'Spanish']
              }
            },
            potentialAction: {
              '@type': 'SearchAction',
              target: SITE_URL + "/products?q={search_term_string}",
              'query-input': 'required name=search_term_string'
            }
          })
        }} />
      </Head>

      {/* ============================================================
           SECTION 1 — HERO
           ============================================================ */}
      <section className="relative overflow-hidden bg-hero-gradient text-white border-b border-white/10">
        <div className="absolute inset-0 bg-hero-texture pointer-events-none" />
        <div className="absolute inset-0 bg-grid-navy opacity-[0.06] pointer-events-none" />

        <div className="section relative pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 items-center gap-10 lg:gap-12">
            {/* ---- Copy ---- */}
            <div className="lg:col-span-7 text-center lg:text-left max-w-none lg:max-w-2xl mx-auto lg:mx-0 rise-in">
              <span className="kickback mb-6 inline-flex">
                <Gem className="w-3.5 h-3.5" /> Trusted B2B Partner · Est. 2012
              </span>
              <h1 className="font-display font-black text-4xl sm:text-display-2 lg:text-display-1 tracking-tight leading-[1.02] text-white mb-6">
                Yiwu Wholesale Sourcing
                <span className="block mt-2">
                  <span className="text-gold-gradient">Factory-Direct Prices.</span>
                  <span className="block lg:inline"> </span>
                  <span className="font-serif italic font-medium text-navy-50">Global Shipping.</span>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-navy-50/85 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                <strong className="text-white font-semibold">964 curated SKUs</strong> sourced directly from 2,000+ verified Yiwu factories —
                from fashion jewelry to home goods, toys, bags, beauty and more. Low MOQ from 12 pcs ·
                private label &amp; OEM welcome · QC before every shipment.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Link href="/products" className="btn-primary btn-xl shadow-gold-glow">
                  📦 Browse 964 Products
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="btn-navy btn-xl border-white/15 bg-white/5 hover:bg-white/10">
                  💬 Request Free Quote
                </Link>
              </div>

              {/* Trust stats row */}
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:gap-8 gap-4 justify-center lg:justify-start pt-2">
                <div className="text-center lg:text-left">
                  <p className="font-display font-black text-3xl sm:text-4xl text-white tabular">964<span className="text-gold-400">+</span></p>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy-200/70 mt-1">Live SKUs</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-display font-black text-3xl sm:text-4xl text-white tabular">180<span className="text-gold-400">+</span></p>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy-200/70 mt-1">Countries Served</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-display font-black text-3xl sm:text-4xl text-white tabular">12<span className="text-gold-400">yrs</span></p>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy-200/70 mt-1">In Yiwu Market</p>
                </div>
                <div className="hidden sm:block text-center lg:text-left">
                  <p className="font-display font-black text-3xl sm:text-4xl text-white tabular">4,000<span className="text-gold-400">+</span></p>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-navy-200/70 mt-1">Happy Buyers</p>
                </div>
              </div>
            </div>

            {/* ---- Premium Product Collage ---- */}
            <div className="lg:col-span-5 relative rise-in" style={{ animationDelay: '120ms' }}>
              {/* Floating decorative tag */}
              <div className="absolute -top-3 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-gold-300/50 shadow-gold-glow">
                <span className="text-xs">🏭</span>
                <div className="leading-tight">
                  <p className="text-[10px] font-bold text-gold-700 tracking-wider uppercase">Direct Exporter</p>
                  <p className="text-[11px] font-black text-navy-900">Yiwu · Verified Supplier</p>
                </div>
              </div>

              <div className="relative mx-auto max-w-[480px]">
                {/* Main showcase card */}
                <div className="premium-card relative aspect-[4/5] overflow-hidden">
                  {/* Gold border */}
                  <div className="absolute inset-0 gold-border-wrap rounded-3xl pointer-events-none" />
                  <div className="absolute inset-1 rounded-[1.35rem] overflow-hidden bg-gradient-to-br from-gold-50 via-white to-sand-100 p-3">
                    {featured[0] ? (
                      <Image
                        src={featured[0].image}
                        alt={featured[0].name}
                        fill
                        priority
                        sizes="(max-width: 1024px) 80vw, 420px"
                        className="object-cover rounded-2xl"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          if ((el as any).dataset.fb) return;
                          (el as any).dataset.fb = '1';
                          (el as any).src = homePlaceholderSvg(featured[0]?.name || 'Featured', ['#FBF7EC','#F3EDDF']);
                        }}
                      />
                    ) : null}
                  </div>
                  {/* Top-right MOQ badge */}
                  <div className="absolute top-5 right-5 z-10 tag-gold !text-[11px] !px-3 !py-1.5 shadow-card">
                    🔥 MOQ {featured[0]?.moq || 12} pcs
                  </div>
                  {/* Bottom price strip */}
                  <div className="absolute left-4 right-4 bottom-4 z-10 p-3.5 rounded-2xl bg-white/95 backdrop-blur border border-sand-200 shadow-card">
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Featured Wholesale · {featured[0]?.sku || ''}</p>
                        <p className="mt-1 text-sm font-bold text-navy-900 leading-snug line-clamp-2">
                          {featured[0]?.name || 'Premium Yiwu Selection'}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2 flex-wrap tabular">
                          <span className="text-xl sm:text-[24px] font-black text-coral-500 leading-none">
                            ${featured[0] ? Number(featured[0].priceMin || featured[0].price || 0).toFixed(2) : '0.00'}
                          </span>
                          <span className="price-old">${featured[0] ? (Number(featured[0].priceMin || featured[0].price || 0) * 1.4).toFixed(2) : '0.00'}</span>
                          <span className="tag-coral !py-0.5">Save 40%</span>
                        </div>
                      </div>
                      <Link
                        href={featured[0]?.slug ? `/product/${featured[0].slug}` : `/product/${featured[0]?.id || '0'}`}
                        className="shrink-0 btn-cta btn-sm gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating small product card 1 */}
                <div className="hidden sm:block absolute -left-8 top-20 w-[150px] z-10 animate-float-y panel-hover !p-2 !rounded-2xl rotate-[-6deg]">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gold-50 to-sand-100">
                    {featured[1] && (
                      <Image
                        src={featured[1].image}
                        alt={featured[1].name}
                        fill
                        sizes="150px"
                        className="object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                      />
                    )}
                  </div>
                  <div className="mt-1.5 px-1">
                    <p className="text-[10px] font-black text-navy-900 leading-tight line-clamp-1">Trending</p>
                    <p className="text-[11px] font-bold text-coral-500 tabular mt-0.5">
                      ${featured[1] ? Number(featured[1].priceMin || 0).toFixed(2) : '--'}
                    </p>
                  </div>
                </div>
                {/* Floating small product card 2 */}
                <div className="hidden sm:block absolute -right-6 bottom-24 w-[150px] z-10 animate-float-y panel-hover !p-2 !rounded-2xl rotate-[5deg]" style={{ animationDelay: '600ms' }}>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-navy-50 to-white">
                    {featured[2] && (
                      <Image
                        src={featured[2].image}
                        alt={featured[2].name}
                        fill
                        sizes="150px"
                        className="object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                      />
                    )}
                  </div>
                  <div className="mt-1.5 px-1">
                    <p className="text-[10px] font-black text-navy-900 leading-tight line-clamp-1">Best Seller</p>
                    <p className="text-[11px] font-bold text-coral-500 tabular mt-0.5">
                      ${featured[2] ? Number(featured[2].priceMin || 0).toFixed(2) : '--'}
                    </p>
                  </div>
                </div>

                {/* Mini trust pill */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 trust-pill">
                  <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                  Live Inventory · Updates Weekly
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gold trim separator */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gold-border pointer-events-none" />
      </section>

      {/* ============================================================
           SECTION 2 — MARKETS MARQUEE
           ============================================================ */}
      <section className="relative bg-trust-stripe border-b border-sand-200 overflow-hidden py-5">
        <div className="section">
          <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.3em] text-navy-700/70">
            Shipping to 180+ Countries · Global Buyers
          </p>
        </div>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="flex gap-4 w-max animate-marquee pr-4">
            {[...MARKETS, ...MARKETS, ...MARKETS].map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-5 py-2 rounded-xl bg-white border border-sand-200 shadow-paper min-w-[180px]"
              >
                <span className="text-2xl leading-none">{m.flag}</span>
                <div>
                  <p className="text-[13px] font-black text-navy-900 leading-tight">{m.name}</p>
                  <p className="text-[10px] text-ink-400 font-semibold tracking-wide">Door to door ✓</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           SECTION 3 — WHY CHOOSE US (value props)
           ============================================================ */}
      <section className="section section-pad !py-16">
        <div className="text-center mb-10">
          <span className="kicker">Why Importers Choose eTrueMart</span>
          <h2 className="section-title mt-4 mx-auto text-balance max-w-3xl">
            Built for <span className="text-gold-gradient">Serious B2B Buyers</span>.<br /> Not Casual Shoppers.
          </h2>
          <p className="section-sub mx-auto text-center">
            Everything a professional sourcing partner needs — factory-direct pricing, quality control, flexible MOQ, and global logistics you can trust.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { icon: Factory, title: 'Factory Direct', sub: 'No middlemen', desc: 'We buy direct from 2,000+ vetted Yiwu factories — up to 60% cheaper than local distributors.', tag: 'Save 40~60%', tone: 'gold' as const },
            { icon: Boxes, title: 'MOQ from 12 pcs', sub: 'Small-batch friendly', desc: 'Start with tiny test orders before committing to full containers — perfect for new stores & markets.', tag: 'Low Risk', tone: 'coral' as const },
            { icon: Plane, title: 'Ships to 180+', sub: 'Sea · Air · Express', desc: 'Consolidate from dozens of suppliers, save on freight with our weekly LCL/FCL departures.', tag: 'Global', tone: 'navy' as const },
            { icon: ShieldCheck, title: '100% QC Before Ship', sub: 'Photos + Reports', desc: 'Every order inspected in our warehouse — third-party inspection (SGS, BV) fully supported.', tag: 'Safe', tone: 'green' as const },
          ].map(({ icon: Icon, title, sub, desc, tag, tone }) => (
            <div
              key={title}
              className="relative group panel-hover !rounded-3xl p-6 sm:p-7 overflow-hidden"
            >
              {/* Decorative background accent */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold-50/80 group-hover:bg-gold-100 transition-colors" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white flex items-center justify-center shadow-navy-glow border border-white/5 shrink-0">
                    <Icon className="w-7 h-7 text-gold-300" strokeWidth={2} />
                  </div>
                  {tone === 'gold'  && <span className="tag-gold">{tag}</span>}
                  {tone === 'coral' && <span className="tag-coral">{tag}</span>}
                  {tone === 'navy'  && <span className="tag-navy">{tag}</span>}
                  {tone === 'green' && <span className="tag-green">{tag}</span>}
                </div>
                <h3 className="font-display font-extrabold text-xl text-navy-900 leading-tight">{title}</h3>
                <p className="text-sm font-bold text-gold-700 mt-1">{sub}</p>
                <p className="mt-3 text-sm text-ink-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
           SECTION 4 — SHOP BY CATEGORY GRID
           ============================================================ */}
      <section className="section section-pad !pt-0">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <span className="kicker">Shop by Category</span>
            <h2 className="section-title mt-4 max-w-2xl text-balance">
              <span className="text-gold-gradient">{categories.length || 20}+</span> Curated Wholesale Categories
            </h2>
            <p className="section-sub">
              From hot-selling fashion accessories to bulk home goods — find your next bestseller.
            </p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex btn-outline btn-lg">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {categories.slice(0, 18).map((cat, idx) => {
            const Icon = (categoryIconMap[cat.slug] as any) || Package;
            const thumb = categoryProductsMap[cat.slug]?.[0];
            const tone: any = ['gold','coral','navy','green','sand'][idx % 5];
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative panel-hover !rounded-3xl p-4 sm:p-5 flex flex-col items-center text-center overflow-hidden min-h-[200px] sm:min-h-[220px]"
              >
                {/* Background thumb (faded) */}
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: catImgBg(cat.slug) }}
                />
                {thumb && (
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-30 group-hover:opacity-60 transition-all group-hover:scale-110 overflow-hidden border-4 border-white shadow-card">
                    <div className="relative w-full h-full">
                      <Image
                        src={thumb.image}
                        alt={cat.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                      />
                    </div>
                  </div>
                )}
                <div className="relative z-[1] flex flex-col items-center w-full">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-card border border-sand-200 group-hover:border-gold-300 transition-all group-hover:shadow-gold-glow group-hover:scale-[1.08] ${
                    tone === 'gold'  ? 'bg-gradient-to-br from-gold-100 to-gold-50' :
                    tone === 'coral' ? 'bg-gradient-to-br from-coral-100 to-coral-50' :
                    tone === 'green' ? 'bg-gradient-to-br from-success-100 to-success-50' :
                    tone === 'navy'  ? 'bg-gradient-to-br from-navy-50 to-white' :
                                       'bg-gradient-to-br from-sand-100 to-sand-50'
                  }`}>
                    <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      tone === 'gold'  ? 'text-gold-700' :
                      tone === 'coral' ? 'text-coral-600' :
                      tone === 'green' ? 'text-success-700' :
                      tone === 'navy'  ? 'text-navy-700' :
                                         'text-ink-700'
                    }`} strokeWidth={1.9} />
                  </div>
                  <h3 className="mt-4 font-display font-extrabold text-base sm:text-[17px] text-navy-900 leading-tight line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-ink-400 tabular">
                    <span className="text-gold-600">{cat.productCount}</span> products
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-navy-700 group-hover:text-gold-700 transition-colors">
                    Shop now
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Link href="/products" className="btn-outline w-full justify-center">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ============================================================
           SECTION 5 — FEATURED / BEST SELLERS
           ============================================================ */}
      <section className="section section-pad !pt-0">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <span className="kicker"><Flame className="w-3 h-3" /> Best Sellers</span>
            <h2 className="section-title mt-4 text-balance max-w-2xl">
              Top-Rated Wholesale Picks
            </h2>
            <p className="section-sub">
              Most-ordered products by our global buyers — proven sell-through, stable supply.
            </p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex btn-navy btn-lg">
            View Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {topDeals.map((p, i) => {
            const badge = i === 0 ? '🔥 Best Seller' : i === 1 ? '⭐ Staff Pick' : i === 2 ? '💎 Premium' : null;
            const tone: any = i === 0 ? 'coral' : i === 1 ? 'gold' : i === 2 ? 'navy' : null;
            return (
              <ProductCard
                key={p.id}
                product={p as any}
                badge={badge}
                badgeTone={tone}
              />
            );
          })}
        </div>
      </section>

      {/* ============================================================
           SECTION 6 — SOURCING PROCESS (how it works)
           ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-sand-100/70 -z-10" />
        <div className="absolute inset-0 bg-diagonal opacity-60 -z-10" />
        <div className="section section-pad">
          <div className="text-center mb-14">
            <span className="kicker">Simple 4-Step Sourcing</span>
            <h2 className="section-title mt-4 mx-auto text-balance max-w-3xl">
              How <span className="text-gold-gradient">eTrueMart</span> Works
            </h2>
            <p className="section-sub mx-auto text-center">
              A streamlined, transparent process honed over 12 years of Yiwu sourcing.
            </p>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* connector line (desktop) */}
            <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5" style={{ background: 'linear-gradient(90deg,#DFB860,#B8860B)' }} />
            {SOURCING_STEPS.map((s) => (
              <div key={s.n} className="relative panel-hover !rounded-3xl p-6 sm:p-7 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center text-3xl shadow-paper border border-gold-300/50 shrink-0">
                    {s.icon}
                  </div>
                  <span className="font-display font-black text-3xl text-sand-200 tabular">{s.n}</span>
                </div>
                <h3 className="font-display font-extrabold text-xl text-navy-900 leading-tight mb-2">{s.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
           SECTION 7 — NEW ARRIVALS
           ============================================================ */}
      <section className="section section-pad">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <span className="kicker"><Sparkles className="w-3 h-3" /> New Arrivals</span>
            <h2 className="section-title mt-4 text-balance max-w-2xl">
              Just In · <span className="editorial italic text-ink-600">Latest Factory Drops</span>
            </h2>
            <p className="section-sub">
              Freshly sourced from Yiwu production lines — be first to market.
            </p>
          </div>
          <Link href="/products" className="hidden sm:inline-flex btn-primary btn-lg">
            All New <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {effectiveNewArrivals.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p as any} badge="✨ NEW" badgeTone="gold" />
          ))}
        </div>
      </section>

      {/* ============================================================
           SECTION 8 — CTA BAND (Free Quote)
           ============================================================ */}
      <section className="section !pb-16">
        <div className="relative premium-card overflow-hidden bg-cta-gradient text-white">
          <div className="absolute inset-0 bg-hero-texture opacity-80 pointer-events-none" />
          <div className="absolute inset-0 bg-dots-gold opacity-10 pointer-events-none" />
          {/* Gold trim top */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gold-border pointer-events-none" />

          <div className="relative grid lg:grid-cols-12 gap-8 p-8 sm:p-12 lg:p-14 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-gold-200 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5">
                💬 2-hour response · Mon — Sun
              </span>
              <h2 className="mt-5 font-display font-black text-3xl sm:text-display-3 lg:text-[2.5rem] leading-[1.1] tracking-tight text-white">
                Need a Custom Quote or <span className="text-gold-gradient">Product Sourcing?</span>
              </h2>
              <p className="mt-4 text-base lg:text-lg text-navy-50/85 leading-relaxed max-w-2xl">
                Tell us what you&apos;re looking for — product list, links, photos or rough specs.
                Our Yiwu-based sourcing team will send you factory-direct prices, MOQ confirmation and door-to-door shipping cost in <strong className="text-gold-300">under 2 hours</strong>.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary btn-xl shadow-gold-glow">
                  📨 Request Free Quote
                </Link>
                <a
                  href="https://wa.me/8618767960499?text=Hello!%20I%20want%20to%20get%20a%20wholesale%20quote%20from%20eTrueMart."
                  target="_blank" rel="noreferrer noopener"
                  className="btn btn-xl !text-white border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur transition-all"
                >
                  💬 WhatsApp Sales Team
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-white/95 backdrop-blur border border-white/20 shadow-card p-6 sm:p-7 text-navy-900">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <Gem className="w-5.5 h-5.5 text-white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="font-display font-extrabold text-lg">Instant Estimate</p>
                    <p className="text-[11px] text-ink-500 font-semibold">Typical order summary</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    ['🎁 Mixed order sample box (100 pcs)', '$250 ~ $500'],
                    ['📦 Small carton (1,000 pcs, 5 SKUs)', '$800 ~ $2,500'],
                    ['🚚 LCL Pallet (5,000 pcs)', '$3,500 ~ $10,000'],
                    ['🚢 Full 20\' GP Container', '$18,000 ~ $50,000+'],
                  ].map(([label, price]) => (
                    <li key={label} className="flex items-center justify-between gap-3 py-2.5 border-b border-sand-100 last:border-0">
                      <span className="text-sm font-semibold text-navy-800">{label}</span>
                      <span className="text-sm font-black text-coral-600 tabular whitespace-nowrap">{price}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-ink-400 leading-relaxed">
                  * Indicative pricing only — final cost depends on product specs, quantity, destination &amp; shipping method. Get a free, exact quote from our sales team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;

// Seed data cache
let homeSeedCache: { categories: any[]; products: any[] } | null = null;

function loadHomeSeedData() {
  if (homeSeedCache) return homeSeedCache;
  const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  if (!fs.existsSync(seedPath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    homeSeedCache = { categories: raw.categories || [], products: raw.products || [] };
    return homeSeedCache;
  } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Home/loadHomeSeedData] failed to read seed-data.json:', e);
    return null;
  }
}

export const getServerSideProps = async () => {
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    const seedData = loadHomeSeedData();
    if (seedData) {
      const { products: rawProducts, categories } = seedData;
      // ========== 变体过滤：只显示父产品 + 单品（排除子产品）==========
      // 父产品：isParent===true ；单品：!parentId && isParent!==true
      const filterListOnly = (arr: any[]) => arr.filter((p: any) => {
        if (p.parentId) return false; // 子产品，不展示
        return true; // 父产品(isParent=true) + 单品(parentId=null且isParent=false) 都保留
      });
      // Build 辅助：所有产品 -> id→product，给父产品提取子款 previews
      const byId = new Map<string, any>();
      for (const p of rawProducts) byId.set(String(p.id), p);
      const parentChildren = new Map<string, any[]>();
      for (const p of rawProducts) {
        if (p.parentId) {
          if (!parentChildren.has(p.parentId)) parentChildren.set(p.parentId, []);
          parentChildren.get(p.parentId)!.push(p);
        }
      }
      const attachVariantPreview = (p: any): any[] | undefined => {
        if (!(p.isParent === true)) return undefined;
        const children = parentChildren.get(String(p.id));
        if (!children || children.length === 0) return undefined;
        return children.map((c: any) => {
          let opts: any = {};
          if (c.variantOptions) {
            try { opts = typeof c.variantOptions === 'string' ? JSON.parse(c.variantOptions) : c.variantOptions; } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Home/attachVariantPreview] JSON.parse(c.variantOptions) failed:', e); }
          }
          return {
            id: c.id,
            sku: c.sku,
            slug: c.slug,
            color: opts.color || c.color || null,
            colorHex: opts.colorHex || null,
            size: opts.size || c.size || null,
            capacity: opts.capacity || null,
            layer: opts.layer || null,
            pack: opts.pack || null,
            price: Number(c.priceMin ?? c.price ?? p.priceMin ?? 0),
            image: resolveImageUrlServerSide(c.image || ''),
          };
        });
      };
      // Sort by revenue (salesCount × price) descending, drop price=0 invalid, take top 50
      const revenue = (p: any) => (p.salesCount || 0) * (Number(p.price ?? p.priceMin ?? 0) || 0);
      const sorted = filterListOnly([...rawProducts])
        .filter((p: any) => Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0)
        .sort((a, b) => revenue(b) - revenue(a))
        .slice(0, 50);

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

      // Compute descendant slugs for product count
      const getDescendantSlugs = (catSlug: string): string[] => {
        const result = [catSlug];
        const cat = slugToCat.get(catSlug);
        if (!cat) return result;
        const children = categories.filter(c => c.parentId === cat.id);
        for (const child of children) {
          result.push(...getDescendantSlugs(child.slug));
        }
        return result;
      };

      // Build product count per root category (including descendants) — only parent+standalone, exclude children
      const productCountByRoot = new Map<string, number>();
      for (const p of rawProducts) {
        if (p.parentId) continue; // 不统计子产品
        const catId = p.categoryId || '';
        const rootCat = getRootCat(catId);
        if (rootCat) {
          productCountByRoot.set(rootCat.slug, (productCountByRoot.get(rootCat.slug) || 0) + 1);
        }
      }

      // Build the categories list (root categories sorted by product count)
      const rootCategories = categories
        .filter((c: any) => !c.parentId)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: productCountByRoot.get(c.slug) || 0,
        }))
        .filter((c: CategoryInfo) => c.productCount > 0)
        .sort((a, b) => b.productCount - a.productCount);

      const formatProduct = (p: any): Product => {
        const image = resolveImageUrlServerSide(p.image || '');

        let images: string[] = [];
        if (p.images) {
          let parsed = p.images;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch (e: any) { if (typeof console !== 'undefined') console.warn('[index] nested JSON parse failed:', e?.message || e); parsed = []; }
          }
          if (Array.isArray(parsed)) {
            images = parsed
              .filter((img: string) => typeof img === 'string' && img.length > 0)
              .map(resolveImageUrlServerSide);
          }
        }
        if (images.length === 0 && image) images = [image];

        const catId = p.categoryId || '';
        const rootCat = getRootCat(catId);
        const directCat = idToCat.get(catId) || slugToCat.get(catId);

        // 首页 ProductCard 仅需以下字段；裁剪 description/keywords/bulletPoints/
        // createdAt/variantOptions 等无用字段，SSR props 可降 ~470KB
        return {
          id: p.slug || p.id,
          slug: p.slug,
          name: p.name,
          priceMin: Number(p.price) || 0,
          priceMax: p.priceMax ? Number(p.priceMax) : Number(p.price) || 0,
          image,
          category: rootCat
            ? { name: rootCat.name, slug: rootCat.slug }
            : directCat
              ? { name: directCat.name, slug: directCat.slug }
              : { name: 'Other', slug: 'other' },
          material: p.material || null,
          moq: Number(p.moq) || 1,
          sku: p.sku || null,
          color: p.color || null,
          isParent: p.isParent === true,
          parentId: p.parentId || null,
          variants: attachVariantPreview(p),
        };
      };

      // 预处理：只筛选 + 排重一次，供 Top50 / NewArrivals / CategoryBlocks 三处复用
      const filteredAll = filterListOnly(rawProducts)
        .filter((p: any) => Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0);
      const byRevenue = [...filteredAll].sort((a, b) => revenue(b) - revenue(a));
      const byCreatedAt = [...filteredAll].sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime());

      // Top 50 products for hero/trending
      const products = byRevenue.slice(0, 50).map(formatProduct);

      // New Arrivals: 6 latest products by createdAt (from ALL products, not just top 50)
      const newArrivals = byCreatedAt.slice(0, 6).map(formatProduct);

      // Top 5 products per root category (for "Shop by Category" blocks) — 过滤掉子产品
      const sortedAll = byRevenue;
      const categoryProductsMap: Record<string, Product[]> = {};
      for (const rootCat of rootCategories) {
        const catProducts = sortedAll
          .filter((p: any) => {
            const rc = getRootCat(p.categoryId || '');
            return rc && rc.slug === rootCat.slug;
          })
          .slice(0, 5)
          .map(formatProduct);
        categoryProductsMap[rootCat.slug] = catProducts;
      }

      return { props: { products, newArrivals, categories: rootCategories, categoryProductsMap } };
    }

    // Vercel fallback: seed-data.json not available, return empty gracefully
    return { props: { products: [], newArrivals: [], categories: [], categoryProductsMap: {} } };
  }

  // Local dev: use SQLite
  try {
    const { getDatabase } = await import('@/lib/db');
    const database = getDatabase();
    
    // 合并两次查询：一次性取出全部已发布产品（全量用于 newArrivals + categoryBlocks，
    // 再按成交金额切片取 Top50），避免对 products 表做两次全表扫描
    const allRawProducts = database.prepare('SELECT * FROM products WHERE isPublished = 1 ORDER BY (salesCount * price) DESC').all() as any[];
    const rawCategories = database.prepare('SELECT * FROM categories ORDER BY sortOrder ASC').all() as any[];

    // Build category lookup with root resolution
    const slugToCat = new Map();
    const idToCat = new Map();
    for (const cat of rawCategories) {
      slugToCat.set(cat.slug, cat);
      idToCat.set(cat.id, cat);
    }

    const getRootCat = (catIdOrSlug: string) => {
      let current = idToCat.get(catIdOrSlug) || slugToCat.get(catIdOrSlug);
      while (current && current.parentId) {
        const parent = idToCat.get(current.parentId) || slugToCat.get(current.parentId);
        if (!parent) break;
        current = parent;
      }
      return current;
    };

    // Compute product counts per root category
    const productCountByRoot = new Map<string, number>();
    for (const p of allRawProducts) {
      const catId = p.categoryId || '';
      const rootCat = getRootCat(catId);
      if (rootCat) {
        productCountByRoot.set(rootCat.slug, (productCountByRoot.get(rootCat.slug) || 0) + 1);
      }
    }

    const rootCategories = rawCategories
      .filter((c: any) => !c.parentId)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: productCountByRoot.get(c.slug) || 0,
      }))
      .filter((c: CategoryInfo) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);

    const formatProductLocal = (p: any): Product => {
      const image = resolveImageUrlServerSide(p.image || '');
      
      let images: string[] = [];
      try {
        const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(parsed)) {
          images = parsed.filter((img: string) => typeof img === 'string' && img.length > 0).map(resolveImageUrlServerSide);
        }
      } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Home/formatProductLocal] JSON.parse(p.images) failed:', e); }
      if (images.length === 0 && image) images = [image];
      
      const catId = p.categoryId || '';
      const rootCat = getRootCat(catId);
      const directCat = idToCat.get(catId) || slugToCat.get(catId);
      
      // 与 seed 分支 formatProduct 保持同样字段裁剪：减去 description/keywords/
      // bulletPoints/createdAt 等首页 ProductCard 不用的字段
      return {
        id: p.slug || p.id,
        slug: p.slug,
        name: p.name,
        priceMin: Number(p.price),
        priceMax: p.priceMax ? Number(p.priceMax) : Number(p.price),
        image,
        category: rootCat
          ? { name: rootCat.name, slug: rootCat.slug }
          : directCat
            ? { name: directCat.name, slug: directCat.slug }
            : { name: 'Other', slug: 'other' },
        material: p.material || null,
        moq: p.moq || 1,
        sku: p.sku || null,
        color: p.color || null,
      };
    };

    // 预先按成交金额/上架时间排序（基于全量数据）
    const filteredAllLocal = allRawProducts.filter((p: any) => Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0);
    const byRevenueLocal = [...filteredAllLocal].sort((a: any, b: any) => ((b.salesCount || 0) * (Number(b.price ?? b.priceMin ?? 0) || 0)) - ((a.salesCount || 0) * (Number(a.price ?? a.priceMin ?? 0) || 0)));
    const byCreatedAtLocal = [...filteredAllLocal].sort((a: any, b: any) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime());

    const products = byRevenueLocal.slice(0, 50).map(formatProductLocal);

    // New Arrivals: 6 latest products by createdAt（复用预排序结果）
    const newArrivals = byCreatedAtLocal.slice(0, 6).map(formatProductLocal);

    // Top 5 products per root category（复用已排好序的 byRevenueLocal，省一次排序）
    const categoryProductsMap: Record<string, Product[]> = {};
    for (const rootCat of rootCategories) {
      const catProducts = byRevenueLocal
        .filter((p: any) => {
          const rc = getRootCat(p.categoryId || '');
          return rc && rc.slug === rootCat.slug;
        })
        .slice(0, 5)
        .map(formatProductLocal);
      categoryProductsMap[rootCat.slug] = catProducts;
    }
    
    return { props: { products, newArrivals, categories: rootCategories, categoryProductsMap } };
  } catch (error) {
    console.error('Error loading products:', error);
    return { props: { products: [], newArrivals: [], categories: [], categoryProductsMap: {} } };
  }
};
