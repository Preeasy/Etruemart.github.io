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
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));

  // 1. Admin account
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: '$2a$10$rpC.Td0.EzAAHn9ZvsMDOezPiWZXXwXGvN9yQyB0rhPe4KFeM02vG',
      name: 'Yeatrusourcing',
      role: 'ADMIN',
    },
  });

  // 2. Official seller account — all existing products belong to this seller
  const officialSellerEmail = 'neil6corrot@gmail.com';
  const officialSeller = await prisma.user.upsert({
    where: { email: officialSellerEmail },
    update: {},
    create: {
      email: officialSellerEmail,
      passwordHash: '$2a$10$rpC.Td0.EzAAHn9ZvsMDOezPiWZXXwXGvN9yQyB0rhPe4KFeM02vG',
      name: 'Official Seller',
      role: 'OFFICIAL_SELLER',
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
          update: {
            name: cat.name,
            sortOrder: cat.sortOrder || 0,
            seoTitle: cat.seoTitle || null,
            seoDesc: cat.seoDesc || null,
          },
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
            update: {
              name: cat.name,
              parentId: parent.id,
              sortOrder: cat.sortOrder || 0,
              seoTitle: cat.seoTitle || null,
              seoDesc: cat.seoDesc || null,
            },
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

  // Incremental product sync: upsert products from site-data.json
  const products = siteData.products || [];
  const existingProducts = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
  const existingNames = new Map(existingProducts.map(p => [p.name, p.id]));
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  let createdCount = 0;
  let updatedCount = 0;

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

    // Find category by name from productData.category object
    const catName = typeof productData.category === 'object' ? productData.category.name : (productData.category || 'Other');
    const catRecord = await prisma.category.findFirst({ where: { name: catName } });
    const fallbackCat = await prisma.category.findFirst();
    const categoryId = catRecord?.id || fallbackCat?.id || '';

    // Generate slug if not provided
    let slug = productData.slug;
    if (!slug) {
      slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      if (existingSlugs.has(slug)) {
        slug = slug + '-' + Date.now().toString(36);
      }
    }
    existingSlugs.add(slug);

    // Upsert: update if exists, create if not
    const existingId = existingNames.get(productData.name);
    if (existingId) {
      // Update existing product
      await prisma.product.update({
        where: { id: existingId },
        data: {
          name: productData.name,
          slug,
          description: productData.description || '',
          price: toNumber(productData.priceMin),
          originalPrice: toNumber(productData.priceMax && productData.priceMax > productData.priceMin
            ? (productData.priceMax * 1.5)
            : (productData.priceMin * 1.3)),
          image: productData.image,
          images: JSON.stringify(uniqueImages),
          categoryId,
          material: productData.material || null,
          plating: productData.plating || null,
          process: productData.process || null,
          color: productData.color || null,
          size: productData.size || null,
          packSize: productData.packSize || 1,
          moq: productData.moq || 1,
          keywords: JSON.stringify(productData.keywords || []),
          stockStatus: productData.stockStatus || 'IN_STOCK',
        },
      });
      updatedCount++;
    } else {
      // Create new product
      await prisma.product.create({
        data: {
          name: productData.name,
          slug,
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
          authorId: officialSeller.id,
          variants: {
            create: variantData.length > 0 ? variantData.map(v => ({ color: v.color, size: v.size, price: toNumber(v.price), stock: v.stock })) : [{ color: 'Default', size: 'One Size', price: toNumber(productData.priceMin), stock: 100 }],
          },
        },
      });
      createdCount++;
    }
  }

  // Clean up products that are no longer in site-data.json
  const siteProductNames = new Set((products as any[]).map((p: any) => p.name));
  const toDelete = existingProducts.filter(p => !siteProductNames.has(p.name)).map(p => p.id);
  if (toDelete.length > 0) {
    await prisma.product.deleteMany({ where: { id: { in: toDelete } } });
  }
}

async function getProductsFromFallback(req: NextApiRequest, res: NextApiResponse) {
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  if (!fs.existsSync(siteDataPath)) {
    return res.json([]);
  }

  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  let products: any[] = siteData.products || [];

  const { category, material, plating, color, priceMin, priceMax } = req.query;

  if (category && category !== 'all') {
    products = products.filter((p: any) => {
      const catSlug = p.category?.slug || p.categorySlug;
      const catName = typeof p.category === 'object' ? p.category.name : p.category;
      return catSlug === category || catName === category;
    });
  }

  if (material) {
    const m = String(material).toLowerCase();
    products = products.filter((p: any) => (p.material || '').toLowerCase().includes(m));
  }

  if (plating) {
    const pl = String(plating).toLowerCase();
    products = products.filter((p: any) => (p.plating || '').toLowerCase().includes(pl));
  }

  if (color) {
    const c = String(color).toLowerCase();
    products = products.filter((p: any) => (p.color || '').toLowerCase().includes(c));
  }

  if (priceMin) {
    const min = parseFloat(priceMin as string);
    products = products.filter((p: any) => (p.priceMin || p.price || 0) >= min);
  }

  if (priceMax) {
    const max = parseFloat(priceMax as string);
    products = products.filter((p: any) => (p.priceMax || p.price || 0) <= max);
  }

  const serialized = products.map((p: any) => ({
    id: p.slug || p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.priceMin || p.price || 0),
    priceMax: p.priceMax ? Number(p.priceMax) : null,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    image: p.image,
    categoryId: '',
    categoryName: typeof p.category === 'object' ? p.category.name : (p.category || ''),
    categorySlug: p.category?.slug || '',
    stock: p.stock || 100,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    isPublished: p.isPublished !== false,
    shippingCost: 0,
    shippingMethod: 'Standard Shipping',
    sku: p.sku,
    material: p.material,
    plating: p.plating,
    process: p.process,
    color: p.color,
    size: p.size,
    packSize: p.packSize || 1,
    moq: p.moq || 1,
    stockStatus: p.stockStatus || 'IN_STOCK',
    authorId: 'seed-system',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return res.json(serialized);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { authorId, categoryId, category, material, plating, color, priceMin, priceMax, all } = req.query;

    if (all === 'true') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

    try {
      // Check if database has products
      const dbCount = await prisma.product.count();
      if (dbCount === 0) {
        return getProductsFromFallback(req, res);
      }

      const where: any = {};

      if (all === 'true') {
        // Show all products including drafts for management
      } else if (authorId) {
        where.authorId = authorId as string;
      } else {
        where.isPublished = true;
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

      const serialized = products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        priceMax: p.priceMax ? Number(p.priceMax) : null,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        image: p.image,
        categoryId: p.categoryId,
        categoryName: p.category?.name || '',
        categorySlug: p.category?.slug || '',
        stock: p.stock,
        rating: Number(p.rating),
        reviewCount: p.reviewCount,
        salesCount: p.salesCount,
        isPublished: p.isPublished,
        shippingCost: Number(p.shippingCost),
        shippingMethod: p.shippingMethod || 'Standard Shipping',
        sku: p.sku,
        material: p.material,
        plating: p.plating,
        process: p.process,
        color: p.color,
        size: p.size,
        packSize: p.packSize,
        moq: p.moq,
        stockStatus: p.stockStatus,
        authorId: p.authorId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      return res.json(serialized);
    } catch {
      return getProductsFromFallback(req, res);
    }
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only sellers and admins can create products
  if (session.user.role !== 'ADMIN' && session.user.role !== 'OFFICIAL_SELLER') {
    return res.status(403).json({ error: 'Only sellers can create products' });
  }

  if (req.method === 'POST') {
    const {
      name, description, price, originalPrice, image, images,
      categoryId, stock, variants,
      material, plating, process, color, size, packSize,
      pkgLength, pkgWidth, pkgHeight, pkgWeight, keywords,
      stockStatus, moq,
    } = req.body;

    // Seller permission: non-ADMIN/OFFICIAL_SELLER can only create products in their allowedCategoryId
    const canManage = session.user.role === 'ADMIN' || session.user.role === 'OFFICIAL_SELLER';
    if (!canManage && session.user.allowedCategoryId) {
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
