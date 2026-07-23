import { useEffect, useState } from 'react';
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
  material?: string | null;
  plating?: string | null;
  packSize?: number;
  sku?: string | null;
  stockStatus?: string;
}

const categoryFilters = [
  { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  { name: 'Garment Accessories', slug: 'garment-accessories' },
  { name: 'Hair Accessories', slug: 'hair-accessories' },
  { name: 'Bags & Accessories', slug: 'bags-accessories' },
  { name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
  { name: 'Seasonal & Festival', slug: 'seasonal-festival' },
];

const materialOptions = ['Alloy', 'Stainless Steel', 'Brass', 'Acrylic', 'Crystal', 'Pearl', 'Resin', 'Fabric', 'Rhinestone'];
const platingOptions = ['Gold Plated', 'Silver Plated', 'Rose Gold Plated', 'Rhodium Plated', 'Gunmetal', 'Antique Bronze'];

const Products = () => {
  const router = useRouter();
  const { category: queryCategory } = router.query;

  const [products, setProducts] = useState<Product[]>([]);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof queryCategory === 'string') {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const productCategorySlug =
      typeof product.category === 'object' && product.category !== null
        ? product.category.slug
        : '';

    const matchesCategory =
      selectedCategory === 'all' ||
      productCategorySlug === selectedCategory ||
      product.categoryId === selectedCategory;

    const matchesMaterial =
      !selectedMaterial ||
      (product.material && product.material.toLowerCase().includes(selectedMaterial.toLowerCase()));

    const matchesPlating =
      !selectedPlating ||
      (product.plating && product.plating.toLowerCase().includes(selectedPlating.toLowerCase()));

    const price = Number(product.price);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesMaterial && matchesPlating && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return Number(a.price) - Number(b.price);
      case 'price-high': return Number(b.price) - Number(a.price);
      default: return 0;
    }
  });

  const getCategoryName = (product: Product): string => {
    if (typeof product.category === 'object' && product.category !== null) {
      return product.category.name;
    }
    if (typeof product.category === 'string') {
      return product.category;
    }
    const matched = categoryFilters.find(c => c.slug === product.categoryId);
    return matched ? matched.name : product.categoryId;
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-dark-800 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-dark-400">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-dark-100 font-medium">Products</span>
            {selectedCategory !== 'all' && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gold-400 font-medium">
                  {categoryFilters.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-dark-800 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-dark-50">
            {selectedCategory !== 'all'
              ? categoryFilters.find(c => c.slug === selectedCategory)?.name || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-dark-400 mt-2">
            Wholesale jewelry &amp; accessories — direct from Yiwu
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700/40 rounded-lg text-dark-300 hover:border-gold-500/50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <div className="flex items-center border border-dark-700/40 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 ${viewMode === 'grid' ? 'bg-gold-500 text-dark-900' : 'text-dark-400 hover:text-gold-400'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 ${viewMode === 'list' ? 'bg-gold-500 text-dark-900' : 'text-dark-400 hover:text-gold-400'}`}
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
              className={`${showSidebar ? 'absolute left-0 top-0 h-full w-80 bg-dark-800 p-6 overflow-y-auto border-r border-dark-700/50' : ''} lg:relative lg:p-0 lg:w-full`}
            >
              <div className="lg:sticky lg:top-32">
                {/* Mobile close */}
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h2 className="text-lg font-semibold text-dark-100">Filters</h2>
                  <button onClick={() => setShowSidebar(false)}>
                    <X className="w-5 h-5 text-dark-400" />
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
                      className="w-full px-4 py-2.5 pl-10 bg-dark-800 border border-dark-600/50 rounded-lg text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-gold-500/15 text-gold-400 font-medium border border-gold-500/20'
                          : 'text-dark-300 hover:bg-dark-700/50 hover:text-dark-100'
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
                            ? 'bg-gold-500/15 text-gold-400 font-medium border border-gold-500/20'
                            : 'text-dark-300 hover:bg-dark-700/50 hover:text-dark-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3">
                    Material
                  </h3>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  >
                    <option value="">All Materials</option>
                    {materialOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Plating */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3">
                    Plating / Finish
                  </h3>
                  <select
                    value={selectedPlating}
                    onChange={(e) => setSelectedPlating(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  >
                    <option value="">All Finishes</option>
                    {platingOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-3">
                    Price Range (USD)
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-dark-800 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                      placeholder="Min"
                    />
                    <span className="text-dark-500">–</span>
                    <input
                      type="number"
                      min={0}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-dark-800 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
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
                  className="w-full text-sm text-dark-400 hover:text-gold-400 py-2 border border-dark-700/50 rounded-lg hover:border-gold-500/30 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-dark-800 rounded-xl p-4 mb-6 border border-dark-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-dark-400 text-sm">
                Showing <span className="font-semibold text-dark-100">{sortedProducts.length}</span> products
              </p>
              <div className="flex items-center gap-3">
                {/* View toggle (desktop) */}
                <div className="hidden lg:flex items-center border border-dark-700/40 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gold-500 text-dark-900' : 'text-dark-400 hover:text-gold-400'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gold-500 text-dark-900' : 'text-dark-400 hover:text-gold-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-dark-700/50 border border-dark-600/50 px-4 py-2 pr-10 rounded-lg text-sm text-dark-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-dark-400">Loading products...</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedProducts.map((product) => {
                    const catName = getCategoryName(product);
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex gap-5 bg-dark-800 rounded-xl border border-dark-700/40 p-4 hover:border-gold-500/30 transition-colors card-hover"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {catName && (
                            <span className="text-[11px] font-medium text-gold-400 uppercase tracking-wider">
                              {catName}
                            </span>
                          )}
                          <h3 className="font-medium text-dark-100 mt-1 hover:text-gold-400 transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {product.material && (
                              <span className="text-[10px] text-dark-300 bg-dark-700/60 px-2 py-0.5 rounded-full border border-dark-600/30">
                                {product.material}
                              </span>
                            )}
                            {product.plating && (
                              <span className="text-[10px] text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                                {product.plating}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-lg font-bold text-gold-400">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-[11px] text-dark-400">
                              MOQ: <span className="text-dark-200 font-medium">{product.moq || 1} pcs</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700/40">
                <Search className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-100 mb-2">No products found</h3>
                <p className="text-dark-500 mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedMaterial('');
                    setSelectedPlating('');
                    setPriceRange([0, 999]);
                  }}
                  className="btn-primary"
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

export const getServerSideProps = () => ({ props: {} });
