import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        variations: true,
        reviews: {
          include: {
            user: true,
            orderItem: { include: { variation: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        shop: true,
        aplus: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { name, description, priceMin, priceMax, mainImage, status } = body;

    const product = await prisma.product.update({
      where: { slug: params.slug },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(priceMin && { priceMin }),
        ...(priceMax && { priceMax }),
        ...(mainImage && { mainImage }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.product.delete({ where: { slug: params.slug } });
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}