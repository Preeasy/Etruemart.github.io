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
  TrendingUp,
} from 'lucide-react';
import Layout from '@/components/Layout';
import fs from 'fs';
import path from 'path';

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

const sidebarCategories = [
  { name: 'Toys & Gift', icon: Gift, slug: 'toys-gift' },
  { name: 'Fashion Jewelry', icon: Gem, slug: 'fashion-jewelry' },
  { name: 'Hair Accessories', icon: Crown, slug: 'hair-accessories' },
  { name: 'Bags & Accessories', icon: ShoppingBag, slug: 'bags-accessories' },
  { name: 'Garment Accessories', icon: Scissors, slug: 'garment-accessories' },
  { name: 'Home Decor & Crafts', icon: HomeIcon, slug: 'home-decor-crafts' },
];

const categoryGuides = [
  { title: 'Toys & Gift', desc: 'Stress relief toys, fidget toys & gift sets', slug: 'toys-gift', badge: 'Trending', color: 'from-blue-600 to-blue-800' },
  { title: 'Fashion Jewelry', desc: 'Necklaces, earrings, rings & bracelets', slug: 'fashion-jewelry', badge: 'Best Seller', color: 'from-amber-600 to-orange-700' },
  { title: 'Hair Accessories', desc: 'Clips, headbands, scrunchies & pins', slug: 'hair-accessories', badge: 'New', color: 'from-pink-500 to-rose-600' },
  { title: 'Bags & Accessories', desc: 'Bag charms, keychains & belt buckles', slug: 'bags-accessories', badge: 'Hot', color: 'from-emerald-600 to-green-700' },
  { title: 'Garment Accessories', desc: 'Zippers, buttons, lace & patches', slug: 'garment-accessories', badge: null, color: 'from-slate-600 to-gray-700' },
  { title: 'Home Decor & Crafts', desc: 'Beads, rhinestones & craft supplies', slug: 'home-decor-crafts', badge: null, color: 'from-purple-600 to-violet-700' },
];

const Home = ({ products }: { products: Product[] }) => {
  const topDeals = products.slice(0, 6);

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-20">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500">
                    <h2 className="font-semibold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      All Categories
                    </h2>
                  </div>
                  <nav className="py-2">
                    {sidebarCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all group"
                      >
                        <cat.icon className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        {cat.name}
                        <ChevronRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-orange-400 transition-colors" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="mt-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold text-lg">Summer Sale</span>
                  </div>
                  <p className="text-sm text-orange-100 mb-4">Up to 25% OFF on selected items!</p>
                  <Link
                    href="/products?promo=summer"
                    className="inline-flex items-center gap-1 bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
                  >
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0 space-y-6">
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-[120px]" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
                </div>
                <div className="relative flex flex-col lg:flex-row items-center justify-between px-8 md:px-12 py-10 md:py-14">
                  <div className="text-center lg:text-left max-w-xl">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-orange-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                      <Flame className="w-4 h-4" />
                      Direct from Yiwu Factories
                    </div>
                    <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                      Wholesale <span className="text-orange-400">Toys & Jewelry</span>
                    </h1>
                    <p className="text-gray-300 text-base md:text-lg mb-6">
                      Premium quality at factory prices. Stress relief toys, fashion jewelry, hair accessories & more. Low MOQ, fast shipping.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-orange-500/25"
                      >
                        Browse All Products <ArrowRight className="w-5 h-5" />
                      </Link>
                      <Link
                        href="/sell"
                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all backdrop-blur"
                      >
                        Become a Seller
                      </Link>
                    </div>
                  </div>
                  <div className="mt-8 lg:mt-0 lg:ml-8">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur-xl" />
                      <img
                        src="https://images.pexels.com/photos/6983866/pexels-photo-6983866.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                        alt="Wholesale Products"
                        className="relative w-72 h-48 object-cover rounded-xl shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/products?category=toys-gift" className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-6 h-6" />
                    <span className="font-semibold">Toys</span>
                  </div>
                  <p className="text-xs text-blue-100">{products.filter(p => SUB_TO_PARENT[p.category.slug] === 'toys-gift').length} items</p>
                </Link>
                <Link href="/products?category=fashion-jewelry" className="group bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <Gem className="w-6 h-6" />
                    <span className="font-semibold">Jewelry</span>
                  </div>
                  <p className="text-xs text-orange-100">{products.filter(p => SUB_TO_PARENT[p.category.slug] === 'fashion-jewelry').length} items</p>
                </Link>
                <Link href="/products?category=hair-accessories" className="group bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 text-white hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-6 h-6" />
                    <span className="font-semibold">Hair</span>
                  </div>
                  <p className="text-xs text-pink-100">{products.filter(p => SUB_TO_PARENT[p.category.slug] === 'hair-accessories').length} items</p>
                </Link>
                <Link href="/products?category=bags-accessories" className="group bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl p-4 text-white hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="font-semibold">Bags</span>
                  </div>
                  <p className="text-xs text-green-100">{products.filter(p => SUB_TO_PARENT[p.category.slug] === 'bags-accessories').length} items</p>
                </Link>
              </div>

              {topDeals.length > 0 && (
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                          <Flame className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-bold text-gray-900">Top Deals</h2>
                          <p className="text-xs text-gray-500">Best selling products at lowest prices</p>
                        </div>
                      </div>
                      <Link href="/products?sort=hot" className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-semibold text-sm">
                        View All <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5">
                    {topDeals.map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`} className="group">
                        <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">{p.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-orange-600">${p.priceMin.toFixed(2)}</span>
                            {p.priceMax > p.priceMin && <span className="text-xs text-gray-400">${p.priceMax.toFixed(2)}</span>}
                          </div>
                          {p.moq && <span className="text-[10px] text-gray-400">MOQ: {p.moq}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-500" />
                  <h2 className="font-display text-xl font-bold text-gray-900">Shop by Category</h2>
                </div>

                {categoryGuides.map((cat) => {
                  const catProducts = products
                    .filter(p => SUB_TO_PARENT[p.category.slug] === cat.slug)
                    .slice(0, 5);

                  return (
                    <div key={cat.slug} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {cat.badge && (
                              <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${cat.color} text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                                {cat.badge}
                              </span>
                            )}
                            <h3 className="font-semibold text-gray-900 text-base">{cat.title}</h3>
                            <span className="text-xs text-gray-400 hidden sm:inline">{cat.desc}</span>
                          </div>
                          <Link href={`/products?category=${cat.slug}`} className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-semibold">
                            See more <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      {catProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5">
                          {catProducts.map((p) => (
                            <Link key={p.id} href={`/products/${p.id}`} className="group">
                              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2 group-hover:ring-2 ring-orange-200 transition-all">
                                <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <p className="text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">{p.name}</p>
                              <p className="text-sm font-bold text-orange-600 mt-1">${p.priceMin.toFixed(2)}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">No products available</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Ready to Start Sourcing?</h2>
                    <p className="text-gray-400">Join thousands of retailers worldwide who trust eTruemart for their wholesale needs.</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/register" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                      Create Account <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="/sell" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                      Sell on eTruemart
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

export const getServerSideProps = async () => {
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  const products = siteData.products || [];
  return { props: { products } };
};
