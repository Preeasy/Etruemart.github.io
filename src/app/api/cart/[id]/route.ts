import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { variation: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart item not found' } },
        { status: 404 }
      );
    }

    if (cartItem.variation.stock < quantity) {
      return NextResponse.json(
        { success: false, error: { code: 'OUT_OF_STOCK', message: 'Insufficient stock' } },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Cart item not found' } },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Item removed' });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}