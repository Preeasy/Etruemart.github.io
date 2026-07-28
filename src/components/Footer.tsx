import Link from 'next/link';
import {
  Gem,
  Facebook,
  Linkedin,
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Lock,
} from 'lucide-react';

const productCategories = [
  'Fashion Jewelry',
  'Bags & Accessories',
  'Hair Accessories',
  'Garment Accessories',
  'Toys & Gift',
  'Home Decor & Crafts',
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Seller Center', href: '/sell' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Quality Assurance', href: '/quality' },
  { label: 'Shipping Policy', href: '/shipping' },
  { label: 'Return Policy', href: '/returns' },
];

const socials = [
  { Icon: Facebook, label: 'Facebook', href: '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: MessageCircle, label: 'WhatsApp', href: '#' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-ink-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - Brand & About */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 rounded-md bg-accent-500 flex items-center justify-center">
                <Gem className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-display font-bold tracking-wide text-white group-hover:text-accent-300 transition-colors leading-tight">
                  eTrue Mark
                </span>
                <span className="text-[9px] tracking-[0.25em] text-ink-400 uppercase leading-tight">
                  Wholesale Source
                </span>
              </div>
            </Link>

            <p className="text-xs text-ink-300 leading-relaxed">
              Your trusted B2B sourcing partner in Yiwu, China. Factory-direct wholesale
              jewelry, accessories &amp; crafts with low MOQ and global shipping.
            </p>

            <div className="flex items-center gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-md border border-navy-700 flex items-center justify-center text-ink-300 hover:text-accent-300 hover:border-accent-300 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Product Categories */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
              Product Categories
            </h3>
            <nav className="flex flex-col">
              {productCategories.map((label) => (
                <Link
                  key={label}
                  href="/products"
                  className="text-xs text-ink-300 hover:text-accent-300 transition-colors py-1"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 - Company */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
              Company
            </h3>
            <nav className="flex flex-col">
              {companyLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-ink-300 hover:text-accent-300 transition-colors py-1"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4 - Trust & Certifications */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                Trade Assurance
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-success-500/20 text-success-500 border border-success-500/30">
                  <BadgeCheck className="w-3 h-3" />
                  Verified Supplier
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-accent-500/20 text-accent-400 border border-accent-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Trade Assurance
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-navy-600/30 text-ink-300 border border-navy-500/30">
                  <Lock className="w-3 h-3" />
                  SSL Secured
                </span>
              </div>
            </div>

            <p className="text-xs text-ink-300">
              We accept: T/T, PayPal, L/C, Western Union
            </p>

            <div className="flex flex-col gap-1">
              <a
                href="mailto:sales@etruemark.com"
                className="inline-flex items-center gap-2 text-xs text-ink-300 hover:text-accent-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                sales@etruemark.com
              </a>
              <a
                href="tel:+8657985000000"
                className="inline-flex items-center gap-2 text-xs text-ink-300 hover:text-accent-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                +86 579 8500-0000
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-ink-400 text-xs">
            &copy; {year} eTrue Mark. Yiwu Yeatru Trading Co., Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-400">
            <a href="#" className="hover:text-accent-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent-300 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-accent-300 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
