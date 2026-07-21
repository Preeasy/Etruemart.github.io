import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Package className="w-8 h-8 text-accent-400" />
              <span className="text-xl font-bold">eTruemart</span>
            </Link>
            <p className="text-gray-300 text-sm mb-4">
              Your trusted cross-border shopping destination. Shop global, ship smart, earn rewards.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/products" className="hover:text-accent-400 transition-colors">All Products</Link></li>
              <li><Link to="/products" className="hover:text-accent-400 transition-colors">New Arrivals</Link></li>
              <li><Link to="/products" className="hover:text-accent-400 transition-colors">Best Sellers</Link></li>
              <li><Link to="/products" className="hover:text-accent-400 transition-colors">Deals & Offers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-accent-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Affiliate Program</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-400" />
                <span>support@etruemart.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                <span>123 Global Trade Street<br />Commerce City, CC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 eTruemart. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-accent-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-accent-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
