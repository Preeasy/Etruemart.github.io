import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  Globe,
  ChevronRight,
  ChevronLeft,
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

const categorySlides = [
  {
    name: 'Fashion Jewelry',
    headline: 'Wholesale Fashion Jewelry',
    desc: 'Earrings, necklaces, bracelets & rings — direct from Yiwu manufacturers at factory prices.',
    icon: Gem,
    slug: 'fashion-jewelry',
    gradient: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    glow: 'bg-gold-50',
    glowPosition: 'top-0 right-0',
  },
  {
    name: 'Garment Accessories',
    headline: 'Garment Accessories',
    desc: 'Buttons, zippers, lace & trim — everything your apparel production needs.',
    icon: Scissors,
    slug: 'garment-accessories',
    gradient: 'bg-gradient-to-bl from-gray-50 via-white to-gray-100',
    glow: 'bg-gold-50',
    glowPosition: 'bottom-0 left-0',
  },
  {
    name: 'Hair Accessories',
    headline: 'Hair Accessories',
    desc: 'Clips, headbands, scrunchies & more — trendy styles at wholesale prices.',
    icon: Crown,
    slug: 'hair-accessories',
    gradient: 'bg-gradient-to-tr from-gray-50 via-white to-gray-100',
    glow: 'bg-gold-50',
    glowPosition: 'top-0 left-0',
  },
  {
    name: 'Bags & Accessories',
    headline: 'Bags & Accessories',
    desc: 'Bag hardware, chains, keychains & fittings — premium quality from Yiwu.',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    gradient: 'bg-gradient-to-tl from-gray-50 via-white to-gray-100',
    glow: 'bg-gold-50',
    glowPosition: 'bottom-0 right-0',
  },
  {
    name: 'Home Decor & Crafts',
    headline: 'Home Decor & Crafts',
    desc: 'Tassels, beads, craft supplies & decorations — beautify every space.',
    icon: HomeIcon,
    slug: 'home-decor-crafts',
    gradient: 'bg-gradient-to-r from-gray-50 via-white to-gray-100',
    glow: 'bg-gold-50',
    glowPosition: 'top-1/2 left-0 -translate-y-1/2',
  },
  {
    name: 'Seasonal & Festival',
    headline: 'Seasonal & Festival',
    desc: 'Christmas, Eid, party supplies & festive decor — celebrate in style.',
    icon: Sparkles,
    slug: 'seasonal-festival',
    gradient: 'bg-gradient-to-l from-gray-50 via-white to-gray-100',
    glow: 'bg-gold-50',
    glowPosition: 'top-1/2 right-0 -translate-y-1/2',
  },
];

const categoryItems = categorySlides.map(s => ({
  name: s.name,
  icon: s.icon,
  slug: s.slug,
  desc: s.desc.split('—')[0].trim(),
  gradient: s.gradient,
  glow: s.glow,
}));

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
      {/* Hero Carousel */}
      <section className="relative h-[420px] md:h-[500px] overflow-hidden bg-white">
        {categorySlides.map((slide, index) => (
          <div
            key={slide.slug}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background */}
            <div className={`absolute inset-0 ${slide.gradient}`} />
            {/* Glow effect */}
            <div className={`absolute w-[500px] h-[500px] rounded-full blur-3xl ${slide.glow} ${slide.glowPosition}`} />
            {/* Decorative pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left: Text */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gold-200 mb-4">
                      <slide.icon className="w-3.5 h-3.5" />
                      {slide.name}
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4 leading-tight">
                      {slide.headline}
                    </h1>
                    <p className="text-base text-gray-500 mb-6 leading-relaxed max-w-lg">
                      {slide.desc}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/products?category=${slide.slug}`}
                        className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-gold-500/30"
                      >
                        Browse {slide.name} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 border-2 border-gold-300 text-gold-600 hover:bg-gold-500/10 px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                      >
                        View All Products
                      </Link>
                    </div>
                  </div>

                  {/* Right: Icon collage */}
                  <div className="hidden md:flex justify-center items-center relative">
                    <slide.icon className="w-48 h-48 text-gold-500/10" strokeWidth={0.5} />
                    <div className="absolute top-8 left-16">
                      <Sparkles className="w-10 h-10 text-gold-500/20" />
                    </div>
                    <div className="absolute bottom-12 right-20">
                      <Gem className="w-8 h-8 text-gold-500/15" />
                    </div>
                    <div className="absolute top-20 right-10">
                      <Package className="w-6 h-6 text-gold-500/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-50/80 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-500/30 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-50/80 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-500/30 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {categorySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-gold-500 w-8' : 'bg-gray-300 w-2 hover:bg-gold-400'
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl text-gray-900">Shop by Category</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categoryItems.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-gold-500/40 transition-all h-36"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 ${cat.gradient}`} />
                {/* Glow effect */}
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl ${cat.glow} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
                {/* Large centered icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <cat.icon className="w-20 h-20 text-gold-500/15 group-hover:text-gold-500/25 transition-colors duration-500" strokeWidth={1} />
                </div>
                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold-100 border border-gold-200 flex items-center justify-center shrink-0">
                      <cat.icon className="w-4 h-4 text-gold-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm text-gray-900 group-hover:text-gold-400 transition-colors truncate">
                        {cat.name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{cat.desc}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Latest additions to our wholesale catalog</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-gold-600 font-medium hover:text-gold-600 transition-colors text-sm"
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
                <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No products yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl text-gray-900">Why Choose eTruemart</h2>
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50/80 rounded-xl p-3 border border-gray-200 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-gold-600" />
                </div>
                <h3 className="font-display text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 md:p-8 border border-gold-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-gold-50 text-gold-600 px-2.5 py-1 rounded-full text-xs font-medium border border-gold-200 mb-3">
                  <Globe className="w-3.5 h-3.5" />
                  For Buyers
                </div>
                <h3 className="font-display text-xl md:text-2xl text-gray-900 mb-2">
                  Need Bulk Pricing or Custom Sourcing?
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tell us what you're looking for and our team will prepare a personalized quote with the best wholesale prices within 24 hours.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
                >
                  Browse Catalog <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:sales@etruemart.com?subject=Wholesale%20Inquiry"
                  className="inline-flex items-center justify-center gap-2 border-2 border-gold-300 text-gold-600 hover:bg-gold-500/10 px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
                >
                  Request a Quote
                </a>
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
