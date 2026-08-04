import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  // Verify ownership
  const existing = await prisma.shippingAddress.findUnique({ where: { id: id as string } });
  if (!existing || existing.userId !== session.user.id) {
    return res.status(404).json({ error: 'Address not found' });
  }

  if (req.method === 'PUT') {
    const { fullName, phone, country, state, city, zipCode, address, isDefault } = req.body;

    // If setting as default, unset other defaults first
    if (isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.shippingAddress.update({
      where: { id: id as string },
      data: {
        ...(fullName !== undefined ? { fullName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(state !== undefined ? { state: state || null } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(zipCode !== undefined ? { zipCode: zipCode || null } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(isDefault !== undefined ? { isDefault: !!isDefault } : {}),
      },
    });
    return res.json(updated);
  }

  if (req.method === 'DELETE') {
    await prisma.shippingAddress.delete({ where: { id: id as string } });
    // If deleted address was default, promote the most recent remaining address
    const remaining = await prisma.shippingAddress.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (remaining && !await prisma.shippingAddress.findFirst({ where: { userId: session.user.id, isDefault: true } })) {
      await prisma.shippingAddress.update({ where: { id: remaining.id }, data: { isDefault: true } });
    }
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
