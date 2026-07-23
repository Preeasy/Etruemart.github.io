import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const siteDataPath = path.join(process.cwd(), 'site-data.json');
    const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));

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

    // Seed categories from categories-data.json
    const catDataPath = path.join(process.cwd(), 'categories-data.json');
    if (fs.existsSync(catDataPath)) {
      const catData = JSON.parse(fs.readFileSync(catDataPath, 'utf-8'));
      const catItems = catData.categories || [];
      // First pass: create/update categories without parentId (root categories)
      for (const cat of catItems) {
        if (!cat.parentId) {
          await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
              name: cat.name,
              slug: cat.slug,
              sortOrder: cat.sortOrder || 0,
              seoTitle: cat.seoTitle || null,
              seoDesc: cat.seoDesc || null,
            },
          });
        }
      }
      // Second pass: create/update child categories with parentId
      for (const cat of catItems) {
        if (cat.parentId) {
          const parent = await prisma.category.findUnique({ where: { slug: cat.parentId } });
          if (parent) {
            await prisma.category.upsert({
              where: { slug: cat.slug },
              update: {},
              create: {
                name: cat.name,
                slug: cat.slug,
                parentId: parent.id,
                sortOrder: cat.sortOrder || 0,
                seoTitle: cat.seoTitle || null,
                seoDesc: cat.seoDesc || null,
              },
            });
          }
        }
      }
    } else {
      // Fallback: use categories from site-data.json
      const categories = siteData.categories || [];
      for (const catName of categories) {
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        await prisma.category.upsert({
          where: { slug },
          update: {},
          create: { name: catName, slug },
        });
      }
    }

    const products = siteData.products || [];
    // Wipe ALL products to avoid duplicates, then re-import
    const deleted = await prisma.product.deleteMany({});
    if (deleted.count > 0) {
      // Prisma will cascade delete variants, orderItems, cartItems, reviews
    }

    let created = 0;
    for (const productData of products) {
      const variations = productData.variations || [];
      const variantData = variations.map((v: any) => ({
        color: v.color || '',
        size: v.size || '',
        price: v.price || productData.priceMin || 0,
        stock: 100,
      }));

      const images: string[] = [productData.image];
      if (productData.aplus) {
        for (const section of productData.aplus) {
          if (section.image) {
            images.push(section.image);
          }
        }
      }
      const uniqueImages = [...new Set(images)];

      // Find category by name from productData.category string
      const catRecord = await prisma.category.findFirst({ where: { name: productData.category || 'Other' } });
      const fallbackCat = await prisma.category.findFirst();
      const categoryId = catRecord?.id || fallbackCat?.id || '';

      await prisma.product.create({
        data: {
          name: productData.name,
          slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + Date.now().toString(36),
          description: productData.description || '',
          price: productData.priceMin || 0,
          originalPrice: productData.priceMax && productData.priceMax > productData.priceMin
            ? (productData.priceMax * 1.5)
            : (productData.priceMin * 1.3),
          image: productData.image,
          images: JSON.stringify(uniqueImages),
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
          moq: productData.moq || 1,
          keywords: JSON.stringify(productData.keywords || []),
          stockStatus: productData.stockStatus || 'IN_STOCK',
          shippingCost: 0,
          shippingMethod: 'Standard Shipping',
          aplus: productData.aplus ? JSON.stringify(productData.aplus) : null,
          authorId: admin.id,
          variants: {
            create: variantData.length > 0 ? variantData : [{ color: 'Default', size: 'One Size', price: productData.priceMin || 0, stock: 100 }],
          },
        },
      });
      created++;
    }

    res.json({ success: true, created, total: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
