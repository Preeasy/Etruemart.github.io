'use client';

import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, ChevronDown, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
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
    { name: 'All Categories', icon: Menu },
    { name: 'Apparel' },
    { name: 'Electronics' },
    { name: 'Kitchenware' },
    { name: 'Toys' },
    { name: 'Home' },
    { name: 'Hand Bag' },
    { name: 'Garden' },
    { name: 'Material' },
    { name: 'Storage' },
  ];

  return (
    <header className="bg-amazon-blue sticky top-0 z-50">
      <div className="max-w-full mx-auto">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-white font-bold text-xl sm:text-2xl hover:text-amazon-yellow transition-colors"
          >
            <Package className="w-8 h-8" />
            <span>eTruemart</span>
          </button>

          <div className="hidden sm:flex items-center text-white text-sm ml-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-xs text-gray-300">Deliver to</span>
            <span className="font-medium">China</span>
            <ChevronDown className="w-4 h-4 ml-0.5" />
          </div>

          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-shrink-0">
                <select
                  className="h-full px-3 py-2 bg-amazon-light-gray text-gray-700 text-sm rounded-l-md border-r-0 focus:outline-none"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                >
                  <option>All</option>
                  {categories.map((cat) => (
                    <option key={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Search eTruemart"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-gray-900 text-sm rounded-none focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amazon-orange hover:bg-amazon-yellow text-white px-4 py-2 rounded-r-md transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-4">
            <div className="px-3 py-1">
              <span className="text-xs text-gray-300">Hello,</span>
              {session?.user ? (
                <>
                  <span className="text-white font-medium block">
                    {session.user.name || session.user.email}
                  </span>
                  <div className="flex items-center">
                    <span className="text-white text-xs">Account</span>
                    <ChevronDown className="w-3 h-3 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <span className="text-white font-medium block">Sign In</span>
                  <div className="flex items-center">
                    <span className="text-white text-xs">Account</span>
                    <ChevronDown className="w-3 h-3 text-white" />
                  </div>
                </>
              )}
            </div>

            <div className="px-3 py-1">
              <span className="text-white text-xs">Returns</span>
              <span className="text-white font-medium block">& Orders</span>
            </div>

            <div className="px-3 py-1">
              <span className="text-white text-xs">Your</span>
              <span className="text-white font-medium block">Prime</span>
            </div>

            <button
              onClick={() => router.push('/cart')}
              className="relative px-3 py-1"
            >
              <ShoppingCart className="w-8 h-8 text-white" />
              <span className="absolute -top-1 -right-1 bg-amazon-orange text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                0
              </span>
            </button>
          </div>

          <button
            className="sm:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden sm:flex items-center h-10 bg-amazon-dark-blue px-4 gap-4 text-white text-sm">
          <div className="flex items-center gap-1">
            <Menu className="w-4 h-4" />
            <span className="font-medium">All</span>
          </div>
          {categories.slice(1, 8).map((category) => (
            <button
              key={category.name}
              onClick={() => router.push(`/products?category=${encodeURIComponent(category.name)}`)}
              className="hover:text-amazon-yellow transition-colors"
            >
              {category.name}
            </button>
          ))}
          <span className="ml-auto text-amazon-yellow">Deal of the Day</span>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden bg-amazon-dark-blue py-4 px-4">
            <div className="relative mb-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search eTruemart..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 text-gray-900 text-sm rounded-lg focus:outline-none"
                />
              </form>
            </div>
            {session?.user ? (
              <div className="flex items-center justify-between mb-4 text-white">
                <span>{session.user.name || session.user.email}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="bg-amazon-blue">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} className="w-full bg-amazon-orange mb-4">
                Sign In
              </Button>
            )}
            <nav className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    router.push(`/products?category=${encodeURIComponent(category.name)}`);
                    setIsMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-white text-sm hover:bg-amazon-blue rounded-lg"
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}