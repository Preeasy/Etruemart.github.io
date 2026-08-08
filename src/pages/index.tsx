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
} from 'lucide-react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
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
  description: string;
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
  { icon: Truck, label: 'Free Shipping', desc: 'On orders $50+' },
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
const Home = ({ products, newArrivals, categories, categoryProductsMap }: { products: Product[]; newArrivals: Product[]; categories: CategoryInfo[]; categoryProductsMap: Record<string, Product[]> }) => {
  const [showMobileCats, setShowMobileCats] = useState(false);
  const slugToProduct = new Map(products.map((p) => [p.slug, p]));
  const topDeals = products.slice(0, 7);

  // Fallback: if newArrivals is empty, compute from products
  const effectiveNewArrivals = newArrivals && newArrivals.length > 0
    ? newArrivals
    : [...products]
        .sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime())
        .slice(0, 6);

  // Hero collage: pick visually appealing products from aesthetic categories
  const heroPreferredSlugs = ['fashion-jewelry', 'garment-accessories', 'bags', 'home-decor-crafts', 'beauty-personal-care', 'kitchen-supplies'];
  const heroProducts = [
    ...products.filter((p: any) => heroPreferredSlugs.includes(p.category?.slug)).slice(0, 7),
    ...products.filter((p: any) => !heroPreferredSlugs.includes(p.category?.slug)).slice(0, 7),
  ].slice(0, 7);

  return (
    <Layout>
      <Head>
        <title>{SITE_NAME + " | Wholesale Jewelry, Accessories & Crafts from Yiwu, China"}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content="wholesale jewelry, Yiwu market, B2B sourcing, fashion jewelry wholesale, bag accessories wholesale, low MOQ jewelry, factory direct China" />
        <link rel="canonical" href={SITE_URL + "/"} />
        <meta property="og:title" content={SITE_NAME + " | Wholesale Jewelry & Accessories from Yiwu"} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL + "/"} />
        <meta property="og:image" content={SITE_OG_IMAGE} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_NAME + " | Wholesale Jewelry & Accessories from Yiwu"} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={SITE_OG_IMAGE} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL + "/",
            description: SITE_DESCRIPTION,
            publisher: {
              '@type': 'Organization',
              name: SITE_COMPANY,
              url: SITE_URL,
              logo: { '@type': 'ImageObject', url: SITE_OG_IMAGE },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+86-18767960499',
                email: 'yeatrusourcing@gmail.com',
                contactType: 'customer service',
                areaServed: 'Worldwide',
                availableLanguage: ['English','Chinese']
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
      <div className="bg-white min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 lg:py-6">
          <div className="flex gap-5 lg:gap-7">
            <Sidebar products={products} categories={categories} />

            <div className="flex-1 min-w-0 space-y-5 lg:space-y-6">
              {/* Hero Banner — editorial, premium */}
              <section className="relative overflow-hidden rounded-2xl bg-hero-gradient">
                {/* Decorative pattern overlay */}
                <div className="absolute inset-0 premium-pattern opacity-40" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-10 md:py-14 gap-8">
                  <div className="text-center lg:text-left max-w-xl">
                    <div className="inline-flex items-center gap-2 text-accent-300 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] mb-5 bg-accent-500/15 border border-accent-400/20">
                      <Sparkles className="w-3 h-3" />
                      Direct from Yiwu Factories
                    </div>
                    <h1 className="hero-headline text-3xl md:text-[56px] text-white mb-4 tracking-tight leading-[1.05]">
                      Yiwu Wholesale<br />
                      <span className="text-gradient-accent">Factory-Direct Prices</span>
                    </h1>
                    <p className="text-navy-200 text-sm md:text-[15px] mb-7 leading-relaxed max-w-lg">
                      50,000+ verified products sourced directly from Yiwu factories. Low MOQ from 12 pcs · Global shipping to 180+ countries
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-400 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-accent-glow hover:scale-[1.02]"
                      >
                        Browse All Products <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                  <div className="w-full lg:w-[28rem] flex-shrink-0">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-premium bg-gradient-to-br from-white via-slate-50 to-blue-50">
                      {/* Clean stylish minimal photo grid collage */}
                      <div className="absolute inset-0 p-5 grid grid-cols-2 grid-rows-3 gap-3">
                        {/* Top left - bags */}
                        <div className="row-span-2 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 bg-white">
                      <div className="relative w-full h-full bg-[linear-gradient(135deg,#fef3c7,#fed7aa)]">
                        <Image
                          src={heroProducts.find(p => Number(p.priceMin || p.price || 0) > 0)?.image || products.find(p => Number(p.priceMin || p.price || 0) > 0)?.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23fef3c7%22/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23fed7aa%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20fill%3D%22url%28%23g%29%22%20width%3D%22400%22%20height%3D%22300%22/%3E%3Crect%20x%3D%2260%22%20y%3D%2275%22%20width%3D%22280%22%20height%3D%22150%22%20rx%3D%2212%22%20fill%3D%22white%22%20stroke%3D%22%23d1d5db%22%20stroke-width%3D%222%22/%3E%3Ccircle%20cx%3D%22140%22%20cy%3D%22120%22%20r%3D%2220%22%20fill%3D%22%23fcd34d%22/%3E%3Cpath%20d%3D%22M100%20210%20L160%20157%20L200%20187%20L250%20142%20L320%20210%20Z%22%20fill%3D%22%23d1d5db%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%3EFeatured%20Product%3C/text%3E%3C/svg%3E'}
                          alt="Featured Product 1"
                          fill
                          priority
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                          onError={(e) => {
                            const el = e.currentTarget as unknown as HTMLImageElement;
                            if (!el.dataset.fallback) {
                              el.dataset.fallback = "1";
                              (el as any).src = homePlaceholderSvg('Featured 1', ['#fef3c7','#fed7aa']);
                            }
                          }}
                        />
                      </div>
                        </div>
                        {/* Top right - jewelry */}
                        <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 bg-white">
                      <div className="relative w-full h-full bg-[linear-gradient(135deg,#dbeafe,#c7d2fe)]">
                        <Image
                          src={heroProducts.slice(1).find(p => Number(p.priceMin || p.price || 0) > 0)?.image || products.slice(1).find(p => Number(p.priceMin || p.price || 0) > 0)?.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23dbeafe%22/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23c7d2fe%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20fill%3D%22url%28%23g%29%22%20width%3D%22400%22%20height%3D%22300%22/%3E%3Crect%20x%3D%2260%22%20y%3D%2275%22%20width%3D%22280%22%20height%3D%22150%22%20rx%3D%2212%22%20fill%3D%22white%22%20stroke%3D%22%23d1d5db%22%20stroke-width%3D%222%22/%3E%3Ccircle%20cx%3D%22140%22%20cy%3D%22120%22%20r%3D%2220%22%20fill%3D%22%23fcd34d%22/%3E%3Cpath%20d%3D%22M100%20210%20L160%20157%20L200%20187%20L250%20142%20L320%20210%20Z%22%20fill%3D%22%23d1d5db%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%3EFeatured%20Product%3C/text%3E%3C/svg%3E'}
                          alt="Featured Product 2"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                          onError={(e) => {
                            const el = e.currentTarget as unknown as HTMLImageElement;
                            if (!el.dataset.fallback) {
                              el.dataset.fallback = "1";
                              (el as any).src = homePlaceholderSvg('Featured 2', ['#dbeafe','#c7d2fe']);
                            }
                          }}
                        />
                      </div>
                        </div>
                        {/* Middle right - toys */}
                        <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 bg-white">
                      <div className="relative w-full h-full bg-[linear-gradient(135deg,#dcfce7,#bbf7d0)]">
                        <Image
                          src={heroProducts.slice(2).find(p => Number(p.priceMin || p.price || 0) > 0)?.image || products.slice(2).find(p => Number(p.priceMin || p.price || 0) > 0)?.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23dcfce7%22/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23bbf7d0%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20fill%3D%22url%28%23g%29%22%20width%3D%22400%22%20height%3D%22300%22/%3E%3Crect%20x%3D%2260%22%20y%3D%2275%22%20width%3D%22280%22%20height%3D%22150%22%20rx%3D%2212%22%20fill%3D%22white%22%20stroke%3D%22%23d1d5db%22%20stroke-width%3D%222%22/%3E%3Ccircle%20cx%3D%22140%22%20cy%3D%22120%22%20r%3D%2220%22%20fill%3D%22%23fcd34d%22/%3E%3Cpath%20d%3D%22M100%20210%20L160%20157%20L200%20187%20L250%20142%20L320%20210%20Z%22%20fill%3D%22%23d1d5db%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%3EFeatured%20Product%3C/text%3E%3C/svg%3E'}
                          alt="Featured Product 3"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                          onError={(e) => {
                            const el = e.currentTarget as unknown as HTMLImageElement;
                            if (!el.dataset.fallback) {
                              el.dataset.fallback = "1";
                              (el as any).src = homePlaceholderSvg('Featured 3', ['#dcfce7','#bbf7d0']);
                            }
                          }}
                        />
                      </div>
                        </div>
                        {/* Bottom - wide */}
                        <div className="col-span-2 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 bg-white">
                      <div className="relative w-full h-full bg-[linear-gradient(135deg,#fce7f3,#fbcfe8)]">
                        <Image
                          src={heroProducts.slice(3).find(p => Number(p.priceMin || p.price || 0) > 0)?.image || products.slice(3).find(p => Number(p.priceMin || p.price || 0) > 0)?.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23fce7f3%22/%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23fbcfe8%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20fill%3D%22url%28%23g%29%22%20width%3D%22400%22%20height%3D%22300%22/%3E%3Crect%20x%3D%2260%22%20y%3D%2275%22%20width%3D%22280%22%20height%3D%22150%22%20rx%3D%2212%22%20fill%3D%22white%22%20stroke%3D%22%23d1d5db%22%20stroke-width%3D%222%22/%3E%3Ccircle%20cx%3D%22140%22%20cy%3D%22120%22%20r%3D%2220%22%20fill%3D%22%23fcd34d%22/%3E%3Cpath%20d%3D%22M100%20210%20L160%20157%20L200%20187%20L250%20142%20L320%20210%20Z%22%20fill%3D%22%23d1d5db%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20fill%3D%22%239ca3af%22%3EFeatured%20Product%3C/text%3E%3C/svg%3E'}
                          alt="Featured Product 4"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                          onError={(e) => {
                            const el = e.currentTarget as unknown as HTMLImageElement;
                            if (!el.dataset.fallback) {
                              el.dataset.fallback = "1";
                              (el as any).src = homePlaceholderSvg('Featured 4', ['#fce7f3','#fbcfe8']);
                            }
                          }}
                        />
                      </div>
                        </div>
                      </div>
                      {/* Floating badge */}
                      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur rounded-lg px-3 py-1.5 shadow-md ring-1 ring-black/5 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-navy-900">Factory-Direct · Yiwu</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Mobile category quick access */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowMobileCats(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-700 hover:border-accent-500 transition-colors font-medium text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Browse Categories
                </button>
              </div>

              {/* Mobile category drawer */}
              {showMobileCats && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={() => setShowMobileCats(false)} />
                  <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 sticky top-0 bg-white z-10">
                      <h3 className="font-bold text-navy-800 text-sm">All Categories</h3>
                      <button onClick={() => setShowMobileCats(false)} className="p-2 hover:bg-ink-50 rounded-lg">
                        <X className="w-5 h-5 text-ink-500" />
                      </button>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {categories.slice(0, 14).map((cat) => {
                        const Icon = categoryIconMap[cat.slug] || Package;
                        return (
                          <Link
                            key={cat.slug}
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setShowMobileCats(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 transition-colors">
                              <Icon className="w-4 h-4 text-navy-600 group-hover:text-accent-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-navy-800">{cat.name}</p>
                              <p className="text-[11px] text-ink-400">{cat.productCount} items</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-ink-300" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Value Props — refined with icons */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {valueProps.map((vp, i) => {
                  const Icon = vp.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-ink-200 p-4 flex items-center gap-3 hover:border-navy-300 hover:shadow-soft transition-all duration-300"
                    >
                      <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-navy-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-navy-900 leading-tight">{vp.label}</p>
                        <p className="text-[11px] text-ink-400 leading-tight mt-0.5">{vp.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Top Deals — clean, minimal heading */}
              {topDeals.length > 0 && (
                <section className="border border-ink-200 rounded-2xl overflow-hidden bg-white shadow-soft">
                  <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-accent-500" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-base text-navy-900 tracking-tight leading-tight">Top Deals</h2>
                        <span className="text-[11px] text-ink-400 leading-tight">Featured · Best quality</span>
                      </div>
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-0.5 text-navy-700 hover:text-accent-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-accent-50 transition-colors">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-px bg-ink-100">
                    {topDeals.map((p) => (
                      <Link key={p.id} href={`/products/${p.slug || p.id}`} className="group bg-white p-3.5 hover:bg-ink-50 transition-colors">
                        <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-2.5 border border-ink-100 group-hover:border-navy-900 transition-colors">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
                              className="!object-cover !w-auto !h-auto group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                const el = e.currentTarget as unknown as HTMLImageElement;
                                if (!el.dataset.fallback) {
                                  el.dataset.fallback = "1";
                                  (el as any).src = homePlaceholderSvg(p.name);
                                }
                              }}
                            />
                        </div>
                        <p className="text-[12px] text-ink-600 line-clamp-2 leading-snug min-h-[2.1em] font-medium group-hover:text-navy-900 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <span className="text-sm font-bold text-navy-900">{"$" + (Number(p.priceMin || p.price || 0)).toFixed(2)}</span>
                          {p.moq && <span className="text-[10px] text-ink-400">MOQ {p.moq}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* New Arrivals — latest 6 products */}
              {effectiveNewArrivals.length > 0 && (
                <section className="border border-ink-200 rounded-2xl overflow-hidden bg-gradient-to-br from-accent-50/40 to-white shadow-soft">
                  <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-accent-500" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-base text-navy-900 tracking-tight leading-tight">New Arrivals</h2>
                        <span className="text-[11px] text-ink-400 leading-tight">Just landed · Fresh picks</span>
                      </div>
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-0.5 text-navy-700 hover:text-accent-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-accent-50 transition-colors">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-ink-100">
                    {effectiveNewArrivals.map((p) => (
                      <Link key={p.id} href={`/products/${p.slug || p.id}`} className="group bg-white p-3.5 hover:bg-ink-50 transition-colors">
                        <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-2.5 border border-ink-100 group-hover:border-navy-900 transition-colors">
                          <span className="absolute top-1.5 left-1.5 bg-accent-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase z-10">New</span>
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
                              className="!object-cover !w-auto !h-auto group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                const el = e.currentTarget as unknown as HTMLImageElement;
                                if (!el.dataset.fallback) {
                                  el.dataset.fallback = "1";
                                  (el as any).src = homePlaceholderSvg(p.name);
                                }
                              }}
                            />
                        </div>
                        <p className="text-[12px] text-ink-600 line-clamp-2 leading-snug min-h-[2.1em] font-medium group-hover:text-navy-900 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <span className="text-sm font-bold text-navy-900">{"$" + (Number(p.priceMin || p.price || 0)).toFixed(2)}</span>
                          {p.moq && <span className="text-[10px] text-ink-400">MOQ {p.moq}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Shop by Category — dynamic from seed data */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5 px-0.5 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-navy-900 tracking-tight leading-tight">Shop by Category</h2>
                    <span className="text-[11px] text-ink-400 leading-tight">Browse our curated wholesale collections</span>
                  </div>
                </div>

                {categories.slice(0, 10).map((cat, catIndex) => {
                  const Icon = categoryIconMap[cat.slug] || Package;
                  const badge = getDynamicBadge(cat.slug, catIndex, cat.productCount);
                  const catProducts = categoryProductsMap[cat.slug] || [];

                  return (
                    <div
                      key={cat.slug}
                      className="border border-ink-200 rounded-2xl overflow-hidden bg-white hover:border-navy-300 hover:shadow-soft transition-all duration-300"
                    >
                      <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-navy-700" />
                          </div>
                          <h3 className="font-display font-bold text-sm text-navy-900">{cat.name}</h3>
                          {badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded">
                              {badge}
                            </span>
                          )}
                          <span className="text-[10px] text-ink-400">· {cat.productCount} items</span>
                        </div>
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="inline-flex items-center gap-0.5 text-navy-700 hover:text-accent-600 font-semibold text-xs px-2.5 py-1 rounded-lg hover:bg-accent-50 transition-colors"
                        >
                          See more <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      {catProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-ink-100">
                          {catProducts.map((p) => (
                            <Link key={p.id} href={`/products/${p.slug || p.id}`} className="group bg-white p-3 hover:bg-ink-50 transition-colors">
                              <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-2 border border-ink-100 group-hover:border-navy-900 transition-colors">
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 14vw"
                              className="!object-cover !w-auto !h-auto group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                const el = e.currentTarget as unknown as HTMLImageElement;
                                if (!el.dataset.fallback) {
                                  el.dataset.fallback = "1";
                                  (el as any).src = homePlaceholderSvg(p.name);
                                }
                              }}
                            />
                              </div>
                              <p className="text-[12px] text-ink-600 line-clamp-2 leading-snug min-h-[2.1em] group-hover:text-navy-900 transition-colors">
                                {p.name}
                              </p>
                              <p className="text-sm font-bold text-navy-900 mt-1">{"$" + (Number(p.priceMin || p.price || 0)).toFixed(2)}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <Package className="w-6 h-6 text-ink-200 mx-auto mb-1.5" />
                          <p className="text-xs text-ink-400">{cat.productCount} products available</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              {/* CTA Section — premium gradient */}
              <section className="relative overflow-hidden rounded-2xl bg-navy-gradient p-6 md:p-8">
                <div className="absolute inset-0 premium-pattern opacity-30" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="text-center md:text-left">
                    <h2 className="font-display font-bold text-lg md:text-xl text-white mb-1.5 tracking-tight">
                      Ready to Start Sourcing?
                    </h2>
                    <p className="text-navy-200 text-sm max-w-lg">
                      Create a free account to track orders, save addresses, and check out faster.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-accent-glow hover:scale-[1.02]"
                    >
                      Create Account <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Browse Products
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
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

        // 子产品自己的 variantOptions 解析
        let selfVariantOptions: any = null;
        if (p.variantOptions) {
          try { selfVariantOptions = typeof p.variantOptions === 'string' ? JSON.parse(p.variantOptions) : p.variantOptions; } catch (e: any) { if (typeof console !== 'undefined') console.warn('[Home/formatProduct] JSON.parse(p.variantOptions) failed:', e); }
        }

        return {
          id: p.slug || p.id,
          slug: p.slug,
          name: p.name,
          description: p.description || '',
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
          createdAt: p.createdAt,
          keywords: [],
          bulletPoints: [],
          isParent: p.isParent === true,
          parentId: p.parentId || null,
          variants: attachVariantPreview(p),
          variantOptions: selfVariantOptions,
        };
      };

      // Top 50 products for hero/trending
      const products = sorted.map(formatProduct);

      // New Arrivals: 6 latest products by createdAt (from ALL products, not just top 50)
      const newArrivals = filterListOnly([...rawProducts])
        .filter((p: any) => Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0)
        .sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime())
        .slice(0, 6)
        .map(formatProduct);

      // Top 5 products per root category (for "Shop by Category" blocks) — 过滤掉子产品
      const sortedAll = filterListOnly([...rawProducts])
        .filter((p: any) => Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0)
        .sort((a, b) => revenue(b) - revenue(a));
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
    
    const rawProducts = database.prepare('SELECT * FROM products WHERE isPublished = 1 ORDER BY (salesCount * price) DESC LIMIT 50').all() as any[];
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
    for (const p of rawProducts) {
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

    // For local dev, load all products for category blocks
    const allRawProducts = database.prepare('SELECT * FROM products WHERE isPublished = 1 ORDER BY (salesCount * price) DESC').all() as any[];

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
      
      return {
        id: p.slug || p.id,
        slug: p.slug,
        name: p.name,
        description: p.description || '',
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
        createdAt: p.createdAt,
        keywords: [],
        bulletPoints: [],
      };
    };

    const products = rawProducts.map(formatProductLocal);

    // New Arrivals: 6 latest products by createdAt (from ALL products, not just 50)
    const newArrivals = allRawProducts
      .filter((p: any) => Number(p.price ?? 0) > 0 || Number(p.priceMin ?? 0) > 0 || Number(p.priceMax ?? 0) > 0)
      .sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime())
      .slice(0, 6)
      .map(formatProductLocal);

    // Top 5 products per root category
    const categoryProductsMap: Record<string, Product[]> = {};
    for (const rootCat of rootCategories) {
      const catProducts = allRawProducts
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
