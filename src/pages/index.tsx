import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Gem,
  Scissors,
  Crown,
  ShoppingBag,
  Home as HomeIcon,
  Gift,
  Package,
  Sparkles,
  Truck,
  ShieldCheck,
  Globe,
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

const PEXELS = 'https://images.pexels.com/photos';

const slides = [
  {
    name: 'Toys & Gift',
    headline: 'Stress Relief Toys',
    desc: 'Butter bars, squishy toys, fidget spinners & more — trending stress relief toys at factory prices.',
    slug: 'toys-gift',
    image: `${PEXELS}/6983866/pexels-photo-6983866.jpeg?auto=compress&cs=tinysrgb&w=2400&h=700&fit=crop`,
  },
  {
    name: 'Fashion Jewelry',
    headline: 'Fashion Jewelry',
    desc: 'Earrings, necklaces & rings — wholesale from Yiwu.',
    slug: 'fashion-jewelry',
    image: `${PEXELS}/4735895/pexels-photo-4735895.jpeg?auto=compress&cs=tinysrgb&w=2400&h=700&fit=crop`,
  },
  {
    name: 'Bags & Accessories',
    headline: 'Bags & Accessories',
    desc: 'Bag hardware, chains & keychains — premium from Yiwu.',
    slug: 'bags-accessories',
    image: `${PEXELS}/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=2400&h=700&fit=crop`,
  },
  {
    name: 'Hair Accessories',
    headline: 'Hair Accessories',
    desc: 'Clips, headbands & scrunchies — trendy wholesale styles.',
    slug: 'hair-accessories',
    image: `${PEXELS}/6462247/pexels-photo-6462247.jpeg?auto=compress&cs=tinysrgb&w=2400&h=700&fit=crop`,
  },
  {
    name: 'Home Decor & Crafts',
    headline: 'Home Decor & Crafts',
    desc: 'Tassels, beads & craft supplies — beautify every space.',
    slug: 'home-decor-crafts',
    image: `${PEXELS}/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=2400&h=700&fit=crop`,
  },
];

const features = [
  { icon: Globe, title: 'Yiwu Direct', desc: 'Source from the world\'s largest small commodities market.' },
  { icon: Package, title: 'Low MOQ', desc: 'Start with as few as 1 piece. Flexible quantities.' },
  { icon: Truck, title: 'Global Shipping', desc: 'Reliable logistics to 200+ countries worldwide.' },
  { icon: ShieldCheck, title: 'Quality Assured', desc: 'Every product inspected before shipment.' },
];

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  const newProducts = products.slice(0, 10);

  return (
    <Layout>
      {/* Hero Carousel - 紧凑型横幅 */}
      <section className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.slug}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-lg">
                  <h1 className="font-display text-2xl md:text-4xl lg:text-5xl text-white mb-2 md:mb-3 leading-tight font-bold">
                    {slide.headline}
                  </h1>
                  <p className="text-white/80 text-sm md:text-base mb-4 md:mb-5 leading-relaxed line-clamp-2">
                    {slide.desc}
                  </p>
                  <Link
                    href={`/products?category=${slide.slug}`}
                    className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-2.5 md:px-7 md:py-3 rounded-lg font-bold text-sm md:text-base transition-all shadow-lg shadow-gold-500/30"
                  >
                    Shop Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-gold-400 w-6' : 'bg-white/40 w-2 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Bar - 紧凑信息条 */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {features.map((item, index) => (
              <div key={index} className="flex items-center gap-3 py-3 px-2 md:px-4">
                <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-gold-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals - 新品到货 */}
      <section className="py-10 md:py-12 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-semibold text-gold-600 uppercase tracking-[0.2em]">Fresh Stock</span>
              <h2 className="font-display text-2xl md:text-3xl text-gray-900 mt-1.5">New Arrivals</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-gold-700 font-semibold hover:text-gold-500 transition-colors text-sm"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newProducts.length > 0 ? (
              newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Toys Spotlight - 玩具特色区域 */}
      <section className="py-10 md:py-12 bg-gray-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
              <img
                src={`${PEXELS}/6983746/pexels-photo-6983746.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop`}
                alt="Toys & Gift"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Trending Now
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-gray-900 mb-3 leading-tight">
                Stress Relief & Fidget Toys
              </h2>
              <p className="text-gray-600 text-sm md:text-base mb-4 leading-relaxed">
                Butter bars, squishy toys, fidget spinners and more — the hottest stress relief toy trends.
                Low MOQ, fast shipping from Yiwu. Perfect for retail, gifting & promotions.
              </p>
              <Link
                href="/products?category=toys-gift"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md shadow-gold-500/20"
              >
                Browse Toys & Gift <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - 询价区域 */}
      <section className="py-10 md:py-12 bg-gradient-to-r from-gold-500 to-gold-600">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h3 className="font-display text-xl md:text-2xl text-white font-bold leading-tight">
                Need Bulk Pricing or Custom Sourcing?
              </h3>
              <p className="text-white/85 text-sm mt-1.5">
                Get a personalized quote within 24 hours.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-gold-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold text-sm transition-colors"
              >
                Browse Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:sales@etruemart.com?subject=Wholesale%20Inquiry"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white hover:bg-white hover:text-gold-600 px-6 py-3 rounded-lg font-bold text-sm transition-all"
              >
                Request a Quote
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;

export const getServerSideProps = () => ({ props: {} });
