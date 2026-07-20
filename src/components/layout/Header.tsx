'use client';

import { useState } from 'react';
import { ShoppingCart, Search, User, Menu, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';



export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignIn = () => signIn();
  const handleSignOut = () => signOut();

  const categories = [
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

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-xl font-bold text-blue-600"
            >
              <Package className="w-8 h-8" />
              <span>eTruemart</span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => router.push(`/products?category=${encodeURIComponent(category)}`)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                0
              </span>
            </button>

            {session?.user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User className="w-6 h-6" />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/account')}
                >
                  Account
                </Button>
                {session.user.role === 'ADMIN' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin')}
                  >
                    Admin
                  </Button>
                )}
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
            )}

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="relative mb-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </form>
            </div>
            <nav className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    router.push(`/products?category=${encodeURIComponent(category)}`);
                    setIsMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}