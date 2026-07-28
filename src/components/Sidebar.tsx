import Link from 'next/link';
import {
  ChevronRight,
  Sparkles,
  Flame,
  TrendingUp,
  Gift,
  Gem,
  Crown,
  ShoppingBag,
  Scissors,
  Home as HomeIcon,
  Shield,
  Truck,
  Award,
  Tag,
  Headphones,
  Clock,
  Star,
  Zap,
  Percent,
  Package,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';

interface Product {
  id: number | string;
  name: string;
  image: string;
  priceMin?: number;
  category?: { name: string; slug: string };
}

interface SidebarProps {
  products: Product[];
  currentCategory?: string;
}

const sidebarCategories = [
  { name: 'Toys & Gift', icon: Gift, slug: 'toys-gift' },
  { name: 'Fashion Jewelry', icon: Gem, slug: 'fashion-jewelry' },
  { name: 'Hair Accessories', icon: Crown, slug: 'hair-accessories' },
  { name: 'Bags & Accessories', icon: ShoppingBag, slug: 'bags-accessories' },
  { name: 'Garment Accessories', icon: Scissors, slug: 'garment-accessories' },
  { name: 'Home Decor & Crafts', icon: HomeIcon, slug: 'home-decor-crafts' },
];

const trustItems = [
  { icon: Shield, label: 'Verified Supplier', desc: 'On-site audited' },
  { icon: Truck, label: 'Global Shipping', desc: '180+ countries' },
  { icon: Award, label: 'Premium Quality', desc: 'Top factories' },
  { icon: Headphones, label: '24/7 Support', desc: 'Always online' },
];

export default function Sidebar({ products, currentCategory }: SidebarProps) {
  const topDeals = products.slice(0, 4);
  const newArrivals = products.slice(4, 8);
  const bestSellers = products.slice(8, 12);

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* All Categories */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-soft overflow-hidden">
          <div className="px-5 py-3.5 bg-navy-800 bg-navy-gradient relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full" />
            <h2 className="font-bold text-white text-sm uppercase tracking-[0.1em] flex items-center gap-2 relative">
              <Sparkles className="w-4 h-4 text-amber-300" />
              All Categories
            </h2>
          </div>
          <nav className="p-2">
            {sidebarCategories.map((cat) => {
              const isActive = currentCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all group ${
                    isActive
                      ? 'bg-accent-50 text-accent-600 font-semibold'
                      : 'text-ink-700 hover:bg-ink-50 hover:text-navy-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 transition-colors">
                    <cat.icon className="w-4 h-4 text-navy-600 group-hover:text-accent-600 transition-colors" />
                  </div>
                  <span className="flex-1">{cat.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-accent-500' : 'text-ink-300 group-hover:text-navy-800'} transition-colors`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Hot Deal Banner */}
        <div className="relative overflow-hidden bg-accent-600 bg-accent-gradient rounded-2xl p-5 text-white shadow-accent-glow">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/20 backdrop-blur text-white text-[9px] font-bold rounded uppercase tracking-wider">
            Limited
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-1 bg-white/25 backdrop-blur text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2.5">
              <Flame className="w-3 h-3" />
              Hot Deal
            </div>
            <h3 className="font-bold text-xl mb-1 leading-tight">Summer Sale</h3>
            <p className="text-sm text-white/90 mb-4 leading-relaxed">Up to 25% OFF on selected items!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 bg-white text-accent-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-50 transition-colors"
            >
              Shop Now <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Trending Now */}
        <div className="bg-white rounded-2xl border border-ink-200 p-4 shadow-soft">
          <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-500" />
            Trending Now
          </h3>
          <div className="space-y-2">
            {topDeals.map((item, i) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="flex gap-3 p-2 rounded-xl hover:bg-accent-50/50 transition-colors group"
              >
                <div className="relative w-14 h-14 flex-shrink-0 bg-ink-50 rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute top-0 left-0 w-5 h-5 bg-accent-600 bg-accent-gradient text-white text-[10px] font-bold rounded-br flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="text-xs font-bold text-navy-800 line-clamp-2 group-hover:text-accent-600 transition-colors leading-tight">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-accent-600 mt-0.5">${Number(item.priceMin || 0).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-br from-navy-50 to-white rounded-2xl border border-ink-200 p-4 shadow-soft">
          <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-500" />
            Why Choose Us
          </h3>
          <ul className="space-y-2.5">
            {trustItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white border border-ink-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-3.5 h-3.5 text-accent-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-800 leading-tight">{item.label}</p>
                    <p className="text-[10px] text-ink-500 leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* New Arrivals Mini */}
        {newArrivals.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink-200 p-4 shadow-soft">
            <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent-500" />
              New Arrivals
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {newArrivals.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="group block">
                  <div className="aspect-square bg-ink-50 rounded-lg overflow-hidden mb-1 border border-ink-100 group-hover:border-accent-300 transition-colors">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="text-[10px] text-navy-800 font-semibold line-clamp-1 group-hover:text-accent-600 transition-colors">
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink-200 p-4 shadow-soft">
            <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent-500" />
              Best Sellers
            </h3>
            <div className="space-y-2">
              {bestSellers.map((item, i) => (
                <Link key={item.id} href={`/products/${item.id}`} className="flex gap-3 p-2 rounded-xl hover:bg-accent-50/50 transition-colors group">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-ink-50 rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-navy-800 line-clamp-1 group-hover:text-accent-600 transition-colors">{item.name}</p>
                    <p className="text-xs font-bold text-accent-600 mt-0.5">${Number(item.priceMin || 0).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Info Mini */}
        <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-4 text-white shadow-soft relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full" />
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] mb-3 flex items-center gap-2 text-white">
            <Globe className="w-4 h-4 text-accent-400" />
            Global Shipping
          </h3>
          <div className="space-y-2">
            {[
              { icon: Truck, label: 'Express (DHL)', desc: '5-9 days' },
              { icon: Clock, label: 'Air Shipping', desc: '9-15 days' },
              { icon: Package, label: 'Sea Shipping', desc: '25-40 days' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-accent-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white leading-tight">{item.label}</p>
                    <p className="text-[10px] text-white/60 leading-tight">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Mini */}
        <div className="bg-white rounded-2xl border border-ink-200 p-4 shadow-soft">
          <h3 className="text-xs font-bold text-navy-800 uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-accent-500" />
            Need Help?
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-ink-600">
              <Mail className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
              <span className="truncate">Yeatrusourcing@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-600">
              <Phone className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
              <span>WhatsApp: +86 15988516408</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
