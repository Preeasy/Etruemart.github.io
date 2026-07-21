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

  if (req.method === 'PUT') {
    const { quantity } = req.body;
    const item = await prisma.cartItem.findUnique({ where: { id: id as string } });
    
    if (!item || item.userId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: id as string } });
      return res.status(204).end();
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: id as string },
      data: { quantity },
    });

    return res.json(updatedItem);
  }

  if (req.method === 'DELETE') {
    const item = await prisma.cartItem.findUnique({ where: { id: id as string } });
    
    if (!item || item.userId !== session.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.cartItem.delete({ where: { id: id as string } });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
