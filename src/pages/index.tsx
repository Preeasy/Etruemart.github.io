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

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Preeasy/images@main/Images';
const IMG_V = '?v=3';

const categorySlides = [
  {
    name: 'Fashion Jewelry',
    headline: 'Wholesale Fashion Jewelry',
    desc: 'Earrings, necklaces, bracelets & rings — direct from Yiwu manufacturers at factory prices.',
    icon: Gem,
    slug: 'fashion-jewelry',
    banner: `${CDN_BASE}/banner-01-fashion-jewelry%20V2.jpg${IMG_V}`,
    image: `${CDN_BASE}/01-fashion-jewelry.jpg${IMG_V}`,
  },
  {
    name: 'Garment Accessories',
    headline: 'Garment Accessories',
    desc: 'Buttons, zippers, lace & trim — everything your apparel production needs.',
    icon: Scissors,
    slug: 'garment-accessories',
    banner: `${CDN_BASE}/banner-02-garment-accessories%20V2.jpg${IMG_V}`,
    image: `${CDN_BASE}/02-garment-accessories.jpg${IMG_V}`,
  },
  {
    name: 'Hair Accessories',
    headline: 'Hair Accessories',
    desc: 'Clips, headbands, scrunchies & more — trendy styles at wholesale prices.',
    icon: Crown,
    slug: 'hair-accessories',
    banner: `${CDN_BASE}/banner-03-hair-accessories%20V2.jpg${IMG_V}`,
    image: `${CDN_BASE}/03-hair-accessories.jpg${IMG_V}`,
  },
  {
    name: 'Bags & Accessories',
    headline: 'Bags & Accessories',
    desc: 'Bag hardware, chains, keychains & fittings — premium quality from Yiwu.',
    icon: ShoppingBag,
    slug: 'bags-accessories',
    banner: `${CDN_BASE}/banner-04-bags-accessories%20V2.jpg${IMG_V}`,
    image: `${CDN_BASE}/04-bags-accessories.jpg${IMG_V}`,
  },
  {
    name: 'Home Decor & Crafts',
    headline: 'Home Decor & Crafts',
    desc: 'Tassels, beads, craft supplies & decorations — beautify every space.',
    icon: HomeIcon,
    slug: 'home-decor-crafts',
    banner: `${CDN_BASE}/banner-05-home-decor-crafts%20V2.jpg${IMG_V}`,
    image: `${CDN_BASE}/05-home-decor-crafts.jpg${IMG_V}`,
  },
  {
    name: 'Seasonal & Festival',
    headline: 'Seasonal & Festival',
    desc: 'Christmas, Eid, party supplies & festive decor — celebrate in style.',
    icon: Sparkles,
    slug: 'seasonal-festival',
    banner: `${CDN_BASE}/banner-06-seasonal-festival%20V2.jpg${IMG_V}`,
    image: `${CDN_BASE}/06-seasonal-festival.jpg${IMG_V}`,
  },
];

const categoryItems = categorySlides.map(s => ({
  name: s.name,
  icon: s.icon,
  slug: s.slug,
  desc: s.desc.split('—')[0].trim(),
  image: s.image,
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
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="relative w-full">
            <div className="aspect-[3/1] w-full relative rounded-2xl overflow-hidden shadow-md border border-gray-100">
              {categorySlides.map((slide, index) => (
                <div
                  key={slide.slug}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  {/* Blurred background layer - fills entire space with image colors */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={slide.banner}
                      alt=""
                      className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/75 to-white/40" />
                  </div>

                  {/* Foreground image - complete, no distortion */}
                  <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16">
                    <div className="relative h-[70%] w-[55%] max-w-[600px]">
                      <img
                        src={slide.banner}
                        alt={slide.name}
                        className="w-full h-full object-contain drop-shadow-xl"
                      />
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="px-8 md:px-12 w-full">
                      <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 bg-gold-50/90 text-gold-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gold-200 mb-4 backdrop-blur-sm">
                          <slide.icon className="w-3.5 h-3.5" />
                          {slide.name}
                        </div>
                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-4 leading-tight">
                          {slide.headline}
                        </h1>
                        <p className="text-base text-gray-600 mb-6 leading-relaxed">
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
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-500/30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gold-600 hover:border-gold-500/30 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {categorySlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-gold-500 w-6' : 'bg-gray-300 w-1.5 hover:bg-gold-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
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
                className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-gold-500/40 transition-all h-40"
              >
                {/* Blurred background */}
                <img
                  src={cat.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm opacity-50 group-hover:scale-125 transition-transform duration-500"
                />
                {/* Foreground image - complete, no distortion */}
                <div className="absolute inset-0 flex items-center justify-center p-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-w-full max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold-500/90 flex items-center justify-center shrink-0">
                      <cat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-semibold text-white group-hover:text-gold-300 transition-colors truncate">
                        {cat.name}
                      </h3>
                      <p className="text-white/70 text-xs mt-0.5 truncate">{cat.desc}</p>
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
