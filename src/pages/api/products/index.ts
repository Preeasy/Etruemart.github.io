import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { authorId, category } = req.query;

    const where: any = { isPublished: true };
    
    if (authorId) {
      where.authorId = authorId as string;
    }
    
    if (category && category !== 'All') {
      where.category = category as string;
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(products);
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { name, description, price, originalPrice, image, images, category, stock, variants } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image,
        images: images || [],
        category,
        stock: parseInt(stock),
        authorId: session.user.id,
        variants: variants ? { create: variants } : undefined,
      },
    });

    return res.status(201).json(product);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
