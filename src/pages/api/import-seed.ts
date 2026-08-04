import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { buildGitHubLookup, findGitHubImage } from '@/lib/image-utils';

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

// Will be set during import
let _githubLookup: Map<string, string> | null = null;

function convertImageUrl(localPath: string, sku?: string): string {
  if (!_githubLookup) {
    // Fallback to basic conversion
    if (!localPath || localPath.startsWith('http')) {
      return localPath || '/images/product-placeholder.svg';
    }
    const filename = localPath.split('/').pop() || '';
    if (localPath.includes('/images/item-list/')) {
      return `https://raw.githubusercontent.com/Preeasy/images/main/Images/${filename}`;
    }
    if (localPath.includes('/images/products/')) {
      if (sku && sku.startsWith('YCS')) {
        return `https://raw.githubusercontent.com/Preeasy/images/main/Images/${sku}.png`;
      }
      return `https://raw.githubusercontent.com/Preeasy/images/main/Images/${filename}`;
    }
    const cleanPath = localPath.replace(/^\//, '');
    return `https://raw.githubusercontent.com/Preeasy/images/main/${cleanPath}`;
  }
  
  return findGitHubImage(localPath, _githubLookup);
}

function convertImagesArray(images: any, sku?: string): string {
  if (!images) return '[]';
  let arr: string[];
  if (typeof images === 'string') {
    try {
      arr = JSON.parse(images);
    } catch {
      arr = [];
    }
  } else {
    arr = images;
  }
  if (Array.isArray(arr)) {
    const converted = arr.map(img => {
      if (typeof img === 'string' && !img.startsWith('http')) {
        return convertImageUrl(img, sku);
      }
      return img;
    });
    return JSON.stringify(converted);
  }
  return '[]';
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
    // Build GitHub lookup for better image matching
    _githubLookup = await buildGitHubLookup();
    
    const batch = parseInt((req.query.batch as string) || '0');
    const isFirstBatch = batch === 0;
    
    // Try batch file first, fall back to full file
    const batchFile = path.join(process.cwd(), 'prisma', `seed-batch-${String(batch).padStart(2, '0')}.json`);
    const fullFile = path.join(process.cwd(), 'prisma', 'seed-data.json');
    
    let seedData: any;
    let source: string;
    
    if (fs.existsSync(batchFile)) {
      seedData = JSON.parse(fs.readFileSync(batchFile, 'utf-8'));
      source = `seed-batch-${String(batch).padStart(2, '0')}.json`;
    } else if (fs.existsSync(fullFile)) {
      seedData = JSON.parse(fs.readFileSync(fullFile, 'utf-8'));
      source = 'seed-data.json';
    } else {
      return res.status(404).json({ error: 'No seed data file found' });
    }

    console.log(`[import-seed] Loading from ${source}: ${seedData.products?.length || 0} products`);

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

    // 2. Create categories (only on first batch)
    const categories = seedData.categories || [];
    const slugToId = new Map<string, string>();
    const oldIdToNewId = new Map<string, string>();
    
    const existingCats = await prisma.category.findMany({ select: { id: true, slug: true } });
    existingCats.forEach(c => {
      if (c.slug) {
        slugToId.set(c.slug, c.id);
      }
    });
    existingCats.forEach(c => {
      if (!c.slug) return;
      // Also map the old ID to new ID for any matching slugs
      const seedCat = categories.find((cat: any) => cat.slug === c.slug);
      if (seedCat) {
        oldIdToNewId.set(String(seedCat.id), c.id);
      }
    });

    let catCreated = 0;
    if (isFirstBatch) {
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
          oldIdToNewId.set(String(cat.id), created.id);
          catCreated++;
        } else {
          // Already exists, update the mapping
          const existingId = slugToId.get(cat.slug)!;
          oldIdToNewId.set(String(cat.id), existingId);
        }
      }
      console.log(`[import-seed] Created ${catCreated} new categories`);
    } else {
      // For non-first batches, just build the oldIdToNewId map
      for (const cat of categories) {
        if (slugToId.has(cat.slug)) {
          oldIdToNewId.set(String(cat.id), slugToId.get(cat.slug)!);
        }
      }
    }

    // 3. Delete existing products on first batch ONLY if force=true
    const forceImport = req.query.force === 'true';
    if (isFirstBatch && forceImport) {
      const deleted = await prisma.product.deleteMany({});
      console.log(`[import-seed] Force import: Deleted ${deleted.count} existing products`);
    }

    // 4. Import products from this batch (skip existing ones unless force)
    const products = seedData.products || [];
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Get existing product slugs for deduplication
    const existingSlugs = new Set<string>();
    if (!forceImport) {
      const existingProducts = await prisma.product.findMany({ select: { slug: true } });
      existingProducts.forEach(p => { if (p.slug) existingSlugs.add(p.slug); });
    }

    for (const product of products) {
      try {
        const productSlug = product.slug || `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        
        // Skip if already exists (non-force mode)
        if (!forceImport && existingSlugs.has(productSlug)) {
          skipped++;
          continue;
        }

        // Map old category ID to new category ID
        const categoryId = product.categoryId 
          ? oldIdToNewId.get(String(product.categoryId)) || null 
          : null;

        const createdProduct = await prisma.product.create({
          data: {
            name: product.name || 'Unnamed Product',
            slug: productSlug,
            description: product.description || '',
            price: toFloat(product.price) ?? 0,
            priceMax: toFloat(product.priceMax),
            originalPrice: toFloat(product.originalPrice),
            image: convertImageUrl(product.image, product.sku) || '/images/product-placeholder.svg',
            images: convertImagesArray(product.images, product.sku),
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
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.error(`[import-seed] Error "${product.name}":`, err.message?.substring(0, 150));
        }
      }
    }

    const total = await prisma.product.count();
    const totalBatches = seedData.totalBatches || 1;
    console.log(`[import-seed] Batch ${batch}: ${created} created, ${skipped} skipped, ${errors} errors. Total in DB: ${total}`);

    res.json({ 
      success: true, 
      batch,
      totalBatches,
      created, 
      skipped,
      errors,
      source,
      dbTotal: total,
      categoriesCreated: catCreated,
      nextBatch: batch + 1 < totalBatches ? batch + 1 : null
    });
  } catch (error) {
    console.error('[import-seed] Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}