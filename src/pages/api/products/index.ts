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

async function getAllCategoryIds(parentId: string): Promise<string[]> {
  const result: string[] = [parentId];
  const children = await prisma.category.findMany({ where: { parentId } });
  for (const child of children) {
    result.push(...(await getAllCategoryIds(child.id)));
  }
  return result;
}

async function seedIfEmpty() {
  const count = await prisma.product.count();
  if (count > 0) {
    // Deduplicate: keep only the first product for each name
    const all = await prisma.product.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const seen = new Set<string>();
    const toDelete: string[] = [];
    for (const p of all) {
      if (seen.has(p.name)) {
        toDelete.push(p.id);
      } else {
        seen.add(p.name);
      }
    }
    if (toDelete.length > 0) {
      await prisma.product.deleteMany({ where: { id: { in: toDelete } } });
    }
    return;
  }

  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));

  const adminEmail = 'Yeatrusourcing';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: '$2a$10$Rctbz.9F8blZNq8Yu8SzqunWgUt2Q495fRW6UTks7.VcfScHXIpnS',
      name: 'Yeatrusourcing',
      role: 'ADMIN',
    },
  });

  // Seed categories from categories-data.json
  const catDataPath = path.join(process.cwd(), 'categories-data.json');
  if (fs.existsSync(catDataPath)) {
    const catData = JSON.parse(fs.readFileSync(catDataPath, 'utf-8'));
    const catItems = catData.categories || [];
    // First pass: create categories without parentId
    for (const cat of catItems) {
      if (!cat.parentId) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            name: cat.name,
            slug: cat.slug,
            sortOrder: cat.sortOrder || 0,
            seoTitle: cat.seoTitle || null,
            seoDesc: cat.seoDesc || null,
          },
        });
      }
    }
    // Second pass: create child categories with parentId
    for (const cat of catItems) {
      if (cat.parentId) {
        const parent = await prisma.category.findUnique({ where: { slug: cat.parentId } });
        if (parent) {
          await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
              name: cat.name,
              slug: cat.slug,
              parentId: parent.id,
              sortOrder: cat.sortOrder || 0,
              seoTitle: cat.seoTitle || null,
              seoDesc: cat.seoDesc || null,
            },
          });
        }
      }
    }
  } else {
    // Fallback: use categories from site-data.json
    const categories = siteData.categories || [];
    for (const catName of categories) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name: catName, slug },
      });
    }
  }

  const products = siteData.products || [];
  for (const productData of products) {
    const variations = productData.variations || [];
    const variantData: { color: string; size: string; price: number; stock: number }[] = variations.map((v: any) => ({
      color: v.color || '',
      size: v.size || '',
      price: toNumber(v.price || productData.priceMin || 0),
      stock: 100,
    }));

    const images: string[] = [productData.image];
    if (productData.aplus) {
      for (const section of productData.aplus) {
        if (section.image) images.push(section.image);
      }
    }
    const uniqueImages = [...new Set(images)];

    // Find category by name from productData.category string
    const catRecord = await prisma.category.findFirst({ where: { name: productData.category || 'Other' } });
    const fallbackCat = await prisma.category.findFirst();
    const categoryId = catRecord?.id || fallbackCat?.id || '';

    await prisma.product.create({
      data: {
        name: productData.name,
        slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + Date.now().toString(36),
        description: productData.description || '',
        price: toNumber(productData.priceMin),
        originalPrice: toNumber(productData.priceMax && productData.priceMax > productData.priceMin
          ? (productData.priceMax * 1.5)
          : (productData.priceMin * 1.3)),
        image: productData.image,
        images: JSON.stringify(uniqueImages),
        categoryId,
        stock: 100,
        isPublished: true,
        sku: productData.sku || null,
        material: productData.material || null,
        plating: productData.plating || null,
        process: productData.process || null,
        color: productData.color || null,
        size: productData.size || null,
        packSize: productData.packSize || 1,
        moq: productData.moq || 1,
        keywords: JSON.stringify(productData.keywords || []),
        stockStatus: productData.stockStatus || 'IN_STOCK',
        shippingCost: 0,
        aplus: productData.aplus ? JSON.stringify(productData.aplus) : null,
        shippingMethod: 'Standard Shipping',
        authorId: admin.id,
        variants: {
          create: variantData.length > 0 ? variantData.map(v => ({ color: v.color, size: v.size, price: toNumber(v.price), stock: v.stock })) : [{ color: 'Default', size: 'One Size', price: toNumber(productData.priceMin), stock: 100 }],
        },
      },
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await seedIfEmpty();

    const { authorId, categoryId, category, material, plating, color, priceMin, priceMax } = req.query;

    const where: any = { isPublished: true };

    if (authorId) {
      where.authorId = authorId as string;
    }

    if (categoryId && categoryId !== 'All') {
      where.categoryId = categoryId as string;
    }

    if (category && category !== 'all') {
      const cat = await prisma.category.findUnique({ where: { slug: category as string } });
      if (cat) {
        const allChildIds = await getAllCategoryIds(cat.id);
        where.categoryId = { in: allChildIds };
      }
    }

    if (material) {
      where.material = { contains: material as string, mode: 'insensitive' };
    }

    if (plating) {
      where.plating = { contains: plating as string, mode: 'insensitive' };
    }

    if (color) {
      where.color = { contains: color as string, mode: 'insensitive' };
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin as string);
      if (priceMax) where.price.lte = parseFloat(priceMax as string);
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: true, category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // 序列化所有响应数据
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
  }

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

    // Seller permission: non-ADMIN can only create products in their allowedCategoryId
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

  res.status(405).json({ error: 'Method not allowed' });
}
