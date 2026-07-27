import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Grid3X3,
  List,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
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

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Products</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-orange-600 font-medium">
                  {categoryFilters.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-[0.2em]">Wholesale Catalog</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2">
            {selectedCategory !== 'all'
              ? categoryFilters.find(c => c.slug === selectedCategory)?.name || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-2">
            Wholesale jewelry & accessories — direct from Yiwu
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:border-orange-500/50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-600'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={`${showSidebar ? 'fixed inset-0 bg-black/50 z-40 lg:relative lg:bg-transparent' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}
          >
            <div
              className={`${showSidebar ? 'absolute left-0 top-0 h-full w-80 bg-gray-50 p-6 overflow-y-auto border-r border-gray-200' : ''} lg:relative lg:p-0 lg:w-full`}
            >
              <div className="lg:sticky lg:top-32">
                {/* Mobile close */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button onClick={() => setShowSidebar(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-orange-50 text-orange-600 font-medium border border-orange-200'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      All Categories
                    </button>
                    {categoryFilters.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.slug
                            ? 'bg-orange-50 text-orange-600 font-medium border border-orange-200'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Material
                  </h3>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  >
                    <option value="">All Materials</option>
                    {materialOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Plating */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Plating / Finish
                  </h3>
                  <select
                    value={selectedPlating}
                    onChange={(e) => setSelectedPlating(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  >
                    <option value="">All Finishes</option>
                    {platingOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">
                    Price Range (USD)
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">–</span>
                    <input
                      type="number"
                      min={0}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Clear filters */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedMaterial('');
                    setSelectedPlating('');
                    setSearchQuery('');
                    setPriceRange([0, 999]);
                  }}
                  className="w-full text-sm text-gray-500 hover:text-orange-600 py-2 border border-gray-200 rounded-lg hover:border-orange-500/30 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <p className="text-gray-600 text-sm">
                Showing <span className="font-semibold text-gray-900">{sortedProducts.length}</span> products
              </p>
              <div className="flex items-center gap-3">
                {/* View toggle (desktop) */}
                <div className="hidden lg:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-600'}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-orange-600'}`}
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
                    className="appearance-none bg-gray-50 border border-gray-200 px-4 py-2 pr-10 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products grid */}
            {sortedProducts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      className="flex gap-5 bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-400 hover:shadow-md transition-all"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {product.category && (
                          <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                            {product.category.name}
                          </span>
                        )}
                        <h3 className="font-medium text-gray-900 mt-1 hover:text-orange-700 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {product.material && (
                            <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                              {product.material}
                            </span>
                          )}
                          {product.plating && (
                            <span className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                              {product.plating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-lg font-bold text-orange-600">
                            ${Number(product.priceMin).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            MOQ: <span className="text-gray-700 font-medium">{product.moq || 1} pcs</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedMaterial('');
                    setSelectedPlating('');
                    setPriceRange([0, 999]);
                  }}
                  className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
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
