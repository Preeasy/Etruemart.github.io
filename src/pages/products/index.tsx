import { useEffect, useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [showSidebar, setShowSidebar] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const cats = ['All', ...Array.from(new Set<string>(data.map((p: Product) => p.category)))];
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return Number(a.price) - Number(b.price);
      case 'price-high': return Number(b.price) - Number(a.price);
      case 'rating': return Number(b.rating) - Number(a.rating);
      default: return Number(b.salesCount) - Number(a.salesCount);
    }
  });

  return (
    <Layout>
      <div className="bg-dark-800 border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-dark-100">All Products</h1>
          <p className="text-dark-400 mt-1">Discover our wide selection of premium products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:hidden mb-4 flex gap-3">
          <button onClick={() => setShowSidebar(!showSidebar)} className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700/50 rounded-lg text-dark-300">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <aside className={`${showSidebar ? 'fixed inset-0 bg-black/50 z-40 lg:relative lg:bg-transparent' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <div className={`${showSidebar ? 'absolute left-0 top-0 h-full w-72 bg-dark-800 p-6 overflow-y-auto border-r border-dark-700/50' : ''} lg:relative lg:p-0`}>
              <div className="lg:sticky lg:top-24">
                <h2 className="text-lg font-semibold text-dark-100 mb-6 hidden lg:block">Filters</h2>
                
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 bg-dark-700/50 border border-dark-700/50 rounded-lg text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-dark-100 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat ? 'bg-accent-500 text-dark-900 font-medium' : 'hover:bg-dark-700/50 text-dark-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {showSidebar && (
                  <button onClick={() => setShowSidebar(false)} className="lg:hidden w-full mt-4 py-2 text-dark-400 hover:text-dark-200">
                    Close
                  </button>
                )}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-dark-800 rounded-xl p-4 mb-6 border border-dark-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-dark-400">
                  <span className="font-semibold text-dark-100">{sortedProducts.length}</span> results
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-dark-700/50 border border-dark-700/50 px-4 py-2 pr-10 rounded-lg text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
                <p className="text-dark-400">Loading products...</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700/50">
                <Search className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dark-100 mb-2">No products found</h3>
                <p className="text-dark-500 mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="btn-primary">
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
