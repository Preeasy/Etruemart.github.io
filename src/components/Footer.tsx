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
  { label: 'Fashion Jewelry', href: '/products?category=fashion-jewelry' },
  { label: 'Garment Accessories', href: '/products?category=garment-accessories' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Bags', href: '/products?category=bags' },
  { label: 'Home Decor & Crafts', href: '/products?category=home-decor-crafts' },
  { label: 'Toys', href: '/products?category=toys' },
  { label: 'Gift', href: '/products?category=gift' },
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: 'mailto:yeatrusourcing@gmail.com' },
  { label: 'Quality Assurance', href: '/about' },
  { label: 'Shipping Policy', href: '/about' },
  { label: 'Return Policy', href: '/about' },
];

const socials = [
  { Icon: Facebook, label: 'Facebook', href: '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/8618767960499' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-ink-300">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 - Brand & About */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-accent-glow group-hover:scale-105 transition-transform duration-300">
                <Gem className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-display font-bold tracking-wide text-white group-hover:text-accent-300 transition-colors leading-tight">
                  eTrue Mark
                </span>
                <span className="text-[9px] tracking-[0.25em] text-accent-400/80 uppercase leading-tight font-medium">
                  Wholesale Source
                </span>
              </div>
            </Link>

            <p className="text-xs text-ink-400 leading-relaxed">
              Your trusted B2B sourcing partner in Yiwu, China. Factory-direct wholesale
              jewelry, accessories &amp; crafts with low MOQ and global shipping.
            </p>

            <div className="flex items-center gap-2.5">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-navy-700/70 flex items-center justify-center text-ink-400 hover:text-white hover:bg-accent-500 hover:border-accent-500 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Product Categories */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3.5">
              Product Categories
            </h3>
            <nav className="flex flex-col gap-1">
              {productCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="text-xs text-ink-400 hover:text-accent-300 transition-colors py-0.5"
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 - Company */}
          <div className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3.5">
              Company
            </h3>
            <nav className="flex flex-col gap-1">
              {companyLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-ink-400 hover:text-accent-300 transition-colors py-0.5"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4 - Trust & Certifications */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3.5">
                Trade Assurance
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-success-500/15 text-success-400 border border-success-500/20">
                  <BadgeCheck className="w-3 h-3" />
                  Verified Supplier
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-accent-500/15 text-accent-400 border border-accent-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Trade Assurance
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-navy-700/40 text-ink-300 border border-navy-600/40">
                  <Lock className="w-3 h-3" />
                  SSL Secured
                </span>
              </div>
            </div>

            <p className="text-xs text-ink-400">
              We accept: T/T, PayPal, L/C, Western Union
            </p>

            <div className="flex flex-col gap-1.5">
              <a
                href="mailto:yeatrusourcing@gmail.com"
                className="inline-flex items-center gap-2 text-xs text-ink-400 hover:text-accent-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                yeatrusourcing@gmail.com
              </a>
              <a
                href="tel:+8618767960499"
                className="inline-flex items-center gap-2 text-xs text-ink-400 hover:text-accent-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                +86 18767960499
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-800/60 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-ink-500 text-xs">
            &copy; {year} eTrue Mark. Yiwu Yeatru Trading Co., Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-500">
            <Link href="/about" className="hover:text-accent-300 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-accent-300 transition-colors">Terms of Service</Link>
            <Link href="/about" className="hover:text-accent-300 transition-colors">Cookie Policy</Link>
            <Link href="/sitemap.xml" className="hover:text-accent-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
