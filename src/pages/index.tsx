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
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { getProductBySlug, getAllCategories, searchProducts } from '@/lib/db';

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  description: string;
  category: { name: string; slug: string };
  priceMin: number;
  priceMax: number;
  image: string;
  material?: string | null;
  moq?: number;
  sku?: string | null;
  color?: string | null;
  keywords?: string[];
  bulletPoints?: string[];
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
  { icon: Star, label: 'Top Rated', desc: '4.8/5 customer rating' },
];

function getDynamicBadge(slug: string, index: number, count: number): string | null {
  if (index === 0) return 'Best Seller';
  if (index === 1) return 'Popular';
  if (index === 2) return 'Trending';
  if (count >= 50) return 'Top Rated';
  if (count >= 20) return 'New';
  return null;
}

const Home = ({ products, categories, categoryProductsMap }: { products: Product[]; categories: CategoryInfo[]; categoryProductsMap: Record<string, Product[]> }) => {
  const [showMobileCats, setShowMobileCats] = useState(false);
  const slugToProduct = new Map(products.map((p) => [p.slug, p]));
  const topDeals = products.slice(0, 7);

  return (
    <Layout>
      <Head>
        <title>eTrue Mark | Wholesale Jewelry, Accessories & Crafts from Yiwu, China</title>
        <meta name="description" content="Source wholesale fashion jewelry, bag accessories, hair accessories, toys, gifts & home decor direct from Yiwu factories. Low MOQ, factory-direct pricing, global shipping to 180+ countries." />
        <meta name="keywords" content="wholesale jewelry, Yiwu market, B2B sourcing, fashion jewelry wholesale, bag accessories wholesale, low MOQ jewelry, factory direct China" />
        <link rel="canonical" href="https://etruemart.vercel.app/" />
        <meta property="og:title" content="eTrue Mark | Wholesale Jewelry & Accessories from Yiwu" />
        <meta property="og:description" content="Factory-direct wholesale jewelry, accessories & crafts. Low MOQ, global shipping." />
        <meta property="og:type" content="website" />
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
                    <h1 className="hero-headline text-3xl md:text-5xl text-white mb-4 tracking-tight">
                      Wholesale Jewelry,<br />
                      <span className="text-gradient-accent">Toys &amp; Accessories</span>
                    </h1>
                    <p className="text-navy-200 text-sm md:text-base mb-7 leading-relaxed max-w-md">
                      Factory-direct pricing · Low MOQ starting 12 pcs · Global shipping to 180+ countries
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
                  <div className="w-full lg:w-[26rem] flex-shrink-0">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-premium">
                      <img
                        src={topDeals[0]?.image || products[0]?.image || ''}
                        alt="Wholesale Products"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          if (!el.dataset.fallback) {
                            el.dataset.fallback = '1';
                            const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="gh" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a2d47"/><stop offset="100%" stop-color="#0f1f32"/></linearGradient></defs><rect fill="url(#gh)" width="400" height="300"/><rect x="30" y="40" width="340" height="220" rx="12" fill="white" stroke="#2d4263" stroke-width="2"/><circle cx="120" cy="100" r="24" fill="#f0834c"/><path d="M60 220 L130 140 L180 180 L240 110 L300 170 L360 100 L390 220 Z" fill="#2d4263"/><text x="200" y="280" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#f5f7fa" font-weight="bold">Wholesale Products from Yiwu</text></svg>`)}`;
                            el.src = svg;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent pointer-events-none" />
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
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              if (!el.dataset.fallback) {
                                el.dataset.fallback = '1';
                                const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><rect x="30" y="50" width="140" height="100" rx="8" fill="white" stroke="#d1d5db" stroke-width="2"/><circle cx="70" cy="80" r="10" fill="#fcd34d"/><path d="M50 140 L80 105 L100 125 L125 95 L160 140 Z" fill="#d1d5db"/><text x="100" y="178" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#9ca3af">${p.name.slice(0,18)}</text></svg>`)}`;
                                el.src = svg;
                              }
                            }}
                          />
                        </div>
                        <p className="text-[12px] text-ink-600 line-clamp-2 leading-snug min-h-[2.1em] font-medium group-hover:text-navy-900 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-baseline justify-between mt-1.5">
                          <span className="text-sm font-bold text-navy-900">${p.priceMin.toFixed(2)}</span>
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
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    const el = e.currentTarget as HTMLImageElement;
                                    if (!el.dataset.fallback) {
                                      el.dataset.fallback = '1';
                                      const svg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><rect x="30" y="50" width="140" height="100" rx="8" fill="white" stroke="#d1d5db" stroke-width="2"/><circle cx="70" cy="80" r="10" fill="#fcd34d"/><path d="M50 140 L80 105 L100 125 L125 95 L160 140 Z" fill="#d1d5db"/><text x="100" y="178" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#9ca3af">${p.name.slice(0,18)}</text></svg>`)}`;
                                      el.src = svg;
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-[12px] text-ink-600 line-clamp-2 leading-snug min-h-[2.1em] group-hover:text-navy-900 transition-colors">
                                {p.name}
                              </p>
                              <p className="text-sm font-bold text-navy-900 mt-1">${p.priceMin.toFixed(2)}</p>
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
  } catch {
    return null;
  }
}

function proxyImageUrlDirect(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  if (url.startsWith('Images/')) {
    return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/${url}`;
  }
  return url;
}

export const getServerSideProps = async () => {
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    const seedData = loadHomeSeedData();
    if (seedData) {
      const { products: rawProducts, categories } = seedData;

      // Sort by salesCount descending (or by id as fallback) and take top 50
      const sorted = [...rawProducts]
        .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        .slice(0, 50);

      // Build category lookup with root resolution
      const slugToCat = new Map();
      const idToCat = new Map();
      for (const cat of categories) {
        slugToCat.set(cat.slug, cat);
        idToCat.set(cat.id, cat);
      }

      // Resolve a category slug to its root category
      const getRootCat = (catSlug: string) => {
        let current = slugToCat.get(catSlug);
        while (current && current.parentId) {
          const parent = idToCat.get(current.parentId);
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

      // Build product count per root category (including descendants)
      const productCountByRoot = new Map<string, number>();
      for (const p of rawProducts) {
        const catSlug = p.categoryId || '';
        const rootCat = getRootCat(catSlug);
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
        const image = proxyImageUrlDirect(p.image || '');

        let images: string[] = [];
        if (p.images) {
          let parsed = p.images;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch { parsed = []; }
          }
          if (Array.isArray(parsed)) {
            images = parsed
              .filter((img: string) => typeof img === 'string' && img.length > 0)
              .map(proxyImageUrlDirect);
          }
        }
        if (images.length === 0 && image) images = [image];

        const catSlug = p.categoryId || '';
        const rootCat = getRootCat(catSlug);
        const directCat = slugToCat.get(catSlug);

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
          keywords: [],
          bulletPoints: [],
        };
      };

      // Top 50 products for hero/trending
      const products = sorted.map(formatProduct);

      // Top 5 products per root category (for "Shop by Category" blocks)
      const sortedAll = [...rawProducts].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
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

      return { props: { products, categories: rootCategories, categoryProductsMap } };
    }
  }

  // Local dev: use SQLite
  try {
    const { getDatabase } = await import('@/lib/db');
    const { proxyImageUrl } = await import('@/lib/image-utils');
    const database = getDatabase();
    
    const rawProducts = database.prepare('SELECT * FROM products WHERE isPublished = 1 ORDER BY salesCount DESC LIMIT 50').all() as any[];
    const rawCategories = database.prepare('SELECT * FROM categories WHERE isPublished = 1 ORDER BY sortOrder ASC').all() as any[];

    // Build category lookup with root resolution
    const slugToCat = new Map();
    const idToCat = new Map();
    for (const cat of rawCategories) {
      slugToCat.set(cat.slug, cat);
      idToCat.set(cat.id, cat);
    }

    const getRootCat = (catSlug: string) => {
      let current = slugToCat.get(catSlug);
      while (current && current.parentId) {
        const parent = idToCat.get(current.parentId);
        if (!parent) break;
        current = parent;
      }
      return current;
    };

    // Compute product counts per root category
    const productCountByRoot = new Map<string, number>();
    for (const p of rawProducts) {
      const catSlug = p.categoryId || '';
      const rootCat = getRootCat(catSlug);
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
    const allRawProducts = database.prepare('SELECT * FROM products WHERE isPublished = 1 ORDER BY salesCount DESC').all() as any[];

    const formatProductLocal = (p: any): Product => {
      const image = proxyImageUrl(p.image || '');
      
      let images: string[] = [];
      try {
        const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(parsed)) {
          images = parsed.filter((img: string) => typeof img === 'string' && img.length > 0).map(proxyImageUrl);
        }
      } catch {}
      if (images.length === 0 && image) images = [image];
      
      const catSlug = p.categoryId || '';
      const rootCat = getRootCat(catSlug);
      const directCat = slugToCat.get(catSlug);
      
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
        keywords: [],
        bulletPoints: [],
      };
    };

    const products = rawProducts.map(formatProductLocal);

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
    
    return { props: { products, categories: rootCategories, categoryProductsMap } };
  } catch (error) {
    console.error('Error loading products:', error);
    return { props: { products: [], categories: [], categoryProductsMap: {} } };
  }
};
