const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const categoriesDataPath = path.join(__dirname, '..', 'categories-data.json');
const productsDataPath = path.join(__dirname, '..', 'sample-products.json');

const categoriesData = JSON.parse(fs.readFileSync(categoriesDataPath, 'utf-8'));
const productsData = JSON.parse(fs.readFileSync(productsDataPath, 'utf-8'));

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create or find admin user
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
  console.log('Admin user ready:', admin.email);

  // 2. Create categories with hierarchical parentId mapping
  const categoryDefinitions = categoriesData.categories || [];

  // First pass: create all categories without parentId (top-level)
  // Second pass: update with parentId now that all categories exist
  // We use slug -> id mapping to resolve parentId references
  const slugToId = {};

  // Create categories in order: top-level first, then children
  // Sort so that categories with no parentId come first
  const sortedCategories = [...categoryDefinitions].sort((a, b) => {
    if (!a.parentId && b.parentId) return -1;
    if (a.parentId && !b.parentId) return 1;
    return 0;
  });

  // We need to create in waves: first all root categories, then level 2, then level 3
  // Because parentId references must exist before we can set them
  const rootCats = sortedCategories.filter(c => !c.parentId);
  const childCats = sortedCategories.filter(c => c.parentId);

  // Create root categories
  for (const cat of rootCats) {
    const record = await prisma.category.upsert({
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
    slugToId[cat.slug] = record.id;
  }
  console.log(`Created ${rootCats.length} root categories`);

  // Create child categories - may need multiple passes for deep hierarchies
  // Keep trying until all are created
  let remaining = [...childCats];
  let pass = 0;
  while (remaining.length > 0 && pass < 10) {
    pass++;
    const nextRemaining = [];
    for (const cat of remaining) {
      const parentDbId = slugToId[cat.parentId];
      if (!parentDbId) {
        nextRemaining.push(cat);
        continue;
      }
      const record = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          parentId: parentDbId,
          sortOrder: cat.sortOrder || 0,
          seoTitle: cat.seoTitle || null,
          seoDesc: cat.seoDesc || null,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          parentId: parentDbId,
          sortOrder: cat.sortOrder || 0,
          seoTitle: cat.seoTitle || null,
          seoDesc: cat.seoDesc || null,
        },
      });
      slugToId[cat.slug] = record.id;
    }
    remaining = nextRemaining;
  }
  console.log(`Created ${childCats.length} child categories (${pass} passes)`);

  // 3. Clear all existing products
  const deleted = await prisma.product.deleteMany({});
  if (deleted.count > 0) {
    console.log(`Cleared ${deleted.count} existing products`);
  }

  // 4. Create products from sample-products.json
  const products = productsData.products || [];
  console.log(`Found ${products.length} products in sample-products.json`);

  let created = 0;
  for (const productData of products) {
    try {
      const variations = productData.variations || [];
      const variantData = variations.map(v => ({
        color: v.color || '',
        size: v.size || '',
        price: v.price || productData.priceMin || 0,
        stock: 100,
      }));

      // Match category by categorySlug
      const categoryId = slugToId[productData.categorySlug];
      if (!categoryId) {
        console.warn(`Category slug not found: ${productData.categorySlug}, skipping product: ${productData.name}`);
        continue;
      }

      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description || '',
          price: productData.priceMin || 0,
          originalPrice: productData.priceMax && productData.priceMax > productData.priceMin
            ? (productData.priceMax * 1.5)
            : (productData.priceMin * 1.3),
          image: productData.image,
          images: productData.images || [productData.image],
          categoryId: categoryId,
          stock: 100,
          isPublished: true,
          sku: productData.sku || null,
          material: productData.material || null,
          plating: productData.plating || null,
          process: productData.process || null,
          color: productData.color || null,
          size: productData.size || null,
          packSize: productData.packSize || 1,
          pkgLength: productData.pkgLength || null,
          pkgWidth: productData.pkgWidth || null,
          pkgHeight: productData.pkgHeight || null,
          pkgWeight: productData.pkgWeight || null,
          keywords: productData.keywords || [],
          origin: productData.origin || null,
          supplierCity: productData.supplierCity || null,
          stockStatus: productData.stockStatus || 'IN_STOCK',
          moq: productData.moq || 1,
          shippingCost: 0,
          shippingMethod: 'Standard Shipping',
          authorId: admin.id,
          variants: {
            create: variantData.length > 0 ? variantData : [{ color: 'Default', size: 'One Size', price: productData.priceMin || 0, stock: 100 }],
          },
        },
      });

      created++;
      console.log(`Created product ${created}/${products.length}: ${product.name}`);
    } catch (err) {
      console.error(`Failed to create product: ${productData.name}`, err.message);
    }
  }

  console.log(`Seed completed! Created ${created}/${products.length} products.`);
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
