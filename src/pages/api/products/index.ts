import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function safeJsonParse<T>(str: any, fallback: T): T {
  if (str === null || str === undefined) return fallback;
  if (typeof str !== 'string') return str as T;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(String(value)) || 0;
}

async function getStaticProducts(category?: string) {
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  if (!fs.existsSync(siteDataPath)) return [];
  
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  let products = siteData.products || [];
  
  if (category && category !== 'all') {
    products = products.filter((p: any) => 
      typeof p.category === 'object' ? p.category.slug === category : false
    );
  }
  
  return products.map((p: any) => ({
    ...p,
    price: p.priceMin,
    originalPrice: p.priceMax ? p.priceMax * 1.3 : p.priceMin * 1.3,
    rating: 4.5 + Math.random() * 0.5,
    stock: 9999,
    isPublished: true,
    variants: [],
    category: p.category,
    images: p.images || [p.image],
    keywords: p.keywords || [],
  }));
}

async function getAllCategoryIds(parentId: string): Promise<string[]> {
  const result: string[] = [parentId];
  try {
    const children = await prisma.category.findMany({ where: { parentId } });
    for (const child of children) {
      result.push(...(await getAllCategoryIds(child.id)));
    }
  } catch {
    // ignore
  }
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category } = req.query;
    
    try {
      const where: any = { isPublished: true };
      
      if (category && category !== 'all') {
        const cat = await prisma.category.findUnique({ where: { slug: category as string } });
        if (cat) {
          const allChildIds = await getAllCategoryIds(cat.id);
          where.categoryId = { in: allChildIds };
        }
      }
      
      const products = await prisma.product.findMany({
        where,
        include: { variants: true, category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      });
      
      const serialized = products.map(p => ({
        ...p,
        images: safeJsonParse(p.images as any, []),
        keywords: safeJsonParse(p.keywords as any, []),
        aplus: safeJsonParse(p.aplus as any, null),
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        rating: Number(p.rating),
        variants: p.variants?.map(v => ({ ...v, price: Number(v.price) })) || [],
      }));
      
      return res.json(serialized);
    } catch (error) {
      console.warn('Database query failed, falling back to static data:', error);
      const staticProducts = await getStaticProducts(category as string);
      return res.json(staticProducts);
    }
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.method === 'POST') {
      const {
        name, description, price, originalPrice, image, images,
        categoryId, stock, variants,
        material, plating, process, color, size, packSize,
        pkgLength, pkgWidth, pkgHeight, pkgWeight, keywords,
        stockStatus, moq,
      } = req.body;
      
      if (session.user.role !== 'ADMIN' && session.user.allowedCategoryId) {
        if (categoryId !== session.user.allowedCategoryId) {
          return res.status(403).json({ error: 'You can only create products in your allowed category' });
        }
      }
      
      const product = await prisma.product.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + Date.now().toString(36),
          description,
          price: toNumber(price),
          originalPrice: originalPrice ? toNumber(originalPrice) : undefined,
          image,
          images: images ? JSON.stringify(images) : '[]',
          categoryId,
          stock: parseInt(stock),
          material: material || null,
          plating: plating || null,
          process: process || null,
          color: color || null,
          size: size || null,
          packSize: packSize ? parseInt(packSize) : 1,
          pkgLength: pkgLength ? toNumber(pkgLength) : null,
          pkgWidth: pkgWidth ? toNumber(pkgWidth) : null,
          pkgHeight: pkgHeight ? toNumber(pkgHeight) : null,
          pkgWeight: pkgWeight ? toNumber(pkgWeight) : null,
          keywords: keywords ? JSON.stringify(keywords) : '[]',
          stockStatus: stockStatus || 'IN_STOCK',
          moq: moq ? parseInt(moq) : 1,
          authorId: session.user.id,
          variants: variants ? { create: variants.map((v: any) => ({ ...v, price: toNumber(v.price) })) } : undefined,
        },
      });
      
      return res.status(201).json(product);
    }
  } catch (error) {
    console.warn('Database operation failed:', error);
    return res.status(503).json({ error: 'Database not available' });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
