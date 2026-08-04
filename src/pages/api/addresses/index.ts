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
    const addresses = await prisma.shippingAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return res.json(addresses);
  }

  if (req.method === 'POST') {
    const { fullName, phone, country, state, city, zipCode, address, isDefault } = req.body;
    if (!fullName || !phone || !country || !city || !address) {
      return res.status(400).json({ error: 'fullName, phone, country, city, address are required' });
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await prisma.shippingAddress.create({
      data: {
        userId: session.user.id,
        fullName,
        phone,
        country,
        state: state || null,
        city,
        zipCode: zipCode || null,
        address,
        isDefault: !!isDefault,
      },
    });

    // If this is the first address, make it default
    const count = await prisma.shippingAddress.count({ where: { userId: session.user.id } });
    if (count === 1 && !created.isDefault) {
      await prisma.shippingAddress.update({ where: { id: created.id }, data: { isDefault: true } });
    }

    return res.status(201).json(created);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
