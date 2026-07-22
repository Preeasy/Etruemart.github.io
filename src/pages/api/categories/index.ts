import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { level } = req.query;

    if (level === '1') {
      // Return only top-level categories (no parent)
      const categories = await prisma.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true, description: true, image: true, sortOrder: true },
      });
      return res.json(categories);
    }

    // Default: return full category tree
    const allCategories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        sortOrder: true,
        seoTitle: true,
        seoDesc: true,
      },
    });

    // Build tree structure
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
