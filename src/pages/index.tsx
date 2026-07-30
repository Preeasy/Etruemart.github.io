import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import {
  ChevronRight,
  ArrowRight,
  Gem,
  Scissors,
  Crown,
  ShoppingBag,
  Home as HomeIcon,
  Gift,
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
} from 'lucide-react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import siteDataJson from '../../site-data.json';

interface Product {
  id: number | string;
  name: string;
  description: string;
  category: { name: string; slug: string };
  priceMin: number;
  priceMax: number;
  image: string;
  moq?: number;
  sku?: string;
  color?: string;
  keywords?: string[];
  bulletPoints?: string[];
}

const SUB_TO_PARENT: Record<string, string> = {
  'stress-relief-toys': 'toys-gift',
  'fidget-toys': 'toys-gift',
  'educational-toys': 'toys-gift',
  'gift-sets': 'toys-gift',
  'necklaces': 'fashion-jewelry',
  'earrings': 'fashion-jewelry',
  'rings': 'fashion-jewelry',
  'bracelets-bangles': 'fashion-jewelry',
  'brooches-pins': 'fashion-jewelry',
  'jewelry-sets': 'fashion-jewelry',
  'hair-clips': 'hair-accessories',
  'headbands': 'hair-accessories',
  'hair-ties': 'hair-accessories',
  'hair-pins': 'hair-accessories',
  'bag-charms': 'bags-accessories',
  'keychains': 'bags-accessories',
  'belt-buckles': 'bags-accessories',
  'zippers': 'garment-accessories',
  'buttons': 'garment-accessories',
  'lace-trim': 'garment-accessories',
  'embroidery-patches': 'garment-accessories',
  'beads-charms': 'home-decor-crafts',
  'rhinestones': 'home-decor-crafts',
  'craft-supplies': 'home-decor-crafts',
};

const categoryGuides = [
  { title: 'Toys & Gift', desc: 'Stress relief, fidget toys & gift sets', slug: 'toys-gift', badge: 'Trending', icon: Gift },
  { title: 'Fashion Jewelry', desc: 'Necklaces, earrings, rings & bracelets', slug: 'fashion-jewelry', badge: 'Best Seller', icon: Gem },
  { title: 'Bags & Accessories', desc: 'Handbags, backpacks & wallets', slug: 'bags-accessories', badge: 'Hot', icon: ShoppingBag },
  { title: 'Hair Accessories', desc: 'Clips, headbands & hair accessories', slug: 'hair-accessories', badge: 'New', icon: Crown },
  { title: 'Garment Accessories', desc: 'Wallets, purses & card holders', slug: 'garment-accessories', badge: null, icon: Scissors },
  { title: 'Home Decor & Crafts', desc: 'Decorative items & craft supplies', slug: 'home-decor-crafts', badge: null, icon: HomeIcon },
];

const valueProps = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders $50+' },
  { icon: ShieldCheck, label: 'Secure Payment', desc: '100% protected' },
  { icon: Award, label: 'Premium Quality', desc: 'Verified factories' },
  { icon: Star, label: 'Top Rated', desc: '4.8/5 customer rating' },
];

const Home = ({ products }: { products: Product[] }) => {
  const [showMobileCats, setShowMobileCats] = useState(false);
  const topDeals = [...products]
    .filter((p) => {
      const price = Number(p.priceMin || 0);
      return price >= 0.3;
    })
    .sort((a, b) => {
      const aScore = Number(a.priceMin || 999) * (a.moq || 1);
      const bScore = Number(b.priceMin || 999) * (b.moq || 1);
      return aScore - bScore;
    })
    .slice(0, 6);

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
            <Sidebar products={products} />

            <div className="flex-1 min-w-0 space-y-5 lg:space-y-6">
              {/* Hero Banner — light, clean */}
              <section className="relative overflow-hidden rounded-xl border border-ink-200 bg-white">
                <div className="relative flex flex-col lg:flex-row items-center justify-between px-6 md:px-10 py-8 md:py-10 gap-6">
                  <div className="text-center lg:text-left max-w-xl">
                    <div className="inline-flex items-center gap-2 text-accent-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] mb-4 bg-accent-50 border border-accent-100">
                      <Sparkles className="w-3 h-3" />
                      Direct from Yiwu Factories
                    </div>
                    <h1 className="font-display text-2xl md:text-4xl font-bold text-navy-900 leading-[1.1] mb-3 tracking-tight">
                      Wholesale Jewelry, Toys &amp; Accessories
                    </h1>
                    <p className="text-ink-500 text-sm md:text-base mb-6 leading-relaxed">
                      Factory-direct pricing · Low MOQ starting 12 pcs · Global shipping to 180+ countries
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-950 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                      >
                        Browse All Products <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/sell"
                        className="inline-flex items-center justify-center gap-2 border border-ink-200 hover:border-navy-900 hover:text-navy-900 text-ink-600 px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                      >
                        Become a Seller
                      </Link>
                    </div>
                  </div>
                  <div className="hidden md:block flex-shrink-0">
                    <div className="relative w-64 h-44 rounded-xl overflow-hidden border border-ink-200 bg-ink-50">
                      <Image
                        src={products[58]?.image || topDeals[0]?.image || ''}
                        alt="Wholesale Products"
                        fill
                        priority
                        className="object-cover opacity-95"
                      />
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
                      {categoryGuides.map((cat) => {
                        const Icon = cat.icon;
                        const count = products.filter(p => p.category.slug === cat.slug).length;
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
                              <p className="text-sm font-semibold text-navy-800">{cat.title}</p>
                              <p className="text-[11px] text-ink-400">{count} items</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-ink-300" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Value Props — minimal lines */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-200 rounded-xl overflow-hidden border border-ink-200">
                {valueProps.map((vp, i) => {
                  const Icon = vp.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white p-4 flex items-center gap-3"
                    >
                      <Icon className="w-5 h-5 text-ink-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-navy-800 leading-tight">{vp.label}</p>
                        <p className="text-[11px] text-ink-400 leading-tight mt-0.5">{vp.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Top Deals — clean, minimal heading */}
              {topDeals.length > 0 && (
                <section className="border border-ink-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-accent-500" />
                      <h2 className="font-bold text-base text-navy-800 tracking-tight">Top Deals</h2>
                      <span className="text-[11px] text-ink-400">Best sellers · Lowest prices</span>
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-0.5 text-navy-800 hover:text-accent-600 font-semibold text-xs">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-ink-100">
                    {topDeals.map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`} className="group bg-white p-3.5 hover:bg-ink-50 transition-colors">
                        <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-2.5 border border-ink-100 group-hover:border-navy-900 transition-colors">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            loading="lazy"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
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

              {/* Shop by Category — clean lines */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-0.5">
                  <Tag className="w-4 h-4 text-navy-800" />
                  <h2 className="font-bold text-lg text-navy-800 tracking-tight">Shop by Category</h2>
                </div>

                {categoryGuides.map((cat) => {
                  const Icon = cat.icon;
                  const catProducts = products
                    .filter(p => p.category.slug === cat.slug)
                    .slice(0, 5);

                  return (
                    <div
                      key={cat.slug}
                      className="border border-ink-200 rounded-xl overflow-hidden bg-white hover:border-navy-300 transition-colors"
                    >
                      <div className="px-4 py-2.5 border-b border-ink-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-navy-700" />
                          <h3 className="font-bold text-sm text-navy-800">{cat.title}</h3>
                          {cat.badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-accent-600">
                              {cat.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-ink-400">· {products.filter(p => p.category.slug === cat.slug).length} items</span>
                        </div>
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="inline-flex items-center gap-0.5 text-navy-700 hover:text-accent-600 font-semibold text-xs"
                        >
                          See more <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      {catProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-ink-100">
                          {catProducts.map((p) => (
                            <Link key={p.id} href={`/products/${p.id}`} className="group bg-white p-3 hover:bg-ink-50 transition-colors">
                              <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-2 border border-ink-100 group-hover:border-navy-900 transition-colors">
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  fill
                                  loading="lazy"
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                        <div className="p-8 text-center">
                          <Package className="w-8 h-8 text-ink-200 mx-auto mb-2" />
                          <p className="text-xs text-ink-400">No products available</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              {/* CTA Section — clean, no color blocks */}
              <section className="border border-ink-200 rounded-xl bg-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                  <div className="text-center md:text-left">
                    <h2 className="font-bold text-lg md:text-xl text-navy-800 mb-1 tracking-tight">
                      Ready to Start Sourcing?
                    </h2>
                    <p className="text-ink-500 text-sm max-w-lg">
                      Join thousands of retailers worldwide. Low MOQ, factory-direct pricing, verified suppliers.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-950 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
                    >
                      Create Account <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/sell"
                      className="inline-flex items-center gap-2 border border-ink-200 hover:border-navy-900 hover:text-navy-900 text-ink-600 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
                    >
                      Sell on eTrue Mark
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

export const getStaticProps = async () => {
  const products = (siteDataJson as any).products || [];
  return { props: { products } };
};
