import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Admin-only endpoint for editing / moderating a single review.
// PUT  — edit title/content/rating/isApproved (marks isEdited, sets editedBy)
// DELETE — remove a review
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.query;
  const review = await prisma.review.findUnique({ where: { id: id as string } });
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  if (req.method === 'PUT') {
    const { title, content, rating, isApproved } = req.body;
    const data: any = { isEdited: true, editedBy: session.user.id };

    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (rating !== undefined) {
      const r = Number(rating);
      if (isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      data.rating = r;
    }
    if (isApproved !== undefined) data.isApproved = !!isApproved;

    const updated = await prisma.review.update({
      where: { id: id as string },
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    // Recompute product aggregate rating from approved reviews
    const reviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true },
    });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
    });

    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.review.delete({ where: { id: id as string } });

    // Recompute product aggregate rating
    const reviews = await prisma.review.findMany({
      where: { productId: review.productId, isApproved: true },
    });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
    });

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
