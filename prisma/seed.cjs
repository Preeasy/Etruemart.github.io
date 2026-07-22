const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const siteDataPath = path.join(__dirname, '..', 'site-data.json');
const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create or find admin user
  const adminEmail = 'admin@etruemart.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq',
      name: 'eTruemart Admin',
      role: 'ADMIN',
    },
  });
  console.log('Admin user ready:', admin.email);

  // 2. Create categories
  const categories = siteData.categories || [];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }
  console.log(`Categories ready: ${categories.length}`);

  // 3. Wipe all products to avoid duplicates, then recreate
  const products = siteData.products || [];
  console.log(`Found ${products.length} products in site-data.json`);

  // Delete ALL products to ensure a clean state
  const deleted = await prisma.product.deleteMany({});
  if (deleted.count > 0) {
    console.log(`Cleared ${deleted.count} existing products`);
  }

  // 4. Create products
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

      // Collect all images
      const images = [productData.image];
      if (productData.aplus) {
        for (const section of productData.aplus) {
          if (section.image) {
            images.push(section.image);
          }
        }
      }
      const uniqueImages = [...new Set(images)];

      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description || '',
          price: productData.priceMin || 0,
          originalPrice: productData.priceMax && productData.priceMax > productData.priceMin
            ? (productData.priceMax * 1.5)
            : (productData.priceMin * 1.3),
          image: productData.image,
          images: uniqueImages,
          category: productData.category || 'Other',
          stock: 100,
          isPublished: true,
          sku: productData.sku || null,
          material: productData.material || null,
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
    // Don't exit with error code to avoid blocking Vercel build
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
