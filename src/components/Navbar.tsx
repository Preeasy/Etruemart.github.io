import { useState, useRef, useEffect, useCallback } from 'react';
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
  ShoppingCart,
  FileText,
  Package,
  Settings,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Home,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useCart } from '@/components/CartContext';
import navCategories from '@/lib/nav-categories';

const categoryIcons: Record<string, any> = {
  'fashion-jewelry': Gem,
  'garment-accessories': Scissors,
  'accessories': Sparkles,
  'bags': ShoppingCart,
  'apparel-shoes': Tag,
  'auto-tools': Settings,
  'beauty-personal-care': Sparkles,
  'electronics': Package,
  'gift': Sparkles,
  'hardware-home': Settings,
  'home-decor-crafts': Sparkles,
  'home-living': Home,
  'home-appliances': Package,
  'kitchen-supplies': Package,
  'mother-baby-toys': Sparkles,
  'musical-instruments': Sparkles,
  'other': Sparkles,
  'pet-supplies': Package,
  'phone-accessories': Package,
  'sports-outdoor': Sparkles,
  'stationery-office': FileText,
  'toys': Sparkles,
};

function Scissors({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

const Navbar = () => {
  const { data: session } = useSession();
  const { count } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const router = useRouter();
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      if (session?.user?.role === 'ADMIN') {
        setShowAdminPanel(prev => !prev);
      }
    }
  }, [session]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (session?.user?.role === 'ADMIN') {
      logoClickCount.current++;
      if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
      logoClickTimer.current = setTimeout(() => {
        logoClickCount.current = 0;
      }, 800);
      if (logoClickCount.current >= 3) {
        logoClickCount.current = 0;
        setShowAdminPanel(prev => !prev);
      }
    }
  };

  const adminLinks = [
    { href: '/sell/new', label: 'New Product', icon: Store },
    { href: '/sell/excel-import', label: 'Excel Import', icon: FileText },
    { href: '/shipping-admin', label: 'Shipping Templates', icon: ClipboardList },
    { href: '/init', label: 'Site Init', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/products') return router.pathname === '/products' && !router.query.category;
    if (href.startsWith('/products?category=')) {
      const cat = href.split('category=')[1];
      return router.pathname === '/products' && router.query.category === cat;
    }
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-md shadow-navy-glow border-b border-navy-800/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1600px] mx-auto">
        {/* Main bar */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            aria-label="eTrue Mark home"
            className="flex items-center gap-2.5 group shrink-0"
            onClick={handleLogoClick}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-accent-glow group-hover:shadow-accent-glow group-hover:scale-105 transition-all duration-300">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold tracking-wide text-white group-hover:text-accent-300 transition-colors leading-tight">
                eTrue Mark
              </span>
              <span className="text-[10px] tracking-[0.2em] text-accent-400/90 uppercase leading-tight font-medium">
                Wholesale Source
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full flex group">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products, SKU, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                  className="w-full pl-10 pr-4 py-2.5 rounded-l-xl bg-navy-800/80 border border-navy-700/60 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400/50 focus:border-accent-500 focus:bg-navy-800 text-sm transition-all"
                />
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-r-xl text-sm font-semibold transition-all flex items-center gap-1 shadow-accent-glow"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex items-center gap-1.5 px-3 py-2 text-sm text-navy-300 hover:text-accent-400 hover:bg-navy-800 rounded-lg transition-colors font-medium"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-navy-900">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            <div className="hidden sm:block w-px h-5 bg-navy-700" />

            {session ? (
              <>
                <Link
                  href="/orders"
                  aria-label="My orders"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-navy-300 hover:text-accent-400 hover:bg-navy-800 rounded-lg transition-colors font-medium"
                >
                  <Package className="w-4 h-4" />
                  Orders
                </Link>
                <button
                  onClick={() => signOut()}
                  aria-label="Logout"
                  className="flex items-center gap-1 px-3 py-2 text-sm text-navy-300 hover:text-accent-400 hover:bg-navy-800 rounded-lg transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  aria-label="Sign In"
                  className="px-3 py-2 text-sm text-navy-300 hover:text-accent-400 hover:bg-navy-800 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  aria-label="Register"
                  className="px-4 py-2 text-sm bg-accent-500 hover:bg-accent-400 text-white rounded-lg font-semibold transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white ml-1 p-2 rounded-lg hover:bg-navy-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation links row */}
        <div className="hidden md:block border-t border-navy-800/60">
          <div className="h-11 flex items-center gap-0.5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                router.pathname === '/'
                  ? 'text-accent-400 bg-navy-800'
                  : 'text-navy-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/products"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/products')
                  ? 'text-accent-400 bg-navy-800'
                  : 'text-navy-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Package className="w-4 h-4" />
              All Products
            </Link>

            {/* Category dropdowns */}
            {navCategories.slice(0, 8).map((cat) => {
              const CatIcon = categoryIcons[cat.slug] || Sparkles;
              const hasChildren = cat.children.length > 0;
              const isOpen = openDropdown === cat.slug;
              const isCatActive = router.query.category === cat.slug;

              return (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenDropdown(cat.slug)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => router.push(`/products?category=${cat.slug}`)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isCatActive
                        ? 'text-accent-400 bg-navy-800'
                        : 'text-navy-300 hover:text-white hover:bg-navy-800'
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    {cat.name}
                    {hasChildren && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {hasChildren && isOpen && (
                    <div className="absolute top-full left-0 mt-0.5 w-64 bg-white rounded-xl shadow-premium border border-navy-100 py-2 z-50 animate-slide-up-sm">
                      <div className="px-3 py-1.5 text-2xs font-bold text-navy-900 uppercase tracking-wider border-b border-navy-100 mb-1">
                        {cat.name} Subcategories
                      </div>
                      {cat.children.map(child => (
                        <Link
                          key={child.slug}
                          href={`/products?category=${child.slug}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 hover:bg-accent-50 hover:text-accent-700 rounded-lg mx-1 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 text-navy-300" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hidden admin panel (only visible when toggled by ADMIN user) */}
        {showAdminPanel && session?.user?.role === 'ADMIN' && (
          <div className="border-t border-accent-500/30 bg-navy-800/80">
            <div className="flex items-center gap-4 px-4 py-2">
              <span className="text-[10px] text-accent-400 uppercase tracking-wider font-semibold">Admin</span>
              {adminLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-navy-300 hover:text-accent-400 transition-colors rounded hover:bg-navy-700"
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setShowAdminPanel(false)}
                className="ml-auto text-navy-400 hover:text-white p-1"
                aria-label="Close admin panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-800/60 max-h-[85vh] overflow-y-auto animate-slide-up-sm">
          <div className="px-4 py-4 space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search products, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                className="flex-1 px-4 py-2.5 rounded-l-xl bg-navy-800/80 border border-navy-700/60 text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-accent-400/50 text-sm"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2.5 rounded-r-xl transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                className="flex items-center justify-between py-2.5 px-3 text-sm text-navy-200 hover:bg-navy-800 hover:text-accent-400 rounded-lg transition-colors font-medium border border-navy-800"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </span>
                {count > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
              {session ? (
                <>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 py-2.5 px-3 text-sm text-navy-200 hover:bg-navy-800 hover:text-accent-400 rounded-lg transition-colors font-medium border border-navy-800"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 py-2.5 px-3 text-sm text-navy-200 hover:bg-navy-800 hover:text-accent-400 rounded-lg transition-colors font-medium border border-navy-800 col-span-2"
                  >
                    <User className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="col-span-2 flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 text-center py-2.5 text-sm text-navy-200 border border-navy-700 rounded-lg font-medium hover:bg-navy-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center py-2.5 text-sm bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-400 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Category navigation */}
            <div className="pt-2 border-t border-navy-800">
              <div className="text-[11px] font-bold text-navy-400 uppercase tracking-wider px-3 mb-2">
                Categories
              </div>
              <Link
                href="/products"
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-navy-200 hover:bg-navy-800 hover:text-accent-400 rounded-lg transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                All Products
              </Link>
              {navCategories.slice(0, 12).map((cat) => {
                const CatIcon = categoryIcons[cat.slug] || Sparkles;
                const isExpanded = mobileExpanded === cat.slug;
                const hasChildren = cat.children.length > 0;

                return (
                  <div key={cat.slug}>
                    <div className="flex items-center">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className={`flex-1 flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors font-medium ${
                          router.query.category === cat.slug
                            ? 'text-accent-400 bg-navy-800'
                            : 'text-navy-200 hover:bg-navy-800 hover:text-accent-400'
                        }`}
                      >
                        <CatIcon className="w-4 h-4" />
                        {cat.name}
                        {cat.productCount > 0 && (
                          <span className="ml-auto text-[10px] text-navy-500 bg-navy-800 px-1.5 py-0.5 rounded-full">
                            {cat.productCount}
                          </span>
                        )}
                      </Link>
                      {hasChildren && (
                        <button
                          onClick={() => setMobileExpanded(isExpanded ? null : cat.slug)}
                          className="p-2 text-navy-400 hover:text-accent-400 transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    {/* Subcategories (mobile expandable) */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 border-l border-navy-800 pl-2 py-1 space-y-0.5">
                        {cat.children.map(child => (
                          <Link
                            key={child.slug}
                            href={`/products?category=${child.slug}`}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-navy-400 hover:text-accent-400 hover:bg-navy-800/50 rounded-md transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
