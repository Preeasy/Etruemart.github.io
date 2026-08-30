import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import {
  ChevronRight,
  Star,
  CheckCircle2,
  Store,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  Globe,
  Clock,
  MessageCircle,
  Phone,
  Mail,
  ThumbsUp,
  TrendingUp,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Gem,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { SITE_URL, SITE_OG_IMAGE, SITE_PHONE, SITE_EMAIL } from '@/lib/site';
import fs from 'fs';
import path from 'path';

interface Product {
  id: number | string;
  slug?: string;
  name: string;
  category: { name: string; slug: string };
  priceMin: number;
  priceMax: number;
  image: string;
  moq?: number;
  sku?: string;
  stockStatus?: string;
}

const storeData = {
  name: 'Yiwu Premium Trading Co.',
  slug: 'yiwu-premium-trading',
  initials: 'YW',
  verified: true,
  since: '2018',
  responseRate: '95%',
  responseTime: '< 4h',
  location: 'Yiwu, Zhejiang, China',
  employees: '50-100',
  annualRevenue: '$5M - $10M',
  mainMarkets: ['USA', 'Europe', 'Middle East', 'Southeast Asia', 'Africa', 'LATAM'],
  categories: ['Toys & Gift', 'Fashion Jewelry', 'Hair Accessories', 'Bags & Accessories', 'Garment Accessories', 'Home Decor & Crafts'],
  description: 'Yiwu Premium Trading Co. is a leading wholesale supplier based in Yiwu, China — the world\'s largest small commodity market. We specialize in fashion jewelry, hair accessories, toys, gift items, and home decor. With over 12 years of export experience, we serve 4,000+ retailers and distributors across 180+ countries. Our in-house design team and 3-stage QC process ensure every product meets international standards.',
  stats: {
    products: 964,
    transactions: 12480,
    rating: 4.8,
    reviews: 356,
    onTimeDelivery: 98,
    disputeRate: 0.2,
  },
  certifications: ['ISO 9001', 'BSCI', 'FSC', 'CE / RoHS', 'SGS Audited'],
  services: ['OEM / ODM', 'Custom Packaging', 'Logo Printing', 'Sample Orders', 'Dropshipping Support', 'Private Label'],
};

export default function StorePage({ products }: { products: Product[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return Number(a.priceMin) - Number(b.priceMin);
      case 'price-high': return Number(b.priceMin) - Number(a.priceMin);
      default: return 0;
    }
  });

  return (
    <Layout>
      <Head>
        <title>{`${storeData.name} | Verified Wholesale Supplier | eTrueMart`}</title>
        <meta name="description" content={`${storeData.description.slice(0, 155)}`} />
        <link rel="canonical" href={`${SITE_URL}/store/${storeData.slug}`} />
        <meta property="og:title" content={`${storeData.name} | eTrueMart B2B`} />
        <meta property="og:description" content={storeData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SITE_OG_IMAGE} />
        <meta property="og:url" content={`${SITE_URL}/store/${storeData.slug}`} />
        <meta property="og:site_name" content="eTrueMart" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: storeData.name,
            description: storeData.description,
            image: SITE_OG_IMAGE,
            url: `${SITE_URL}/store/${storeData.slug}`,
            telephone: SITE_PHONE,
            email: SITE_EMAIL,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Yiwu',
              addressRegion: 'Zhejiang',
              addressCountry: 'CN',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: storeData.stats.rating,
              reviewCount: storeData.stats.reviews,
            },
          })
        }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
              { '@type': 'ListItem', position: 3, name: storeData.name, item: `${SITE_URL}/store/${storeData.slug}` },
            ],
          })
        }} />
      </Head>

      {/* Breadcrumb */}
      <div className="bg-sand-100/60 border-b border-sand-200">
        <div className="section py-3">
          <nav className="flex items-center gap-2 text-xs text-ink-500">
            <Link href="/" className="link-navy font-medium">Home</Link>
            <ChevronRight className="w-3 h-3 text-ink-300" />
            <Link href="/products" className="link-navy font-medium">Products</Link>
            <ChevronRight className="w-3 h-3 text-ink-300" />
            <span className="text-navy-800 font-bold">{storeData.name}</span>
          </nav>
        </div>
      </div>

      {/* ─── STORE HEADER — Navy / Gold premium ─── */}
      <div className="relative overflow-hidden bg-hero-gradient text-white border-b border-white/10">
        <div className="absolute inset-0 bg-hero-texture opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-navy opacity-[0.05] pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gold-400/20 blur-[100px]" />
        <div className="section py-10 md:py-14 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl gold-border-wrap rounded-2xl pointer-events-none" />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 border-2 border-white/20 flex items-center justify-center text-navy-900 font-black text-3xl md:text-4xl flex-shrink-0 shadow-gold-glow">
                {storeData.initials}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight leading-tight">{storeData.name}</h1>
                {storeData.verified && (
                  <span className="inline-flex items-center gap-1.5 bg-success-500/20 text-success-200 text-xs font-black px-3 py-1 rounded-full border border-success-400/30 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Supplier
                  </span>
                )}
                <span className="tag !bg-white/10 !text-gold-200 !border-white/15 !rounded-full">
                  <Gem className="w-3 h-3" /> Gold Member · Est. {storeData.since}
                </span>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-navy-50/90 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold-300" />{storeData.location}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gold-300" />{storeData.employees} staff</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold-300" />12+ years in Yiwu Market</span>
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(storeData.stats.rating) ? 'text-gold-400 fill-gold-400' : 'text-white/20'}`} />)}
                  </div>
                  <span className="text-white font-black tabular">{storeData.stats.rating}</span>
                  <span className="text-navy-200/80 text-xs">({storeData.stats.reviews} reviews)</span>
                </div>
                <span className="text-navy-200/50">|</span>
                <span className="text-navy-50/90 text-sm"><span className="text-white font-black tabular">{storeData.stats.transactions.toLocaleString()}</span> transactions</span>
                <span className="text-navy-200/50">|</span>
                <span className="text-navy-50/90 text-sm"><span className="text-white font-black tabular">{storeData.stats.products}</span> SKUs</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0 w-full md:w-auto">
              <a
                href="https://wa.me/8618767960499?text=Hello%2C%20I%27d%20like%20to%20contact%20Yiwu%20Premium%20Trading%20for%20wholesale."
                target="_blank" rel="noreferrer noopener"
                className="btn-cta btn-lg shadow-coral-glow w-full md:w-auto justify-center"
              >
                <MessageCircle className="w-4 h-4" /> Contact Sales Now
              </a>
              <a
                href={`tel:${SITE_PHONE}`}
                className="btn btn-lg w-full md:w-auto justify-center !text-white border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur transition-all"
              >
                <Phone className="w-4 h-4" /> {SITE_PHONE}
              </a>
            </div>
          </div>
        </div>
        {/* Gold trim separator */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gold-border pointer-events-none" />
      </div>

      {/* ─── STATS BAR — Sand tone ─── */}
      <div className="bg-trust-stripe border-b border-sand-200">
        <div className="section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-sand-200/60">
            {[
              { label: 'On-time Delivery', value: `${storeData.stats.onTimeDelivery}%`, icon: Clock, tone: 'success' },
              { label: 'Response Rate', value: storeData.responseRate, icon: MessageCircle, tone: 'gold' },
              { label: 'Avg Response', value: storeData.responseTime, icon: TrendingUp, tone: 'navy' },
              { label: 'Dispute Rate', value: `${storeData.stats.disputeRate}%`, icon: ShieldCheck, tone: 'coral' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-3 md:px-6 py-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-paper ${
                    stat.tone === 'success' ? 'bg-success-50 text-success-600' :
                    stat.tone === 'gold'    ? 'bg-gold-50 text-gold-700' :
                    stat.tone === 'coral'   ? 'bg-coral-50 text-coral-600' :
                                              'bg-navy-50 text-navy-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-display font-black text-xl md:text-2xl text-navy-900 tabular leading-none">{stat.value}</p>
                    <p className="text-[11px] text-ink-500 font-semibold mt-1">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="lg:col-span-3 space-y-5">
            {/* About */}
            <div className="panel !rounded-2xl p-5">
              <h3 className="label flex items-center gap-2">
                <Store className="w-4 h-4 text-gold-600" />About Store
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">{storeData.description}</p>
              <div className="mt-4 pt-4 border-t border-sand-100 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Revenue</p>
                  <p className="mt-0.5 font-bold text-navy-800 text-sm">{storeData.annualRevenue}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Employees</p>
                  <p className="mt-0.5 font-bold text-navy-800 text-sm">{storeData.employees}</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="panel !rounded-2xl p-5">
              <h3 className="label flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-600" />Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {storeData.certifications.map((cert, i) => (
                  <span key={i} className="tag-gold !px-3 !py-1">
                    <CheckCircle2 className="w-3 h-3" />{cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="panel !rounded-2xl p-5">
              <h3 className="label flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-gold-600" />Our Services
              </h3>
              <ul className="space-y-2.5">
                {storeData.services.map((svc, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-ink-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0 border border-gold-200">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                    {svc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Markets */}
            <div className="panel !rounded-2xl p-5">
              <h3 className="label flex items-center gap-2">
                <Globe className="w-4 h-4 text-gold-600" />Ships To
              </h3>
              <div className="flex flex-wrap gap-2">
                {storeData.mainMarkets.map((mkt, i) => (
                  <span key={i} className="tag-navy !px-2.5 !py-1 !text-[11px]">{mkt}</span>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-500 leading-relaxed">
                Door-to-door service · Sea, Air &amp; Express · Consolidated LCL/FCL weekly.
              </p>
            </div>

            {/* Contact */}
            <div className="premium-card !rounded-2xl p-5 bg-gradient-to-br from-navy-50 via-white to-gold-50 border-gold-300/40">
              <h3 className="label flex items-center gap-2">
                <Gem className="w-4 h-4 text-gold-600" />Sales Contact
              </h3>
              <div className="space-y-3 mt-1">
                <a href={`tel:${SITE_PHONE}`} className="flex items-center gap-2.5 text-sm text-navy-800 hover:text-gold-700 transition-colors font-semibold">
                  <Phone className="w-4 h-4 text-coral-500" />{SITE_PHONE}
                </a>
                <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-2.5 text-sm text-navy-800 hover:text-gold-700 transition-colors font-semibold break-all">
                  <Mail className="w-4 h-4 text-coral-500 flex-shrink-0" />{SITE_EMAIL}
                </a>
                <div className="flex items-start gap-2.5 text-sm text-ink-700">
                  <MapPin className="w-4 h-4 text-coral-500 flex-shrink-0 mt-0.5" />Yiwu International Trade City, Zhejiang, China
                </div>
              </div>
            </div>
          </aside>

          {/* ─── RIGHT: PRODUCTS ─── */}
          <div className="lg:col-span-9">
            {/* Toolbar */}
            <div className="panel !rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search in this store..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 py-2.5 text-sm"
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="select py-2.5 text-sm pr-9 appearance-none cursor-pointer min-w-[180px]"
                  >
                    <option value="all">All Categories</option>
                    {storeData.categories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-sand-200 rounded-xl overflow-hidden bg-white">
                  <button onClick={() => setViewMode('grid')} aria-label="Grid view" className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-navy-800 text-white' : 'text-ink-500 hover:text-navy-700'}`}><Grid3X3 className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('list')} aria-label="List view" className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-navy-800 text-white' : 'text-ink-500 hover:text-navy-700'}`}><List className="w-4 h-4" /></button>
                </div>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select py-2.5 text-sm pr-9 appearance-none cursor-pointer">
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-500">
                Showing <span className="font-black text-navy-800 tabular">{sortedProducts.length}</span> products from this verified supplier
              </p>
              <Link href="/products" className="link-gold text-xs font-bold hidden sm:inline-flex items-center gap-1">
                Browse all 964+ SKUs →
              </Link>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="panel !rounded-2xl py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sand-50 to-gold-50 border border-sand-200 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gold-400" />
                </div>
                <h3 className="font-display font-black text-xl text-navy-900 mb-2">No matching products</h3>
                <p className="text-ink-500 max-w-md mx-auto text-sm mb-6">
                  Try a different search term — or contact us directly and we&apos;ll source exactly what you need from 2,000+ Yiwu factories.
                </p>
                <a
                  href="https://wa.me/8618767960499"
                  target="_blank" rel="noreferrer noopener"
                  className="btn-primary"
                >
                  💬 Ask for Custom Sourcing
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'yiwu-premium-trading' } }],
    fallback: false,
  };
}

export const getStaticProps = async (context: { params: { slug: string } }) => {
  // Prefer prisma/seed-data.json (fallback: site-data.json) for store listing preview.
  const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  let products: Product[] = [];
  try {
    let raw: any = null;
    if (fs.existsSync(seedPath)) {
      raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    } else if (fs.existsSync(siteDataPath)) {
      raw = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
    }
    if (raw) {
      products = (raw.products || []).map((p: any) => ({
        id: p.id,
        slug: p.slug || String(p.id),
        name: p.name || '',
        category: p.category || { name: '', slug: '' },
        priceMin: Number(p.priceMin || p.price || 0),
        priceMax: p.priceMax ? Number(p.priceMax) : 0,
        image: p.image || '',
        moq: p.moq ? Number(p.moq) : 0,
        sku: p.sku || '',
        stockStatus: p.stockStatus || 'IN_STOCK',
      }));
    }
  } catch (e: any) { if (typeof console !== 'undefined') console.warn('[store/[slug]] SSR fetch failed:', e?.message || e); }
  return { props: { products } };
};
