const fs = require('fs');
const path = require('path');

// First, set the environment variable so Prisma picks up the right schema
process.env.DATABASE_URL = process.env.DATABASE_URL || '';

// Use the PostgreSQL schema explicitly
const { PrismaClient } = require('@prisma/client');

// This script connects directly to Vercel PostgreSQL and imports data
// Usage: DATABASE_URL="postgresql://..." node scripts/import-to-vercel.cjs

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
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Please set DATABASE_URL environment variable');
    console.error('Example: DATABASE_URL="postgresql://user:pass@host:port/db" node scripts/import-to-vercel.cjs');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  });

  console.log('Connecting to database...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('Connected successfully!');

    // Load seed data
    const seedPath = path.join(__dirname, '..', 'prisma', 'seed-data.json');
    if (!fs.existsSync(seedPath)) {
      console.error('seed-data.json not found');
      process.exit(1);
    }

    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    console.log(`Loaded: ${seedData.categories.length} categories, ${seedData.products.length} products`);

    // 1. Create admin account
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
    console.log('Admin account ensured:', admin.email);

    // 2. Create categories
    const categories = seedData.categories || [];
    const slugToId = new Map();
    
    const existingCats = await prisma.category.findMany({ select: { id: true, slug: true } });
    existingCats.forEach(c => {
      if (c.slug) slugToId.set(c.slug, c.id);
    });

    let catCreated = 0;
    const rootCats = categories.filter(c => !c.parentId);
    const childCats = categories.filter(c => c.parentId);

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
    console.log(`Created ${catCreated} categories`);

    // 3. Map old IDs
    const oldIdToNewId = new Map();
    for (const cat of categories) {
      if (slugToId.has(cat.slug)) {
        oldIdToNewId.set(String(cat.id), slugToId.get(cat.slug));
      }
    }

    // 4. Delete ALL existing products
    const deleted = await prisma.product.deleteMany({});
    console.log(`Deleted ${deleted.count} existing products`);

    // 5. Import products
    const products = seedData.products || [];
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
        if (created % 100 === 0) {
          console.log(`Progress: ${created}/${products.length}`);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) {
          console.error(`Error "${product.name}":`, err.message?.substring(0, 150));
        }
      }
    }

    const total = await prisma.product.count();
    console.log(`\nDone! Created: ${created}, Errors: ${errors}, Total in DB: ${total}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();