import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, id } = req.query as { slug?: string; id?: string };
  if (!slug && !id) {
    return res.status(400).json({ error: 'slug or id parameter required' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.json({ isOwner: false, canManage: false });
  }

  const where = slug ? { slug } : { id };
  const product = await prisma.product.findUnique({ where });

  if (!product) {
    return res.json({ isOwner: false, canManage: false, productId: null });
  }

  const userId = session.user.id;
  const role = (session.user as any).role || '';
  const isOwner = product.authorId === userId;
  const canManage = role === 'ADMIN' || role === 'OFFICIAL_SELLER' || isOwner;

  const safeJsonParse = (str: string | null | undefined) => {
    if (!str) return null;
    try { return JSON.parse(str); } catch { return null; }
  };

  return res.json({
    isOwner,
    canManage,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    aplus: safeJsonParse(product.aplus),
    images: safeJsonParse(product.images) || [],
    keywords: safeJsonParse(product.keywords) || [],
  });
}
