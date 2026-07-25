import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | string;
  price: number;
  originalPrice?: number;
  image: string;
  moq?: number;
  packSize?: number;
  stockStatus?: string;
}

const PEXELS = 'https://images.pexels.com/photos';

// Parent categories for guide rows — each shows 4-5 products in one row
const categoryGuides = [
  {
    title: 'Toys & Gift',
    desc: 'Stress relief toys, fidget toys & gift sets',
    slug: 'toys-gift',
    badge: 'Trending',
  },
  {
    title: 'Fashion Jewelry',
    desc: 'Necklaces, earrings, rings & bracelets',
    slug: 'fashion-jewelry',
    badge: 'Best Seller',
  },
  {
    title: 'Hair Accessories',
    desc: 'Clips, headbands, scrunchies & pins',
    slug: 'hair-accessories',
    badge: 'New',
  },
  {
    title: 'Bags & Accessories',
    desc: 'Bag charms, keychains & belt buckles',
    slug: 'bags-accessories',
    badge: 'Hot',
  },
  {
    title: 'Garment Accessories',
    desc: 'Zippers, buttons, lace & patches',
    slug: 'garment-accessories',
    badge: null,
  },
  {
    title: 'Home Decor & Crafts',
    desc: 'Beads, rhinestones & craft supplies',
    slug: 'home-decor-crafts',
    badge: null,
  },
];

// Map product.categorySlug (subcategory) -> parent category slug
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

// Left sidebar categories — matches Navbar categories
const sidebarCategories = [
  {
    name: 'Toys & Gift',
    icon: Gift,
    slug: 'toys-gift',
    children: [
      { name: 'Stress Relief Toys', slug: 'stress-relief-toys' },
      { name: 'Fidget Toys', slug: 'fidget-toys' },
      { name: 'Educational Toys', slug: 'educational-toys' },
      { name: 'Gift Sets', slug: 'gift-sets' },
    ],
  },
  {
    name: 'Fashion Jewelry',
    icon: Gem,
    slug: 'fashion-jewelry',
    children: [
      { name: 'Necklaces', slug: 'necklaces' },
      { name: 'Earrings', slug: 'earrings' },
      { name: 'Rings', slug: 'rings' },
      { name: 'Bracelets & Bangles', slug: 'bracelets-bangles' },
      { name: 'Brooches & Pins', slug: 'brooches-pins' },
      { name: 'Jewelry Sets', slug: 'jewelry-sets' },
    ],
  },
  {
    name: 'Hair Accessories',
    icon: Crown,
    slug: 'hair-accessories',
    children: [
      { name: 'Hair Clips', slug: 'hair-clips' },
      { name: 'Headbands', slug: 'headbands' },
      { name: 'Hair Ties', slug: 'hair-ties' },
      { name: 'Hair Pins', slug: 'hair-pins' },
    ],
  },
  {
    name: 'Bags & Accessories',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    children: [
      { name: 'Bag Charms', slug: 'bag-charms' },
      { name: 'Keychains', slug: 'keychains' },
      { name: 'Belt Buckles', slug: 'belt-buckles' },
    ],
  },
  {
    name: 'Garment Accessories',
    icon: Scissors,
    slug: 'garment-accessories',
    children: [
      { name: 'Zippers', slug: 'zippers' },
      { name: 'Buttons', slug: 'buttons' },
      { name: 'Lace & Trim', slug: 'lace-trim' },
      { name: 'Embroidery Patches', slug: 'embroidery-patches' },
    ],
  },
  {
    name: 'Home Decor & Crafts',
    icon: HomeIcon,
    slug: 'home-decor-crafts',
    children: [
      { name: 'Beads & Charms', slug: 'beads-charms' },
      { name: 'Rhinestones', slug: 'rhinestones' },
      { name: 'Craft Supplies', slug: 'craft-supplies' },
    ],
  },
];

// Category hero guide rows — handled above (product rows, no static images)

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openCat, setOpenCat] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const topDeals = products.slice(0, 6);

  return (
    <Layout>
      {/* Main content area: left sidebar + right content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Categories */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="font-semibold text-sm text-gray-900 uppercase tracking-wider">
                    All Categories
                  </h2>
                </div>
                <nav className="py-1">
                  {sidebarCategories.map((cat) => (
                    <div key={cat.slug}>
                      <button
                        onClick={() => setOpenCat(openCat === cat.slug ? null : cat.slug)}
                        onMouseEnter={() => setOpenCat(cat.slug)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <cat.icon className="w-4 h-4 text-gray-400" />
                          {cat.name}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-300 transition-transform ${openCat === cat.slug ? 'rotate-90' : ''}`} />
                      </button>
                      {openCat === cat.slug && (
                        <div className="pb-1.5 bg-orange-50/30">
                          {cat.children.map((child) => (
                            <Link
                              key={child.slug}
                              href={`/products?category=${cat.slug}&sub=${child.slug}`}
                              className="block pl-11 pr-4 py-1.5 text-xs text-gray-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                          <Link
                            href={`/products?category=${cat.slug}`}
                            className="block pl-11 pr-4 py-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            View All →
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Right Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Hero - Top Deals Guide (one-line banner) */}
              <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0F2A4A] to-[#1a3a5c]">
                <div className="flex items-center justify-between px-6 md:px-10 py-8 md:py-10">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-2.5 py-1 rounded-full text-xs font-semibold mb-3">
                      <Flame className="w-3 h-3" />
                      Top Deals
                    </div>
                    <h1 className="font-display text-2xl md:text-4xl text-white font-bold leading-tight mb-2">
                      Wholesale Direct from Yiwu
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base mb-4">
                      Stress relief toys, jewelry, hair accessories & more. Low MOQ, factory prices.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-colors"
                    >
                      Shop All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="hidden md:flex shrink-0">
                    <img
                      src={`${PEXELS}/6983866/pexels-photo-6983866.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`}
                      alt="Top Deals"
                      className="w-56 h-36 object-cover rounded-md shadow-xl"
                    />
                  </div>
                </div>
              </section>

              {/* Activity Promo Banner (one-line) */}
              <section className="relative overflow-hidden rounded-lg bg-white border border-gray-200">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                        Summer Sourcing Festival — Up to 20% Off Bulk Orders
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        Limited-time factory pricing on stress relief toys & jewelry. Ends soon.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/products?promo=summer"
                    className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-semibold text-sm shrink-0 ml-4"
                  >
                    View Deals <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </section>

              {/* Top Deals Products Grid */}
              {topDeals.length > 0 && (
                <section className="bg-white rounded-lg border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg md:text-xl font-bold text-gray-900">
                      Top Deals
                    </h2>
                    <Link
                      href="/products?sort=hot"
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      See more
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {topDeals.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="group block"
                      >
                        <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-sm font-bold text-orange-600 mt-0.5">
                          ${Number(p.price).toFixed(2)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Category Guide Rows — one row of 4-5 products per category */}
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg md:text-xl font-bold text-gray-900">
                    Shop by Category
                  </h2>
                </div>

                {categoryGuides.map((cat) => {
                  // Get up to 5 products for this parent category
                  const catProducts = products
                    .filter(p => {
                      // API returns category as {id, name, slug} where slug is the subcategory
                      const subSlug = typeof p.category === 'object' ? p.category?.slug : '';
                      if (!subSlug) return false;
                      return SUB_TO_PARENT[subSlug] === cat.slug;
                    })
                    .slice(0, 5);

                  return (
                    <div
                      key={cat.slug}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Category header — single line with See more */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0">
                          {cat.badge && (
                            <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0">
                              {cat.badge}
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                            {cat.title}
                          </h3>
                          <span className="hidden sm:inline text-xs text-gray-400 truncate">
                            {cat.desc}
                          </span>
                        </div>
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 text-xs md:text-sm font-semibold shrink-0 ml-3"
                        >
                          See more <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Product row — 4 to 5 products in one line */}
                      {catProducts.length > 0 ? (
                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-3 p-4">
                          {catProducts.map((p) => (
                            <Link
                              key={p.id}
                              href={`/products/${p.id}`}
                              className="group block"
                            >
                              <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-2">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <p className="text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                                {p.name}
                              </p>
                              <p className="text-sm font-bold text-orange-600 mt-0.5">
                                ${Number(p.price).toFixed(2)}
                              </p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-xs text-gray-400">
                            Loading products...
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </section>

              {/* Empty state if no products */}
              {products.length === 0 && (
                <section className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Products are loading. Browse categories in the meantime.
                  </p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

export const getServerSideProps = () => ({ props: {} });
