import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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

    try {
      const dbCount = await prisma.category.count();
      if (dbCount === 0) {
        return res.json(await getCategoriesFromFallback(level as string | undefined));
      }

      if (level === '1') {
        const categories = await prisma.category.findMany({
          where: { parentId: null },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true, description: true, image: true, sortOrder: true },
        });
        return res.json(categories);
      }

      const allCategories = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true, name: true, slug: true, description: true, image: true,
          parentId: true, sortOrder: true, seoTitle: true, seoDesc: true,
        },
      });

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
      return res.json(await getCategoriesFromFallback(level as string | undefined));
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

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
      },
    });

    return res.status(201).json(category);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
