import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: true, data: { items: [], total: 0 } });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
        variation: true,
      },
    });

    let total = 0;
    for (const item of cartItems) {
      total += Number(item.variation.price) * item.quantity;
    }

    return NextResponse.json({
      success: true,
      data: { items: cartItems, total, count: cartItems.length },
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

    const body = await request.json();
    const { productId, variationId, quantity } = body;

    if (!productId || !variationId || !quantity) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const variation = await prisma.productVariation.findUnique({
      where: { id: variationId },
      include: { product: true },
    });

    if (!variation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Variation not found' } },
        { status: 404 }
      );
    }

    if (variation.stock < quantity) {
      return NextResponse.json(
        { success: false, error: { code: 'OUT_OF_STOCK', message: 'Insufficient stock' } },
        { status: 400 }
      );
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_variationId: { userId: session.user.id, variationId } },
    });

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          variationId,
          quantity,
        },
      });
    }

    return NextResponse.json({ success: true, data: cartItem });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}