import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: product.id,
        order: {
          userId: session.user.id,
          status: 'COMPLETED',
        },
      },
      select: { id: true },
    });

    const existingReviews = await prisma.review.findMany({
      where: {
        userId: session.user.id,
        orderItemId: { in: orderItems.map((item: { id: string }) => item.id) },
      },
      select: { orderItemId: true },
    });

    const existingOrderItemIds = existingReviews.map((r: { orderItemId: string }) => r.orderItemId);
    const availableOrderItemIds = orderItems
      .map((item: { id: string }) => item.id)
      .filter((id: string) => !existingOrderItemIds.includes(id));

    return NextResponse.json({
      success: true,
      data: {
        canReview: availableOrderItemIds.length > 0,
        orderItemIds: availableOrderItemIds,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
