import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

function isValidCuid(str: string): boolean {
  return /^c[a-z0-9]{20,}$/.test(str);
}

async function findProduct(idOrSlug: string) {
  if (isValidCuid(idOrSlug)) {
    return prisma.product.findUnique({
      where: { id: idOrSlug },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        variants: true,
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
  return prisma.product.findUnique({
    where: { slug: idOrSlug },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      variants: true,
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

async function findProductForEdit(idOrSlug: string) {
  if (isValidCuid(idOrSlug)) {
    return prisma.product.findUnique({ where: { id: idOrSlug } });
  }
  return prisma.product.findUnique({ where: { slug: idOrSlug } });
}

async function getProductFromFallback(idStr: string) {
  const siteDataPath = path.join(process.cwd(), 'site-data.json');
  if (!fs.existsSync(siteDataPath)) {
    return null;
  }

  const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
  const products = siteData.products || [];

  // Try to find by slug first, then by id
  const product =
    products.find((p: any) => String(p.slug) === String(idStr)) ||
    products.find((p: any) => String(p.id) === String(idStr));

  if (!product) return null;

  const images = Array.isArray(product.images) ? product.images : [product.image];
  const keywords = Array.isArray(product.keywords) ? product.keywords : [];
  const aplus = product.aplus || null;

  return {
    id: product.slug || product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.priceMin || product.price || 0),
    priceMax: product.priceMax ? Number(product.priceMax) : null,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    image: product.image,
    images,
    category: {
      id: '',
      name: typeof product.category === 'object' ? product.category.name : (product.category || ''),
      slug: product.category?.slug || '',
    },
    material: product.material || null,
    plating: product.plating || null,
    process: product.process || null,
    color: product.color || null,
    size: product.size || null,
    packSize: product.packSize || 1,
    moq: product.moq || 1,
    sku: product.sku || null,
    keywords,
    aplus,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    stock: product.stock || 100,
    stockStatus: product.stockStatus || 'IN_STOCK',
    shippingCost: 0,
    shippingMethod: product.shippingMethod || 'Standard Shipping',
    authorId: 'seed-system',
    variants: [{
      id: 'fallback-variant-1',
      productId: product.slug || product.id,
      color: product.color || 'Default',
      size: product.size || 'One Size',
      price: Number(product.priceMin || product.price || 0),
      stock: product.stock || 100,
    }],
    reviews: [],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idStr = id as string;

  if (req.method === 'GET') {
    let product = null;

    try {
      product = await findProduct(idStr);
    } catch {}

    // Fallback to site-data.json
    if (!product) {
      product = await getProductFromFallback(idStr);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If from fallback, return directly
    if (!('images' in product) || typeof (product as any).images === 'string') {
      const serialized = {
        ...product,
        images: Array.isArray((product as any).images) ? (product as any).images : [(product as any).image],
        keywords: Array.isArray((product as any).keywords) ? (product as any).keywords : [],
        aplus: (product as any).aplus || null,
        price: Number((product as any).price),
        originalPrice: (product as any).originalPrice ? Number((product as any).originalPrice) : null,
        rating: Number((product as any).rating || 0),
      };
      return res.json(serialized);
    }

    // Database product: parse JSON fields
    const p = product as any;
    const parsedAplus = typeof p.aplus === 'string' ? safeJsonParse(p.aplus, null) : p.aplus;
    const serialized = {
      ...p,
      images: typeof p.images === 'string' ? safeJsonParse(p.images, []) : p.images,
      keywords: typeof p.keywords === 'string' ? safeJsonParse(p.keywords, []) : p.keywords,
      aplus: parsedAplus,
      bulletPoints: Array.isArray(p.bulletPoints) && p.bulletPoints.length > 0
        ? p.bulletPoints
        : (parsedAplus?.bulletPoints || []),
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      rating: Number(p.rating),
      variants: p.variants?.map((v: any) => ({ ...v, price: Number(v.price) })) || [],
    };

    return res.json(serialized);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    // Only admins can edit products (site policy: admin-managed catalog)
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can edit products' });
    }

    const product = await findProductForEdit(idStr);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      name, description, price, originalPrice, image, images, categoryId, stock,
      isPublished, shippingCost, shippingMethod, sku, material, moq,
      plating, process, color, size, packSize,
      pkgLength, pkgWidth, pkgHeight, pkgWeight,
      keywords, stockStatus, aplus,
    } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (image !== undefined) data.image = image;
    if (images !== undefined) data.images = typeof images === 'string' ? images : JSON.stringify(images || []);
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (shippingCost !== undefined) data.shippingCost = parseFloat(shippingCost);
    if (shippingMethod !== undefined) data.shippingMethod = shippingMethod;
    if (sku !== undefined) data.sku = sku;
    if (material !== undefined) data.material = material;
    if (moq !== undefined) data.moq = parseInt(moq);
    if (plating !== undefined) data.plating = plating;
    if (process !== undefined) data.process = process;
    if (color !== undefined) data.color = color;
    if (size !== undefined) data.size = size;
    if (packSize !== undefined) data.packSize = parseInt(packSize);
    if (pkgLength !== undefined) data.pkgLength = pkgLength ? parseFloat(pkgLength) : null;
    if (pkgWidth !== undefined) data.pkgWidth = pkgWidth ? parseFloat(pkgWidth) : null;
    if (pkgHeight !== undefined) data.pkgHeight = pkgHeight ? parseFloat(pkgHeight) : null;
    if (pkgWeight !== undefined) data.pkgWeight = pkgWeight ? parseFloat(pkgWeight) : null;
    if (keywords !== undefined) data.keywords = typeof keywords === 'string' ? keywords : JSON.stringify(keywords || []);
    if (stockStatus !== undefined) data.stockStatus = stockStatus;
    if (aplus !== undefined) data.aplus = aplus === null ? null : (typeof aplus === 'string' ? aplus : JSON.stringify(aplus));

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data,
    });

    return res.json(updatedProduct);
  }

  if (req.method === 'DELETE') {
    // Only admins can delete products (site policy: admin-managed catalog)
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only administrators can delete products' });
    }

    const product = await findProductForEdit(idStr);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: product.id } });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
