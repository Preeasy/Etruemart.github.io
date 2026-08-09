import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { seedShippingTemplatesIfEmpty } from '@/lib/shipping';

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET is public (buyers need to see shipping options), but auto-seeds defaults.
  if (req.method === 'GET') {
    try {
      await seedShippingTemplatesIfEmpty();
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/shipping/templates] seed failed:', e?.message || e); }
    const templates = await prisma.shippingTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return res.status(200).json(templates);
  }

  // All mutations require ADMIN
  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'POST') {
    const { name, regions, basePrice, weightRate, volumeRate, freeThreshold, minDays, maxDays, isActive } = req.body;
    if (!name || !regions) {
      return res.status(400).json({ error: 'name and regions are required' });
    }
    const regionsStr = typeof regions === 'string' ? regions : JSON.stringify(regions);
    const created = await prisma.shippingTemplate.create({
      data: {
        name,
        regions: regionsStr,
        basePrice: Number(basePrice) || 0,
        weightRate: Number(weightRate) || 0,
        volumeRate: Number(volumeRate) || 0,
        freeThreshold: freeThreshold === null || freeThreshold === undefined || freeThreshold === '' ? null : Number(freeThreshold),
        minDays: Number(minDays) || 7,
        maxDays: Number(maxDays) || 21,
        isActive: isActive !== false,
      },
    });
    return res.status(201).json(created);
  }

  if (req.method === 'PUT') {
    const { id, name, regions, basePrice, weightRate, volumeRate, freeThreshold, minDays, maxDays, isActive } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (regions !== undefined) data.regions = typeof regions === 'string' ? regions : JSON.stringify(regions);
    if (basePrice !== undefined) data.basePrice = Number(basePrice) || 0;
    if (weightRate !== undefined) data.weightRate = Number(weightRate) || 0;
    if (volumeRate !== undefined) data.volumeRate = Number(volumeRate) || 0;
    if (freeThreshold !== undefined) data.freeThreshold = freeThreshold === null || freeThreshold === '' ? null : Number(freeThreshold);
    if (minDays !== undefined) data.minDays = Number(minDays) || 7;
    if (maxDays !== undefined) data.maxDays = Number(maxDays) || 21;
    if (isActive !== undefined) data.isActive = !!isActive;

    const updated = await prisma.shippingTemplate.update({ where: { id }, data });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await prisma.shippingTemplate.delete({ where: { id: id as string } });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
