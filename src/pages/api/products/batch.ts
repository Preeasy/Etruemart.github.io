import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';


interface ProductImportData {
  name: string;
  description: string;
  slug: string;
  priceMin: number;
  priceMax: number;
  image: string;
  images: string[];
  categorySlug: string;
  material?: string;
  plating?: string;
  process?: string;
  color?: string;
  size?: string;
  packSize?: number;
  pkgLength?: number;
  pkgWidth?: number;
  pkgHeight?: number;
  pkgWeight?: number;
  moq?: number;
  sku?: string;
  origin?: string;
  supplierCity?: string;
  stockStatus?: string;
  keywords?: string[];
  variations?: { color: string; size: string; price: number }[];
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can batch import products' });
  }

  try {
    let data: ProductImportData[];
    
    if (req.body.data) {
      data = req.body.data;
    } else {
      return res.status(400).json({ error: 'No data provided' });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Data must be an array with at least one product' });
    }

    const categories = await prisma.category.findMany({
      select: { id: true, slug: true },
    });
    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const item of data) {
      try {
        const categoryId = categoryMap.get(item.categorySlug);
        if (!categoryId) {
          errors.push(`Product "${item.name}" skipped: category "${item.categorySlug}" not found`);
          failCount++;
          continue;
        }

        const existingProduct = await prisma.product.findUnique({
          where: { slug: item.slug },
        });

        if (existingProduct) {
          await prisma.product.update({
            where: { slug: item.slug },
            data: {
              name: item.name,
              description: item.description,
              price: item.priceMin,
              priceMax: item.priceMax,
              image: item.image,
              images: JSON.stringify(item.images),
              categoryId,
              material: item.material || '',
              plating: item.plating || '',
              process: item.process || '',
              color: item.color || '',
              size: item.size || '',
              packSize: item.packSize || 1,
              pkgLength: item.pkgLength || null,
              pkgWidth: item.pkgWidth || null,
              pkgHeight: item.pkgHeight || null,
              pkgWeight: item.pkgWeight || null,
              moq: item.moq || 1,
              sku: item.sku || '',
              origin: item.origin || 'Yiwu, China',
              supplierCity: item.supplierCity || 'Yiwu',
              stockStatus: item.stockStatus || 'IN_STOCK',
              keywords: JSON.stringify(item.keywords || []),
              updatedAt: new Date(),
            },
          });
          successCount++;
          continue;
        }

        await prisma.product.create({
          data: {
            name: item.name,
            description: item.description,
            slug: item.slug,
            price: item.priceMin,
            priceMax: item.priceMax,
            image: item.image,
            images: JSON.stringify(item.images),
            categoryId,
            material: item.material || '',
            plating: item.plating || '',
            process: item.process || '',
            color: item.color || '',
            size: item.size || '',
            packSize: item.packSize || 1,
            pkgLength: item.pkgLength || null,
            pkgWidth: item.pkgWidth || null,
            pkgHeight: item.pkgHeight || null,
            pkgWeight: item.pkgWeight || null,
            moq: item.moq || 1,
            sku: item.sku || '',
            origin: item.origin || 'Yiwu, China',
            supplierCity: item.supplierCity || 'Yiwu',
            stockStatus: item.stockStatus || 'IN_STOCK',
            keywords: JSON.stringify(item.keywords || []),
            authorId: session.user.id,
            isPublished: true,
            variants: {
              create: item.variations?.map(v => ({
                color: v.color,
                size: v.size,
                price: v.price,
              })) || [],
            },
          },
        });
        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Product "${item.name}" failed: ${errorMsg}`);
        failCount++;
      }
    }

    res.status(200).json({
      total: data.length,
      success: successCount,
      failed: failCount,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Server error: ${errorMsg}` });
  }
}
