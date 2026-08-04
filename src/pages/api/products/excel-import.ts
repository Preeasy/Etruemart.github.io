import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import {
  detectColumns,
  matchCategory,
  matchImage,
  slugify,
  toNumber,
  cnyToUsd,
} from '@/lib/excel-mapping';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

// 加载图片映射数据
function loadImageData() {
  const baseDir = path.join(process.cwd(), 'scripts');
  const imageMapPath = path.join(baseDir, 'ycs-image-map.json');
  const manifestPath = path.join(baseDir, 'github-image-manifest.txt');

  const imageMap: Record<string, string> = fs.existsSync(imageMapPath)
    ? JSON.parse(fs.readFileSync(imageMapPath, 'utf-8'))
    : {};

  const allImages: string[] = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath, 'utf-8').trim().split('\n')
    : [];

  return { imageMap, allImages };
}

// 从 JSON 文件加载分类作为数据库的备选方案
function loadCategoriesFromJson(): { id: string; slug: string }[] {
  const categoriesPath = path.join(process.cwd(), 'categories-data.json');
  if (!fs.existsSync(categoriesPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
    // 这些 JSON 分类没有数据库 ID，用 slug 作为临时 ID
    return (data.categories || []).map((c: { slug: string }) => ({
      id: c.slug,
      slug: c.slug,
    }));
  } catch {
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admin can import products' });
  }

  try {
    const { rows, headers } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    if (!Array.isArray(headers)) {
      return res.status(400).json({ error: 'No headers provided' });
    }

    // 检测列映射
    const colMap = detectColumns(headers);

    // 如果没有 Item 号列，尝试用 SKU
    if (colMap.itemNo === undefined && colMap.sku !== undefined) {
      colMap.itemNo = colMap.sku;
    }

    // 加载图片数据
    const { imageMap, allImages } = loadImageData();

    // 获取分类（带容错机制）
    let categories: { id: string; slug: string | null }[] = [];
    let dbError = false;
    try {
      categories = await prisma.category.findMany({
        select: { id: true, slug: true },
      });
    } catch (err) {
      console.error('Database category query failed:', err);
      dbError = true;
      // 回退到 JSON 文件
      categories = loadCategoriesFromJson();
    }

    const slugToId = new Map<string, string>();
    categories.forEach(c => {
      if (c.slug) slugToId.set(c.slug, c.id);
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let noImage = 0;
    let noCategory = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const getVal = (field: string) => {
          if (colMap[field] !== undefined) return row[headers[colMap[field]]];
          return undefined;
        };

        const itemNo = getVal('itemNo');
        const sku = getVal('sku') || itemNo;
        const nameCn = getVal('nameCn');
        const nameEn = getVal('nameEn');
        const name = nameEn || nameCn || sku || `Product ${i + 1}`;
        // 价格：人民币转美元 (CNY / 6.7 × 1.15)
        const priceMin = cnyToUsd(toNumber(getVal('priceMin')));
        const priceMax = cnyToUsd(toNumber(getVal('priceMax')));
        const moq = getVal('moq') ? Math.max(1, parseInt(getVal('moq'))) : 1;
        const catL1 = getVal('categoryL1');
        const catL2 = getVal('categoryL2');
        const description = getVal('description') || '';
        const material = getVal('material') || '';
        const color = getVal('color') || '';
        const size = getVal('size') || '';
        const origin = getVal('origin') || 'Yiwu, China';
        const pkgWeight = getVal('pkgWeight') ? toNumber(getVal('pkgWeight')) : null;
        const pkgLength = getVal('pkgLength') ? toNumber(getVal('pkgLength')) : null;
        const pkgWidth = getVal('pkgWidth') ? toNumber(getVal('pkgWidth')) : null;
        const pkgHeight = getVal('pkgHeight') ? toNumber(getVal('pkgHeight')) : null;
        const packSize = getVal('packSize') ? parseInt(getVal('packSize')) : 1;

        // 匹配图片
        let imageUrl = getVal('image');
        if (!imageUrl && itemNo) {
          imageUrl = matchImage(itemNo, imageMap, allImages);
        }
        if (!imageUrl && sku) {
          imageUrl = matchImage(sku, imageMap, allImages);
        }
        if (!imageUrl) {
          imageUrl = '/images/product-placeholder.svg';
          noImage++;
        }

        // 匹配分类
        const categoryId = matchCategory(catL1, catL2, slugToId);
        if (!categoryId) noCategory++;

        // 生成 slug
        let slug = slugify(name);
        if (!slug) slug = slugify(sku) || `product-${Date.now()}-${i}`;
        const existingBySlug = await prisma.product.findUnique({ where: { slug } });
        if (existingBySlug) {
          slug = `${slug}-${sku || i}`;
        }

        // 描述
        const descParts = [description];
        if (!description && nameCn) descParts.push(`Product Name: ${nameCn}`);
        if (material) descParts.push(`Material: ${material}`);
        if (color) descParts.push(`Color: ${color}`);
        if (size) descParts.push(`Size: ${size}`);
        if (itemNo) descParts.push(`Item No: ${itemNo}`);
        const finalDesc = descParts.filter(Boolean).join('\n');

        const keywords = [name, sku, itemNo, catL1, catL2].filter(Boolean).map(String);
        const keywordsStr = JSON.stringify(keywords);
        const imagesStr = JSON.stringify([imageUrl]);
        const originalPrice = priceMax > priceMin ? priceMax : priceMin * 1.3;

        // 检查是否已存在
        let existing = null;
        if (sku) {
          existing = await prisma.product.findFirst({ where: { sku: String(sku) } });
        }
        if (!existing) {
          existing = await prisma.product.findUnique({ where: { slug } });
        }

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: String(name),
              description: finalDesc,
              price: priceMin,
              priceMax: priceMax || null,
              originalPrice,
              image: imageUrl,
              images: imagesStr,
              categoryId: categoryId || existing.categoryId,
              material: material || null,
              color: color || null,
              size: size || null,
              moq,
              sku: sku ? String(sku) : null,
              origin,
              stockStatus: 'IN_STOCK',
              stock: 9999,
              packSize,
              pkgWeight, pkgLength, pkgWidth, pkgHeight,
              keywords: keywordsStr,
              updatedAt: new Date(),
            },
          });
          updated++;
        } else {
          await prisma.product.create({
            data: {
              name: String(name),
              slug,
              description: finalDesc,
              price: priceMin,
              priceMax: priceMax || null,
              originalPrice,
              image: imageUrl,
              images: imagesStr,
              categoryId: categoryId || null,
              material: material || null,
              color: color || null,
              size: size || null,
              moq,
              sku: sku ? String(sku) : null,
              origin,
              supplierCity: 'Yiwu',
              stockStatus: 'IN_STOCK',
              stock: 9999,
              isPublished: true,
              packSize,
              pkgWeight, pkgLength, pkgWidth, pkgHeight,
              keywords: keywordsStr,
              shippingCost: 0,
              shippingMethod: 'Standard Shipping',
              authorId: session.user.id,
              variants: {
                create: [{
                  color: color || 'Default',
                  size: size || 'One Size',
                  price: priceMin,
                  stock: 9999,
                }],
              },
            },
          });
          created++;
        }
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        skipped++;
      }
    }

    res.status(200).json({
      total: rows.length,
      created,
      updated,
      skipped,
      noImage,
      noCategory,
      dbWarning: dbError ? 'Database category query failed, using JSON fallback. Some categories may not match.' : null,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Excel import error:', errorMsg);
    res.status(500).json({ error: `Server error: ${errorMsg}` });
  }
}
