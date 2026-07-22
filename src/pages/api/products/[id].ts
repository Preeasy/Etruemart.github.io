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
    if (!product || (product.authorId !== session.user.id && session.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, description, price, originalPrice, image, images, category, stock, isPublished, shippingCost, shippingMethod, sku, material, moq } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (image !== undefined) data.image = image;
    if (images !== undefined) data.images = images;
    if (category !== undefined) data.category = category;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (shippingCost !== undefined) data.shippingCost = parseFloat(shippingCost);
    if (shippingMethod !== undefined) data.shippingMethod = shippingMethod;
    if (sku !== undefined) data.sku = sku;
    if (material !== undefined) data.material = material;
    if (moq !== undefined) data.moq = parseInt(moq);

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data,
    });

    return res.json(updatedProduct);
  }

  if (req.method === 'DELETE') {
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product || (product.authorId !== session.user.id && session.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.product.delete({ where: { id: id as string } });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
