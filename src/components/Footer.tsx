import Link from 'next/link';
import { Gem } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0F2A4A] text-gray-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1600px] mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-md bg-orange-500 flex items-center justify-center">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-display font-bold tracking-wide text-white group-hover:text-orange-300 transition-colors leading-tight">
                eTruemart
              </span>
              <span className="text-[9px] tracking-[0.25em] text-gray-400 uppercase leading-tight">
                Wholesale Source
              </span>
            </div>
          </Link>

          {/* Minimal links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/products" className="hover:text-orange-300 transition-colors">
              All Products
            </Link>
            <Link href="/sell" className="hover:text-orange-300 transition-colors">
              Seller Center
            </Link>
            <Link href="/login" className="hover:text-orange-300 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-orange-300 transition-colors">
              Register
            </Link>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} eTruemart. Wholesale sourcing from Yiwu, China.
          </p>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-orange-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
