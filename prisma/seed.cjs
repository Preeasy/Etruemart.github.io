const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const categoriesDataPath = path.join(__dirname, '..', 'categories-data.json');
const productsDataPath = path.join(__dirname, '..', 'site-data.json');

const categoriesData = JSON.parse(fs.readFileSync(categoriesDataPath, 'utf-8'));
const productsData = JSON.parse(fs.readFileSync(productsDataPath, 'utf-8'));

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const adminEmail = 'yeatrusourcing@gmail.com';
  const officialSellerEmail = 'neil6corrot@gmail.com';
  const password = process.env.SEED_PASSWORD || 'ldz52385109';
  const passwordHash = bcrypt.hashSync(password, 12);

  // 1. Create admin account
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Yeatrusourcing',
      role: 'ADMIN',
    },
  });
  console.log('Admin ready:', admin.email);

  // 2. Create official seller account
  const seller = await prisma.user.upsert({
    where: { email: officialSellerEmail },
    update: {},
    create: {
      email: officialSellerEmail,
      passwordHash,
      name: 'Official Seller',
      role: 'OFFICIAL_SELLER',
    },
  });
  console.log('Seller ready:', seller.email);

  // 3. Categories
  const categoryDefinitions = categoriesData.categories || [];
  const slugToId = {};

  const sortedCategories = [...categoryDefinitions].sort((a, b) => {
    if (!a.parentId && b.parentId) return -1;
    if (a.parentId && !b.parentId) return 1;
    return 0;
  });

  const rootCats = sortedCategories.filter(c => !c.parentId);
  const childCats = sortedCategories.filter(c => c.parentId);

  for (const cat of rootCats) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: cat.sortOrder || 0, seoTitle: cat.seoTitle || null, seoDesc: cat.seoDesc || null },
      create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder || 0, seoTitle: cat.seoTitle || null, seoDesc: cat.seoDesc || null },
    });
    slugToId[cat.slug] = record.id;
  }
  console.log(`Root categories: ${rootCats.length}`);

  let remaining = [...childCats];
  let pass = 0;
  while (remaining.length > 0 && pass < 10) {
    pass++;
    const nextRemaining = [];
    for (const cat of remaining) {
      const parentDbId = slugToId[cat.parentId];
      if (!parentDbId) { nextRemaining.push(cat); continue; }
      const record = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, parentId: parentDbId, sortOrder: cat.sortOrder || 0, seoTitle: cat.seoTitle || null, seoDesc: cat.seoDesc || null },
        create: { name: cat.name, slug: cat.slug, parentId: parentDbId, sortOrder: cat.sortOrder || 0, seoTitle: cat.seoTitle || null, seoDesc: cat.seoDesc || null },
      });
      slugToId[cat.slug] = record.id;
    }
    remaining = nextRemaining;
  }
  console.log(`Child categories: ${childCats.length}`);

  // 4. Products
  await prisma.product.deleteMany({});
  const products = productsData.products || [];
  console.log(`Products: ${products.length}`);

  let created = 0;
  for (const productData of products) {
    try {
      const categorySlug = productData.category?.slug || productData.categorySlug;
      const categoryId = slugToId[categorySlug];
      if (!categoryId) {
        console.warn(`Skip (no category): ${productData.name}`);
        continue;
      }

      const imagesArray = Array.isArray(productData.images) ? productData.images : [productData.image];
      const keywordsStr = Array.isArray(productData.keywords) ? JSON.stringify(productData.keywords) : JSON.stringify([productData.slug]);
      const bulletPointsStr = Array.isArray(productData.bulletPoints) ? JSON.stringify(productData.bulletPoints) : '[]';

      await prisma.product.create({
        data: {
          name: productData.name,
          slug: productData.slug,
          description: productData.description || '',
          price: productData.priceMin || 0,
          originalPrice: productData.priceMax || (productData.priceMin || 0) * 1.3,
          image: productData.image,
          images: JSON.stringify(imagesArray),
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
          keywords: keywordsStr,
          origin: productData.origin || null,
          supplierCity: productData.supplierCity || null,
          stockStatus: productData.stockStatus || 'IN_STOCK',
          moq: productData.moq || 1,
          shippingCost: 0,
          shippingMethod: 'Standard Shipping',
          authorId: seller.id,
          variants: {
            create: [{ color: 'Default', size: 'One Size', price: productData.priceMin || 0, stock: 100 }],
          },
        },
      });
      created++;
    } catch (err) {
      console.error(`Failed: ${productData.name}`, err.message);
    }
  }
  console.log(`Seed done: ${created}/${products.length}`);
}

main().catch(e => { console.error('Seed failed:', e); process.exit(0); }).finally(async () => { await prisma.$disconnect(); });
