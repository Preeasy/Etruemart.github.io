import Link from 'next/link';
import {
  Gem,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* CTA Band */}
      <div className="geo-pattern bg-gradient-to-b from-gold-50/40 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl text-gray-900 mb-2">
                Ready to Source from Yiwu?
              </h3>
              <p className="text-gray-600">
                Get access to thousands of wholesale jewelry &amp; accessories suppliers.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-gold-500/20"
              >
                Request Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
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
              <p className="text-gray-600 text-sm mb-5 max-w-sm leading-relaxed">
                Your trusted wholesale sourcing partner for jewelry, garment accessories,
                hair accessories, and decorative trim — direct from Yiwu, China.
                Serving buyers across Europe, Americas, Middle East &amp; Africa.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-300 hover:bg-gold-50 transition-all" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-300 hover:bg-gold-50 transition-all" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-300 hover:bg-gold-50 transition-all" aria-label="Youtube">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-300 hover:bg-gold-50 transition-all" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wider mb-4">
                Categories
              </h4>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li><Link href="/products?category=toys-gift" className="hover:text-gold-600 transition-colors">Toys & Gift</Link></li>
                <li><Link href="/products?category=fashion-jewelry" className="hover:text-gold-600 transition-colors">Fashion Jewelry</Link></li>
                <li><Link href="/products?category=hair-accessories" className="hover:text-gold-600 transition-colors">Hair Accessories</Link></li>
                <li><Link href="/products?category=bags-accessories" className="hover:text-gold-600 transition-colors">Bags & Accessories</Link></li>
                <li><Link href="/products?category=garment-accessories" className="hover:text-gold-600 transition-colors">Garment Accessories</Link></li>
                <li><Link href="/products?category=home-decor-crafts" className="hover:text-gold-600 transition-colors">Home Decor & Crafts</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li><Link href="/products" className="hover:text-gold-600 transition-colors">All Products</Link></li>
                <li><Link href="/sell" className="hover:text-gold-600 transition-colors">Become a Seller</Link></li>
                <li><a href="#" className="hover:text-gold-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gold-600 transition-colors">Sourcing Services</a></li>
                <li><a href="#" className="hover:text-gold-600 transition-colors">Quality Assurance</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wider mb-4">
                Contact
              </h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <a href="mailto:info@yeatru.com" className="hover:text-gold-600 transition-colors">info@yeatru.com</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gold-600 flex-shrink-0" />
                  <span>+86 15988516408</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>Yiwu City, Zhejiang, China</span>
                </li>
              </ul>

              <div className="mt-5">
                <h5 className="text-xs text-gray-700 uppercase tracking-wider mb-2 font-semibold">Newsletter</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 focus:bg-white transition-colors"
                  />
                  <button className="bg-gold-500 hover:bg-gold-400 text-white px-3 py-2 rounded-r-lg transition-colors" aria-label="Subscribe">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} eTruemart. All rights reserved. Powered by Yiwu sourcing.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gold-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold-600 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
