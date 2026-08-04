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
  // Check for secret key (passed via query or header)
  const secret = req.query.secret || req.headers['x-secret'];
  if (secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: 'Invalid or missing secret key' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[import-seed] Starting seed import...');

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
    console.log('[import-seed] Admin account ensured:', admin.email);

    // 2. Load seed-data.json
    const seedDataPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
    if (!fs.existsSync(seedDataPath)) {
      return res.status(404).json({ error: 'seed-data.json not found' });
    }

    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
    console.log(`[import-seed] Loaded: ${seedData.categories?.length || 0} categories, ${seedData.products?.length || 0} products`);

    // 3. Create categories
    const categories = seedData.categories || [];
    const slugToId = new Map<string, string>();
    
    const existingCats = await prisma.category.findMany({ select: { id: true, slug: true } });
    existingCats.forEach(c => slugToId.set(c.slug, c.id));

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
    }
    console.log(`[import-seed] Created ${catCreated} new categories`);

    // 4. Map old category IDs
    const oldIdToNewId = new Map<string, string>();
    for (const cat of categories) {
      oldIdToNewId.set(cat.id, slugToId.get(cat.slug));
    }

    // 5. Wipe ALL products
    const deleted = await prisma.product.deleteMany({});
    console.log(`[import-seed] Deleted ${deleted.count} existing products`);

    // 6. Import products
    const products = seedData.products || [];
    let created = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const categoryId = oldIdToNewId.get(product.categoryId) || null;

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

        if (created % 100 === 0) {
          console.log(`[import-seed] Progress: ${created}/${products.length}`);
        }
      } catch (err: any) {
        errors++;
        if (errors <= 10) {
          console.error(`[import-seed] Error "${product.name}":`, err.message?.substring(0, 200));
        }
      }
    }

    const total = await prisma.product.count();
    console.log(`[import-seed] Complete: ${created} created, ${errors} errors. Total in DB: ${total}`);

    res.json({ 
      success: true, 
      created, 
      errors,
      total: products.length,
      dbTotal: total,
      categoriesCreated: catCreated
    });
  } catch (error) {
    console.error('[import-seed] Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}