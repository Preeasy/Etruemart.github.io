import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

interface VariationInput {
  color: string;
  size: string;
  price: number;
  stock?: number;
  image?: string;
  skuSuffix: string;
}

interface CreateProductBody {
  name: string;
  sku: string;
  category: string;
  description: string;
  material?: string;
  moq?: number;
  priceMin: number;
  priceMax: number;
  mainImage: string;
  shopId: string;
  variations?: VariationInput[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: Record<string, unknown> = { status: 'ACTIVE' };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variations: true,
        reviews: { take: 1 },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      data: { products, total, page, limit, totalPages: Math.ceil(total / limit) },
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
    const body = (await request.json()) as CreateProductBody;
    const { name, sku, category, description, material, moq, priceMin, priceMax, mainImage, shopId, variations } = body;

    if (!name || !sku || !category || !priceMin || !priceMax || !mainImage || !shopId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: { code: 'SKU_EXISTS', message: 'SKU already exists' } },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        slug,
        category,
        description,
        material,
        moq,
        priceMin,
        priceMax,
        mainImage,
        shopId,
        variations: variations
          ? {
              create: variations.map((v) => ({
                color: v.color,
                size: v.size,
                price: v.price,
                stock: v.stock || 0,
                image: v.image,
                skuSuffix: v.skuSuffix,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}