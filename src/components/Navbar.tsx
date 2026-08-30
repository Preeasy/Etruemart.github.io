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
  ArrowRight,
  Phone,
  Heart,
} from 'lucide-react';
import { useCart } from '@/components/CartContext';
import navCategories from '@/lib/nav-categories';

const categoryIcons: Record<string, any> = {
  'fashion-jewelry': Gem,
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
  'office-supplies': FileText,
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
categoryIcons['garment-accessories'] = Scissors;

const Navbar = () => {
  const { data: session } = useSession();
  const { count } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add elevation on scroll — premium B2B feel
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      if (session?.user?.role === 'ADMIN') setShowAdminPanel(prev => !prev);
    }
  }, [session]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLogoClick = () => {
    if (session?.user?.role === 'ADMIN') {
      logoClickCount.current++;
      if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
      logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 800);
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
    <nav
      className={`sticky top-0 z-40 transition-all duration-300
        ${scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-sand-200 shadow-card'
          : 'bg-white/80 backdrop-blur border-b border-sand-100'
        }`}
    >
      {/* ============== UTILITY ROW (desktop only) ============== */}
      <div className="hidden lg:block bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white/85 border-b border-white/5">
        <div className="section flex items-center justify-between h-8 text-[11.5px]">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-gold-300" />
              <span className="font-semibold text-white/90">+86 187 6796 0499</span>
              <span className="opacity-70">(WhatsApp · 24/7)</span>
            </span>
            <span className="opacity-50">|</span>
            <span className="opacity-90">
              <span className="text-gold-300 font-semibold">Factory-Direct</span> · Yiwu, China · Est. 2012
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="opacity-90 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
              Live Inventory · 964 SKUs
            </span>
            <Link href="/about" className="opacity-90 hover:text-gold-300 transition-colors">About</Link>
            <Link href="/about" className="opacity-90 hover:text-gold-300 transition-colors">Quality Assurance</Link>
            <a href="mailto:yeatrusourcing@gmail.com" className="opacity-90 hover:text-gold-300 transition-colors">
              ✉ Email Us
            </a>
          </div>
        </div>
      </div>

      <div className="section">
        {/* ============== MAIN BAR ============== */}
        <div className="flex items-center justify-between h-16 lg:h-20 gap-3 lg:gap-6">
          {/* ---------- Logo ---------- */}
          <Link
            href="/"
            aria-label="Etruemart home"
            className="flex items-center gap-3 group shrink-0"
            onClick={handleLogoClick}
          >
            <div className="relative">
              <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-hero-gradient flex items-center justify-center shadow-navy-glow group-hover:scale-105 transition-all duration-300">
                <Gem className="w-5.5 h-5.5 lg:w-6 lg:h-6 text-gold-300" strokeWidth={2.2} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-md bg-gold-500 border-2 border-white flex items-center justify-center shadow-gold-glow">
                <span className="text-[8px] font-black text-navy-900 leading-none">E</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl lg:text-[22px] font-display font-extrabold text-navy-900 tracking-tight group-hover:text-navy-800 transition-colors">
                eTrue<span className="text-gold-gradient">Mart</span>
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-px w-5 bg-gold-400/70 rounded-full" />
                <span className="text-[9.5px] tracking-[0.22em] uppercase font-bold text-gold-700">
                  B2B Wholesale
                </span>
                <span className="h-px w-5 bg-gold-400/70 rounded-full" />
              </div>
            </div>
          </Link>

          {/* ---------- Search bar (center) ---------- */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative w-full flex items-stretch group">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-400 group-focus-within:text-gold-600 pointer-events-none transition-colors" />
                <input
                  type="text"
                  placeholder="Search 964+ wholesale products, SKU, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                  className="input !rounded-l-2xl !rounded-r-none !py-3.5 !pl-12 !pr-5 !text-sm
                            !border-sand-200 group-focus-within:!border-gold-400
                            transition-all shadow-paper focus:!shadow-card"
                />
              </div>
              <div className="hidden sm:flex items-center px-4 border-y border-sand-200 bg-sand-50/50 text-[11px] font-semibold text-ink-500 whitespace-nowrap">
                All Categories
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="btn-cta !rounded-l-none !rounded-r-2xl !px-6 !py-0 text-sm gap-2 font-bold shadow-coral-glow"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>

          {/* ---------- Right actions ---------- */}
          <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
            {/* Fav */}
            <button
              className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl border border-sand-200 text-navy-700 hover:border-coral-300 hover:text-coral-500 hover:bg-coral-50 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
            </button>

            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-xl border border-sand-200
                         text-navy-800 hover:border-gold-400 hover:bg-gold-50/60 hover:shadow-card transition-all font-semibold text-sm"
            >
              <div className="relative">
                <ShoppingCart className="w-4.5 h-4.5 text-navy-700" strokeWidth={2} />
                {count > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1
                                   bg-gradient-to-b from-coral-400 to-coral-600 text-white text-[10.5px] font-black
                                   rounded-full flex items-center justify-center leading-none ring-2 ring-white shadow-coral-glow tabular">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline">Cart</span>
            </Link>

            <div className="hidden sm:block w-px h-8 bg-sand-200 mx-0.5" />

            {session ? (
              <>
                <Link
                  href="/orders"
                  aria-label="My orders"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm text-navy-700 hover:text-gold-700 hover:bg-gold-50 rounded-xl transition-colors font-semibold"
                >
                  <Package className="w-4.5 h-4.5" />
                  Orders
                </Link>
                <button
                  onClick={() => signOut()}
                  aria-label="Logout"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-navy-700 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-colors font-semibold"
                >
                  <User className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  aria-label="Sign In"
                  className="hidden sm:inline-flex px-4 py-2.5 text-sm text-navy-700 hover:text-gold-700 hover:bg-gold-50 rounded-xl transition-colors font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  aria-label="Register"
                  className="inline-flex px-4 lg:px-5 py-2.5 text-sm bg-navy-800 hover:bg-navy-700 text-white rounded-xl font-bold transition-all shadow-navy-glow border border-navy-700"
                >
                  <Gem className="w-3.5 h-3.5 hidden sm:inline text-gold-300" />
                  Get Quote
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-navy-900 ml-1 p-2.5 rounded-xl hover:bg-sand-100 transition-colors border border-sand-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ---------- Mobile search bar ---------- */}
        <div className="md:hidden pb-3 -mt-1">
          <form onSubmit={handleSearch} className="relative flex items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input !pl-10 !pr-4 !py-2.5 !rounded-l-xl !rounded-r-none"
              />
            </div>
            <button type="submit" className="btn-cta !rounded-r-xl !rounded-l-none !px-4 !py-0">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* ============== CATEGORY NAV ROW (desktop) ============== */}
        <div className="hidden md:block border-t border-sand-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                router.pathname === '/'
                  ? 'text-white bg-navy-800 shadow-navy-glow'
                  : 'text-navy-800 hover:bg-gold-50 hover:text-gold-700'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              Home
            </Link>
            <Link
              href="/products"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive('/products')
                  ? 'text-gold-700 bg-gold-50 border border-gold-200'
                  : 'text-navy-800 hover:bg-gold-50 hover:text-gold-700'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              All Products
            </Link>

            {/* Category mega menus */}
            {navCategories.slice(0, 10).map((cat) => {
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
                  onFocus={() => hasChildren && setOpenDropdown(cat.slug)}
                >
                  <button
                    onClick={() => router.push(`/products?category=${cat.slug}`)}
                    aria-haspopup={hasChildren ? 'true' : undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                      isCatActive
                        ? 'text-gold-700 bg-gold-50 border border-gold-200'
                        : 'text-navy-800 hover:bg-gold-50 hover:text-gold-700'
                    }`}
                  >
                    <CatIcon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{cat.name}</span>
                    {hasChildren && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {hasChildren && isOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 w-[500px] max-w-[92vw] bg-white rounded-2xl shadow-card-lg border border-sand-200 p-4 z-50 animate-slide-up-sm"
                      onMouseEnter={() => setOpenDropdown(cat.slug)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-sand-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-gold-50 border border-gold-200 flex items-center justify-center shadow-paper">
                            <CatIcon className="w-5 h-5 text-gold-600" />
                          </div>
                          <div>
                            <p className="font-display font-bold text-navy-900 leading-tight">{cat.name}</p>
                            <p className="text-[11px] text-ink-500 leading-tight">{cat.productCount} products · MOQ 12+</p>
                          </div>
                        </div>
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-navy-800 hover:text-gold-700 px-3 py-1.5 rounded-lg hover:bg-gold-50 border border-transparent hover:border-gold-200 transition-all"
                        >
                          View All <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 max-h-[55vh] overflow-y-auto pr-1">
                        {cat.children.map(child => (
                          <Link
                            key={child.slug}
                            href={`/products?category=${child.slug}`}
                            className="group flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-sand-50 hover:shadow-paper transition-all"
                          >
                            <span className="text-sm font-medium text-ink-700 group-hover:text-navy-900 truncate">
                              {child.name}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-sand-300 group-hover:text-gold-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="ml-auto flex items-center gap-2 pl-2 pr-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-coral-600 hover:text-coral-700 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" /> Hot Deals
              </Link>
            </div>
          </div>
        </div>

        {/* ============== ADMIN quick panel ============== */}
        {showAdminPanel && (
          <div className="border-t border-gold-200 bg-gold-50/80 backdrop-blur-sm py-2.5 mt-1 mb-2 rounded-xl border border-gold-200">
            <div className="flex items-center gap-2 flex-wrap px-3">
              <span className="tag-gold mr-1">ADMIN</span>
              {adminLinks.map(l => {
                const I = l.icon;
                return (
                  <Link
                    key={l.href} href={l.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sand-200 text-xs font-semibold text-navy-800 hover:text-gold-700 hover:border-gold-300 transition-all"
                  >
                    <I className="w-3.5 h-3.5" /> {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ============== MOBILE DRAWER ============== */}
        {isOpen && (
          <div className="md:hidden border-t border-sand-200 py-4 -mx-4 px-4 space-y-3 bg-white">
            <Link href="/" onClick={() => setIsOpen(false)} className="block btn-outline w-full justify-start">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/products" onClick={() => setIsOpen(false)} className="block btn-outline w-full justify-start">
              <Package className="w-4 h-4" /> All Products
            </Link>
            {navCategories.slice(0, 14).map((cat) => {
              const CatIcon = categoryIcons[cat.slug] || Sparkles;
              const hasChildren = cat.children.length > 0;
              const expanded = mobileExpanded === cat.slug;
              return (
                <div key={cat.slug} className="border border-sand-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => {
                      if (hasChildren) setMobileExpanded(expanded ? null : cat.slug);
                      else { setIsOpen(false); router.push(`/products?category=${cat.slug}`); }
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white hover:bg-sand-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                      <CatIcon className="w-4 h-4 text-gold-600" />{cat.name}
                    </span>
                    {hasChildren && <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />}
                  </button>
                  {hasChildren && expanded && (
                    <div className="px-3 pb-3 pt-1 space-y-1 bg-sand-50/60 border-t border-sand-200">
                      {cat.children.slice(0, 16).map(child => (
                        <Link
                          key={child.slug}
                          href={`/products?category=${child.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-2.5 py-1.5 text-sm text-ink-700 rounded-lg hover:bg-white hover:text-navy-900"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
