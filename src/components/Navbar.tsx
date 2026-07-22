import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, User, Package, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="bg-dark-900 border-b border-dark-500/30 text-dark-50 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Package className="w-8 h-8 text-accent-500 group-hover:text-accent-400 transition-colors" />
              <span className="text-xl font-bold tracking-wide text-accent-500 group-hover:text-accent-400 transition-colors">eTruemart</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-12 rounded-full bg-dark-700 border border-dark-500/50 text-dark-50 placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent-500 hover:bg-accent-400 text-dark-900 px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-accent-500 transition-colors font-medium">
              Products
            </Link>
            <Link href="/sell" className="flex items-center gap-2 hover:text-accent-500 transition-colors font-medium">
              <PlusCircle className="w-5 h-5" />
              Sell
            </Link>
            {session && (
              <Link href="/dashboard" className="hover:text-accent-500 transition-colors font-medium">
                Dashboard
              </Link>
            )}
            {session ? (
              <div className="relative">
                <Link href="/cart" className="relative hover:text-accent-500 transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-dark-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    0
                  </span>
                </Link>
              </div>
            ) : null}
            {session ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 hover:text-accent-500 transition-colors"
              >
                <User className="w-6 h-6" />
                <span className="font-medium">Logout</span>
              </button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-accent-500 transition-colors">
                <User className="w-6 h-6" />
                <span className="font-medium">Login</span>
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="hover:text-accent-500">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-500/30">
          <div className="px-4 py-3 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 rounded-full bg-dark-700 border border-dark-500/50 text-dark-50 placeholder-dark-300 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
            </div>
            <Link href="/products" className="block py-2 hover:text-accent-500">Products</Link>
            <Link href="/sell" className="block py-2 hover:text-accent-500">Sell</Link>
            {session && <Link href="/dashboard" className="block py-2 hover:text-accent-500">Dashboard</Link>}
            {session ? (
              <>
                <Link href="/cart" className="block py-2 hover:text-accent-500">Cart</Link>
                <button onClick={() => signOut()} className="w-full text-left py-2 hover:text-accent-500">Logout</button>
              </>
            ) : (
              <Link href="/login" className="block py-2 hover:text-accent-500">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
