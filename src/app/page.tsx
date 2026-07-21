'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Truck, Shield, CreditCard, Gift, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  description: string;
  priceMin: number;
  priceMax: number;
  mainImage: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
}

async function getProducts() {
  const response = await fetch('/api/products?limit=16');
  const data = await response.json();
  if (data.success) {
    return data.data.products as Product[];
  }
  return [];
}

const sidebarCategories = [
  { name: 'Electronics', count: 128 },
  { name: 'Apparel', count: 256 },
  { name: 'Home & Kitchen', count: 89 },
  { name: 'Kitchenware', count: 67 },
  { name: 'Sports & Outdoors', count: 45 },
  { name: 'Toys & Games', count: 112 },
  { name: 'Hand Bags', count: 38 },
  { name: 'Garden', count: 56 },
  { name: 'Materials', count: 78 },
  { name: 'Storage', count: 94 },
];

const bannerItems = [
  {
    image: 'https://images.unsplash.com/photo-1605793717442-10454b2d23c0?w=1200&h=600&fit=crop',
    title: 'Electronics Sale',
    link: '/products?category=Electronics',
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
    title: 'Summer Fashion',
    link: '/products?category=Apparel',
  },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $25' },
  { icon: Shield, title: 'Secure Shopping', desc: 'Your payment is protected' },
  { icon: CreditCard, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: Gift, title: 'Best Prices', desc: 'Lowest price guarantee' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchProductsData = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProductsData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-amazon-light-gray min-h-screen">
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-full">
          {bannerItems.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <Link href={item.link}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                />
              </Link>
            </div>
          ))}
          <button
            onClick={() => setCurrentBanner((prev) => (prev - 1 + bannerItems.length) % bannerItems.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentBanner((prev) => (prev + 1) % bannerItems.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBanner ? 'bg-amazon-orange w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-3 border-b border-gray-100 font-bold text-gray-900">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>Shop by Category</span>
                </div>
              </div>
              <nav className="p-2">
                {sidebarCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/products?category=${encodeURIComponent(category.name)}`}
                    className="block flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-amazon-light-gray rounded-lg transition-colors"
                  >
                    <span>{category.name}</span>
                    <span className="text-gray-400">{category.count}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {features.map((feature) => (
                <div key={feature.title} className="bg-white p-4 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 bg-amazon-orange rounded-full flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{feature.title}</div>
                    <div className="text-xs text-gray-500">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amazon-dark-blue rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-white font-bold text-lg">Get 10% Off Your First Order</h2>
                <p className="text-amazon-yellow text-sm">Use code: WELCOME10</p>
              </div>
              <Button className="bg-amazon-orange hover:bg-amazon-yellow text-amazon-blue font-bold">
                Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Best Sellers</h2>
                <Link href="/products" className="text-amazon-blue hover:text-amazon-yellow text-sm font-medium">
                  See more <ChevronRight className="inline w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.slice(0, 8).map((product) => (
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
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
                <Link href="/products" className="text-amazon-blue hover:text-amazon-yellow text-sm font-medium">
                  See more <ChevronRight className="inline w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.slice(8).map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`} className="block group">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                          New
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-700">{product.rating || 4.5}</span>
                          <span className="text-xs text-gray-400">({product.reviewCount || 5})</span>
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
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          Fresh arrival
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}