/**
 * Vercel 环境数据库初始化 API
 * 在 Vercel 部署后调用此 API 来迁移数据库和导入数据
 * 
 * 使用方法：
 * POST /api/init-db
 * Headers: x-secret: <SEED_SECRET>
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-secret'] || req.query.secret;
  if (secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: 'Invalid or missing secret key' });
  }

  const prisma = new PrismaClient();

  try {
    console.log('[init-db] Starting database initialization...');

    // 检查是否已经有数据
    const productCount = await prisma.product.count();
    if (productCount > 0 && !req.body.force) {
      return res.json({
        success: true,
        message: 'Database already has data',
        productCount,
        skipped: true,
      });
    }

    // 读取导出的数据文件
    const exportPath = path.join(process.cwd(), 'prisma', 'sqlite-export.json');
    let exportData: any;

    if (fs.existsSync(exportPath)) {
      exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
      console.log(`[init-db] Loaded export data from file`);
    } else {
      // 如果没有导出文件，使用 seed-data.json
      const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
      if (!fs.existsSync(seedPath)) {
        return res.status(404).json({ error: 'No data files found' });
      }
      
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      exportData = {
        categories: seedData.categories || [],
        products: seedData.products || [],
        product_variants: [],
        shipping_templates: [],
      };
      console.log(`[init-db] Using seed-data.json as source`);
    }

    const results: { [key: string]: { success: number; failed: number } } = {};

    // 1. 导入 Categories
    if (exportData.categories?.length) {
      console.log(`[init-db] Importing ${exportData.categories.length} categories...`);
      let success = 0, failed = 0;
      
      for (const cat of exportData.categories) {
        try {
          const createdAt = cat.createdAt ? new Date(cat.createdAt) : new Date();
          const updatedAt = cat.updatedAt ? new Date(cat.updatedAt) : new Date();

          await prisma.category.upsert({
            where: { id: cat.id },
            update: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image: cat.image,
              parentId: cat.parentId,
              sortOrder: cat.sortOrder || 0,
              seoTitle: cat.seoTitle,
              seoDesc: cat.seoDesc,
              updatedAt,
            },
            create: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              image: cat.image,
              parentId: cat.parentId,
              sortOrder: cat.sortOrder || 0,
              seoTitle: cat.seoTitle,
              seoDesc: cat.seoDesc,
              createdAt,
              updatedAt,
            },
          });
          success++;
        } catch (err: any) {
          failed++;
          if (failed <= 3) console.error(`  Category ${cat.id}: ${err.message?.substring(0, 100)}`);
        }
      }
      results.categories = { success, failed };
      console.log(`[init-db] Categories: ${success} success, ${failed} failed`);
    }

    // 2. 导入 Products
    if (exportData.products?.length) {
      console.log(`[init-db] Importing ${exportData.products.length} products...`);
      let success = 0, failed = 0;
      
      for (const product of exportData.products) {
        try {
          const createdAt = product.createdAt ? new Date(product.createdAt) : new Date();
          const updatedAt = product.updatedAt ? new Date(product.updatedAt) : new Date();

          let images = product.images;
          if (typeof images === 'string') {
            try {
              const parsed = JSON.parse(images);
              images = JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]);
            } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/init-db] silent error:', e?.message || e);
                images = images || '[]';
              }
          } else if (Array.isArray(images)) {
            images = JSON.stringify(images);
          } else {
            images = '[]';
          }

          let keywords = product.keywords;
          if (typeof keywords === 'string') {
            try {
              const parsed = JSON.parse(keywords);
              keywords = JSON.stringify(Array.isArray(parsed) ? parsed : [parsed]);
            } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/init-db] silent error:', e?.message || e);
                keywords = keywords || '[]';
              }
          } else {
            keywords = '[]';
          }

          const authorId = product.authorId || 'system-admin';

          await prisma.product.upsert({
            where: { id: product.id },
            update: {
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: product.price,
              priceMax: product.priceMax,
              originalPrice: product.originalPrice,
              image: product.image,
              images,
              categoryId: product.categoryId,
              stock: product.stock || 0,
              rating: product.rating || 0,
              reviewCount: product.reviewCount || 0,
              salesCount: product.salesCount || 0,
              isPublished: product.isPublished !== false,
              shippingCost: product.shippingCost || 0,
              shippingMethod: product.shippingMethod,
              sku: product.sku,
              material: product.material,
              plating: product.plating,
              process: product.process,
              color: product.color,
              size: product.size,
              packSize: product.packSize || 1,
              pkgLength: product.pkgLength,
              pkgWidth: product.pkgWidth,
              pkgHeight: product.pkgHeight,
              pkgWeight: product.pkgWeight,
              keywords,
              origin: product.origin,
              supplierCity: product.supplierCity,
              stockStatus: product.stockStatus || 'IN_STOCK',
              moq: product.moq || 1,
              aplus: product.aplus,
              updatedAt,
            },
            create: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: product.price,
              priceMax: product.priceMax,
              originalPrice: product.originalPrice,
              image: product.image,
              images,
              categoryId: product.categoryId,
              stock: product.stock || 0,
              rating: product.rating || 0,
              reviewCount: product.reviewCount || 0,
              salesCount: product.salesCount || 0,
              isPublished: product.isPublished !== false,
              shippingCost: product.shippingCost || 0,
              shippingMethod: product.shippingMethod,
              sku: product.sku,
              material: product.material,
              plating: product.plating,
              process: product.process,
              color: product.color,
              size: product.size,
              packSize: product.packSize || 1,
              pkgLength: product.pkgLength,
              pkgWidth: product.pkgWidth,
              pkgHeight: product.pkgHeight,
              pkgWeight: product.pkgWeight,
              keywords,
              origin: product.origin,
              supplierCity: product.supplierCity,
              stockStatus: product.stockStatus || 'IN_STOCK',
              moq: product.moq || 1,
              aplus: product.aplus,
              authorId,
              createdAt,
              updatedAt,
            },
          });
          success++;
        } catch (err: any) {
          failed++;
          if (failed <= 3) console.error(`  Product ${product.sku || product.id}: ${err.message?.substring(0, 100)}`);
        }
      }
      results.products = { success, failed };
      console.log(`[init-db] Products: ${success} success, ${failed} failed`);
    }

    // 3. 导入 Product Variants
    if (exportData.product_variants?.length) {
      console.log(`[init-db] Importing ${exportData.product_variants.length} variants...`);
      let success = 0, failed = 0;
      
      for (const variant of exportData.product_variants) {
        try {
          await prisma.productVariant.upsert({
            where: { id: variant.id },
            update: {
              productId: variant.productId,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock || 0,
            },
            create: {
              id: variant.id,
              productId: variant.productId,
              color: variant.color,
              size: variant.size,
              price: variant.price,
              stock: variant.stock || 0,
            },
          });
          success++;
        } catch (err) {
          failed++;
        }
      }
      results.product_variants = { success, failed };
      console.log(`[init-db] Variants: ${success} success, ${failed} failed`);
    }

    // 4. 导入 Shipping Templates
    if (exportData.shipping_templates?.length) {
      let success = 0, failed = 0;
      for (const template of exportData.shipping_templates) {
        try {
          const createdAt = template.createdAt ? new Date(template.createdAt) : new Date();
          const updatedAt = template.updatedAt ? new Date(template.updatedAt) : new Date();
          
          await prisma.shippingTemplate.upsert({
            where: { id: template.id },
            update: {
              name: template.name,
              regions: template.regions,
              basePrice: template.basePrice,
              weightRate: template.weightRate,
              volumeRate: template.volumeRate,
              freeThreshold: template.freeThreshold,
              minDays: template.minDays,
              maxDays: template.maxDays,
              isActive: template.isActive,
              updatedAt,
            },
            create: {
              id: template.id,
              name: template.name,
              regions: template.regions,
              basePrice: template.basePrice,
              weightRate: template.weightRate,
              volumeRate: template.volumeRate,
              freeThreshold: template.freeThreshold,
              minDays: template.minDays,
              maxDays: template.maxDays,
              isActive: template.isActive,
              createdAt,
              updatedAt,
            },
          });
          success++;
        } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/init-db] silent error:', e?.message || e);
            failed++;
          }
      }
      results.shipping_templates = { success, failed };
    }

    console.log('[init-db] ✅ Database initialization completed!');
    console.log(JSON.stringify(results, null, 2));

    return res.json({
      success: true,
      message: 'Database initialization completed',
      results,
      summary: {
        totalProducts: exportData.products?.length || 0,
        totalCategories: exportData.categories?.length || 0,
      },
    });

  } catch (error: any) {
    console.error('[init-db] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}
