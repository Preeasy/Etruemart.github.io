import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Globe,
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

const categorySlides = [
  {
    name: 'Fashion Jewelry',
    headline: 'Wholesale Fashion Jewelry',
    desc: 'Earrings, necklaces, bracelets & rings — direct from Yiwu manufacturers at factory prices.',
    icon: Gem,
    slug: 'fashion-jewelry',
    image: `${PEXELS}/3862695/pexels-photo-3862695.jpeg?auto=compress&cs=tinysrgb&w=2400&h=800&fit=crop`,
  },
  {
    name: 'Garment Accessories',
    headline: 'Garment Accessories',
    desc: 'Buttons, zippers, lace & trim — everything your apparel production needs.',
    icon: Scissors,
    slug: 'garment-accessories',
    image: `${PEXELS}/6194019/pexels-photo-6194019.jpeg?auto=compress&cs=tinysrgb&w=2400&h=800&fit=crop`,
  },
  {
    name: 'Hair Accessories',
    headline: 'Hair Accessories',
    desc: 'Clips, headbands, scrunchies & more — trendy styles at wholesale prices.',
    icon: Crown,
    slug: 'hair-accessories',
    image: `${PEXELS}/6983530/pexels-photo-6983530.jpeg?auto=compress&cs=tinysrgb&w=2400&h=800&fit=crop`,
  },
  {
    name: 'Bags & Accessories',
    headline: 'Bags & Accessories',
    desc: 'Bag hardware, chains, keychains & fittings — premium quality from Yiwu.',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    image: `${PEXELS}/3908800/pexels-photo-3908800.jpeg?auto=compress&cs=tinysrgb&w=2400&h=800&fit=crop`,
  },
  {
    name: 'Home Decor & Crafts',
    headline: 'Home Decor & Crafts',
    desc: 'Tassels, beads, craft supplies & decorations — beautify every space.',
    icon: HomeIcon,
    slug: 'home-decor-crafts',
    image: `${PEXELS}/7061396/pexels-photo-7061396.jpeg?auto=compress&cs=tinysrgb&w=2400&h=800&fit=crop`,
  },
  {
    name: 'Toys & Gift',
    headline: 'Toys & Gift',
    desc: 'Educational toys, plush, games & gift sets — fun for all ages at wholesale prices.',
    icon: Gift,
    slug: 'toys-gift',
    image: `${PEXELS}/8613149/pexels-photo-8613149.jpeg?auto=compress&cs=tinysrgb&w=2400&h=800&fit=crop`,
  },
];

const categoryItems = categorySlides.map(s => ({
  name: s.name,
  icon: s.icon,
  slug: s.slug,
  desc: s.desc.split('—')[0].trim(),
  image: s.image,
}));

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
      setCurrentSlide((prev) => (prev + 1) % categorySlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % categorySlides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + categorySlides.length) % categorySlides.length);

  const newProducts = products.slice(0, 8);

  return (
    <Layout>
      <section className="relative w-full h-[50vh] md:h-[65vh] lg:h-[75vh] overflow-hidden">
        {categorySlides.map((slide, index) => (
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold border border-white/20 mb-6">
                    <slide.icon className="w-4 h-4" />
                    {slide.name}
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white mb-4 md:mb-6 leading-tight">
                    {slide.headline}
                  </h1>
                  <p className="text-white/80 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                    {slide.desc}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/products?category=${slide.slug}`}
                      className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-8 py-3.5 rounded-lg font-bold text-base transition-all shadow-lg shadow-gold-500/30 hover:shadow-gold-500/50"
                    >
                      Browse {slide.name} <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-8 py-3.5 rounded-lg font-bold text-base transition-all border border-white/20"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:text-gold-300 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:text-gold-300 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {categorySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-gold-400 w-8' : 'bg-white/50 w-2 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-gold-600 uppercase tracking-[0.2em]">Browse Collection</span>
            <h2 className="font-display text-3xl md:text-4xl text-gray-900 mt-3">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categoryItems.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative h-64 md:h-72 overflow-hidden rounded-2xl"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/90 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">{cat.name}</h3>
                      <p className="text-white/70 text-xs mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-semibold text-gold-600 uppercase tracking-[0.2em]">Fresh Stock</span>
              <h2 className="font-display text-3xl md:text-4xl text-gray-900 mt-3">New Arrivals</h2>
              <p className="text-gray-600 text-sm mt-2">Latest additions to our wholesale catalog</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-gold-700 font-semibold hover:text-gold-500 transition-colors px-5 py-2.5 bg-white rounded-lg shadow-sm"
            >
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {newProducts.length > 0 ? (
              newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gold-500 to-gold-600">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-3xl md:text-4xl text-white mb-4 leading-tight">
                Need Bulk Pricing or Custom Sourcing?
              </h3>
              <p className="text-white/90 text-base leading-relaxed">
                Tell us what you're looking for and our team will prepare a personalized quote with the best wholesale prices within 24 hours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-gold-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-base transition-colors shadow-lg"
              >
                Browse Catalog <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:sales@etruemart.com?subject=Wholesale%20Inquiry"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white hover:text-gold-600 px-8 py-4 rounded-lg font-bold text-base transition-all"
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
