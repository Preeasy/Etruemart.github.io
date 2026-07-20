import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, TrendingUp, Zap, Truck } from 'lucide-react';
import { formatPrice, truncateText } from '@/lib/utils';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  description: string;
  priceMin: number;
  priceMax: number;
  mainImage: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
}

async function getProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: { reviews: { take: 1 } },
    orderBy: { salesCount: 'desc' },
    take: 12,
  });
  return products as unknown as Product[];
}

export default async function HomePage() {
  const products = await getProducts();

  const features = [
    {
      icon: Truck,
      title: 'Fast Shipping',
      description: 'Delivery worldwide within 3-15 days',
    },
    {
      icon: Zap,
      title: 'Secure Payment',
      description: 'SSL encrypted transactions',
    },
    {
      icon: TrendingUp,
      title: 'Affiliate Program',
      description: 'Earn 5% commission on every sale',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>
          <div className="relative px-8 py-12 md:px-16 md:py-20">
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Shop Global, Ship Local
              </h1>
              <p className="text-blue-100 text-lg mb-8">
                Discover quality products from around the world with fast shipping. Join our affiliate program and earn commissions on every sale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">Shop Now <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
              <p className="text-gray-500">Top rated products loved by customers</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">View All <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="block">
              <Card hoverable className="overflow-hidden cursor-pointer">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {truncateText(product.description, 60)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(product.priceMin)}
                      </span>
                      {product.priceMin !== product.priceMax && (
                        <span className="text-sm text-gray-400 ml-1">
                          - {formatPrice(product.priceMax)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{product.rating || 0}</span>
                      <span className="text-gray-400">({product.reviewCount})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}