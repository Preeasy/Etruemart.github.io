import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function toBool(v: any): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return true;
}

function toFloat(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  return Number(v);
}

function toInt(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  return Math.round(Number(v));
}

function toJsonString(v: any): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.query.secret || req.headers['x-secret'];
  if (secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: 'Invalid or missing secret key' });
  }

  // Accept both GET and POST for easy browser access
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  try {
    console.log('[import-all] Starting full import...');

    // 1. Ensure admin account exists
    const adminEmail = 'yeatrusourcing@gmail.com';
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { name: 'Yeatrusourcing', role: 'ADMIN' },
      create: {
        email: adminEmail,
        passwordHash: '$2a$10$rpC.Td0.EzAAHn9ZvsMDOezPiWZXXwXGvN9yQyB0rhPe4KFeM02vG',
        name: 'Yeatrusourcing',
        role: 'ADMIN',
      },
    });
    console.log('[import-all] Admin account ensured');

    // 2. Load seed-data.json for categories
    const fullDataPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
    if (!fs.existsSync(fullDataPath)) {
      return res.status(404).json({ error: 'seed-data.json not found' });
    }
    const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf-8'));
    const categories = fullData.categories || [];

    // 3. Create categories
    const slugToId = new Map<string, string>();
    const oldIdToNewId = new Map<string, string>();
    
    const existingCats = await prisma.category.findMany({ select: { id: true, slug: true } });
    existingCats.forEach(c => {
      if (c.slug) {
        slugToId.set(c.slug, c.id);
      }
    });

    let catCreated = 0;
    const rootCats = categories.filter((c: any) => !c.parentId);
    const childCats = categories.filter((c: any) => c.parentId);

    for (const cat of [...rootCats, ...childCats]) {
      if (!slugToId.has(cat.slug)) {
        const parentId = cat.parentId ? slugToId.get(cat.parentId) || null : null;
        const created = await prisma.category.create({
          data: {
            slug: cat.slug,
            name: cat.name || cat.slug,
            description: cat.description || '',
            parentId,
          },
        });
        slugToId.set(cat.slug, created.id);
        catCreated++;
      }
      // Build mapping
      if (slugToId.has(cat.slug)) {
        oldIdToNewId.set(String(cat.id), slugToId.get(cat.slug)!);
      }
    }
    console.log(`[import-all] Created ${catCreated} categories`);

    // 4. Delete ALL existing products
    const deleted = await prisma.product.deleteMany({});
    console.log(`[import-all] Deleted ${deleted.count} products`);

    // 5. Import ALL products from full data
    const products = fullData.products || [];
    let created = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const categoryId = product.categoryId 
          ? oldIdToNewId.get(String(product.categoryId)) || null 
          : null;

        const createdProduct = await prisma.product.create({
          data: {
            name: product.name || 'Unnamed Product',
            slug: product.slug || `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            description: product.description || '',
            price: toFloat(product.price) ?? 0,
            priceMax: toFloat(product.priceMax),
            originalPrice: toFloat(product.originalPrice),
            image: product.image || '/images/product-placeholder.svg',
            images: toJsonString(product.images) || '[]',
            categoryId,
            stock: toInt(product.stock) ?? 100,
            rating: toFloat(product.rating) ?? 0,
            reviewCount: toInt(product.reviewCount) ?? 0,
            salesCount: toInt(product.salesCount) ?? 0,
            isPublished: toBool(product.isPublished),
            shippingCost: toFloat(product.shippingCost) ?? 0,
            shippingMethod: product.shippingMethod || 'Standard Shipping',
            sku: product.sku || null,
            material: product.material || null,
            plating: product.plating || null,
            process: product.process || null,
            color: product.color || null,
            size: product.size || null,
            packSize: toInt(product.packSize) ?? 1,
            pkgLength: toFloat(product.pkgLength),
            pkgWidth: toFloat(product.pkgWidth),
            pkgHeight: toFloat(product.pkgHeight),
            pkgWeight: toFloat(product.pkgWeight),
            keywords: toJsonString(product.keywords) || '[]',
            origin: product.origin || null,
            supplierCity: product.supplierCity || null,
            stockStatus: product.stockStatus || 'IN_STOCK',
            moq: toInt(product.moq) ?? 1,
            aplus: toJsonString(product.aplus),
            authorId: admin.id,
          },
        });

        // Create default variant
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            color: product.color || 'Default',
            size: product.size || 'One Size',
            price: toFloat(product.price) ?? 0,
            stock: toInt(product.stock) ?? 100,
          },
        });

        created++;

        if (created % 200 === 0) {
          console.log(`[import-all] Progress: ${created}/${products.length}`);
        }
      } catch (err: any) {
        errors++;
        if (errors <= 10) {
          console.error(`[import-all] Error "${product.name}":`, err.message?.substring(0, 200));
        }
      }
    }

    const total = await prisma.product.count();
    console.log(`[import-all] Complete: ${created} created, ${errors} errors. Total: ${total}`);

    res.json({ 
      success: true, 
      created, 
      errors,
      total: products.length,
      dbTotal: total,
      categoriesCreated: catCreated
    });
  } catch (error) {
    console.error('[import-all] Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}