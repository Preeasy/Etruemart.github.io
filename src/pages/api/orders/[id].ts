import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const VALID_PAYMENT_STATUSES = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const isAdmin = session.user.role === 'ADMIN';

  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: {
        items: { include: { product: true, variant: true } },
        address: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Admin can view any order; users only their own
    if (order.userId !== session.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(order);
  }

  if (req.method === 'PUT') {
    const { status, paymentStatus, paymentId, paymentMethod, notes, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({ where: { id: id as string } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only the order owner can cancel their own unpaid order; status/payment
    // transitions otherwise require admin.
    const isOwner = order.userId === session.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const data: any = {};
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      // Non-admins may only cancel their own unpaid orders
      if (!isAdmin && status !== 'CANCELLED') {
        return res.status(403).json({ error: 'Only administrators can change order status' });
      }
      if (!isAdmin && order.paymentStatus !== 'UNPAID') {
        return res.status(403).json({ error: 'Cannot cancel a paid order' });
      }
      data.status = status;
    }
    if (paymentStatus !== undefined) {
      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ error: 'Invalid payment status value' });
      }
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can change payment status' });
      }
      data.paymentStatus = paymentStatus;
    }
    if (paymentId !== undefined && isAdmin) data.paymentId = paymentId;
    if (paymentMethod !== undefined && isAdmin) data.paymentMethod = paymentMethod;
    if (notes !== undefined) data.notes = notes;

    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data,
      include: { items: { include: { product: true } } },
    });

    return res.json(updatedOrder);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
