import Link from 'next/link';
import { SITE_COMPANY } from '@/lib/site';
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
  MapPin,
  Clock,
  Award,
  Truck,
  RefreshCcw,
  Headphones,
  Check,
} from 'lucide-react';

const productCategories = [
  { label: 'Fashion Jewelry', href: '/products?category=fashion-jewelry' },
  { label: 'Garment Accessories', href: '/products?category=garment-accessories' },
  { label: 'Bags & Luggage', href: '/products?category=bags' },
  { label: 'Home & Living', href: '/products?category=home-living' },
  { label: 'Kitchen Supplies', href: '/products?category=kitchen-supplies' },
  { label: 'Shoes & Apparel', href: '/products?category=apparel-shoes' },
  { label: 'Beauty & Personal Care', href: '/products?category=beauty-personal-care' },
  { label: 'Electronics & Appliances', href: '/products?category=electronics' },
  { label: 'Toys & Games', href: '/products?category=toys' },
  { label: 'Mother & Baby', href: '/products?category=mother-baby-toys' },
  { label: 'Auto & Tools', href: '/products?category=auto-tools' },
  { label: 'Sports & Outdoor', href: '/products?category=sports-outdoor' },
];

const companyLinks = [
  { label: 'About Etruemart', href: '/about' },
  { label: 'Why Choose Us', href: '/about' },
  { label: 'Quality Assurance', href: '/about' },
  { label: 'Global Shipping', href: '/about' },
  { label: 'Payment Methods', href: '/about' },
  { label: 'Return & Refund', href: '/about' },
];

const serviceLinks = [
  { label: 'Request a Quote', href: '/register' },
  { label: 'Custom OEM / ODM', href: '/about' },
  { label: 'Private Label Service', href: '/about' },
  { label: 'Consolidation Service', href: '/about' },
  { label: 'Yiwu Market Guide', href: '/about' },
  { label: 'Become a Partner', href: '/register' },
];

const socials = [
  { Icon: Facebook,    label: 'Facebook',  href: '#', bg: 'hover:bg-[#1877F2] hover:border-[#1877F2]' },
  { Icon: Linkedin,    label: 'LinkedIn',  href: '#', bg: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]' },
  { Icon: Instagram,   label: 'Instagram', href: '#', bg: 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:border-transparent' },
  { Icon: MessageCircle,label:'WhatsApp',  href: 'https://wa.me/8618767960499', bg: 'hover:bg-[#25D366] hover:border-[#25D366]' },
];

const payments = [
  { label: 'T/T Bank Wire',  flag: '🏦' },
  { label: 'Western Union',  flag: '💵' },
  { label: 'MoneyGram',      flag: '💸' },
  { label: 'PayPal',         flag: '🅿️' },
  { label: 'Letter of Credit',flag:'📜' },
  { label: 'Alibaba Trade',  flag: '🛡' },
];

const trustFeatures = [
  { Icon: ShieldCheck, title: 'Trade Assurance', desc: '100% payment protection' },
  { Icon: Truck,       title: 'Global Shipping', desc: 'Door-to-door to 180+ countries' },
  { Icon: Award,       title: 'Verified Factory', desc: '12+ years · Yiwu direct' },
  { Icon: RefreshCcw,  title: 'Easy Refund',     desc: '30-day quality promise' },
  { Icon: Headphones,  title: '24/7 Support',    desc: 'WhatsApp · Email · Call' },
  { Icon: BadgeCheck,  title: 'Low MOQ',         desc: 'From 12 pcs per style' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-white">
      {/* ===== Premium gold trust strip ===== */}
      <div className="relative bg-gold-border text-navy-900">
        <div className="section py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trustFeatures.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-2.5">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white/85 flex items-center justify-center shadow-paper border border-white">
                  <Icon className="w-4.5 h-4.5 text-gold-600" strokeWidth={2.3} />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-navy-900">{title}</p>
                  <p className="text-[11px] text-navy-700/80 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] bg-grid-navy" />
      <div
        className="absolute inset-x-0 -top-px h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #D9B368, transparent)' }}
      />

      {/* ===== Main footer ===== */}
      <div className="relative section pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
          {/* 1. Brand column (large) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-700 flex items-center justify-center shadow-gold-glow group-hover:scale-105 transition-all">
                  <Gem className="w-6 h-6 text-navy-900" strokeWidth={2.3} />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-display font-extrabold text-white tracking-tight">
                  eTrue<span className="text-gold-gradient">Mart</span>
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-px w-5 bg-gold-400/80 rounded-full" />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-black text-gold-300">
                    Yiwu · B2B Sourcing
                  </span>
                  <span className="h-px w-5 bg-gold-400/80 rounded-full" />
                </div>
              </div>
            </Link>

            <p className="text-sm text-navy-100/70 leading-relaxed max-w-md">
              Your trusted <span className="text-gold-300 font-semibold">B2B wholesale partner</span> since 2012.
              We source directly from 2,000+ Yiwu factories — delivering curated, quality goods to
              importers, retailers and distributors in 180+ countries at <em>the lowest possible cost</em>.
            </p>

            {/* Contact info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a href="tel:+8618767960499" className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/60 hover:bg-gold-500/10 transition-all">
                <div className="w-9 h-9 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-300">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wider text-navy-200/60 font-bold">Sales Hotline</p>
                  <p className="text-sm font-bold text-white group-hover:text-gold-300 transition-colors">+86 187 6796 0499</p>
                </div>
              </a>
              <a href="mailto:yeatrusourcing@gmail.com" className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/60 hover:bg-gold-500/10 transition-all">
                <div className="w-9 h-9 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-300">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wider text-navy-200/60 font-bold">Email</p>
                  <p className="text-xs font-bold text-white group-hover:text-gold-300 transition-colors truncate max-w-[170px]">yeatrusourcing@gmail.com</p>
                </div>
              </a>
              <div className="sm:col-span-2 flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-300 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <p className="text-[10px] uppercase tracking-wider text-navy-200/60 font-bold">Head Office</p>
                  <p className="text-xs font-semibold text-white/90">
                    Yiwu International Trade City (福田市场), District 1-5 · Jinhua, Zhejiang, China
                  </p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ Icon, label, href, bg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className={`w-10 h-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center
                              text-navy-100/80 hover:text-white hover:shadow-gold-glow transition-all duration-300 ${bg}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Top Categories */}
          <div className="lg:col-span-3 flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-300 mb-4 flex items-center gap-2">
              <span className="block h-px w-7 bg-gold-500/60 rounded-full" />
              Top Categories
            </h3>
            <nav className="grid grid-cols-1 gap-x-4 gap-y-2">
              {productCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group text-sm text-navy-100/75 hover:text-white transition-colors py-0.5 flex items-center gap-2"
                >
                  <span className="text-gold-400/0 group-hover:text-gold-400 transition-all w-3 shrink-0">→</span>
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 3. Company */}
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-300 mb-4 flex items-center gap-2">
              <span className="block h-px w-7 bg-gold-500/60 rounded-full" />
              Company
            </h3>
            <nav className="flex flex-col gap-y-2">
              {companyLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="group text-sm text-navy-100/75 hover:text-white transition-colors py-0.5 flex items-center gap-2"
                >
                  <span className="text-gold-400/0 group-hover:text-gold-400 transition-all w-3 shrink-0">→</span>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 4. Services + Cert */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-300 mb-4 flex items-center gap-2">
                <span className="block h-px w-7 bg-gold-500/60 rounded-full" />
                Sourcing Services
              </h3>
              <nav className="flex flex-col gap-y-2">
                {serviceLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="group text-sm text-navy-100/75 hover:text-white transition-colors py-0.5 flex items-center gap-2"
                  >
                    <span className="text-gold-400/0 group-hover:text-gold-400 transition-all w-3 shrink-0">→</span>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Cert badges */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-wider text-gold-300 mb-3">Trade Assurance</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/10">
                  <BadgeCheck className="w-5 h-5 text-gold-300" />
                  <span className="text-[9px] text-navy-100/80 font-bold text-center leading-tight">Verified</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-success-300" />
                  <span className="text-[9px] text-navy-100/80 font-bold text-center leading-tight">Insured</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-white/10">
                  <Lock className="w-5 h-5 text-gold-200" />
                  <span className="text-[9px] text-navy-100/80 font-bold text-center leading-tight">SSL Safe</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-navy-100/80">
                <Clock className="w-3.5 h-3.5 text-gold-300" />
                <span>Responds within <strong className="text-white">2 hours</strong> on weekdays</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Payment methods row ===== */}
        <div className="mt-12 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-300">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gold-300">Secure Payments</p>
                <p className="text-sm text-navy-100/80">We accept 6 trusted international methods</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {payments.map(p => (
                <div
                  key={p.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sand-200 shadow-paper text-navy-800 text-xs font-bold"
                >
                  <span className="text-base leading-none">{p.flag}</span>
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Bottom bar ===== */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-navy-100/55">
          <p>© {year} <span className="text-white font-semibold">eTrue Mart</span>. {SITE_COMPANY}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/about" className="hover:text-gold-300 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-gold-300 transition-colors">Terms of Service</Link>
            <Link href="/about" className="hover:text-gold-300 transition-colors">Cookie Policy</Link>
            <Link href="/sitemap.xml" className="hover:text-gold-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Newsletter / CTA Floating subtle bottom accent */}
      <div
        className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #D9B368, transparent)' }}
      />
    </footer>
  );
};

export default Footer;
