import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, updatedAt: true },
  });

  const baseRoutes = [
    { url: 'https://etruemart.com', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: 'https://etruemart.com/products', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: 'https://etruemart.com/login', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: 'https://etruemart.com/register', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const productRoutes = products.map((product: { slug: string; updatedAt: Date }) => ({
    url: `https://etruemart.com/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...baseRoutes, ...productRoutes];
}
