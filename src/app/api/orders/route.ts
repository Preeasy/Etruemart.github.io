import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

interface OrderItemInput {
  productId: string;
  variationId: string;
  quantity: number;
  price: number;
}

interface CreateOrderBody {
  shippingAddress: string;
  shippingMethod: string;
  shippingFee: number;
  items: OrderItemInput[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = { userId: session.user.id };
    if (status) {
      where.status = status.toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true, variation: true } },
        payment: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      data: { orders, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateOrderBody;
    const { shippingAddress, shippingMethod, shippingFee, items } = body;

    if (!shippingAddress || !shippingMethod || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    for (const item of items) {
      const variation = await prisma.productVariation.findUnique({
        where: { id: item.variationId },
      });
      if (!variation || variation.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: { code: 'OUT_OF_STOCK', message: 'Insufficient stock' } },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const total = item.price * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        price: item.price,
        total,
      };
    });

    const tax = subtotal * 0.08;
    const total = subtotal + shippingFee + tax;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: 'PENDING',
        subtotal,
        shippingFee,
        tax,
        total,
        shippingAddress,
        shippingMethod,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    for (const item of items) {
      await prisma.productVariation.update({
        where: { id: item.variationId },
        data: { stock: { decrement: item.quantity } },
      });
      await prisma.product.update({
        where: { id: item.productId },
        data: { salesCount: { increment: item.quantity } },
      });
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}