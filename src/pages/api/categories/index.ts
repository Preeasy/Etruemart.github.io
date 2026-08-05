import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

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

function getCategoriesFromSeedData(level?: string) {
  const seedData = loadSeedData();
  if (!seedData) {
    return [];
  }

  const { categories, products } = seedData;

  // Count products per category slug
  const productCountBySlug = new Map<string, number>();
  for (const p of products) {
    const catSlug = p.categoryId;
    if (catSlug) {
      productCountBySlug.set(catSlug, (productCountBySlug.get(catSlug) || 0) + 1);
    }
  }

  // Build category lookup for descendant computation (shared by both level=1 and tree)
  const slugToCat = new Map<string, any>();
  const idToSlug = new Map<string, string>();
  for (const cat of categories) {
    slugToCat.set(cat.slug, cat);
    idToSlug.set(cat.id, cat.slug);
  }

  // Compute all descendant slugs for each category
  const getDescendantSlugs = (catSlug: string): string[] => {
    const result = [catSlug];
    const cat = slugToCat.get(catSlug);
    if (!cat) return result;
    const children = categories.filter(c => c.parentId === cat.id);
    for (const child of children) {
      result.push(...getDescendantSlugs(child.slug));
    }
    return result;
  };

  if (level === '1') {
    const rootCats = categories
      .filter((c: any) => !c.parentId)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((c: any) => {
        const descendants = getDescendantSlugs(c.slug);
        let count = 0;
        for (const slug of descendants) {
          count += productCountBySlug.get(slug) || 0;
        }
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || null,
          image: c.image || null,
          sortOrder: c.sortOrder || 0,
          productCount: count,
        };
      });

    // Sort by product count descending, then sort order
    rootCats.sort((a, b) => {
      if (b.productCount !== a.productCount) return b.productCount - a.productCount;
      return a.sortOrder - b.sortOrder;
    });

    return rootCats;
  }

  // Compute product count including descendants
  const getTotalProductCount = (catSlug: string): number => {
    const descendantSlugs = getDescendantSlugs(catSlug);
    let total = 0;
    for (const slug of descendantSlugs) {
      total += productCountBySlug.get(slug) || 0;
    }
    return total;
  };

  const roots = categories
    .filter((c: any) => !c.parentId)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      image: c.image || null,
      parentId: null,
      sortOrder: c.sortOrder || 0,
      seoTitle: c.seoTitle || null,
      seoDesc: c.seoDesc || null,
      productCount: getTotalProductCount(c.slug),
      children: categories
        .filter((child: any) => child.parentId === c.id)
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((child: any) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description || null,
          image: child.image || null,
          parentId: c.id,
          sortOrder: child.sortOrder || 0,
          seoTitle: child.seoTitle || null,
          seoDesc: child.seoDesc || null,
          productCount: productCountBySlug.get(child.slug) || 0,
          children: [],
        })),
    }));

  return roots;
}

async function getCategoriesFromFallback(level?: string) {
  const catDataPath = path.join(process.cwd(), 'categories-data.json');
  if (!fs.existsSync(catDataPath)) {
    return [];
  }
  const catData = JSON.parse(fs.readFileSync(catDataPath, 'utf-8'));
  const categories = catData.categories || [];

  if (level === '1') {
    return categories
      .filter((c: any) => !c.parentId)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((c: any) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        image: c.image || null,
        sortOrder: c.sortOrder || 0,
      }));
  }

  const roots = categories
    .filter((c: any) => !c.parentId)
    .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((c: any) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      image: c.image || null,
      parentId: null,
      sortOrder: c.sortOrder || 0,
      seoTitle: c.seoTitle || null,
      seoDesc: c.seoDesc || null,
      children: categories
        .filter((child: any) => child.parentId === c.slug)
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((child: any) => ({
          id: child.slug,
          name: child.name,
          slug: child.slug,
          description: child.description || null,
          image: child.image || null,
          parentId: c.slug,
          sortOrder: child.sortOrder || 0,
          seoTitle: child.seoTitle || null,
          seoDesc: child.seoDesc || null,
          children: [],
        })),
    }));

  return roots;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { level } = req.query;

    // Detect Vercel environment - always use seed data on Vercel
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      // On Vercel, always use seed-data.json (SQLite is read-only)
      return res.json(await getCategoriesFromSeedData(level as string | undefined));
    }

    try {
      const database = getDatabase();
      const dbCount = database.prepare('SELECT COUNT(*) as count FROM categories').get() as any;
      
      if (!dbCount || dbCount.count === 0) {
        return res.json(await getCategoriesFromSeedData(level as string | undefined));
      }

      if (level === '1') {
        const categories = database.prepare(
          `SELECT c.id, c.name, c.slug, c.description, c.image, c.sortOrder,
            (SELECT COUNT(*) FROM products WHERE categoryId = c.id) as productCount
           FROM categories c WHERE c.parentId IS NULL
           ORDER BY productCount DESC, c.sortOrder ASC`
        ).all();
        return res.json(categories);
      }

      const allCategories = database.prepare(
        'SELECT id, name, slug, description, image, parentId, sortOrder, seoTitle, seoDesc FROM categories ORDER BY sortOrder ASC'
      ).all() as any[];

      const categoryMap = new Map<string, any>();
      const roots: any[] = [];

      for (const cat of allCategories) {
        categoryMap.set(cat.id, { ...cat, children: [] });
      }

      for (const cat of allCategories) {
        const node = categoryMap.get(cat.id);
        if (cat.parentId && categoryMap.has(cat.parentId)) {
          categoryMap.get(cat.parentId).children.push(node);
        } else {
          roots.push(node);
        }
      }

      return res.json(roots);
    } catch {
      // Try seed data first, then fallback
      try {
        return res.json(await getCategoriesFromSeedData(level as string | undefined));
      } catch {
        return res.json(await getCategoriesFromFallback(level as string | undefined));
      }
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only ADMIN can create categories' });
    }

    const { name, slug, description, image, parentId, sortOrder, seoTitle, seoDesc } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    const database = getDatabase();
    const stmt = database.prepare(
      'INSERT INTO categories (id, name, slug, description, image, parentId, sortOrder, seoTitle, seoDesc, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\"now\"), datetime(\"now\"))'
    );
    const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    stmt.run(id, name, slug, description || null, image || null, parentId || null, sortOrder || 0, seoTitle || null, seoDesc || null);

    return res.status(201).json({
      id, name, slug, description: description || null, image: image || null,
      parentId: parentId || null, sortOrder: sortOrder || 0,
      seoTitle: seoTitle || null, seoDesc: seoDesc || null,
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
