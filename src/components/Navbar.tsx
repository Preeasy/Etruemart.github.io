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
  Sparkles,
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
    name: 'Seasonal & Festival',
    icon: Sparkles,
    slug: 'seasonal-festival',
    children: [
      'Christmas Decor',
      'Eid & Ramadan',
      'Halloween',
      'Valentine\'s Day',
      'Wedding Supplies',
      'Party Decorations',
    ],
  },
];

const Navbar = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="sticky top-0 z-50">
      {/* Top bar - contact info */}
      <div className="bg-white border-b border-gold-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-9 text-xs text-gray-500">
            <div className="flex items-center gap-6">
              <a
                href="mailto:info@yeatru.com"
                className="flex items-center gap-1.5 hover:text-gold-500 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                info@yeatru.com
              </a>
              <a
                href="tel:+8615988516408"
                className="hidden sm:flex items-center gap-1.5 hover:text-gold-500 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                +86 15988516408
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sell" className="hover:text-gold-500 transition-colors">
                Become a Seller
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/orders" className="hover:text-gold-500 transition-colors">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-bold tracking-wide text-gold-600 group-hover:text-gold-300 transition-colors leading-tight">
                  eTruemart
                </span>
                <span className="text-[9px] tracking-[0.25em] text-gray-500 uppercase leading-tight">
                  Wholesale Source
                </span>
              </div>
            </Link>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search jewelry, accessories, trim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 pr-24 rounded-lg bg-gray-50 border border-dark-600/50 text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50 transition-colors text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold-500 hover:bg-gold-400 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-5">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-500 hover:text-gold-500 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold-500 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gold-500 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-500 hover:text-gold-500"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-dark-800/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center h-11 gap-0.5">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setActiveMenu(cat.slug)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gold-500 transition-colors rounded-md hover:bg-dark-700/50"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Link>

                {/* Mega menu */}
                {activeMenu === cat.slug && (
                  <div className="absolute left-0 top-full pt-0 z-50">
                    <div className="bg-gray-50 border border-dark-600/50 rounded-b-lg shadow-2xl py-3 min-w-[220px]">
                      {cat.children.map((child) => (
                        <Link
                          key={child}
                          href={`/products?category=${cat.slug}&sub=${child.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block px-5 py-2 text-sm text-gray-500 hover:text-gold-500 hover:bg-dark-700/30 transition-colors"
                        >
                          {child}
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <Link
                          href={`/products?category=${cat.slug}`}
                          className="block px-5 py-2 text-sm text-gold-600 hover:text-gold-300 font-medium transition-colors"
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
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-100 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2.5 pl-10 rounded-lg bg-dark-700 border border-dark-600/50 text-dark-100 placeholder-dark-500 focus:outline-none text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            </div>

            {categories.map((cat) => (
              <div key={cat.slug} className="border-b border-gray-100 py-2">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-2 py-2 text-gray-600 font-medium"
                >
                  <cat.icon className="w-4 h-4 text-gold-500" />
                  {cat.name}
                </Link>
                <div className="ml-6 space-y-1">
                  {cat.children.slice(0, 4).map((child) => (
                    <Link
                      key={child}
                      href={`/products?category=${cat.slug}&sub=${child.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block py-1.5 text-sm text-gray-500 hover:text-gold-500"
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
                  <Link href="/dashboard" className="block py-2 text-gray-500 hover:text-gold-500">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left py-2 text-gray-500 hover:text-gold-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block py-2 text-gray-500 hover:text-gold-500">
                  Sign In
                </Link>
              )}
              <Link
                href="/sell"
                className="block py-2 text-gray-500 hover:text-gold-500 text-sm"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
