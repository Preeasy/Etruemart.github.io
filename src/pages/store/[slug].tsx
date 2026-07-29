import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Star,
  CheckCircle2,
  Store,
  MapPin,
  Calendar,
  Users,
  Package,
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
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Flame,
  Tag,
} from 'lucide-react';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import siteDataJson from '../../../site-data.json';

interface Product {
  id: number | string;
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
  mainMarkets: ['USA', 'Europe', 'Middle East', 'Southeast Asia'],
  categories: ['Toys & Gift', 'Fashion Jewelry', 'Hair Accessories', 'Bags & Accessories', 'Garment Accessories', 'Home Decor & Crafts'],
  description: 'Yiwu Premium Trading Co. is a leading wholesale supplier based in Yiwu, China — the world\'s largest small commodity market. We specialize in fashion jewelry, hair accessories, toys, gift items, and home decor. With over 8 years of export experience, we serve 2,000+ retailers and distributors across 180+ countries. Our in-house design team and strict QC process ensure every product meets international standards.',
  stats: {
    products: 200,
    transactions: 12480,
    rating: 4.8,
    reviews: 356,
    onTimeDelivery: 98,
    disputeRate: 0.2,
  },
  certifications: ['ISO 9001', 'BSCI', 'FSC', 'CE / RoHS'],
  services: ['OEM / ODM', 'Custom Packaging', 'Logo Printing', 'Sample Orders', 'Dropshipping Support'],
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
      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-3.5">
          <nav className="flex items-center gap-2 text-sm text-ink-500">
            <Link href="/" className="hover:text-accent-600 transition-colors font-medium">Home</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <Link href="/products" className="hover:text-accent-600 transition-colors font-medium">Products</Link>
            <ChevronRight className="w-4 h-4 text-ink-300" />
            <span className="text-navy-800 font-bold">{storeData.name}</span>
          </nav>
        </div>
      </div>

      {/* ─── STORE HEADER ─── */}
      <div className="bg-navy-800 bg-navy-gradient relative overflow-hidden">
        <div className="absolute inset-0 premium-pattern opacity-20" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent-500/15 rounded-full blur-[100px]" />
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-10 md:py-14 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-2xl md:text-3xl flex-shrink-0">
              {storeData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{storeData.name}</h1>
                {storeData.verified && (
                  <span className="inline-flex items-center gap-1 bg-success-500/20 text-success-300 text-xs font-bold px-2.5 py-1 rounded-full border border-success-500/30 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />Verified Supplier
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap mt-2 text-ink-200 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{storeData.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Since {storeData.since}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{storeData.employees} employees</span>
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(storeData.stats.rating) ? 'text-accent-400 fill-accent-400' : 'text-white/20'}`} />)}
                  </div>
                  <span className="text-white font-bold">{storeData.stats.rating}</span>
                  <span className="text-ink-300 text-xs">({storeData.stats.reviews} reviews)</span>
                </div>
                <span className="text-ink-300">|</span>
                <span className="text-ink-200 text-sm"><span className="text-white font-bold">{storeData.stats.transactions.toLocaleString()}</span> transactions</span>
                <span className="text-ink-300">|</span>
                <span className="text-ink-200 text-sm"><span className="text-white font-bold">{storeData.stats.products}</span> products</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-accent-glow">
                <MessageCircle className="w-4 h-4" />Contact Now
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors backdrop-blur border border-white/10">
                <Phone className="w-4 h-4" />+86 579-8555-8888
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STATS BAR ─── */}
      <div className="bg-white border-b border-ink-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-ink-100">
            {[
              { label: 'On-time Delivery', value: `${storeData.stats.onTimeDelivery}%`, icon: Clock },
              { label: 'Response Rate', value: storeData.responseRate, icon: MessageCircle },
              { label: 'Response Time', value: storeData.responseTime, icon: TrendingUp },
              { label: 'Dispute Rate', value: `${storeData.stats.disputeRate}%`, icon: ShieldCheck },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-4 md:px-6 py-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy-800">{stat.value}</p>
                    <p className="text-[11px] text-ink-500 font-medium">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px] mx-auto py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="lg:col-span-3 space-y-5">
            {/* About */}
            <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-soft">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-accent-500" />About Store
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">{storeData.description}</p>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-soft">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-500" />Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {storeData.certifications.map((cert, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-800 bg-ink-50 px-2.5 py-1 rounded-lg border border-ink-100">
                    <CheckCircle2 className="w-3 h-3 text-success-500" />{cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-soft">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-accent-500" />Services
              </h3>
              <ul className="space-y-2">
                {storeData.services.map((svc, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-ink-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
                    {svc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Markets */}
            <div className="bg-white rounded-xl border border-ink-200 p-5 shadow-soft">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-500" />Main Markets
              </h3>
              <div className="flex flex-wrap gap-2">
                {storeData.mainMarkets.map((mkt, i) => (
                  <span key={i} className="text-[10px] font-bold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full border border-accent-100">{mkt}</span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-navy-50 to-white rounded-xl border border-navy-100 p-5 shadow-soft">
              <h3 className="text-sm font-bold text-navy-800 uppercase tracking-[0.08em] mb-3">Contact Info</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-ink-600">
                  <Phone className="w-3.5 h-3.5 text-accent-500" />+86 579-8555-8888
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-600">
                  <Mail className="w-3.5 h-3.5 text-accent-500" />sales@yiwupremium.com
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-600">
                  <MapPin className="w-3.5 h-3.5 text-accent-500" />Yiwu, Zhejiang, China
                </div>
              </div>
            </div>
          </aside>

          {/* ─── RIGHT: PRODUCTS ─── */}
          <div className="lg:col-span-9">
            {/* Toolbar */}
            <div className="bg-white rounded-xl p-4 mb-5 border border-ink-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search in store..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 pl-9 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                </div>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-ink-50 border border-ink-200 px-4 py-2 pr-9 rounded-xl text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 focus:bg-white cursor-pointer font-medium"
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
                <div className="flex items-center border border-ink-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}><Grid3X3 className="w-4 h-4" /></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-accent-500 text-white' : 'text-ink-500 hover:text-accent-600'}`}><List className="w-4 h-4" /></button>
                </div>
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-ink-50 border border-ink-200 px-4 py-2 pr-9 rounded-xl text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 cursor-pointer font-medium">
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <p className="text-sm text-ink-500 mb-4">Showing <span className="font-bold text-navy-800">{sortedProducts.length}</span> products from this store</p>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-ink-200">
                <div className="w-20 h-20 rounded-xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-ink-300" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">No products found</h3>
                <p className="text-ink-500">Try adjusting your search or filters.</p>
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
  const products = (siteDataJson as any).products || [];
  return { props: { products } };
};
