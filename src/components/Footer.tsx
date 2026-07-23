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
    <footer className="bg-dark-900 border-t border-gold-500/20">
      {/* CTA Band */}
      <div className="geo-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl text-dark-50 mb-2">
                Ready to Source from Yiwu?
              </h3>
              <p className="text-dark-400">
                Get access to thousands of wholesale jewelry &amp; accessories suppliers.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Become a Seller
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-dark-900 px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Request Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="border-t border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center">
                  <Gem className="w-5 h-5 text-dark-900" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-display font-bold tracking-wide text-gold-400 group-hover:text-gold-300 transition-colors leading-tight">
                    YEATRU
                  </span>
                  <span className="text-[9px] tracking-[0.25em] text-dark-400 uppercase leading-tight">
                    Wholesale Source
                  </span>
                </div>
              </Link>
              <p className="text-dark-400 text-sm mb-5 max-w-sm leading-relaxed">
                Your trusted wholesale sourcing partner for jewelry, garment accessories,
                hair accessories, and decorative trim — direct from Yiwu, China.
                Serving buyers across Europe, Americas, Middle East &amp; Africa.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-sm text-gold-400 uppercase tracking-wider mb-4">
                Categories
              </h4>
              <ul className="space-y-2.5 text-dark-400 text-sm">
                <li><Link href="/products?category=fashion-jewelry" className="hover:text-gold-400 transition-colors">Fashion Jewelry</Link></li>
                <li><Link href="/products?category=garment-accessories" className="hover:text-gold-400 transition-colors">Garment Accessories</Link></li>
                <li><Link href="/products?category=hair-accessories" className="hover:text-gold-400 transition-colors">Hair Accessories</Link></li>
                <li><Link href="/products?category=bags-accessories" className="hover:text-gold-400 transition-colors">Bags & Accessories</Link></li>
                <li><Link href="/products?category=home-decor-crafts" className="hover:text-gold-400 transition-colors">Home Decor & Crafts</Link></li>
                <li><Link href="/products?category=seasonal-festival" className="hover:text-gold-400 transition-colors">Seasonal & Festival</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm text-gold-400 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-dark-400 text-sm">
                <li><Link href="/products" className="hover:text-gold-400 transition-colors">All Products</Link></li>
                <li><Link href="/sell" className="hover:text-gold-400 transition-colors">Sell on YEATRU</Link></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Sourcing Services</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">Quality Assurance</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm text-gold-400 uppercase tracking-wider mb-4">
                Contact
              </h4>
              <ul className="space-y-3 text-dark-400 text-sm">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <a href="mailto:info@yeatru.com" className="hover:text-gold-400 transition-colors">info@yeatru.com</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <span>+86 15988516408</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                  <span>Yiwu City, Zhejiang, China</span>
                </li>
              </ul>

              <div className="mt-5">
                <h5 className="text-xs text-dark-500 uppercase tracking-wider mb-2">Newsletter</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 min-w-0 px-3 py-2 bg-dark-800 border border-dark-600/50 rounded-l-lg text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  />
                  <button className="bg-gold-500 hover:bg-gold-400 text-dark-900 px-3 py-2 rounded-r-lg transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-500 text-xs">
              &copy; {new Date().getFullYear()} YEATRU. All rights reserved. Powered by Yiwu sourcing.
            </p>
            <div className="flex gap-6 text-xs text-dark-500">
              <a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gold-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
