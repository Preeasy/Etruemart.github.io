import { useState, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Search,
  User,
  Menu,
  X,
  Gem,
  Store,
} from 'lucide-react';

const navLinks = [
  { label: 'All Products', href: '/products' },
  { label: 'Fashion Jewelry', href: '/products?category=fashion-jewelry' },
  { label: 'Bags & Accessories', href: '/products?category=bags-accessories' },
  { label: 'Toys & Gift', href: '/products?category=toys-gift' },
  { label: 'Home Decor', href: '/products?category=home-decor-crafts' },
  { label: 'Seller Center', href: '/sell' },
];

const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-navy-900 shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1600px] mx-auto">
        {/* Main bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" aria-label="eTrue Mark home" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-md bg-accent-500 flex items-center justify-center">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-bold tracking-wide text-white group-hover:text-accent-300 transition-colors leading-tight">
                eTrue Mark
              </span>
              <span className="text-[9px] tracking-[0.25em] text-ink-400 uppercase leading-tight">
                Wholesale Source
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className="relative w-full flex">
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                className="flex-1 px-4 py-2 rounded-l-md bg-white border-0 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm"
              />
              <button
                onClick={() => searchQuery && router.push(`/products?q=${encodeURIComponent(searchQuery)}`)}
                aria-label="Search"
                className="bg-accent-500 hover:bg-accent-400 text-white px-5 py-2 rounded-r-md text-sm font-semibold transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right actions — minimal: Sign In / Seller / Dashboard / Logout */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/sell"
              aria-label="Seller Center"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs text-ink-200 hover:text-accent-300 transition-colors font-medium"
            >
              <Store className="w-4 h-4" />
              Seller Center
            </Link>
            <div className="hidden sm:block w-px h-5 bg-navy-600" />
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  aria-label="Dashboard"
                  className="px-3 py-2 text-xs text-ink-200 hover:text-accent-300 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  aria-label="Logout"
                  className="flex items-center gap-1 px-3 py-2 text-xs text-ink-200 hover:text-accent-300 transition-colors font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  aria-label="Sign In"
                  className="px-3 py-2 text-xs text-ink-200 hover:text-accent-300 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  aria-label="Register"
                  className="px-3 py-2 text-xs bg-accent-500 hover:bg-accent-400 text-white rounded-md font-semibold transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white ml-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Second row: navigation menu (desktop only) */}
      <div className="hidden md:block bg-navy-950">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1600px] mx-auto">
          <div className="h-10 flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className="text-sm text-ink-300 hover:text-accent-400 px-3 py-2 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-3">
            <div className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                className="flex-1 px-4 py-2 rounded-l-md bg-white border-0 text-ink-900 placeholder-ink-400 focus:outline-none text-sm"
              />
              <button
                onClick={() => searchQuery && router.push(`/products?q=${encodeURIComponent(searchQuery)}`)}
                aria-label="Search"
                className="bg-accent-500 text-white px-4 py-2 rounded-r-md"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/sell"
              aria-label="Seller Center"
              className="block py-2 text-sm text-ink-200 hover:text-accent-300 font-medium"
            >
              Seller Center
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" aria-label="Dashboard" className="block py-2 text-sm text-ink-200 hover:text-accent-300 font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  aria-label="Logout"
                  className="w-full text-left py-2 text-sm text-ink-200 hover:text-accent-300 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-navy-700">
                <Link
                  href="/login"
                  aria-label="Sign In"
                  className="flex-1 text-center py-2 text-sm text-ink-200 border border-navy-600 rounded-md font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  aria-label="Register"
                  className="flex-1 text-center py-2 text-sm bg-accent-500 text-white rounded-md font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
