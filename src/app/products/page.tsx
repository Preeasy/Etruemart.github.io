'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Filter, ChevronDown, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceMin: number;
  priceMax: number;
  mainImage: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const categories = [
  'All',
  'Apparel',
  'Electronics',
  'Kitchenware',
  'Toys',
  'Home',
  'Hand Bag',
  'Garden',
  'Material',
  'Storage',
];

const sortOptions = [
  { value: 'relevance', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'newest', label: 'Newest Arrivals' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const category = searchParams.get('category') || 'All';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || 'relevance';

    setSelectedCategory(category);
    setSearchQuery(search);
    setCurrentPage(page);
    setSortBy(sort);

    fetchProducts(category, search, page, sort);
  }, [searchParams]);

  const fetchProducts = async (category: string, search: string, page: number, sort: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    params.set('page', page.toString());
    params.set('limit', '24');
    params.set('sort', sort);

    const response = await fetch(`/api/products?${params}`);
    const data: ProductsResponse = await response.json();

    if (data.success) {
      setProducts(data.data.products);
      setTotalPages(data.data.totalPages);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    params.set('page', '1');
    router.push(`/products?${params}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    params.set('page', '1');
    router.push(`/products?${params}`);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    params.set('sort', sort);
    params.set('page', '1');
    router.push(`/products?${params}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    params.set('page', page.toString());
    router.push(`/products?${params}`);
  };

  return (
    <div className="bg-amazon-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h1>
            <p className="text-sm text-gray-500">
              {products.length} results for &quot;{searchQuery || selectedCategory}&quot;
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <Button variant="outline" className="border-gray-300">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>Category</span>
              </div>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-amazon-orange text-white'
                        : 'text-gray-700 hover:bg-amazon-light-gray'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
              <div className="font-bold text-gray-900 mb-3">Price Range</div>
              <div className="space-y-2">
                <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amazon-light-gray rounded-lg">
                  Under $25
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amazon-light-gray rounded-lg">
                  $25 - $50
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amazon-light-gray rounded-lg">
                  $50 - $100
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amazon-light-gray rounded-lg">
                  Over $100
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
              <div className="font-bold text-gray-900 mb-3">Customer Review</div>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((stars) => (
                  <button key={stars} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amazon-light-gray rounded-lg flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>& Up</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-10">
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-amazon-orange text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found.</p>
                <Button onClick={() => router.push('/products')} className="mt-4 bg-amazon-orange">
                  Browse All Products
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`} className="block group">
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative aspect-square bg-gray-50 overflow-hidden">
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.salesCount > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                              Hot
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-gray-700">{product.rating || 4.5}</span>
                            <span className="text-xs text-gray-400">({product.reviewCount || 12})</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-amazon-blue transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-amazon-orange">
                              {formatPrice(product.priceMin)}
                            </span>
                            {product.priceMin !== product.priceMax && (
                              <span className="text-xs text-gray-400">- {formatPrice(product.priceMax)}</span>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {product.salesCount > 0 ? `${product.salesCount} sold` : 'New'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="border-gray-300"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum = i + 1;
                      if (currentPage > 3 && currentPage < totalPages - 1) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages;
                      } else if (currentPage >= totalPages - 1) {
                        pageNum = totalPages - 4 + i;
                        if (pageNum < 1) pageNum = 1;
                      }
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? 'primary' : 'outline'}
                          onClick={() => handlePageChange(pageNum)}
                          className={currentPage === pageNum ? 'bg-amazon-orange hover:bg-amazon-yellow' : 'border-gray-300'}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="border-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}