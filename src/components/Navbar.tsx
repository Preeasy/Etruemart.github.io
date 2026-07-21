import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Package } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="bg-gradient-to-r from-primary-800 to-primary-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Package className="w-8 h-8 text-accent-400" />
              <span className="text-xl font-bold">eTruemart</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                Search
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="hover:text-accent-400 transition-colors font-medium">
              Products
            </Link>
            <Link to="/about" className="hover:text-accent-400 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="hover:text-accent-400 transition-colors font-medium">
              Contact
            </Link>
            <button className="relative hover:text-accent-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button className="hover:text-accent-400 transition-colors">
              <User className="w-6 h-6" />
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="hover:text-accent-400">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-primary-800 border-t border-primary-700">
          <div className="px-4 py-3 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 rounded-full text-gray-900 focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
            <Link to="/products" className="block py-2 hover:text-accent-400">Products</Link>
            <Link to="/about" className="block py-2 hover:text-accent-400">About</Link>
            <Link to="/contact" className="block py-2 hover:text-accent-400">Contact</Link>
            <div className="flex items-center gap-4 pt-2 border-t border-primary-700">
              <button className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
              </button>
              <button><User className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
