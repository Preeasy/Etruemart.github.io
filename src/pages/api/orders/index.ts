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
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  }

  if (req.method === 'POST') {
    const { shippingAddress, paymentMethod } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      const price = item.variant ? item.variant.price : item.product.price;
      totalAmount += parseFloat(price.toString()) * item.quantity;
    }

    const shippingCost = totalAmount > 50 ? 0 : 5;
    const taxAmount = totalAmount * 0.08;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: totalAmount + shippingCost + taxAmount,
        shippingCost,
        taxAmount,
        shippingAddress,
        paymentMethod,
        status: 'PAID',
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant ? item.variant.price : item.product.price,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    return res.status(201).json(order);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
