import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { seedShippingTemplatesIfEmpty } from '@/lib/shipping';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require ADMIN session or valid init token from env
  const initToken = process.env.INIT_TOKEN;
  const requestToken = req.headers['x-init-token'] || req.body?.token;
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';

  if (!isAdmin && (!initToken || requestToken !== initToken)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    // Seed the single admin account once. Product/category/shipping sync below
    // is idempotent (upsert) and always runs so all site-data.json products
    // are guaranteed to be present in the database.
    const existingCount = await prisma.user.count();

    const password = process.env.SEED_PASSWORD || 'ldz52385109';
    const passwordHash = await bcrypt.hash(password, 12);

    const adminEmail = 'yeatrusourcing@gmail.com';

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, name: 'Yeatrusourcing', role: 'ADMIN' },
      create: { email: adminEmail, passwordHash, name: 'Yeatrusourcing', role: 'ADMIN' },
    });

    // Import categories
    let categoryCount = 0;
    const catDataPath = path.join(process.cwd(), 'categories-data.json');
    if (fs.existsSync(catDataPath)) {
      const catData = JSON.parse(fs.readFileSync(catDataPath, 'utf-8'));
      const catItems = catData.categories || [];
      const slugToId: Record<string, string> = {};

      // Root categories
      for (const cat of catItems) {
        if (!cat.parentId) {
          const r = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, sortOrder: cat.sortOrder || 0 },
            create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder || 0 },
          });
          slugToId[cat.slug] = r.id;
          categoryCount++;
        }
      }

      // Child categories
      for (const cat of catItems) {
        if (cat.parentId && slugToId[cat.parentId]) {
          const r = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, parentId: slugToId[cat.parentId] },
            create: { name: cat.name, slug: cat.slug, parentId: slugToId[cat.parentId] },
          });
          slugToId[cat.slug] = r.id;
          categoryCount++;
        }
      }
    }

    // Import products from site-data.json (idempotent via upsert by slug)
    let productCount = 0;
    const siteDataPath = path.join(process.cwd(), 'site-data.json');
    if (fs.existsSync(siteDataPath)) {
      const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
      const products = siteData.products || [];

      for (const p of products) {
        try {
          if (!p.slug) continue;
          const catSlug = p.category?.slug || p.categorySlug;
          let categoryId = '';

          if (catSlug) {
            const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
            if (cat) categoryId = cat.id;
          }
          if (!categoryId) {
            const catName = typeof p.category === 'object' ? p.category.name : (p.category || '');
            if (catName) {
              const cat = await prisma.category.findFirst({ where: { name: catName } });
              if (cat) categoryId = cat.id;
            }
          }
          if (!categoryId) {
            const firstCat = await prisma.category.findFirst();
            if (firstCat) categoryId = firstCat.id;
          }
          if (!categoryId) continue;

          const imagesArr = Array.isArray(p.images) ? p.images : [p.image];
          const keywordsStr = JSON.stringify(Array.isArray(p.keywords) ? p.keywords : [p.slug]);
          const priceMin = p.priceMin || p.price || 0;
          const priceMax = p.priceMax || null;

          // upsert by slug so re-running init is safe and keeps all 378 products in sync
          const upserted = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {
              name: p.name,
              description: p.description || '',
              price: priceMin,
              priceMax,
              originalPrice: priceMax || priceMin * 1.3,
              image: p.image,
              images: JSON.stringify(imagesArr),
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
              moq: p.moq || 1,
              keywords: keywordsStr,
              stockStatus: p.stockStatus || 'IN_STOCK',
              shippingCost: p.shippingCost ?? 0,
              shippingMethod: p.shippingMethod || 'Standard Shipping',
              aplus: p.aplus ? JSON.stringify(p.aplus) : null,
            },
            create: {
              name: p.name,
              slug: p.slug,
              description: p.description || '',
              price: priceMin,
              priceMax,
              originalPrice: priceMax || priceMin * 1.3,
              image: p.image,
              images: JSON.stringify(imagesArr),
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
              moq: p.moq || 1,
              keywords: keywordsStr,
              stockStatus: p.stockStatus || 'IN_STOCK',
              shippingCost: p.shippingCost ?? 0,
              shippingMethod: p.shippingMethod || 'Standard Shipping',
              aplus: p.aplus ? JSON.stringify(p.aplus) : null,
              authorId: admin.id,
              variants: {
                create: [{ color: p.color || 'Default', size: p.size || 'One Size', price: priceMin, stock: p.stock || 100 }],
              },
            },
          });

          // Ensure a default variant exists for products that were updated (created earlier without one)
          if (upserted) {
            const variantCount = await prisma.productVariant.count({ where: { productId: upserted.id } });
            if (variantCount === 0) {
              await prisma.productVariant.create({
                data: {
                  productId: upserted.id,
                  color: p.color || 'Default',
                  size: p.size || 'One Size',
                  price: priceMin,
                  stock: p.stock || 100,
                },
              });
            }
          }
          productCount++;
        } catch (err) {
          // skip individual product errors but continue importing the rest
        }
      }
    }

    // Seed default shipping templates (AI-analyzed reasonable rates)
    let shippingTemplates = 0;
    try {
      await seedShippingTemplatesIfEmpty();
      shippingTemplates = await prisma.shippingTemplate.count();
    } catch (err) {
      // skip shipping template seed errors
    }

    res.json({
      success: true,
      message: 'Database initialized',
      users: 1,
      categories: categoryCount,
      products: productCount,
      shippingTemplates,
    });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}
