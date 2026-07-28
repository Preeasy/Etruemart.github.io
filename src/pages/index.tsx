import Link from 'next/link';
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
} from 'lucide-react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import siteDataJson from '../../site-data.json';

interface Product {
  id: number;
  name: string;
  description: string;
  category: { name: string; slug: string };
  priceMin: number;
  priceMax: number;
  image: string;
  moq?: number;
  sku?: string;
  color?: string;
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
  { title: 'Hair Accessories', desc: 'Clips, headbands, scrunchies & pins', slug: 'hair-accessories', badge: 'New', icon: Crown },
  { title: 'Bags & Accessories', desc: 'Bag charms, keychains & belt buckles', slug: 'bags-accessories', badge: 'Hot', icon: ShoppingBag },
  { title: 'Garment Accessories', desc: 'Zippers, buttons, lace & patches', slug: 'garment-accessories', badge: null, icon: Scissors },
  { title: 'Home Decor & Crafts', desc: 'Beads, rhinestones & craft supplies', slug: 'home-decor-crafts', badge: null, icon: HomeIcon },
];

const valueProps = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders $50+' },
  { icon: ShieldCheck, label: 'Secure Payment', desc: '100% protected' },
  { icon: Award, label: 'Premium Quality', desc: 'Verified factories' },
  { icon: Star, label: 'Top Rated', desc: '4.8/5 customer rating' },
];

const Home = ({ products }: { products: Product[] }) => {
  const topDeals = products.slice(0, 6);

  return (
    <Layout>
      <div className="bg-ink-50 min-h-screen">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8">
          <div className="flex gap-6 lg:gap-8">
            <Sidebar products={products} />

            <div className="flex-1 min-w-0 space-y-6 lg:space-y-8">
              {/* Hero Banner */}
              <section className="relative overflow-hidden rounded-3xl bg-navy-900 bg-hero-gradient shadow-premium">
                <div className="absolute inset-0 premium-pattern opacity-30" />
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/30 rounded-full blur-[120px]" />
                </div>
                <div className="relative flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-10 md:py-14">
                  <div className="text-center lg:text-left max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-5 border border-white/10">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Direct from Yiwu Factories
                    </div>
                    <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-[1.1] mb-4 tracking-tight">
                      Wholesale <span className="text-accent-400">Toys & Jewelry</span>
                    </h1>
                    <p className="text-ink-200 text-base md:text-lg mb-7 leading-relaxed">
                      Premium quality at factory prices. Stress relief toys, fashion jewelry, hair accessories & more. Low MOQ, fast shipping.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-accent-glow hover:shadow-lg"
                      >
                        Browse All Products <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/sell"
                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all backdrop-blur-md border border-white/10"
                      >
                        Become a Seller
                      </Link>
                    </div>
                  </div>
                  <div className="mt-8 lg:mt-0 lg:ml-8 hidden md:block">
                    <div className="relative">
                      <div className="absolute -inset-6 bg-gradient-to-br from-accent-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                      <div className="relative w-80 h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        <img
                          src="/images/products/1783332968156.jpg"
                          alt="Wholesale Products"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-navy-800 text-[10px] font-bold rounded-md">
                          200+ Premium Items
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Value Props */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {valueProps.map((vp, i) => {
                  const Icon = vp.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-ink-200 p-4 flex items-center gap-3 shadow-soft hover:shadow-medium transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-accent-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-navy-800 leading-tight">{vp.label}</p>
                        <p className="text-[11px] text-ink-500 leading-tight mt-0.5">{vp.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Quick Categories */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categoryGuides.slice(0, 4).map((cat) => {
                  const Icon = cat.icon;
                  const count = products.filter(p => SUB_TO_PARENT[p.category.slug] === cat.slug).length;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      className="group relative overflow-hidden bg-navy-800 bg-navy-gradient rounded-2xl p-4 text-white hover:shadow-medium transition-all hover:-translate-y-0.5"
                    >
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />
                      <div className="relative">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm">{cat.title.split(' ')[0]}</span>
                        </div>
                        <p className="text-xs text-white/70">{count} items</p>
                      </div>
                    </Link>
                  );
                })}
              </section>

              {/* Top Deals */}
              {topDeals.length > 0 && (
                <section className="bg-white rounded-2xl border border-ink-200 shadow-soft overflow-hidden">
                  <div className="px-6 py-4 border-b border-ink-100 bg-gradient-to-r from-accent-50 to-orange-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-600 bg-accent-gradient flex items-center justify-center shadow-accent-glow">
                          <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-bold text-navy-800 tracking-tight">Top Deals</h2>
                          <p className="text-xs text-ink-500">Best selling products at lowest prices</p>
                        </div>
                      </div>
                      <Link href="/products" className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 font-bold text-sm">
                        View All <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5">
                    {topDeals.map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`} className="group">
                        <div className="aspect-square bg-ink-50 rounded-xl overflow-hidden mb-3 border border-ink-100 group-hover:border-accent-300 transition-colors">
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-ink-700 line-clamp-2 leading-snug group-hover:text-accent-600 transition-colors min-h-[2.4em] font-medium">
                            {p.name}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-navy-800">${p.priceMin.toFixed(2)}</span>
                            {p.priceMax > p.priceMin && (
                              <span className="text-[10px] text-ink-400 line-through">${p.priceMax.toFixed(2)}</span>
                            )}
                          </div>
                          {p.moq && <span className="text-[10px] text-ink-400">MOQ: {p.moq} pcs</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Shop by Category */}
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 bg-navy-gradient flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-navy-800 tracking-tight">Shop by Category</h2>
                    <p className="text-xs text-ink-500">Explore our curated wholesale collections</p>
                  </div>
                </div>

                {categoryGuides.map((cat) => {
                  const Icon = cat.icon;
                  const catProducts = products
                    .filter(p => p.category.slug === cat.slug)
                    .slice(0, 5);

                  return (
                    <div
                      key={cat.slug}
                      className="bg-white rounded-2xl border border-ink-200 shadow-soft overflow-hidden hover:shadow-medium transition-shadow"
                    >
                      <div className="px-5 py-3.5 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-navy-800 bg-navy-gradient flex items-center justify-center">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-navy-800 text-base">{cat.title}</h3>
                                {cat.badge && (
                                  <span className="inline-flex items-center gap-1 bg-accent-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {cat.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-ink-500">{cat.desc}</p>
                            </div>
                          </div>
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 text-sm font-bold"
                          >
                            See more <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      {catProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5">
                          {catProducts.map((p) => (
                            <Link key={p.id} href={`/products/${p.id}`} className="group">
                              <div className="aspect-square bg-ink-50 rounded-xl overflow-hidden mb-2 border border-ink-100 group-hover:border-accent-300 group-hover:ring-2 ring-accent-200 transition-all">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <p className="text-xs text-ink-700 line-clamp-2 leading-snug group-hover:text-accent-600 transition-colors min-h-[2.2em] font-medium">
                                {p.name}
                              </p>
                              <p className="text-sm font-bold text-navy-800 mt-1">${p.priceMin.toFixed(2)}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 text-center">
                          <Package className="w-10 h-10 text-ink-200 mx-auto mb-2" />
                          <p className="text-sm text-ink-400">No products available</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              {/* CTA Section */}
              <section className="relative overflow-hidden bg-navy-800 bg-navy-gradient rounded-2xl p-8 md:p-10 shadow-premium">
                <div className="absolute inset-0 premium-pattern opacity-20" />
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                      Ready to Start Sourcing?
                    </h2>
                    <p className="text-ink-200 max-w-lg">
                      Join thousands of retailers worldwide who trust eTrue Mark for their wholesale needs.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-accent-glow"
                    >
                      Create Account <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/sell"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-xl font-bold transition-colors backdrop-blur border border-white/10"
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
