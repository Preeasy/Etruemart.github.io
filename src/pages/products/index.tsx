import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import {
  Search, ChevronDown, ChevronRight, Grid3X3, List,
  SlidersHorizontal, Sparkles, X, Package, Filter,
  RotateCcw, ArrowRight,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';
import { SITE_URL, SITE_OG_IMAGE, MAX_PRICE_FILTER } from '@/lib/site';
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
  slug?: string | null;
  name: string;
  description: string;
  category: { name: string; slug: string };
  priceMin: number;
  price?: number;
  priceMax?: number | null;
  image: string;
  moq?: number | null;
  material?: string | null;
  plating?: string | null;
  packSize?: number | null;
  sku?: string | null;
  stockStatus?: string | null;
  keywords?: string[];
  bulletPoints?: string[];
  isParent?: boolean;
  parentId?: string | null;
  variants?: VariantPreview[] | null;
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
      .catch((e) => { if (typeof console !== 'undefined') console.warn('[Products] fetch categories level=1 failed:', e); });

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
      .catch((e) => { if (typeof console !== 'undefined') console.warn('[Products] fetch categories tree failed:', e); });
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
            slug: p.slug || null,
            name: p.name,
            description: p.description || '',
            category: { name: p.categoryName || '', slug: p.categorySlug || '' },
            priceMin: Number(p.price) || 0,
            priceMax: p.priceMax ? Number(p.priceMax) : null,
            image: proxyImageUrl(p.image),
            moq: p.moq ?? null,
            material: p.material || null,
            plating: p.plating || null,
            packSize: p.packSize ?? null,
            sku: p.sku || null,
            stockStatus: p.stockStatus || null,
            keywords: Array.isArray(p.keywords) ? p.keywords : [],
            bulletPoints: Array.isArray(p.bulletPoints) ? p.bulletPoints : [],
            isParent: p.isParent === true,
            parentId: p.parentId || null,
            variants: Array.isArray(p.variants) ? p.variants : null,
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
        <title>Wholesale Products Catalog | eTrueMart — Yiwu Factory-Direct B2B</title>
        <meta name="description" content="Browse 964+ wholesale products: fashion jewelry, bags, hair accessories, toys, garment accessories &amp; home decor. Factory-direct pricing from Yiwu, China. Low MOQ from 12 pcs." />
        <link rel="canonical" href={`${SITE_URL}/products`} />
        <meta property="og:title" content="Wholesale Products Catalog | eTrueMart B2B" />
        <meta property="og:description" content="Browse wholesale products direct from Yiwu. Factory pricing, low MOQ, global shipping to 180+ countries." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_OG_IMAGE} />
        <meta property="og:url" content={`${SITE_URL}/products`} />
        <meta property="og:site_name" content="eTrueMart" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
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

      {/* ====== Breadcrumb bar ====== */}
      <div className="bg-sand-100/60 border-b border-sand-200">
        <div className="section py-3">
          <nav className="flex items-center gap-1.5 text-xs text-ink-500">
            <Link href="/" className="link-navy font-medium">Home</Link>
            <ChevronRight className="w-3 h-3 text-ink-300" />
            <span className="text-navy-800 font-bold">Products</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-ink-300" />
                <span className="text-gold-700 font-bold">{currentCategoryName}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="section py-6 sm:py-8">
        {/* ====== Category Intro Banner ====== */}
        <div className="panel mb-6 !rounded-3xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-navy-50 via-white to-gold-50 p-5 sm:p-7">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gold-200/30 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-52 h-52 rounded-full bg-navy-200/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-white flex items-center justify-center shadow-navy-glow shrink-0">
                <Sparkles className="w-7 h-7 text-gold-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-navy-900 leading-tight">
                  {currentCategoryName}
                  <span className="font-serif italic font-medium text-ink-500 text-lg sm:text-xl ml-2">
                    Wholesale Collection
                  </span>
                </h1>
                <p className="mt-2 text-sm text-ink-500">
                  <span className="font-black text-navy-800 tabular">{sortedProducts.length}</span> curated SKUs
                  {currentCategoryName !== 'All Products' && <> · Sourced direct from verified Yiwu factories</>}
                  {sortedProducts.length === 0 ? ' — matching your filters.' : ' · Low MOQ · QC before every shipment.'}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <Link href="/" className="btn-outline btn-sm">
                  Back to Home
                </Link>
                <a
                  href="https://wa.me/8618767960499?text=Hello%2C%20I%27d%20like%20a%20quote%20for%20eTrueMart%20wholesale%20products."
                  target="_blank" rel="noreferrer noopener"
                  className="btn-primary btn-sm"
                >
                  💬 Request Quote
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ====== Compact Toolbar ====== */}
        <div className="panel mb-5 !rounded-2xl overflow-hidden">
          {/* Top row: Search + Sort + View + Filter */}
          <div className="flex flex-col lg:flex-row gap-3 p-4 lg:p-5">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-11 pr-10 h-11 text-base"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-navy-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select h-11 pr-10 appearance-none cursor-pointer w-auto"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex items-center border border-sand-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-navy-800 text-white' : 'text-ink-500 hover:text-navy-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-navy-800 text-white' : 'text-ink-500 hover:text-navy-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 inline-flex items-center gap-1.5 px-4 rounded-xl text-sm font-bold transition-all ${
                  showFilters || hasActiveFilters
                    ? 'btn-primary !py-0 !px-4'
                    : 'bg-white border border-sand-200 text-navy-800 hover:border-gold-400 hover:text-gold-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && !showFilters && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-coral-500 text-white text-[10px] font-black tabular">
                    {[selectedCategory !== 'all', !!selectedMaterial, !!selectedPlating, priceRange[0] > 0, priceRange[1] < 999].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category pills — horizontal scroll bar */}
          <div className="border-t border-sand-200 bg-sand-50/50 px-4 lg:px-5 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <span className="label !mb-0 mr-2 !text-[10px] flex-shrink-0">
                <Filter className="w-3 h-3 inline mr-1" />Category
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'btn-navy !py-1.5 !px-3.5 !rounded-xl !text-xs'
                    : 'bg-white border border-sand-200 text-ink-600 hover:border-navy-300 hover:text-navy-800'
                }`}
              >
                All ({totalCount || products.length})
              </button>
              {categoryFilters.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'btn-navy !py-1.5 !px-3.5 !rounded-xl !text-xs'
                      : 'bg-white border border-sand-200 text-ink-600 hover:border-gold-400 hover:text-gold-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="border-t border-sand-200 p-4 lg:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="label">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="select cursor-pointer appearance-none"
                  >
                    <option value="">All Materials</option>
                    {materialOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Plating / Finish</label>
                  <select
                    value={selectedPlating}
                    onChange={(e) => setSelectedPlating(e.target.value)}
                    className="select cursor-pointer appearance-none"
                  >
                    <option value="">All Finishes</option>
                    {platingOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Min Price (USD)</label>
                  <input
                    type="number" min={0}
                    value={priceRange[0]}
                    onChange={(e) => { const n = e.target.value === '' ? 0 : Number(e.target.value); if (!Number.isNaN(n)) setPriceRange([n, priceRange[1]]); }}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label">Max Price (USD)</label>
                  <input
                    type="number" min={0}
                    value={priceRange[1]}
                    onChange={(e) => { const n = e.target.value === '' ? MAX_PRICE_FILTER : Number(e.target.value); if (!Number.isNaN(n)) setPriceRange([priceRange[0], n]); }}
                    className="input"
                    placeholder="999"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-sand-100">
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-coral-600 font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-primary btn-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedCategory !== 'all' && (
              <span className="tag-gold">
                {currentCategoryName}
                <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-gold-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedMaterial && (
              <span className="tag-sand">
                {selectedMaterial}
                <button onClick={() => setSelectedMaterial('')} className="ml-1 hover:text-ink-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedPlating && (
              <span className="tag-sand">
                {selectedPlating}
                <button onClick={() => setSelectedPlating('')} className="ml-1 hover:text-ink-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 999) && (
              <span className="tag-navy">
                ${priceRange[0]} – ${priceRange[1]}
                <button onClick={() => setPriceRange([0, 999])} className="ml-1 hover:text-navy-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-xs text-ink-500 hover:text-coral-600 font-bold underline underline-offset-2 ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* ====== Product Results ====== */}
        <div>
          {sortedProducts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
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
                    className="panel-hover !rounded-2xl flex gap-4 bg-white group"
                  >
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-gradient-to-br from-gold-50 via-white to-sand-100 rounded-2xl overflow-hidden border border-sand-200 m-3">
                      <Image
                        src={product.image || ""}
                        alt={product.name}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 112px, 144px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const el = e.currentTarget as unknown as HTMLImageElement;
                          if (!el.dataset.fallback) {
                            el.dataset.fallback = "1";
                            (el as any).src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FAF6EE"/><stop offset="100%" stop-color="#F2E9D6"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><text x="100" y="105" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="12" fill="#9F9C93" font-weight="600">${(product.name||'').slice(0,18)}</text></svg>`);
                          }
                        }}
                      />
                      {product.stockStatus === 'IN_STOCK' && (
                        <span className="absolute top-2 left-2 tag-green !text-[10px] !py-0.5 !px-2">
                          In Stock
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-4 pr-4">
                      {product.category && (
                        <span className="kicker !text-[9px] !px-2.5 !py-0.5 !rounded-full">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="mt-2 font-display font-extrabold text-navy-900 hover:text-gold-700 transition-colors line-clamp-1 text-base sm:text-lg leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-ink-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description?.replace(/<[^>]+>/g, ' ') || 'Factory-direct wholesale from Yiwu, Zhejiang. Bulk discounts available for qualified buyers.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {product.material && (
                          <span className="tag-sand !text-[10px] !py-0.5 !px-2.5">
                            {product.material}
                          </span>
                        )}
                        {product.sku && (
                          <span className="tag !text-[10px] !py-0.5 !px-2.5 bg-white border border-sand-200 text-ink-500 font-mono">
                            SKU · {product.sku}
                          </span>
                        )}
                        {product.moq && (
                          <span className="tag-navy !text-[10px] !py-0.5 !px-2.5">
                            MOQ {product.moq} pcs
                          </span>
                        )}
                      </div>
                      <div className="flex items-end justify-between mt-3 pt-3 border-t border-sand-100">
                        <div className="flex items-baseline gap-2">
                          <span className="price-current text-2xl">
                            ${Number(product.priceMin || product.price || 0).toFixed(2)}
                          </span>
                          {product.priceMax && Number(product.priceMax) - Number(product.priceMin || 0) > 0.01 && (
                            <span className="text-sm text-ink-400">– ${Number(product.priceMax).toFixed(2)}</span>
                          )}
                          <span className="text-xs text-ink-400 font-medium">/ unit</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 group-hover:text-gold-700 transition-colors">
                          View Details
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="panel !rounded-3xl py-16 sm:py-20">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sand-50 to-gold-50 border border-sand-200 flex items-center justify-center mx-auto mb-6 shadow-paper">
                  <Search className="w-12 h-12 text-gold-400" strokeWidth={1.6} />
                </div>
                <span className="kicker mb-4">No matches found</span>
                <h3 className="mt-4 font-display font-black text-2xl sm:text-3xl text-navy-900">
                  We couldn&apos;t find those products <span className="text-gold-gradient">— yet.</span>
                </h3>
                <p className="mt-4 text-ink-500 leading-relaxed">
                  Try broadening your filters, or send us your sourcing list —
                  our Yiwu team can source it direct from 2,000+ factories within 2 hours.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button onClick={clearAllFilters} className="btn-navy">
                    <RotateCcw className="w-4 h-4" />
                    Reset All Filters
                  </button>
                  <a
                    href="https://wa.me/8618767960499?text=Hello%2C%20I%20need%20help%20sourcing%20products%20from%20Yiwu."
                    target="_blank" rel="noreferrer noopener"
                    className="btn-primary"
                  >
                    💬 Ask for Sourcing Help
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====== CTA strip under listing ====== */}
        {sortedProducts.length > 0 && (
          <div className="mt-12 premium-card !rounded-3xl overflow-hidden bg-cta-gradient text-white">
            <div className="absolute inset-0 bg-hero-texture opacity-60 pointer-events-none" />
            <div className="relative p-6 sm:p-10 lg:p-12 grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-gold-200 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5">
                  🏭 Yiwu Direct · Mixed container orders welcome
                </span>
                <h2 className="mt-5 font-display font-black text-2xl sm:text-4xl leading-[1.1] tracking-tight text-white">
                  Ordering {sortedProducts.length} SKUs? <span className="text-gold-gradient">Get an all-in quote.</span>
                </h2>
                <p className="mt-3 text-navy-100/85 leading-relaxed max-w-2xl">
                  Consolidate multiple products into one shipment. Save on freight with our weekly LCL/FCL departures.
                  Door-to-door delivery to 180+ countries.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                <a
                  href="https://wa.me/8618767960499?text=Hello%2C%20I%20want%20a%20bulk%20quote%20for%20${encodeURIComponent(currentCategoryName)}%20from%20eTrueMart."
                  target="_blank" rel="noreferrer noopener"
                  className="btn-primary btn-lg shadow-gold-glow flex-1 justify-center"
                >
                  📨 Request Bulk Quote
                </a>
                <Link href="/register" className="btn btn-lg !text-white border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur flex-1 justify-center">
                  📦 Mixed Order Calculator
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
