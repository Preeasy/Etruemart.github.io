import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Admin only
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session as any).role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Read site-data.json from the project root
    const filePath = path.join(process.cwd(), 'site-data.json');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'site-data.json not found in project root' });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const products = data.products || [];

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products found in site-data.json' });
    }

    // Get admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!admin) {
      return res.status(500).json({ error: 'No admin user found' });
    }

    let updated = 0;
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const item of products) {
      try {
        const sku = item.sku?.trim();
        if (!sku) { skipped++; continue; }

        // Serialize aplus blocks as JSON string
        const aplusJson = item.aplus ? JSON.stringify(item.aplus) : null;
        const variationsJson = item.variations ? JSON.stringify(item.variations) : null;

        // Build slug from name
        const slug = item.name
          ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) + '-' + sku.toLowerCase()
          : sku.toLowerCase();

        // Images: use main image, plus any variation images
        const images: string[] = [item.image].filter(Boolean);
        if (Array.isArray(item.variations)) {
          for (const v of item.variations) {
            if (v.image && !images.includes(v.image)) images.push(v.image);
          }
        }
        // Also collect aplus block images
        if (Array.isArray(item.aplus)) {
          for (const block of item.aplus) {
            if (block.image && !images.includes(block.image)) images.push(block.image);
          }
        }

        const price = parseFloat(item.priceMin) || 0;
        const priceMax = parseFloat(item.priceMax) || price;
        const moq = parseInt(item.moq) || 1;

        // Try to find existing product by SKU
        const existing = await prisma.product.findFirst({
          where: { sku },
        });

        const productData = {
          name: item.name || sku,
          slug,
          description: item.description || '',
          price,
          priceMax,
          image: item.image || '',
          images: JSON.stringify(images),
          material: item.material || null,
          size: item.size || null,
          moq,
          sku,
          aplus: aplusJson,
          keywords: variationsJson || '[]',
          stock: 9999,
          stockStatus: 'IN_STOCK',
          isPublished: true,
          authorId: admin.id,
        };

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: productData,
          });
          updated++;
        } else {
          // Need categoryId — try to match by name
          const categoryName = item.category;
          let category = null;
          if (categoryName) {
            category = await prisma.category.findFirst({
              where: { name: { contains: categoryName, mode: 'insensitive' } },
            });
          }

          await prisma.product.create({
            data: {
              ...productData,
              categoryId: category?.id || null,
            },
          });
          created++;
        }
      } catch (e: any) {
        errors.push(`SKU ${item.sku}: ${e.message}`);
      }
    }

    res.status(200).json({
      success: true,
      total: products.length,
      updated,
      created,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
