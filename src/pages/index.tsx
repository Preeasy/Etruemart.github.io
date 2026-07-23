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
  packSize?: number;
  stockStatus?: string;
}

const categoryItems = [
  {
    name: 'Fashion Jewelry',
    icon: Gem,
    slug: 'fashion-jewelry',
    desc: 'Necklaces, earrings, bracelets & rings',
    image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6c2?w=400&h=300&fit=crop',
  },
  {
    name: 'Garment Accessories',
    icon: Scissors,
    slug: 'garment-accessories',
    desc: 'Buttons, zippers, lace & trim',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
  },
  {
    name: 'Hair Accessories',
    icon: Crown,
    slug: 'hair-accessories',
    desc: 'Clips, headbands & scrunchies',
    image: 'https://images.unsplash.com/photo-1599624231144-7ee5e61e0d76?w=400&h=300&fit=crop',
  },
  {
    name: 'Bags & Accessories',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    desc: 'Hardware, chains & keychains',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop',
  },
  {
    name: 'Home Decor & Crafts',
    icon: HomeIcon,
    slug: 'home-decor-crafts',
    desc: 'Tassels, beads & craft supplies',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=300&fit=crop',
  },
  {
    name: 'Seasonal & Festival',
    icon: Sparkles,
    slug: 'seasonal-festival',
    desc: 'Christmas, Eid & party supplies',
    image: 'https://images.unsplash.com/photo-1543903921-628d6e88c4c6?w=400&h=300&fit=crop',
  },
];

const whyChooseUs = [
  {
    icon: Globe,
    title: 'Yiwu Direct',
    desc: 'Source directly from the world\'s largest small commodities market.',
  },
  {
    icon: Package,
    title: 'Low MOQ',
    desc: 'Start with as few as 1 piece. Flexible order quantities.',
  },
  {
    icon: Truck,
    title: 'Global Shipping',
    desc: 'Reliable logistics to 200+ countries worldwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Assured',
    desc: 'Every product inspected before shipment.',
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
      <section className="relative h-[360px] md:h-[420px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&h=600&fit=crop"
          alt="Wholesale Jewelry & Accessories"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/80 to-dark-900/40" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gold-500/15 text-gold-400 px-3 py-1 rounded-full text-xs font-medium border border-gold-500/20 mb-4">
                <Gem className="w-3.5 h-3.5" />
                Wholesale from Yiwu
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-dark-50 mb-4 leading-tight">
                Your Trusted Source for{' '}
                <span className="text-gold-400">Wholesale Jewelry</span>{' '}
                &amp; Accessories
              </h1>
              <p className="text-base text-dark-200 mb-6 leading-relaxed max-w-lg">
                Direct from Yiwu — premium fashion jewelry and garment accessories at unbeatable wholesale prices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-gold-500/30"
                >
                  Browse Products <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 border-2 border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-dark-900 px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl text-dark-50">Shop by Category</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryItems.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-dark-700/50 hover:border-gold-500/40 transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                      <cat.icon className="w-3.5 h-3.5 text-gold-400" />
                    </div>
                    <h3 className="font-display text-sm text-dark-50 group-hover:text-gold-400 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-dark-800/50 border-t border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-dark-50">New Arrivals</h2>
              <p className="text-dark-400 text-sm mt-1">Latest additions to our wholesale catalog</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-gold-400 font-medium hover:text-gold-300 transition-colors text-sm"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {newProducts.length > 0 ? (
              newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <Package className="w-10 h-10 text-dark-600 mx-auto mb-2" />
                <p className="text-dark-400 text-sm">No products yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl text-dark-50">Why Choose YEATRU</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-dark-800/80 rounded-xl p-3 border border-dark-700/50 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-gold-400" />
                </div>
                <h3 className="font-display text-sm font-semibold text-dark-50 mb-1">{item.title}</h3>
                <p className="text-dark-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-dark-800 border-t border-dark-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-dark-900 rounded-xl p-5 border border-dark-700/50">
              <div className="inline-flex items-center gap-2 bg-gold-500/15 text-gold-400 px-2.5 py-1 rounded-full text-xs font-medium border border-gold-500/20 mb-3">
                <Award className="w-3.5 h-3.5" />
                For Suppliers
              </div>
              <h3 className="font-display text-lg text-dark-50 mb-2">Become a Seller</h3>
              <p className="text-dark-400 text-sm mb-3 leading-relaxed">
                List your products and reach wholesale buyers across 200+ countries. No listing fees.
              </p>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Start Selling <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-dark-900 rounded-xl p-5 border border-gold-500/20">
              <div className="inline-flex items-center gap-2 bg-gold-500/15 text-gold-400 px-2.5 py-1 rounded-full text-xs font-medium border border-gold-500/20 mb-3">
                <Globe className="w-3.5 h-3.5" />
                For Buyers
              </div>
              <h3 className="font-display text-lg text-dark-50 mb-2">Request a Catalog</h3>
              <p className="text-dark-400 text-sm mb-3 leading-relaxed">
                Get our latest wholesale catalog with thousands of SKUs. Custom sourcing available.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Browse Catalog <ArrowRight className="w-4 h-4" />
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