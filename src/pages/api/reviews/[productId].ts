import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { productId } = req.query;
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';

  if (req.method === 'GET') {
    // Public users only see approved reviews; admins see all.
    const where: any = { productId: productId as string };
    if (!isAdmin) where.isApproved = true;

    const reviews = await prisma.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(reviews);
  }

  if (req.method === 'POST') {
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { rating, title, content } = req.body;
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    // Buyer must have purchased this product to review it
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: productId as string,
        order: { userId: session.user.id },
      },
    });

    if (!hasPurchased && !isAdmin) {
      return res.status(403).json({ error: 'You must purchase this product to review it' });
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: productId as string } },
    });

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    // New reviews are approved by default (admin can unapprove later),
    // except spam-prone first reviews which require approval.
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: productId as string,
        rating: ratingNum,
        title,
        content,
        isApproved: true,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Recompute product aggregate rating from approved reviews
    const reviews = await prisma.review.findMany({
      where: { productId: productId as string, isApproved: true },
    });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    await prisma.product.update({
      where: { id: productId as string },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
    });

    return res.status(201).json(review);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
