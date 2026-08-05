const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

function toBool(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return true;
}

function toFloat(v) {
  if (v === null || v === undefined || v === '') return null;
  return Number(v);
}

function toInt(v) {
  if (v === null || v === undefined || v === '') return null;
  return Math.round(Number(v));
}

function toJsonString(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  return JSON.stringify(v);
}

async function main() {
  const prisma = new PrismaClient();

  const seedPath = path.join(__dirname, 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    console.log('[seed] No seed-data.json found, skipping product import');
    await prisma.$disconnect();
    return;
  }

  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log(`[seed] Loading ${seedData.categories.length} categories and ${seedData.products.length} products`);

  // 1. Create admin user
  let adminId = null;
  if (seedData.admin) {
    const admin = await prisma.user.upsert({
      where: { email: seedData.admin.email },
      update: { name: seedData.admin.name || 'Admin', role: 'ADMIN' },
      create: {
        email: seedData.admin.email,
        name: seedData.admin.name || 'Admin',
        passwordHash: '$2b$10$placeholder',
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
    console.log('[seed] Admin user ensured:', admin.email);
  }

  // 2. Create categories (upsert by slug)
  const slugToId = new Map();
  const existingCats = await prisma.category.findMany({ select: { id: true, slug: true } });
  existingCats.forEach(c => slugToId.set(c.slug, c.id));

  let catCreated = 0;
  // Create root categories first (those with null parentId)
  const rootCats = seedData.categories.filter(c => !c.parentId);
  const childCats = seedData.categories.filter(c => c.parentId);

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
  console.log(`[seed] Created ${catCreated} new categories`);

  // 3. Map old category IDs to new ones
  const oldIdToNewId = new Map();
  for (const cat of seedData.categories) {
    oldIdToNewId.set(cat.id, slugToId.get(cat.slug));
  }

  // 4. Import products - upsert by slug, delete products no longer in seed data
  const seedSlugs = new Set(seedData.products.map(p => p.slug).filter(Boolean));
  const existingProducts = await prisma.product.findMany({ select: { id: true, slug: true } });
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  // Delete products that exist in DB but not in seed data
  const toDelete = existingProducts.filter(p => p.slug && !seedSlugs.has(p.slug));
  if (toDelete.length > 0) {
    console.log(`[seed] Deleting ${toDelete.length} products not in seed data`);
    // Delete variants first (foreign key), then products
    const deleteIds = toDelete.map(p => p.id);
    // Batch delete to avoid query size limits
    const BATCH = 200;
    for (let i = 0; i < deleteIds.length; i += BATCH) {
      const batch = deleteIds.slice(i, i + BATCH);
      try {
        await prisma.productVariant.deleteMany({ where: { productId: { in: batch } } });
      } catch {}
      await prisma.product.deleteMany({ where: { id: { in: batch } } });
    }
    console.log(`[seed] Deleted ${toDelete.length} obsolete products`);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let batch = 0;
  let errors = 0;

  for (const product of seedData.products) {
    try {
      const categoryId = oldIdToNewId.get(product.categoryId) || null;

      const productData = {
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
        authorId: adminId,
      };

      if (product.slug && existingSlugs.has(product.slug)) {
        // Update existing product
        await prisma.product.update({
          where: { slug: product.slug },
          data: productData,
        });
        updated++;
      } else {
        // Create new product
        const createdProduct = await prisma.product.create({ data: productData });

        // Create default variant
        try {
          await prisma.productVariant.create({
            data: {
              productId: createdProduct.id,
              color: product.color || 'Default',
              size: product.size || 'One Size',
              price: toFloat(product.price) ?? 0,
              stock: toInt(product.stock) ?? 100,
            },
          });
        } catch {}
        existingSlugs.add(productData.slug);
        created++;
      }

      batch++;

      if (batch % 100 === 0) {
        console.log(`[seed] Progress: ${batch}/${seedData.products.length} (errors: ${errors})`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.error(`[seed] Error "${product.name}":`, err.message?.substring(0, 150));
      }
    }
  }

  console.log(`[seed] Complete: ${created} created, ${updated} updated, ${errors} errors`);

  const total = await prisma.product.count();
  console.log(`[seed] Total products in database: ${total}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('[seed] Failed:', e);
  process.exit(1);
});
