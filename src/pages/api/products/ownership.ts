import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

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
  let product = null;

  try {
    product = await prisma.product.findUnique({ where });
  } catch {}

  // Fallback to site-data.json
  if (!product) {
    const siteDataPath = path.join(process.cwd(), 'site-data.json');
    if (fs.existsSync(siteDataPath)) {
      const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
      const products = siteData.products || [];
      const lookupId = slug || id;
      product = products.find((p: any) => String(p.slug) === String(lookupId)) ||
                 products.find((p: any) => String(p.id) === String(lookupId));
      if (product) {
        product = { ...product, id: product.slug || product.id, authorId: 'seed-system' };
      }
    }
  }

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

  const aplus = product.aplus
    ? (typeof product.aplus === 'string' ? safeJsonParse(product.aplus) : product.aplus)
    : null;
  const images = Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []);
  const keywords = Array.isArray(product.keywords) ? product.keywords : [];

  return res.json({
    isOwner,
    canManage,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    aplus,
    images,
    keywords,
  });
}
