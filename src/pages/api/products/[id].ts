import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        variants: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product || product.authorId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, description, price, originalPrice, image, images, category, stock } = req.body;
    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        image,
        images: images || [],
        category,
        stock: parseInt(stock),
      },
    });

    return res.json(updatedProduct);
  }

  if (req.method === 'DELETE') {
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product || product.authorId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.product.delete({ where: { id: id as string } });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
