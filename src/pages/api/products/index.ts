import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

function safeJsonParse<T>(str: any, fallback: T): T {
  if (str === null || str === undefined) return fallback;
  if (typeof str !== 'string') return str as T;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(String(value)) || 0;
}

function getAllCategoryIds(database: any, parentId: string): string[] {
  const result: string[] = [parentId];
  const children = database.prepare('SELECT id FROM categories WHERE parentId = ?').all(parentId) as any[];
  for (const child of children) {
    result.push(...getAllCategoryIds(database, child.id));
  }
  return result;
}

async function getProductsFromFallback(req: NextApiRequest, res: NextApiResponse) {
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  if (!fs.existsSync(siteDataPath)) {
    return res.json([]);
  }

  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  let products: any[] = siteData.products || [];

  const { category, material, plating, color, priceMin, priceMax } = req.query;

  if (category && category !== 'all') {
    products = products.filter((p: any) => {
      const catSlug = p.category?.slug || p.categorySlug;
      const catName = typeof p.category === 'object' ? p.category.name : p.category;
      return catSlug === category || catName === category;
    });
  }

  if (material) {
    const m = String(material).toLowerCase();
    products = products.filter((p: any) => (p.material || '').toLowerCase().includes(m));
  }

  if (plating) {
    const pl = String(plating).toLowerCase();
    products = products.filter((p: any) => (p.plating || '').toLowerCase().includes(pl));
  }

  if (color) {
    const c = String(color).toLowerCase();
    products = products.filter((p: any) => (p.color || '').toLowerCase().includes(c));
  }

  if (priceMin) {
    const min = parseFloat(priceMin as string);
    products = products.filter((p: any) => (p.priceMin || p.price || 0) >= min);
  }

  if (priceMax) {
    const max = parseFloat(priceMax as string);
    products = products.filter((p: any) => (p.priceMax || p.price || 0) <= max);
  }

  const serialized = products.map((p: any) => ({
    id: p.slug || p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.priceMin || p.price || 0),
    priceMax: p.priceMax ? Number(p.priceMax) : null,
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    image: p.image,
    categoryId: '',
    categoryName: typeof p.category === 'object' ? p.category.name : (p.category || ''),
    categorySlug: p.category?.slug || '',
    stock: p.stock || 100,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    isPublished: p.isPublished !== false,
    shippingCost: 0,
    shippingMethod: 'Standard Shipping',
    sku: p.sku,
    material: p.material,
    plating: p.plating,
    process: p.process,
    color: p.color,
    size: p.size,
    packSize: p.packSize || 1,
    moq: p.moq || 1,
    stockStatus: p.stockStatus || 'IN_STOCK',
    authorId: 'seed-system',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return res.json(serialized);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { authorId, categoryId, category, material, plating, color, priceMin, priceMax, all } = req.query;

    if (all === 'true') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }

    try {
      const database = getDatabase();
      
      // Check if database has products
      const dbCountResult = database.prepare('SELECT COUNT(*) as count FROM products').get() as any;
      const dbCount = dbCountResult?.count || 0;
      
      if (dbCount === 0) {
        return getProductsFromFallback(req, res);
      }

      // Build WHERE clause
      const whereConditions: string[] = [];
      const params: any[] = [];

      if (all === 'true') {
        // Show all products including drafts for management
      } else if (authorId) {
        whereConditions.push('authorId = ?');
        params.push(authorId);
      } else {
        whereConditions.push('isPublished = ?');
        params.push(1);
      }

      if (categoryId && categoryId !== 'All') {
        whereConditions.push('categoryId = ?');
        params.push(categoryId);
      }

      if (category && category !== 'all') {
        const catRow = database.prepare('SELECT id, slug FROM categories WHERE slug = ?').get(category as string) as any;
        if (catRow) {
          const allChildIds = getAllCategoryIds(database, catRow.id);
          if (allChildIds.length > 0) {
            const placeholders = allChildIds.map(() => '?').join(',');
            whereConditions.push(`categoryId IN (${placeholders})`);
            params.push(...allChildIds);
          }
        }
      }

      if (material) {
        whereConditions.push('LOWER(material) LIKE ?');
        params.push('%' + String(material).toLowerCase() + '%');
      }

      if (plating) {
        whereConditions.push('LOWER(plating) LIKE ?');
        params.push('%' + String(plating).toLowerCase() + '%');
      }

      if (color) {
        whereConditions.push('LOWER(color) LIKE ?');
        params.push('%' + String(color).toLowerCase() + '%');
      }

      if (priceMin) {
        whereConditions.push('price >= ?');
        params.push(parseFloat(priceMin as string));
      }
      if (priceMax) {
        whereConditions.push('price <= ?');
        params.push(parseFloat(priceMax as string));
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      const sql = `SELECT p.*, c.name as categoryName, c.slug as categorySlug FROM products p LEFT JOIN categories c ON p.categoryId = c.id ${whereClause} ORDER BY p.createdAt DESC`;
      
      const products = database.prepare(sql).all(...params) as any[];

      const serialized = products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.price),
        priceMax: p.priceMax ? Number(p.priceMax) : null,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        image: p.image,
        categoryId: p.categoryId,
        categoryName: p.categoryName || '',
        categorySlug: p.categorySlug || '',
        stock: p.stock,
        rating: Number(p.rating),
        reviewCount: p.reviewCount,
        salesCount: p.salesCount,
        isPublished: Boolean(p.isPublished),
        shippingCost: Number(p.shippingCost),
        shippingMethod: p.shippingMethod || 'Standard Shipping',
        sku: p.sku,
        material: p.material,
        plating: p.plating,
        process: p.process,
        color: p.color,
        size: p.size,
        packSize: p.packSize,
        moq: p.moq,
        stockStatus: p.stockStatus,
        authorId: p.authorId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      return res.json(serialized);
    } catch (e) {
      console.error('Products API error:', e);
      return getProductsFromFallback(req, res);
    }
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only admins can create products (site policy: admin-managed catalog)
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only administrators can create products' });
  }

  if (req.method === 'POST') {
    const {
      name, description, price, originalPrice, image, images,
      categoryId, stock, variants,
      material, plating, process, color, size, packSize,
      pkgLength, pkgWidth, pkgHeight, pkgWeight, keywords,
      stockStatus, moq,
    } = req.body;

    const database = getDatabase();
    
    // Generate slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') + '-' + Date.now().toString(36);
    
    // Find existing admin user
    const admin = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('ADMIN') as any;
    const authorId = admin?.id || session.user.id;
    
    const newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    
    const stmt = database.prepare(
      `INSERT INTO products (
        id, name, slug, description, price, originalPrice, image, images,
        categoryId, stock, isPublished, sku, material, plating, process,
        color, size, packSize, pkgLength, pkgWidth, pkgHeight, pkgWeight,
        keywords, stockStatus, moq, shippingCost, shippingMethod,
        authorId, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now")
      )`
    );
    
    stmt.run(
      newId, name, slug, description || '', toNumber(price),
      originalPrice ? toNumber(originalPrice) : null,
      image || '', images ? JSON.stringify(images) : '[]',
      categoryId || null, parseInt(stock || '100'), 1,
      null, material || null, plating || null, process || null,
      color || null, size || null, packSize ? parseInt(packSize) : 1,
      pkgLength ? toNumber(pkgLength) : null,
      pkgWidth ? toNumber(pkgWidth) : null,
      pkgHeight ? toNumber(pkgHeight) : null,
      pkgWeight ? toNumber(pkgWeight) : null,
      keywords ? JSON.stringify(keywords) : '[]',
      stockStatus || 'IN_STOCK', moq ? parseInt(moq) : 1,
      0, 'Standard Shipping', authorId
    );

    // Create variants
    if (variants && variants.length > 0) {
      const variantStmt = database.prepare(
        'INSERT INTO product_variants (id, productId, color, size, price, stock, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
      );
      for (const v of variants) {
        const variantId = 'var_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        variantStmt.run(variantId, newId, v.color || 'Default', v.size || 'One Size', toNumber(v.price), parseInt(v.stock || '100'));
      }
    } else {
      const variantId = 'var_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      database.prepare(
        'INSERT INTO product_variants (id, productId, color, size, price, stock, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
      ).run(variantId, newId, 'Default', 'One Size', toNumber(price), 100);
    }

    return res.status(201).json({ id: newId, slug });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
