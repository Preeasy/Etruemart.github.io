import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function seedIfEmpty() {
  const count = await prisma.product.count();
  if (count > 0) {
    // Deduplicate: keep only the first product for each name
    const all = await prisma.product.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const seen = new Set<string>();
    const toDelete: string[] = [];
    for (const p of all) {
      if (seen.has(p.name)) {
        toDelete.push(p.id);
      } else {
        seen.add(p.name);
      }
    }
    if (toDelete.length > 0) {
      await prisma.product.deleteMany({ where: { id: { in: toDelete } } });
    }
    return;
  }

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

  const categories = siteData.categories || [];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }

  const products = siteData.products || [];
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
        if (section.image) images.push(section.image);
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
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    await seedIfEmpty();

    const { authorId, category } = req.query;

    const where: any = { isPublished: true };
    
    if (authorId) {
      where.authorId = authorId as string;
    }
    
    if (category && category !== 'All') {
      where.category = category as string;
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(products);
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { name, description, price, originalPrice, image, images, category, stock, variants } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image,
        images: images || [],
        category,
        stock: parseInt(stock),
        authorId: session.user.id,
        variants: variants ? { create: variants } : undefined,
      },
    });

    return res.status(201).json(product);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
