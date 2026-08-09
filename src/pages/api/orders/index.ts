import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateShipping } from '@/lib/shipping';

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
    const {
      shippingAddressId,
      shippingAddress: inlineAddress,
      paymentMethod,
      notes,
    } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true, variant: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Resolve shipping address: prefer address book entry, else inline object
    let addressRecord: any = null;
    let addressSnapshot: string = '';
    let country = '';

    if (shippingAddressId) {
      addressRecord = await prisma.shippingAddress.findFirst({
        where: { id: shippingAddressId, userId: session.user.id },
      });
      if (!addressRecord) {
        return res.status(400).json({ error: 'Shipping address not found' });
      }
      country = addressRecord.country;
      addressSnapshot = JSON.stringify(addressRecord);
    } else if (inlineAddress) {
      // Accept either a JSON string or a structured object
      if (typeof inlineAddress === 'string') {
        try {
          const parsed = JSON.parse(inlineAddress);
          country = parsed.country || '';
          addressSnapshot = inlineAddress;
        } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/orders] silent error:', e?.message || e);
            country = '';
            addressSnapshot = JSON.stringify({ address: inlineAddress 
});
        }
      } else {
        country = inlineAddress.country || '';
        addressSnapshot = JSON.stringify(inlineAddress);
      }
    } else {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!country) {
      return res.status(400).json({ error: 'Country is required in shipping address' });
    }

    // Compute order subtotal
    let totalAmount = 0;
    for (const item of cartItems) {
      const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
      totalAmount += price * item.quantity;
    }

    // Calculate shipping via template (region + weight + volumetric weight)
    const calcItems = cartItems.map((item) => ({
      quantity: item.quantity,
      pkgWeight: item.product.pkgWeight,
      pkgLength: item.product.pkgLength,
      pkgWidth: item.product.pkgWidth,
      pkgHeight: item.product.pkgHeight,
    }));
    const shipping = await calculateShipping({
      items: calcItems,
      country,
      orderSubtotal: totalAmount,
    });

    const shippingCost = shipping.cost;
    const taxAmount = Math.round(totalAmount * 0.08 * 100) / 100;
    const grandTotal = Math.round((totalAmount + shippingCost + taxAmount) * 100) / 100;

    // Create order with UNPAID payment status — payment will be confirmed
    // separately once the merchant provides the payment collection account.
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: grandTotal,
        shippingCost,
        taxAmount,
        shippingAddressId: addressRecord?.id || null,
        shippingAddress: addressSnapshot,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'UNPAID',
        status: 'PENDING',
        notes: notes || null,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant ? Number(item.variant.price) : Number(item.product.price),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Clear the cart after order creation
    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    // Decrement product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return res.status(201).json({
      ...order,
      shippingEstimate: {
        minDays: shipping.minDays,
        maxDays: shipping.maxDays,
        templateName: shipping.templateName,
        region: shipping.region,
        chargeableWeightKg: shipping.chargeableWeightKg,
      },
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
