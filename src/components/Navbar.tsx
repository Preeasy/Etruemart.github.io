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
} from 'lucide-react';

const categories = [
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
  {
    name: 'Toys & Gift',
    icon: Gift,
    slug: 'toys-gift',
    children: [
      'Educational Toys',
      'Plush & Stuffed',
      'Games & Puzzles',
      'Gift Sets',
      'Party Favors',
      'Novelty Toys',
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
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Contact */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-sm shadow-gold-500/30">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-bold tracking-wide text-gold-700 group-hover:text-gold-500 transition-colors leading-tight">
                  eTruemart
                </span>
                <span className="text-[10px] tracking-[0.25em] text-gray-500 uppercase leading-tight">
                  Wholesale Source
                </span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-4 text-xs text-gray-600 pl-4 border-l border-gray-200">
              <a
                href="mailto:info@yeatru.com"
                className="flex items-center gap-1.5 hover:text-gold-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gold-500" />
                info@yeatru.com
              </a>
              <a
                href="tel:+8615988516408"
                className="flex items-center gap-1.5 hover:text-gold-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-gold-500" />
                +86 15988516408
              </a>
            </div>
          </div>

          {/* Center: Search bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search jewelry, accessories, trim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 pr-24 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 focus:bg-white transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold-500 hover:bg-gold-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-600">
              <Link href="/sell" className="hover:text-gold-600 transition-colors font-medium">
                Become a Seller
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/orders" className="hover:text-gold-600 transition-colors font-medium">
                Track Order
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-1 pl-3 border-l border-gray-200">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 text-sm text-gray-700 hover:text-gold-600 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-gold-600 transition-colors font-medium"
                  >
                    <User className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-gold-600 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
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

        {/* Category nav */}
        <div className="hidden md:flex items-center h-11 gap-0.5 border-t border-gray-100">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => setActiveMenu(cat.slug)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 hover:text-gold-700 transition-colors rounded-md hover:bg-gold-50 font-medium"
              >
                <cat.icon className="w-4 h-4 text-gold-500" />
                {cat.name}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Link>

              {/* Mega menu */}
              {activeMenu === cat.slug && (
                <div className="absolute left-0 top-full pt-0 z-50">
                  <div className="bg-white border border-gray-200 rounded-b-lg shadow-xl py-3 min-w-[220px]">
                    {cat.children.map((child) => (
                      <Link
                        key={child}
                        href={`/products?category=${cat.slug}&sub=${child.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-5 py-2 text-sm text-gray-700 hover:text-gold-700 hover:bg-gold-50 transition-colors"
                      >
                        {child}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="block px-5 py-2 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
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
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2.5 pl-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-4 py-2 text-xs text-gray-600 border-b border-gray-100">
              <a href="mailto:info@yeatru.com" className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gold-500" />
                info@yeatru.com
              </a>
              <a href="tel:+8615988516408" className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gold-500" />
                +86 15988516408
              </a>
            </div>

            {categories.map((cat) => (
              <div key={cat.slug} className="border-b border-gray-100 py-2">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-2 py-2 text-gray-700 font-medium"
                >
                  <cat.icon className="w-4 h-4 text-gold-500" />
                  {cat.name}
                </Link>
                <div className="ml-6 space-y-1">
                  {cat.children.slice(0, 4).map((child) => (
                    <Link
                      key={child}
                      href={`/products?category=${cat.slug}&sub=${child.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block py-1.5 text-sm text-gray-500 hover:text-gold-600"
                    >
                      {child}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 space-y-2">
              {session ? (
                <>
                  <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-gold-600 font-medium">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left py-2 text-gray-700 hover:text-gold-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block py-2 text-gray-700 hover:text-gold-600 font-medium">
                  Sign In
                </Link>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <Link href="/sell" className="hover:text-gold-600 font-medium">
                  Become a Seller
                </Link>
                <span className="text-gray-300">|</span>
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
