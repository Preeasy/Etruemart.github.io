import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  Filter,
  Sparkles,
  X,
  Settings,
  Edit3,
  Package,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { SITE_URL, SITE_OG_IMAGE } from '@/lib/site';
import siteDataJson from '../../../site-data.json';

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  description: string;
  category: { name: string; slug: string };
  priceMin: number;
  priceMax?: number;
  image: string;
  moq?: number;
  material?: string;
  plating?: string;
  packSize?: number;
  sku?: string;
  stockStatus?: string;
  keywords?: string[];
  bulletPoints?: string[];
}

const categoryFilters = [
  { name: 'Toys & Gift', slug: 'toys-gift' },
  { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  { name: 'Bags & Accessories', slug: 'bags-accessories' },
  { name: 'Hair Accessories', slug: 'hair-accessories' },
  { name: 'Garment Accessories', slug: 'garment-accessories' },
  { name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
];

const materialOptions = ['Alloy', 'Stainless Steel', 'Brass', 'Acrylic', 'Crystal', 'Pearl', 'Resin', 'Fabric', 'Rhinestone'];
const platingOptions = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Rhodium Plated', 'Gunmetal', 'Antique Bronze'];

const Products = ({ products: initialProducts }: { products: Product[] }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { category: queryCategory } = router.query;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    typeof queryCategory === 'string' ? queryCategory : 'all'
  );
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedPlating, setSelectedPlating] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);
  const [sortBy, setSortBy] = useState('newest');
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sellerProducts, setSellerProducts] = useState<{ id: string; slug: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const dbProducts: Product[] = data.map((p: any) => ({
            id: p.id,
            slug: p.slug || undefined,
            name: p.name,
            description: p.description || '',
            category: { name: p.categoryName || '', slug: p.categorySlug || '' },
            priceMin: Number(p.price) || 0,
            priceMax: p.priceMax ? Number(p.priceMax) : undefined,
            image: p.image,
            moq: p.moq,
            material: p.material || undefined,
            plating: p.plating || undefined,
            packSize: p.packSize,
            sku: p.sku || undefined,
            stockStatus: p.stockStatus,
            keywords: Array.isArray(p.keywords) ? p.keywords : [],
            bulletPoints: Array.isArray(p.bulletPoints) ? p.bulletPoints : [],
          }));
          const slugSet = new Set(dbProducts.map(p => p.id));
          const merged = [...dbProducts, ...initialProducts.filter(p => !slugSet.has(String(p.id)))];
          setProducts(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user && (session.user.role === 'OFFICIAL_SELLER' || session.user.role === 'ADMIN')) {
      fetch('/api/products/my-products')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.products) setSellerProducts(data.products); })
        .catch(() => {});
    }
  }, [session]);

  const sellerProductMap = new Map(sellerProducts.map(p => [p.slug || p.id, p]));
  const sellerProductByNameMap = new Map(sellerProducts.map(p => [p.name?.toLowerCase() || '', p]));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const productCategorySlug = product.category?.slug || '';

    const matchesCategory =
      selectedCategory === 'all' ||
      productCategorySlug === selectedCategory;

    const matchesMaterial =
      !selectedMaterial ||
      (product.material && product.material.toLowerCase().includes(selectedMaterial.toLowerCase()));

    const matchesPlating =
      !selectedPlating ||
      (product.plating && product.plating.toLowerCase().includes(selectedPlating.toLowerCase()));

    const price = Number(product.priceMin);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesMaterial && matchesPlating && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return Number(a.priceMin) - Number(b.priceMin);
      case 'price-high': return Number(b.priceMin) - Number(a.priceMin);
      default: return 0;
    }
  });

  const currentCat = categoryFilters.find(c => c.slug === selectedCategory);
  const currentCategoryName = currentCat?.name || 'All Products';

  return (
    <Layout>
      <Head>
        <title>Wholesale Products Catalog | eTrue Mark</title>
        <meta name="description" content="Browse 178+ wholesale products: fashion jewelry, bags, hair accessories, toys, garment accessories & home decor. Factory-direct pricing from Yiwu, China." />
        <link rel="canonical" href={`${SITE_URL}/products`} />
        <meta property="og:title" content="Wholesale Products Catalog | eTrue Mark" />
        <meta property="og:description" content="Browse 178+ wholesale products direct from Yiwu. Factory pricing, low MOQ, global shipping." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_OG_IMAGE} />
        <meta property="og:url" content={`${SITE_URL}/products`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
              ...(selectedCategory !== 'all' && currentCat ? [{ '@type': 'ListItem', position: 3, name: currentCat.name, item: `${SITE_URL}/products?category=${selectedCategory}` }] : []),
            ],
          })
        }} />
      </Head>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium text-ink-600">Home</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <span className="text-navy-800 font-bold">Products</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-4 h-4 text-ink-300" />
                <span className="text-accent-600 font-bold">{currentCategoryName}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Page header — clean white, no dark banner */}
      <div className="bg-white border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-6 lg:py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent-500" />
                <span className="text-[11px] font-bold text-accent-600 uppercase tracking-[0.15em]">Wholesale Catalog</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900 tracking-tight mb-2">
                {currentCategoryName}
              </h1>
              <p className="text-ink-500 text-sm max-w-2xl leading-relaxed mb-4">
                Wholesale jewelry & accessories — direct from Yiwu. Factory pricing, low MOQ, fast global shipping.
              </p>
            </div>
            {session?.user && (session.user.role === 'OFFICIAL_SELLER' || session.user.role === 'ADMIN') && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 text-ink-700 text-sm font-semibold rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Seller Center
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  My Products
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-ink-50 border border-ink-200 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
              <span className="text-[11px] text-ink-600 font-medium">{sortedProducts.length} Products Available</span>
            </div>
            <div className="flex items-center gap-1.5 bg-ink-50 border border-ink-200 rounded-full px-3 py-1.5">
              <span className="text-[11px] text-ink-600 font-medium">MOQ Starting at 12 pcs</span>
            </div>
            <div className="flex items-center gap-1.5 bg-ink-50 border border-ink-200 rounded-full px-3 py-1.5">
              <span className="text-[11px] text-ink-600 font-medium">Factory Direct Pricing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-navy-800">Filters</h3>
              <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-ink-100 rounded-lg">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-2 block">Category</label>
                <div className="space-y-2">
                  {categoryFilters.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setShowSidebar(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === cat.slug
                          ? 'bg-accent-500 text-white'
                          : 'text-ink-700 hover:bg-ink-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedMaterial('');
                  setSelectedPlating('');
                  setSearchQuery('');
                  setPriceRange([0, 999]);
                  setShowSidebar(false);
                }}
                className="w-full text-sm text-ink-500 hover:text-accent-600 font-medium py-2"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-700 hover:border-accent-500 transition-colors font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-2.5 ${viewMode === 'list' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          <Sidebar products={products} currentCategory={selectedCategory} />

          <div className="flex-1 min-w-0">
            {/* Filters Side Panel (Desktop) */}
            <div className="hidden lg:block mb-6">
              <div className="bg-white rounded-xl border border-ink-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Filter className="w-5 h-5 text-accent-500" />
                  <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.12em]">Refine Results</h3>
                </div>

                {/* Search */}
                <div className="mb-5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-gradient-to-r from-ink-50 to-white border border-ink-200 rounded-xl text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  </div>
                </div>

                {/* Category Pills */}
                <div className="mb-5 pb-5 border-b border-ink-100">
                  <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-navy-800 text-white shadow-md'
                          : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                      }`}
                    >
                      All
                    </button>
                    {categoryFilters.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedCategory === cat.slug
                            ? 'bg-navy-800 text-white shadow-md'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2 block">Material</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="w-full bg-gradient-to-r from-ink-50 to-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 appearance-none cursor-pointer"
                    >
                      <option value="">All Materials</option>
                      {materialOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2 block">Plating</label>
                    <select
                      value={selectedPlating}
                      onChange={(e) => setSelectedPlating(e.target.value)}
                      className="w-full bg-gradient-to-r from-ink-50 to-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 appearance-none cursor-pointer"
                    >
                      <option value="">All Finishes</option>
                      {platingOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2 block">Min Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-gradient-to-r from-ink-50 to-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2 block">Max Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-gradient-to-r from-ink-50 to-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedMaterial('');
                    setSelectedPlating('');
                    setSearchQuery('');
                    setPriceRange([0, 999]);
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-accent-600 font-semibold transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-accent-100 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-accent-600" />
                </div>
                <p className="text-ink-600 text-sm">
                  Showing <span className="font-bold text-navy-800">{sortedProducts.length}</span> products
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View toggle (desktop) */}
                <div className="hidden lg:flex items-center border border-ink-200 rounded-xl overflow-hidden bg-ink-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-white text-accent-600' : 'text-ink-500 hover:text-accent-600'}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 ${viewMode === 'list' ? 'bg-white text-accent-600' : 'text-ink-500 hover:text-accent-600'}`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gradient-to-r from-ink-50 to-white border border-ink-200 px-4 py-2.5 pr-10 rounded-xl text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 cursor-pointer font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products grid */}
            {sortedProducts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {sortedProducts.map((product) => {
                    const sellerMatch = sellerProductMap.get(String(product.id)) || sellerProductByNameMap.get(product.name?.toLowerCase());
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        editUrl={sellerMatch ? `/sell/${sellerMatch.id}` : undefined}
                        isOwner={!!sellerMatch}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      className="flex gap-5 bg-white rounded-xl border border-ink-100 p-5 hover:border-accent-300 hover:shadow-md transition-all group"
                    >
                      <div className="relative w-36 h-36 flex-shrink-0 bg-gradient-to-br from-ink-50 to-white rounded-xl overflow-hidden border border-ink-100">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="144px"
                        />
                        {product.stockStatus === 'IN_STOCK' && (
                          <span className="absolute top-2 right-2 bg-success-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase">
                            In Stock
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {product.category && (
                          <span className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.12em]">
                            {product.category.name}
                          </span>
                        )}
                        <h3 className="font-bold text-navy-800 mt-1.5 hover:text-accent-600 transition-colors line-clamp-1 text-base">
                          {product.name}
                        </h3>
                        <p className="text-sm text-ink-500 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {product.material && (
                            <span className="text-[10px] text-ink-600 bg-ink-100 px-2.5 py-1 rounded-full font-medium">
                              {product.material}
                            </span>
                          )}
                          {product.sku && (
                            <span className="text-[10px] text-ink-400 bg-white border border-ink-200 px-2.5 py-1 rounded-full font-mono">
                              {product.sku}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-navy-800">
                              ${Number(product.priceMin).toFixed(2)}
                            </span>
                            {product.priceMax && (
                              <span className="text-sm text-ink-400">- ${Number(product.priceMax).toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-ink-500">
                              MOQ: <span className="text-navy-800 font-bold">{product.moq || 1} pcs</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-ink-100">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-ink-100 to-ink-50 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-ink-300" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-3">No products found</h3>
                <p className="text-ink-500 mb-8 max-w-md mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedMaterial('');
                    setSelectedPlating('');
                    setPriceRange([0, 999]);
                  }}
                  className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white px-8 py-3 rounded-xl font-bold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;

export const getStaticProps = async () => {
  const products = (siteDataJson as any).products || [];
  return { props: { products } };
};
