import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateShipping } from '@/lib/shipping';

// POST /api/shipping/calculate
// Body: { country: string, items: [{ productId, quantity }] }
// Returns shipping cost based on region, weight and volumetric weight.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { country, items } = req.body;
  if (!country || !Array.isArray(items)) {
    return res.status(400).json({ error: 'country and items are required' });
  }

  try {
    // Resolve product weights & dimensions from the DB
    const productIds = items.map((i: any) => String(i.productId)).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        pkgWeight: true,
        pkgLength: true,
        pkgWidth: true,
        pkgHeight: true,
        packSize: true,
        price: true,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const calcItems = items
      .map((i: any) => {
        const p = productMap.get(String(i.productId));
        if (!p) return null;
        return {
          quantity: Number(i.quantity) || 1,
          pkgWeight: p.pkgWeight,
          pkgLength: p.pkgLength,
          pkgWidth: p.pkgWidth,
          pkgHeight: p.pkgHeight,
        };
      })
      .filter(Boolean) as any[];

    // Compute order subtotal from cart (use DB prices)
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true, variant: true },
    });
    let orderSubtotal = 0;
    for (const item of cartItems) {
      const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
      orderSubtotal += price * item.quantity;
    }
    // Fallback: if cart empty (direct checkout), use provided items
    if (orderSubtotal === 0) {
      for (const i of items) {
        const p = productMap.get(String(i.productId));
        if (p) orderSubtotal += Number(p.price) * (Number(i.quantity) || 1);
      }
    }

    const result = await calculateShipping({
      items: calcItems,
      country,
      orderSubtotal,
    });

    return res.status(200).json({ ...result, orderSubtotal: Math.round(orderSubtotal * 100) / 100 });
  } catch (error) {
    console.error('Shipping calculate error:', error);
    return res.status(500).json({ error: 'Failed to calculate shipping' });
  }
}
