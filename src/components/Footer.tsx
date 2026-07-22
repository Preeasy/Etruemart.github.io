import Link from 'next/link';
import { Package, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-500/30 text-dark-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Package className="w-8 h-8 text-accent-500 group-hover:text-accent-400 transition-colors" />
              <span className="text-xl font-bold tracking-wide text-accent-500 group-hover:text-accent-400 transition-colors">eTruemart</span>
            </Link>
            <p className="text-dark-200 text-sm mb-4">
              Your trusted cross-border shopping destination. Shop global, ship smart, earn rewards.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-dark-300 hover:text-accent-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-dark-300 hover:text-accent-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-dark-300 hover:text-accent-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-dark-300 hover:text-accent-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent-500">Quick Links</h3>
            <ul className="space-y-2 text-dark-200">
              <li><Link href="/products" className="hover:text-accent-500 transition-colors">All Products</Link></li>
              <li><Link href="/sell" className="hover:text-accent-500 transition-colors">Sell on eTruemart</Link></li>
              <li><Link href="/products" className="hover:text-accent-500 transition-colors">New Arrivals</Link></li>
              <li><Link href="/products" className="hover:text-accent-500 transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent-500">Customer Service</h3>
            <ul className="space-y-2 text-dark-200">
              <li><a href="#" className="hover:text-accent-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent-500 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-accent-500 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-accent-500 transition-colors">Track Order</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-accent-500">Contact Us</h3>
            <ul className="space-y-3 text-dark-200">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-500" />
                <span>info@yeatru.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent-500" />
                <span>+86 15988516408</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <span>Yiwu City, Zhejiang, China</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-500/30 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-300 text-sm">&copy; 2026 eTruemart. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-dark-300">
              <a href="#" className="hover:text-accent-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-accent-500 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
