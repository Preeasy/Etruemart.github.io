import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Globe,
  Award,
  ChevronRight,
  ArrowRight,
  Gem,
  Scissors,
  Crown,
  ShoppingBag,
  Home as HomeIcon,
  Sparkles,
  Package,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | string;
  price: number;
  originalPrice?: number;
  image: string;
  moq?: number;
  material?: string | null;
  plating?: string | null;
  packSize?: number;
  sku?: string | null;
  stockStatus?: string;
}

const categoryItems = [
  {
    name: 'Fashion Jewelry',
    icon: Gem,
    slug: 'fashion-jewelry',
    desc: 'Necklaces, earrings, bracelets, rings & more',
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6c2?w=400&h=300&fit=crop',
  },
  {
    name: 'Garment Accessories',
    icon: Scissors,
    slug: 'garment-accessories',
    desc: 'Buttons, zippers, lace, ribbons & trim',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  },
  {
    name: 'Hair Accessories',
    icon: Crown,
    slug: 'hair-accessories',
    desc: 'Clips, headbands, scrunchies & combs',
    image: 'https://images.unsplash.com/photo-1599624231144-7ee5e61e0d76?w=400&h=300&fit=crop',
  },
  {
    name: 'Bags & Accessories',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    desc: 'Hardware, chains, keychains & charms',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
  },
  {
    name: 'Home Decor & Crafts',
    icon: HomeIcon,
    slug: 'home-decor-crafts',
    desc: 'Tassels, beads, pearls & craft supplies',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=300&fit=crop',
  },
  {
    name: 'Seasonal & Festival',
    icon: Sparkles,
    slug: 'seasonal-festival',
    desc: 'Christmas, Eid, wedding & party supplies',
    image: 'https://images.unsplash.com/photo-1543903921-628d6e88c4c6?w=400&h=300&fit=crop',
  },
];

const whyChooseUs = [
  {
    icon: Globe,
    title: 'Yiwu Direct',
    desc: 'Source directly from the world\'s largest small commodities market in Yiwu, China.',
  },
  {
    icon: Package,
    title: 'Low MOQ',
    desc: 'Start with as few as 1 piece. Flexible order quantities for businesses of all sizes.',
  },
  {
    icon: Truck,
    title: 'Global Shipping',
    desc: 'Reliable logistics to 200+ countries across Europe, Americas, Middle East & Africa.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assured',
    desc: 'Every product inspected before shipment. We stand behind the quality we deliver.',
  },
];

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const newProducts = products.slice(0, 8);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative h-[560px] md:h-[620px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&h=700&fit=crop"
          alt="Wholesale Jewelry & Accessories"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/80 to-dark-900/40" />
        <div className="absolute inset-0 geo-pattern opacity-40" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary-500/15 text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium border border-primary-500/20 mb-6">
                <Gem className="w-4 h-4" />
                Wholesale from Yiwu
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-dark-50 mb-5 leading-tight">
                Your Trusted Source for{' '}
                <span className="text-gradient-gold">Wholesale Jewelry</span>{' '}
                &amp; Garment Accessories
              </h1>
              <p className="text-lg md:text-xl text-dark-200 mb-8 leading-relaxed max-w-lg">
                Direct from Yiwu — premium fashion jewelry, garment accessories, and decorative trim at unbeatable wholesale prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-dark-900 px-8 py-3.5 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-primary-500/30 hover:scale-105"
                >
                  Browse Products <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 border-2 border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-dark-900 px-8 py-3.5 rounded-lg font-bold text-lg transition-all"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading gold-line">Shop by Category</h2>
            <p className="section-subheading mt-5">
              Explore our curated wholesale categories
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryItems.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-dark-700/40 card-hover"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <h3 className="font-display text-xl text-dark-50 group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-dark-400 text-sm">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-20 bg-dark-800/50 border-t border-dark-700/30 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-heading gold-line">New Arrivals</h2>
              <p className="section-subheading mt-5">Latest additions to our wholesale catalog</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-primary-400 font-medium hover:text-primary-300 transition-colors"
            >
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.length > 0 ? (
              newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Package className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 mb-4">No products yet. Check back soon!</p>
                <Link href="/sell" className="btn-primary">
                  Become a Seller
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 bg-dark-900 geo-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading gold-line">Why Choose YEATRU</h2>
            <p className="section-subheading mt-5">
              Your competitive edge in wholesale sourcing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-dark-800/80 rounded-xl p-6 border border-dark-700/40 text-center card-hover gold-glow"
              >
                <div className="w-14 h-14 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="font-display text-lg text-dark-50 mb-2">{item.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 bg-dark-800 border-t border-dark-700/30 border-b border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Become a Seller */}
            <div className="bg-dark-900 rounded-2xl p-8 border border-dark-700/40 gold-glow">
              <div className="inline-flex items-center gap-2 bg-primary-500/15 text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium border border-primary-500/20 mb-4">
                <Award className="w-4 h-4" />
                For Suppliers
              </div>
              <h3 className="font-display text-2xl text-dark-50 mb-3">
                Become a Seller
              </h3>
              <p className="text-dark-400 mb-6 leading-relaxed">
                List your products and reach wholesale buyers across 200+ countries.
                No listing fees, dedicated support, and weekly payouts.
              </p>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-dark-900 px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Start Selling <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Request Catalog */}
            <div className="bg-dark-900 rounded-2xl p-8 border border-rose-500/20" style={{ boxShadow: '0 0 20px rgba(212, 131, 154, 0.1)' }}>
              <div className="inline-flex items-center gap-2 bg-rose-500/15 text-rose-400 px-3 py-1.5 rounded-full text-sm font-medium border border-rose-500/20 mb-4">
                <Globe className="w-4 h-4" />
                For Buyers
              </div>
              <h3 className="font-display text-2xl text-dark-50 mb-3">
                Request a Catalog
              </h3>
              <p className="text-dark-400 mb-6 leading-relaxed">
                Get our latest wholesale catalog with thousands of SKUs across all categories.
                Custom sourcing requests welcome — we find what you need in Yiwu.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Browse Catalog <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;

export const getServerSideProps = () => ({ props: {} });
