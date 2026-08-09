import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { resolveImageUrlServerSide } from '@/lib/image-utils';
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

// 一次性加载所有分类，在内存中递归收集子分类 ID，避免 N+1 查询
function getAllCategoryIds(database: any, parentId: string): string[] {
  const allCats = database.prepare('SELECT id, parentId FROM categories').all() as any[];
  const childrenMap = new Map<string, string[]>();
  for (const c of allCats) {
    const pid = c.parentId;
    if (pid) {
      const arr = childrenMap.get(pid) || [];
      arr.push(c.id);
      childrenMap.set(pid, arr);
    }
  }
  const result: string[] = [parentId];
  const stack = [parentId];
  while (stack.length > 0) {
    const cur = stack.pop()!;
    const kids = childrenMap.get(cur);
    if (kids) {
      for (const k of kids) {
        result.push(k);
        stack.push(k);
      }
    }
  }
  return result;
}

// Seed data cache - loaded once per process
let seedDataCache: { categories: any[]; products: any[] } | null = null;

function loadSeedData(): { categories: any[]; products: any[] } | null {
  if (seedDataCache) return seedDataCache;

  const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    return null;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    seedDataCache = {
      categories: raw.categories || [],
      products: raw.products || [],
    };
    return seedDataCache;
  } catch (e) {
    console.error('Failed to load seed-data.json:', e);
    return null;
  }
}

// Build a map from category slug -> category info (including children slugs)
function buildCategoryMap(categories: any[]) {
  const slugToCat = new Map<string, any>();
  const idToCat = new Map<string, any>();

  for (const cat of categories) {
    slugToCat.set(cat.slug, cat);
    idToCat.set(cat.id, cat);
  }

  // For a given category slug or id, return all CATEGORY IDs that fall under it (itself + all descendants)
  // This is used for filtering: product.categoryId (an ID) must be in the resulting IDs
  const getDescendantCategoryIds = (catIdOrSlug: string): string[] => {
    const cat = idToCat.get(catIdOrSlug) || slugToCat.get(catIdOrSlug);
    if (!cat) return [catIdOrSlug];

    const result: string[] = [cat.id];
    const children = categories.filter(c => c.parentId === cat.id);
    for (const child of children) {
      result.push(...getDescendantCategoryIds(child.id));
    }
    return result;
  };

  // Also build parent lookup: for each category id, find the root category
  const getRootCat = (catIdOrSlug: string): any | null => {
    let current = idToCat.get(catIdOrSlug) || slugToCat.get(catIdOrSlug);
    while (current && current.parentId) {
      const parent = idToCat.get(current.parentId) || slugToCat.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current || null;
  };

  return { slugToCat, idToCat, getDescendantCategoryIds, getRootCat };
}

function convertImageUrl(url: string): string {
  return resolveImageUrlServerSide(url) || '';
}

function getProductsFromSeedData(req: NextApiRequest, res: NextApiResponse) {
  const seedData = loadSeedData();
  if (!seedData) {
    return res.json([]);
  }

  const { categories, products } = seedData;
  const { slugToCat, idToCat, getDescendantCategoryIds, getRootCat } = buildCategoryMap(categories);

  const { category, material, plating, color, priceMin, priceMax, all, includeChildren } = req.query;

  let filtered = products.filter((p: any) => {
    // Filter by isPublished (unless all=true for admin)
    if (all !== 'true' && p.isPublished === false) return false;

    // ========== Variant filtering: hide child products from list (unless includeChildren=true) ==========
    // Only show parent products (isParent=true) and standalone products (no parentId)
    if (all !== 'true' && includeChildren !== 'true' && p.parentId) return false;

    // Category filtering
    if (category && category !== 'all') {
      const productCatId = p.categoryId || '';
      // Get all category IDs under the selected category (including the selected category itself)
      const validCategoryIds = getDescendantCategoryIds(String(category));
      // Check if the product's categoryId is in the valid ID set (directly or as descendant)
      if (!validCategoryIds.includes(productCatId)) {
        // Also check by root slug match for legacy data
        const rootCat = getRootCat(productCatId);
        const selectedRootCat = getRootCat(String(category));
        if (!(rootCat && selectedRootCat && rootCat.id === selectedRootCat.id)) {
          return false;
        }
      }
    }

    if (material) {
      const m = String(material).toLowerCase();
      if (!(p.material || '').toLowerCase().includes(m)) return false;
    }

    if (plating) {
      const pl = String(plating).toLowerCase();
      if (!(p.plating || '').toLowerCase().includes(pl)) return false;
    }

    if (color) {
      const c = String(color).toLowerCase();
      if (!(p.color || '').toLowerCase().includes(c)) return false;
    }

    if (priceMin) {
      const min = parseFloat(priceMin as string);
      const price = p.price ?? 0;
      if (price < min) return false;
    }

    if (priceMax) {
      const max = parseFloat(priceMax as string);
      const price = p.priceMax ?? p.price ?? 0;
      if (price > max) return false;
    }

    return true;
  });

  // ========== Build parent→children map for variant previews ==========
  const parentChildrenMap = new Map<string, any[]>();
  for (const p of products) {
    if (p.parentId) {
      const key = String(p.parentId);
      if (!parentChildrenMap.has(key)) parentChildrenMap.set(key, []);
      parentChildrenMap.get(key)!.push(p);
    }
  }

  const serialized = filtered.map((p: any) => {
    const catId = p.categoryId || '';
    const cat = idToCat.get(catId) || slugToCat.get(catId);
    const rootCat = cat ? getRootCat(catId) : null;

    let images = p.images;
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }
    if (!Array.isArray(images)) images = [];

    let keywords = p.keywords;
    if (typeof keywords === 'string') {
      try { keywords = JSON.parse(keywords); } catch { keywords = []; }
    }
    if (!Array.isArray(keywords)) keywords = [];

    // Build variant previews for parent products
    let variantPreviews: any[] | undefined = undefined;
    if (p.isParent === true) {
      const children = parentChildrenMap.get(String(p.id));
      if (children && children.length > 0) {
        variantPreviews = children.map((c: any) => {
          let opts: any = {};
          if (c.variantOptions) {
            try { opts = typeof c.variantOptions === 'string' ? JSON.parse(c.variantOptions) : c.variantOptions; } catch {}
          }
          return {
            id: c.id,
            sku: c.sku,
            slug: c.slug,
            color: opts.color || c.color || null,
            size: opts.size || c.size || null,
            capacity: opts.capacity || null,
            layer: opts.layer || null,
            pack: opts.pack || null,
            price: Number(c.priceMin ?? c.price ?? 0),
            image: convertImageUrl(c.image || ''),
          };
        });
      }
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: Number(p.price) || 0,
      priceMax: p.priceMax ? Number(p.priceMax) : null,
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      image: convertImageUrl(p.image || ''),
      categoryId: catId,
      categoryName: cat?.name || rootCat?.name || '',
      categorySlug: cat?.slug || rootCat?.slug || catId,
      stock: p.stock ?? 100,
      rating: Number(p.rating) || 0,
      reviewCount: Number(p.reviewCount) || 0,
      salesCount: Number(p.salesCount) || 0,
      isPublished: p.isPublished !== false,
      shippingCost: Number(p.shippingCost) || 0,
      shippingMethod: p.shippingMethod || 'Standard Shipping',
      sku: p.sku || null,
      material: p.material || null,
      plating: p.plating || null,
      process: p.process || null,
      color: p.color || null,
      size: p.size || null,
      packSize: Number(p.packSize) || 1,
      moq: Number(p.moq) || 1,
      stockStatus: p.stockStatus || 'IN_STOCK',
      authorId: p.authorId || 'seed-system',
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      images,
      keywords,
      isParent: p.isParent === true,
      parentId: p.parentId || null,
      variants: variantPreviews,
    };
  });

  return res.json(serialized);
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
    image: convertImageUrl(p.image),
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

    // Detect Vercel environment - always use seed data on Vercel since SQLite is read-only
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      // On Vercel, always use seed-data.json (SQLite is read-only and may have stale data)
      return getProductsFromSeedData(req, res);
    }

    try {
      const database = getDatabase();
      
      // Check if database has products
      const dbCountResult = database.prepare('SELECT COUNT(*) as count FROM products').get() as any;
      const dbCount = dbCountResult?.count || 0;
      
      if (dbCount === 0) {
        // No products in SQLite, use seed data
        return getProductsFromSeedData(req, res);
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
        // Hide child products (parentId IS NOT NULL) from public list
        whereConditions.push('(parentId IS NULL OR parentId = "")');
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
        image: convertImageUrl(p.image),
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
        isParent: Boolean(p.isParent),
        parentId: p.parentId || null,
      }));

      return res.json(serialized);
    } catch (e) {
      console.error('Products API error:', e);
      // Fall back to seed data or site-data.json
      try {
        return getProductsFromSeedData(req, res);
      } catch {
        return getProductsFromFallback(req, res);
      }
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
