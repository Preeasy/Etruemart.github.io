const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log('Importing 200 new products...');

  const dataPath = path.join(__dirname, '..', 'products-200.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const products = data.products;

  const seller = await prisma.user.findUnique({
    where: { email: 'neil6corrot@gmail.com' }
  });

  if (!seller) {
    console.error('Seller not found!');
    process.exit(1);
  }
  console.log(`Seller: ${seller.name} (${seller.email})`);

  const categories = await prisma.category.findMany({});
  const slugToId = {};
  categories.forEach(c => { slugToId[c.slug] = c.id; });

  console.log(`Categories loaded: ${categories.length}`);

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      const categoryId = slugToId[p.category.slug];
      if (!categoryId) {
        console.warn(`Skip (no category): ${p.name}`);
        skipped++;
        continue;
      }

      const existing = await prisma.product.findUnique({
        where: { slug: p.slug }
      });

      if (existing) {
        console.log(`Skip (exists): ${p.slug}`);
        skipped++;
        continue;
      }

      const imagesArray = Array.isArray(p.images) ? p.images : [p.image];
      const keywordsStr = Array.isArray(p.keywords) ? JSON.stringify(p.keywords) : '[]';
      const bulletPointsStr = Array.isArray(p.bulletPoints) ? JSON.stringify(p.bulletPoints) : '[]';
      const aplusStr = p.aplus ? JSON.stringify(p.aplus) : null;

      const priceVal = p.priceMin || 0;
      const originalPriceVal = p.priceMax || priceVal * 1.3;

      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: priceVal,
          originalPrice: originalPriceVal,
          priceMax: p.priceMax || null,
          image: p.image,
          images: JSON.stringify(imagesArray),
          categoryId,
          stock: p.stock || 100,
          isPublished: p.isPublished !== false,
          sku: p.sku || null,
          material: p.material || null,
          plating: p.plating || null,
          process: p.process || null,
          color: p.color || null,
          size: p.size || null,
          packSize: p.packSize || 1,
          pkgLength: p.pkgLength || null,
          pkgWidth: p.pkgWidth || null,
          pkgHeight: p.pkgHeight || null,
          pkgWeight: p.pkgWeight || null,
          keywords: keywordsStr,
          origin: p.origin || null,
          supplierCity: p.supplierCity || null,
          stockStatus: p.stockStatus || 'IN_STOCK',
          moq: p.moq || 1,
          shippingCost: p.shippingCost ?? 0,
          shippingMethod: p.shippingMethod || 'Standard Shipping',
          aplus: aplusStr,
          authorId: seller.id,
          variants: {
            create: [{
              color: p.color || 'Default',
              size: p.size || 'One Size',
              price: priceVal,
              stock: p.stock || 100
            }]
          },
        },
      });
      created++;
      if (created % 20 === 0) console.log(`Progress: ${created}/${products.length}`);
    } catch (err) {
      console.error(`Failed: ${p.name}`, err.message);
    }
  }

  console.log(`\nImport done: ${created} created, ${skipped} skipped`);

  const totalProducts = await prisma.product.count();
  console.log(`Total products in database: ${totalProducts}`);
}

main().catch(e => { console.error('Import failed:', e); process.exit(0); }).finally(async () => { await prisma.$disconnect(); });