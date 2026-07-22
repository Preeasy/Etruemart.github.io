const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const siteDataPath = path.join(__dirname, '..', 'site-data.json');
const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const adminEmail = 'admin@etruemart.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq',
        name: 'eTruemart Admin',
        role: 'ADMIN',
      },
    });
    console.log('Created admin user');
  }

  const categories = siteData.categories || [];
  for (const catName of categories) {
    const existing = await prisma.category.findUnique({ where: { name: catName } });
    if (!existing) {
      await prisma.category.create({ data: { name: catName } });
      console.log(`Created category: ${catName}`);
    }
  }

  const products = siteData.products || [];
  for (const productData of products) {
    const existing = await prisma.product.findFirst({
      where: { name: productData.name },
    });

    if (existing) {
      console.log(`Product already exists: ${productData.name}`);
      continue;
    }

    const variations = productData.variations || [];
    const variantData = variations.map(v => ({
      color: v.color || '',
      size: v.size || '',
      price: v.price || productData.priceMin || 0,
      stock: 100,
    }));

    const images = [productData.image];
    if (productData.aplus) {
      for (const section of productData.aplus) {
        if (section.image) {
          images.push(section.image);
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description || '',
        price: productData.priceMin || 0,
        originalPrice: productData.priceMax ? (productData.priceMax * 1.5) : undefined,
        image: productData.image,
        images: [...new Set(images)],
        category: productData.category || 'Other',
        stock: 100,
        isPublished: true,
        authorId: admin.id,
        variants: {
          create: variantData,
        },
      },
    });

    console.log(`Created product: ${product.name} (${product.id})`);
  }

  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });