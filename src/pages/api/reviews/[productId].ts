import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { productId } = req.query;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const reviews = await prisma.review.findMany({
      where: { productId: productId as string },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(reviews);
  }

  if (req.method === 'POST') {
    const { rating, title, content } = req.body;

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: productId as string,
        order: { userId: session.user.id },
      },
    });

    if (!hasPurchased) {
      return res.status(403).json({ error: 'You must purchase this product to review it' });
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: productId as string } },
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: productId as string,
        rating,
        title,
        content,
      },
    });

    const reviews = await prisma.review.findMany({ where: { productId: productId as string } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: productId as string },
      data: { rating: avgRating, reviewCount: reviews.length },
    });

    return res.status(201).json(review);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
