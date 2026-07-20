import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

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

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: 'PUBLISHED' },
      include: {
        user: true,
        orderItem: { include: { variation: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.review.count({
      where: { productId: product.id, status: 'PUBLISHED' },
    });

    return NextResponse.json({
      success: true,
      data: { reviews, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
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

    const body = await request.json();
    const { rating, title, content, images, orderItemId } = body;

    if (!rating || !title || !content || !orderItemId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
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

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ORDER_ITEM', message: 'You can only review products you purchased' } },
        { status: 403 }
      );
    }

    if (orderItem.order.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_COMPLETED', message: 'You can only review after completing the order' } },
        { status: 403 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_orderItemId: { userId: session.user.id, orderItemId } },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: { code: 'REVIEW_EXISTS', message: 'You have already reviewed this product' } },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        orderItemId,
        rating,
        title,
        content,
        images: images || [],
      },
    });

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: 'PUBLISHED' },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
