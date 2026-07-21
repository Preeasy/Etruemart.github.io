import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const products = await prisma.product.findMany({
      where: { authorId: session.user.id },
      include: { variants: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(products);
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
