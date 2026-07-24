import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Search,
  User,
  Menu,
  X,
  Mail,
  ChevronDown,
  Gem,
  Scissors,
  Crown,
  ShoppingBag,
  Home,
  Gift,
  Phone,
  Sparkles,
} from 'lucide-react';

const categories = [
  {
    name: 'Toys & Gift',
    icon: Gift,
    slug: 'toys-gift',
    featured: true,
    children: [
      'Stress Relief Toys',
      'Fidget & Squishy',
      'Educational Toys',
      'Plush & Stuffed',
      'Games & Puzzles',
      'Gift Sets',
      'Party Favors',
      'Novelty Toys',
    ],
  },
  {
    name: 'Fashion Jewelry',
    icon: Gem,
    slug: 'fashion-jewelry',
    children: [
      'Necklaces & Pendants',
      'Earrings',
      'Bracelets & Bangles',
      'Rings',
      'Brooches & Pins',
      'Body Jewelry',
    ],
  },
  {
    name: 'Hair Accessories',
    icon: Crown,
    slug: 'hair-accessories',
    children: [
      'Hair Clips & Pins',
      'Headbands',
      'Hair Ties & Scrunchies',
      'Hair Combs',
      'Hair Extensions',
      'Hair Chains',
    ],
  },
  {
    name: 'Bags & Accessories',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    children: [
      'Handbag Hardware',
      'Bag Chains',
      'Keychains & Charms',
      'Bag Feet & Studs',
      'Zipper Pulls',
      'Bag Hooks',
    ],
  },
  {
    name: 'Garment Accessories',
    icon: Scissors,
    slug: 'garment-accessories',
    children: [
      'Buttons',
      'Zippers',
      'Lace & Trim',
      'Ribbons',
      'Sequins & Rhinestones',
      'Buckles & Clasps',
    ],
  },
  {
    name: 'Home Decor & Crafts',
    icon: Home,
    slug: 'home-decor-crafts',
    children: [
      'Decorative Trim',
      'Tassels & Fringe',
      'Beads & Pearls',
      'Craft Wire & Tools',
      'Candle Accessories',
      'Wall Decor Hardware',
    ],
  },
];

const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1600px] mx-auto">
        {/* Main bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-bold tracking-wide text-gold-700 group-hover:text-gold-500 transition-colors leading-tight">
                eTruemart
              </span>
              <span className="text-[9px] tracking-[0.25em] text-gray-400 uppercase leading-tight">
                Wholesale Source
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search stress relief toys, jewelry, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-9 pr-20 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 focus:bg-white transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold-500 hover:bg-gold-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500">
              <a href="mailto:info@yeatru.com" className="flex items-center gap-1 hover:text-gold-600 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                info@yeatru.com
              </a>
              <span className="text-gray-200">|</span>
              <a href="tel:+8615988516408" className="flex items-center gap-1 hover:text-gold-600 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +86 15988516408
              </a>
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-2 lg:border-l lg:border-gray-200">
              <Link href="/sell" className="text-xs text-gray-600 hover:text-gold-600 transition-colors font-medium">
                Become a Seller
              </Link>
              <span className="text-gray-200">|</span>
              <Link href="/orders" className="text-xs text-gray-600 hover:text-gold-600 transition-colors font-medium">
                Track Order
              </Link>
            </div>
            <div className="flex items-center gap-1 sm:pl-2 sm:border-l sm:border-gray-200">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-2.5 py-1.5 text-xs text-gray-700 hover:text-gold-600 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gold-600 transition-colors font-medium"
                  >
                    <User className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-700 hover:text-gold-600 transition-colors font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-700 hover:text-gold-600"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Category bar */}
        <div className="hidden md:flex items-center h-10 gap-0.5 border-t border-gray-100">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => setActiveMenu(cat.slug)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors rounded-md font-medium ${
                  cat.featured
                    ? 'text-gold-700 hover:bg-gold-50 bg-gold-50/50'
                    : 'text-gray-700 hover:text-gold-700 hover:bg-gray-50'
                }`}
              >
                {cat.featured && <Sparkles className="w-3.5 h-3.5 text-gold-500" />}
                <cat.icon className={`w-4 h-4 ${cat.featured ? 'text-gold-500' : 'text-gray-400'}`} />
                {cat.name}
                <ChevronDown className="w-3 h-3 opacity-40" />
              </Link>

              {/* Mega menu */}
              {activeMenu === cat.slug && (
                <div className="absolute left-0 top-full pt-0 z-50">
                  <div className="bg-white border border-gray-200 rounded-b-lg shadow-xl py-2 min-w-[200px]">
                    {cat.children.map((child) => (
                      <Link
                        key={child}
                        href={`/products?category=${cat.slug}&sub=${child.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-1.5 text-sm text-gray-600 hover:text-gold-700 hover:bg-gold-50 transition-colors"
                      >
                        {child}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1.5 pt-1.5">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="block px-4 py-1.5 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
                      >
                        View All {cat.name} →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 max-h-[80vh] overflow-y-auto shadow-lg">
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-9 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
              <a href="mailto:info@yeatru.com" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                info@yeatru.com
              </a>
              <a href="tel:+8615988516408" className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                +86 15988516408
              </a>
            </div>

            {categories.map((cat) => (
              <div key={cat.slug} className="border-b border-gray-100 py-1.5">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`flex items-center gap-2 py-1.5 font-medium ${
                    cat.featured ? 'text-gold-700' : 'text-gray-700'
                  }`}
                >
                  {cat.featured && <Sparkles className="w-3.5 h-3.5 text-gold-500" />}
                  <cat.icon className={`w-4 h-4 ${cat.featured ? 'text-gold-500' : 'text-gray-400'}`} />
                  {cat.name}
                </Link>
                <div className="ml-6 space-y-0.5">
                  {cat.children.slice(0, 4).map((child) => (
                    <Link
                      key={child}
                      href={`/products?category=${cat.slug}&sub=${child.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block py-1 text-sm text-gray-500 hover:text-gold-600"
                    >
                      {child}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-3 space-y-1.5">
              {session ? (
                <>
                  <Link href="/dashboard" className="block py-1.5 text-gray-700 hover:text-gold-600 font-medium">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left py-1.5 text-gray-700 hover:text-gold-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block py-1.5 text-gray-700 hover:text-gold-600 font-medium">
                  Sign In
                </Link>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1.5 border-t border-gray-100">
                <Link href="/sell" className="hover:text-gold-600 font-medium">
                  Become a Seller
                </Link>
                <span className="text-gray-200">|</span>
                <Link href="/orders" className="hover:text-gold-600 font-medium">
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
