import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  ChevronRight,
  Star,
  Zap,
  ArrowRight,
  Package,
  Gift,
  Award,
  Clock,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const slides = [
    {
      title: 'Global Shopping, Delivered to Your Door',
      subtitle: 'Discover premium products from around the world with fast international shipping',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=600&fit=crop',
      cta: 'Shop Now',
      link: '/products',
    },
    {
      title: 'Start Selling Today',
      subtitle: 'Join thousands of sellers and reach customers worldwide',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&h=600&fit=crop',
      cta: 'Sell Now',
      link: '/sell',
    },
    {
      title: 'Up to 50% Off Electronics',
      subtitle: 'Limited time offer on all tech gadgets and accessories',
      image: 'https://images.unsplash.com/photo-1556740755-069a40165b40?w=1600&h=600&fit=crop',
      cta: 'Explore Deals',
      link: '/products',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50 worldwide' },
    { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer service' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  ];

  const featured = products.slice(0, 4);

  return (
    <Layout>
      <section className="relative h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-900/40" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-50 mb-4 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-dark-100 mb-8 drop-shadow-md">{slide.subtitle}</p>
                  <Link href={slide.link} className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-dark-900 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-accent-500/40 hover:scale-105">
                    {slide.cta} <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-accent-500 w-8' : 'bg-dark-300/50'}`}
            />
          ))}
        </div>
      </section>

      <section className="bg-dark-800 py-8 border-b border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-primary-800/50 p-3 rounded-full border border-primary-700/30">
                  <feature.icon className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-50">{feature.title}</h3>
                  <p className="text-sm text-dark-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-50 mb-2">Featured Products</h2>
              <p className="text-dark-300">Handpicked items just for you</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-accent-500 font-medium hover:text-accent-400 transition-colors">
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.length > 0 ? (
              featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Package className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                <p className="text-dark-300">No products found. Be the first to list!</p>
                <Link href="/sell" className="btn-primary mt-4">
                  Sell Your First Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-900 to-dark-800 border-t border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent-500/20 text-accent-500 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Become a Seller
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-50 mb-4">
                Start Selling Today
              </h2>
              <p className="text-dark-200 text-lg mb-8">
                Join thousands of sellers and reach customers worldwide. No upfront fees, no minimum sales.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/sell" className="bg-accent-500 hover:bg-accent-400 text-dark-900 px-8 py-3 rounded-lg font-bold transition-colors">
                  Start Selling
                </Link>
                <Link href="/sell" className="border-2 border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-dark-900 px-8 py-3 rounded-lg font-bold transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-800/60 backdrop-blur rounded-xl p-6 text-center border border-dark-500/30">
                <Gift className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                <h3 className="text-dark-50 font-semibold mb-1">Free Listing</h3>
                <p className="text-dark-300 text-sm">No listing fees</p>
              </div>
              <div className="bg-dark-800/60 backdrop-blur rounded-xl p-6 text-center border border-dark-500/30">
                <Award className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                <h3 className="text-dark-50 font-semibold mb-1">Global Reach</h3>
                <p className="text-dark-300 text-sm">150+ countries</p>
              </div>
              <div className="bg-dark-800/60 backdrop-blur rounded-xl p-6 text-center border border-dark-500/30">
                <Clock className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                <h3 className="text-dark-50 font-semibold mb-1">Fast Payout</h3>
                <p className="text-dark-300 text-sm">Weekly payments</p>
              </div>
              <div className="bg-dark-800/60 backdrop-blur rounded-xl p-6 text-center border border-dark-500/30">
                <Star className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                <h3 className="text-dark-50 font-semibold mb-1">Top Support</h3>
                <p className="text-dark-300 text-sm">24/7 assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Home;

export const getServerSideProps = () => ({ props: {} });
