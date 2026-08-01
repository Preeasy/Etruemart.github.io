import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const SHIPPING_DATA_PATH = path.join(process.cwd(), 'shipping-data.json');

const readShippingData = () => {
  try {
    const raw = fs.readFileSync(SHIPPING_DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { carriers: [], updatedAt: new Date().toISOString() };
  }
};

const writeShippingData = (data: any) => {
  fs.writeFileSync(SHIPPING_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'OFFICIAL_SELLER')) {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const data = readShippingData();
    return res.status(200).json(data);
  }

  // All mutations require auth
  if (!await requireAdmin(req, res)) return;

  if (req.method === 'POST') {
    const data = readShippingData();
    const newCarrier = req.body;
    if (!newCarrier.id) {
      newCarrier.id = `carrier-${Date.now()}`;
    }
    data.carriers.push(newCarrier);
    data.updatedAt = new Date().toISOString();
    writeShippingData(data);
    return res.status(201).json(newCarrier);
  }

  if (req.method === 'PUT') {
    const data = readShippingData();
    const updatedCarrier = req.body;
    const idx = data.carriers.findIndex((c: any) => c.id === updatedCarrier.id);
    if (idx === -1) return res.status(404).json({ error: 'Carrier not found' });
    data.carriers[idx] = updatedCarrier;
    data.updatedAt = new Date().toISOString();
    writeShippingData(data);
    return res.status(200).json(updatedCarrier);
  }

  if (req.method === 'DELETE') {
    const data = readShippingData();
    const { id } = req.query;
    data.carriers = data.carriers.filter((c: any) => c.id !== id);
    data.updatedAt = new Date().toISOString();
    writeShippingData(data);
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
