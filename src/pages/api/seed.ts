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

    const categories = siteData.categories || [];
    for (const catName of categories) {
      await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName },
      });
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

      await prisma.product.create({
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
    }

    res.json({ success: true, created, total: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
