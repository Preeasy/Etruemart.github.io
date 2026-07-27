import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  Filter,
  Sparkles,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Sidebar from '@/components/Sidebar';
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
  material?: string;
  plating?: string;
  packSize?: number;
  sku?: string;
  stockStatus?: string;
}

const categoryFilters = [
  { name: 'Toys & Gift', slug: 'toys-gift' },
  { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  { name: 'Hair Accessories', slug: 'hair-accessories' },
  { name: 'Bags & Accessories', slug: 'bags-accessories' },
  { name: 'Garment Accessories', slug: 'garment-accessories' },
  { name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
];

const materialOptions = ['Alloy', 'Stainless Steel', 'Brass', 'Acrylic', 'Crystal', 'Pearl', 'Resin', 'Fabric', 'Rhinestone'];
const platingOptions = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Rhodium Plated', 'Gunmetal', 'Antique Bronze'];

const Products = ({ products }: { products: Product[] }) => {
  const router = useRouter();
  const { category: queryCategory } = router.query;

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
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-ink-500">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium">Home</Link>
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

      {/* Page header */}
      <div className="bg-gradient-to-b from-white to-ink-50 border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-bold text-accent-600 uppercase tracking-[0.15em]">Wholesale Catalog</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-800 tracking-tight">
            {currentCategoryName}
          </h1>
          <p className="text-ink-500 mt-2 max-w-2xl">
            Wholesale jewelry & accessories — direct from Yiwu. Factory pricing, low MOQ, fast global shipping.
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-700 hover:border-accent-500 transition-colors font-medium shadow-soft"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <div className="flex items-center border border-ink-200 rounded-xl overflow-hidden bg-white shadow-soft">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
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
            <div className="hidden lg:block mb-5">
              <div className="bg-white rounded-2xl border border-ink-200 shadow-soft p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-accent-500" />
                  <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.1em]">Refine Results</h3>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {/* Category Pills */}
                  <div className="col-span-4 flex flex-wrap gap-2 mb-3 pb-3 border-b border-ink-100">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-accent-500 text-white shadow-accent-glow'
                          : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                      }`}
                    >
                      All
                    </button>
                    {categoryFilters.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedCategory === cat.slug
                            ? 'bg-accent-500 text-white shadow-accent-glow'
                            : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Material</label>
                    <select
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white"
                    >
                      <option value="">All Materials</option>
                      {materialOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Plating / Finish</label>
                    <select
                      value={selectedPlating}
                      onChange={(e) => setSelectedPlating(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white"
                    >
                      <option value="">All Finishes</option>
                      {platingOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Min Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white"
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 block">Max Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-ink-50 border border-ink-200 rounded-lg px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white"
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
                  className="mt-4 text-xs text-ink-500 hover:text-accent-600 font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 mb-5 border border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
              <p className="text-ink-600 text-sm">
                Showing <span className="font-bold text-navy-800">{sortedProducts.length}</span> products
              </p>
              <div className="flex items-center gap-3">
                {/* View toggle (desktop) */}
                <div className="hidden lg:flex items-center border border-ink-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}
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
                    className="appearance-none bg-ink-50 border border-ink-200 px-4 py-2 pr-10 rounded-lg text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-colors cursor-pointer font-medium"
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex gap-5 bg-white rounded-2xl border border-ink-200 p-4 hover:border-accent-400 hover:shadow-medium transition-all"
                    >
                      <div className="relative w-32 h-32 flex-shrink-0 bg-ink-50 rounded-xl overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {product.category && (
                          <span className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.12em]">
                            {product.category.name}
                          </span>
                        )}
                        <h3 className="font-bold text-navy-800 mt-1 hover:text-accent-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-ink-600 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {product.material && (
                            <span className="text-[10px] text-ink-600 bg-ink-100 px-2 py-0.5 rounded-full font-medium">
                              {product.material}
                            </span>
                          )}
                          {product.plating && (
                            <span className="text-[10px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full border border-accent-200 font-medium">
                              {product.plating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-lg font-bold text-navy-800">
                            ${Number(product.priceMin).toFixed(2)}
                          </span>
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
                <div className="w-20 h-20 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-ink-300" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">No products found</h3>
                <p className="text-ink-500 mb-6 max-w-md mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedMaterial('');
                    setSelectedPlating('');
                    setPriceRange([0, 999]);
                  }}
                  className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-accent-glow"
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

export const getServerSideProps = async () => {
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  const products = siteData.products || [];
  return { props: { products } };
};
