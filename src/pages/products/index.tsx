import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import {
  Search, ChevronDown, ChevronRight, Grid3X3, List,
  SlidersHorizontal, Sparkles, X, Package, Filter,
  RotateCcw,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';
import { SITE_URL, SITE_OG_IMAGE } from '@/lib/site';
import { proxyImageUrl } from '@/lib/image-utils';

interface VariantPreview {
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
  isParent?: boolean;
  parentId?: string | null;
  variants?: VariantPreview[];
}

const materialOptions = ['Alloy', 'Stainless Steel', 'Brass', 'Acrylic', 'Crystal', 'Pearl', 'Resin', 'Fabric', 'Rhinestone'];
const platingOptions = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Rhodium Plated', 'Gunmetal', 'Antique Bronze'];

const Products = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { category: queryCategory, q: querySearch } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categoryFilters, setCategoryFilters] = useState<{ name: string; slug: string }[]>([]);
  const [categorySlugMap, setCategorySlugMap] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState(typeof querySearch === 'string' ? querySearch : '');
  const [selectedCategory, setSelectedCategory] = useState(
    typeof queryCategory === 'string' ? queryCategory : 'all'
  );
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedPlating, setSelectedPlating] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const category = typeof router.query.category === 'string' ? router.query.category : 'all';
    const search = typeof router.query.q === 'string' ? router.query.q : '';
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [router.query.category, router.query.q]);

  useEffect(() => {
    fetch('/api/categories?level=1')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoryFilters(data.map((c: any) => ({ name: c.name, slug: c.slug })));
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data)) {
          const slugMap = new Map<string, string>();
          const buildSlugMap = (cats: any[], parentSlug?: string) => {
            for (const cat of cats) {
              if (parentSlug) slugMap.set(cat.slug, parentSlug);
              if (cat.children && cat.children.length > 0) {
                buildSlugMap(cat.children, parentSlug || cat.slug);
              }
            }
          };
          buildSlugMap(data);
          setCategorySlugMap(slugMap);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('q', searchQuery);
    const url = params.toString() ? `/api/products?${params.toString()}` : '/api/products';

    fetch(url)
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
            image: proxyImageUrl(p.image),
            moq: p.moq,
            material: p.material || undefined,
            plating: p.plating || undefined,
            packSize: p.packSize,
            sku: p.sku || undefined,
            stockStatus: p.stockStatus,
            keywords: Array.isArray(p.keywords) ? p.keywords : [],
            bulletPoints: Array.isArray(p.bulletPoints) ? p.bulletPoints : [],
            isParent: p.isParent === true,
            parentId: p.parentId || null,
            variants: Array.isArray(p.variants) ? p.variants : undefined,
          }));
          setTotalCount(data.length);
          setProducts(dbProducts);
        } else {
          setTotalCount(0);
          setProducts([]);
        }
      })
      .catch(() => {});
  }, [selectedCategory, searchQuery]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.description && product.description.toLowerCase().includes(q)) ||
      (product.sku && product.sku.toLowerCase().includes(q)) ||
      (product.keywords && Array.isArray(product.keywords) && product.keywords.some(k => k.toLowerCase().includes(q)));

    const productCategorySlug = product.category?.slug || '';
    const mappedSlug = categorySlugMap.get(productCategorySlug) || productCategorySlug;

    const matchesCategory =
      selectedCategory === 'all' ||
      productCategorySlug === selectedCategory ||
      mappedSlug === selectedCategory;

    const matchesMaterial =
      !selectedMaterial ||
      (product.material && product.material.toLowerCase().includes(selectedMaterial.toLowerCase()));

    const matchesPlating =
      !selectedPlating ||
      (product.plating && product.plating.toLowerCase().includes(selectedPlating.toLowerCase()));

    const price = Number(product.priceMin);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    // Hide invalid products with zero price
    const hasValidPrice = price > 0 || (Number(product.priceMax ?? 0) > 0);

    return hasValidPrice && matchesSearch && matchesCategory && matchesMaterial && matchesPlating && matchesPrice;
  }), [products, searchQuery, selectedCategory, categorySlugMap, selectedMaterial, selectedPlating, priceRange]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-low': sorted.sort((a, b) => Number(a.priceMin) - Number(b.priceMin)); break;
      case 'price-high': sorted.sort((a, b) => Number(b.priceMin) - Number(a.priceMin)); break;
      default: break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  const currentCat = categoryFilters.find(c => c.slug === selectedCategory);
  const currentCategoryName = currentCat?.name || 'All Products';

  const hasActiveFilters = selectedCategory !== 'all' || selectedMaterial || selectedPlating || searchQuery || priceRange[0] > 0 || priceRange[1] < 999;

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedMaterial('');
    setSelectedPlating('');
    setSearchQuery('');
    setPriceRange([0, 999]);
  };

  return (
    <Layout>
      <Head>
        <title>Wholesale Products Catalog | eTrue Mark</title>
        <meta name="description" content="Browse wholesale products: fashion jewelry, bags, hair accessories, toys, garment accessories & home decor. Factory-direct pricing from Yiwu, China." />
        <link rel="canonical" href={`${SITE_URL}/products`} />
        <meta property="og:title" content="Wholesale Products Catalog | eTrue Mark" />
        <meta property="og:description" content="Browse wholesale products direct from Yiwu. Factory pricing, low MOQ, global shipping." />
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
      <div className="bg-ink-50/70 border-b border-ink-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="w-3 h-3 text-ink-300" />
            <span className="text-navy-800 font-semibold">Products</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-ink-300" />
                <span className="text-accent-600 font-semibold">{currentCategoryName}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
        {/* ===== Compact Toolbar — consolidated search + categories + filters + sort ===== */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-sm overflow-hidden">
          {/* Top row: Title + Search + Filter toggle + Sort */}
          <div className="flex flex-col lg:flex-row gap-3 p-4 lg:p-5">
            {/* Left: Category title & count */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-lg lg:text-xl font-bold text-navy-900 leading-tight">{currentCategoryName}</h1>
                <p className="text-xs text-ink-500">
                  <span className="font-semibold text-navy-700">{sortedProducts.length}</span> products
                  {currentCategoryName !== 'All Products' && ' · Factory direct from Yiwu'}
                </p>
              </div>
            </div>

            {/* Middle: Search bar */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, SKU, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Sort + View + Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-10 bg-ink-50 border border-ink-200 pl-3 pr-8 rounded-xl text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 cursor-pointer font-medium"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center border border-ink-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-accent-500 text-white' : 'bg-ink-50 text-ink-500 hover:text-accent-600'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-accent-500 text-white' : 'bg-ink-50 text-ink-500 hover:text-accent-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-accent-500 text-white'
                    : 'bg-ink-50 border border-ink-200 text-ink-700 hover:border-accent-500'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && !showFilters && (
                  <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-accent-600 rounded-full text-[10px] font-bold">
                    {[selectedCategory !== 'all', !!selectedMaterial, !!selectedPlating, priceRange[0] > 0, priceRange[1] < 999].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category pills — scrollable horizontal bar */}
          <div className="border-t border-ink-100 bg-ink-50/50 px-4 lg:px-5 py-2.5 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider flex-shrink-0 mr-1">Category</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-white border border-ink-200 text-ink-600 hover:border-navy-300 hover:text-navy-800'
                }`}
              >
                All
              </button>
              {categoryFilters.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-navy-800 text-white shadow-sm'
                      : 'bg-white border border-ink-200 text-ink-600 hover:border-navy-300 hover:text-navy-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="border-t border-ink-100 bg-white px-4 lg:px-5 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full h-9 bg-ink-50 border border-ink-200 rounded-lg px-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 appearance-none cursor-pointer"
                  >
                    <option value="">All Materials</option>
                    {materialOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Plating</label>
                  <select
                    value={selectedPlating}
                    onChange={(e) => setSelectedPlating(e.target.value)}
                    className="w-full h-9 bg-ink-50 border border-ink-200 rounded-lg px-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 appearance-none cursor-pointer"
                  >
                    <option value="">All Finishes</option>
                    {platingOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Min Price ($)</label>
                  <input
                    type="number" min={0}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full h-9 bg-ink-50 border border-ink-200 rounded-lg px-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Max Price ($)</label>
                  <input
                    type="number" min={0}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-9 bg-ink-50 border border-ink-200 rounded-lg px-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                    placeholder="999"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-accent-600 font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-xs font-semibold text-accent-600 hover:text-accent-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-accent-200">
                {currentCategoryName}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-accent-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedMaterial && (
              <span className="inline-flex items-center gap-1 bg-ink-100 text-ink-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {selectedMaterial}
                <button onClick={() => setSelectedMaterial('')} className="hover:text-ink-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedPlating && (
              <span className="inline-flex items-center gap-1 bg-ink-100 text-ink-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                {selectedPlating}
                <button onClick={() => setSelectedPlating('')} className="hover:text-ink-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-xs text-ink-500 hover:text-accent-600 font-medium underline underline-offset-2">
              Clear all
            </button>
          </div>
        )}

        {/* Products */}
        <div className="mt-5">
          {sortedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                {sortedProducts.map((product) => {
                  const isAdmin = session?.user?.role === 'ADMIN';
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      editUrl={isAdmin && product.id ? `/sell/${product.id}` : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug || product.id}`}
                    className="flex gap-4 bg-white rounded-xl border border-ink-200 p-4 hover:border-accent-300 hover:shadow-md transition-all group"
                  >
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 bg-gradient-to-br from-ink-50 to-white rounded-xl overflow-hidden border border-ink-100">
                      <Image
                        src={product.image || ""}
                        alt={product.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, 128px"
                        className="!object-contain !w-auto !h-auto !p-2 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const el = e.currentTarget as unknown as HTMLImageElement;
                          if (!el.dataset.fallback) {
                            el.dataset.fallback = "1";
                            (el as any).src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="#f3f4f6" width="200" height="200"/><text x="100" y="105" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">${product.name.slice(0,18)}</text></svg>`);
                          }
                        }}
                      />
                      {product.stockStatus === 'IN_STOCK' && (
                        <span className="absolute top-1.5 right-1.5 bg-success-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          In Stock
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {product.category && (
                        <span className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.1em]">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-navy-800 mt-0.5 hover:text-accent-600 transition-colors line-clamp-1 text-sm sm:text-base">
                        {product.name}
                      </h3>
                      <p className="text-xs text-ink-500 mt-0.5 line-clamp-1 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {product.material && (
                          <span className="text-[10px] text-ink-600 bg-ink-100 px-2 py-0.5 rounded-full font-medium">
                            {product.material}
                          </span>
                        )}
                        {product.sku && (
                          <span className="text-[10px] text-ink-400 bg-white border border-ink-200 px-2 py-0.5 rounded-full font-mono">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-navy-800">
                            ${Number(product.priceMin || product.price || 0).toFixed(2)}
                          </span>
                          {product.priceMax && (
                            <span className="text-xs text-ink-400">- ${Number(product.priceMax).toFixed(2)}</span>
                          )}
                        </div>
                        <span className="text-xs text-ink-500">
                          MOQ: <span className="text-navy-800 font-bold">{product.moq || 1} pcs</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-ink-200">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ink-100 to-ink-50 flex items-center justify-center mx-auto mb-5">
                <Search className="w-10 h-10 text-ink-300" />
              </div>
              <h3 className="text-lg font-bold text-navy-800 mb-2">No products found</h3>
              <p className="text-ink-500 mb-6 max-w-md mx-auto text-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
