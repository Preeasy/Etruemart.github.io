import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({
      where: { id: id as string },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!order || order.userId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.json(order);
  }

  if (req.method === 'PUT') {
    const { status } = req.body;
    const order = await prisma.order.findUnique({ where: { id: id as string } });
    
    if (!order || order.userId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: { status },
    });

    return res.json(updatedOrder);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
