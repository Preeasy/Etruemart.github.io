import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeBulletPoints } from '@/lib/bullet-points';
import { resolveImageUrlServerSide } from '@/lib/image-utils';
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

function convertImageUrl(url: string): string {
  return resolveImageUrlServerSide(url) || '';
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

// Seed data cache
let seedDataCache: { categories: any[]; products: any[] } | null = null;

function loadSeedData(): { categories: any[]; products: any[] } | null {
  if (seedDataCache) return seedDataCache;

  const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    return null;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    seedDataCache = {
      categories: raw.categories || [],
      products: raw.products || [],
    };
    return seedDataCache;
  } catch (e) {
    console.error('Failed to load seed-data.json:', e);
    return null;
  }
}

async function getProductFromSeedData(idStr: string) {
  const seedData = loadSeedData();
  if (!seedData) {
    return null;
  }

  const { categories, products } = seedData;

  // Build category lookup with root resolution
  const slugToCat = new Map<string, any>();
  const idToCat = new Map<string, any>();
  for (const cat of categories) {
    slugToCat.set(cat.slug, cat);
    idToCat.set(cat.id, cat);
  }

  // Resolve to root category (categoryId might be stored as ID or slug depending on source)
  const getRootCat = (catIdOrSlug: string) => {
    let current = idToCat.get(catIdOrSlug) || slugToCat.get(catIdOrSlug);
    while (current && current.parentId) {
      const parent = idToCat.get(current.parentId) || slugToCat.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current;
  };

  // Try to find by slug first, then by id
  const product =
    products.find((p: any) => String(p.slug) === String(idStr)) ||
    products.find((p: any) => String(p.id) === String(idStr)) ||
    products.find((p: any) => String(p.sku) === String(idStr));

  if (!product) return null;

  // Parse images
  let images = product.images;
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch { images = []; }
  }
  if (!Array.isArray(images)) images = [];
  if (product.image && !images.includes(product.image)) {
    images = [product.image, ...images];
  }

  // Parse keywords
  let keywords = product.keywords;
  if (typeof keywords === 'string') {
    try { keywords = JSON.parse(keywords); } catch { keywords = []; }
  }
  if (!Array.isArray(keywords)) keywords = [];

  // Parse aplus — supports both old format and new flat array format.
  // A+ content renders TEXT ONLY (heading + text); image fields are dropped
  // and <img> tags inside text are stripped at render time.
  let aplus = product.aplus;
  let aplusBlocks: { type: string; heading?: string; text?: string }[] = [];
  if (typeof aplus === 'string') {
    try {
      aplus = JSON.parse(aplus);
    } catch { aplus = null; }
  }
  // New format: flat array of {type, heading, text, image}
  if (Array.isArray(aplus)) {
    aplusBlocks = aplus
      .filter((b: any) => b && typeof b.type === 'string')
      .map((b: any) => ({
        type: b.type,
        heading: b.heading,
        text: b.text,
      }));
    aplus = null; // not old format
  }

  // Get category info - use root category
  const catSlug = product.categoryId || '';
  const rootCat = getRootCat(catSlug);
  const directCat = idToCat.get(catSlug) || slugToCat.get(catSlug);
  const resolvedCat = rootCat || directCat;

  // Compute bulletPoints from product data
  const bulletPoints = computeBulletPoints({
    name: product.name,
    material: product.material || null,
    moq: Number(product.moq) || 1,
    categoryId: catSlug,
    aplus,
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: Number(product.price) || 0,
    priceMax: product.priceMax ? Number(product.priceMax) : null,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    image: convertImageUrl(product.image || ''),
    images: (Array.isArray(images) ? images : []).map(convertImageUrl),
    category: resolvedCat ? {
      id: resolvedCat.id || '',
      name: resolvedCat.name || '',
      slug: resolvedCat.slug || catSlug,
    } : null,
    material: product.material || null,
    plating: product.plating || null,
    process: product.process || null,
    color: product.color || null,
    size: product.size || null,
    packSize: Number(product.packSize) || 1,
    moq: Number(product.moq) || 1,
    sku: product.sku || null,
    keywords,
    aplus,
    aplusBlocks,
    bulletPoints,
    rating: Number(product.rating) || 0,
    reviewCount: Number(product.reviewCount) || 0,
    salesCount: Number(product.salesCount) || 0,
    stock: Number(product.stock) || 100,
    stockStatus: product.stockStatus || 'IN_STOCK',
    shippingCost: Number(product.shippingCost) || 0,
    shippingMethod: product.shippingMethod || 'Standard Shipping',
    authorId: product.authorId || 'seed-system',
    packagingInfo: product.packagingInfo || null,
    variants: [{
      id: 'seed-variant-1',
      productId: product.id,
      color: product.color || 'Default',
      size: product.size || 'One Size',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 100,
    }],
    reviews: [],
  };
}

async function getProductFromFallback(idStr: string) {
  // Try seed data first
  const seedProduct = await getProductFromSeedData(idStr);
  if (seedProduct) return seedProduct;

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

  // Parse aplus — A+ renders TEXT ONLY (heading + text); image fields are dropped.
  let aplus: any = product.aplus || null;
  let aplusBlocks: { type: string; heading?: string; text?: string }[] = [];
  if (Array.isArray(aplus)) {
    aplusBlocks = aplus
      .filter((b: any) => b && typeof b.type === 'string')
      .map((b: any) => ({
        type: b.type,
        heading: b.heading,
        text: b.text,
      }));
    aplus = null; // not old format
  }

  return {
    id: product.slug || product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.priceMin || product.price || 0),
    priceMax: product.priceMax ? Number(product.priceMax) : null,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    image: convertImageUrl(product.image),
    images: images.map(convertImageUrl),
    category: (typeof product.category === 'object' && product.category?.name) ? {
      id: '',
      name: product.category.name,
      slug: product.category.slug || '',
    } : null,
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
    aplusBlocks,
    bulletPoints: computeBulletPoints({
      name: product.name,
      material: product.material || null,
      moq: Number(product.moq) || 1,
      categoryId: product.category?.slug || '',
      aplus: Array.isArray(product.aplus) ? null : product.aplus,
    }),
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

    // On Vercel, skip Prisma (SQLite is read-only with stale data) and use seed data directly
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
      // Use seed data on Vercel for instant access to the latest product data
      product = await getProductFromSeedData(idStr);
    } else {
      try {
        product = await findProduct(idStr);
      } catch {}
    }

    // Fallback to seed data / site-data.json
    if (!product) {
      product = await getProductFromFallback(idStr);
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If from fallback, return directly
    if (!('images' in product) || typeof (product as any).images === 'string') {
      const p = product as any;
      const parsedAplus = typeof p.aplus === 'string' ? safeJsonParse(p.aplus, null) : p.aplus;

      // Extract new-format aplus blocks (text-only; image fields dropped).
      let parsedAplusBlocks: { type: string; heading?: string; text?: string }[] = [];
      let normalizedAplus = parsedAplus;
      if (Array.isArray(parsedAplus)) {
        parsedAplusBlocks = parsedAplus
          .filter((b: any) => b && typeof b.type === 'string')
          .map((b: any) => ({
            type: b.type,
            heading: b.heading,
            text: b.text,
          }));
        normalizedAplus = null;
      }

      // Compute bulletPoints
      const bulletPoints = computeBulletPoints({
        name: p.name,
        material: p.material || null,
        moq: Number(p.moq) || 1,
        categoryId: p.categoryId || '',
        aplus: normalizedAplus,
      });

      const rawImages = typeof p.images === 'string'
        ? safeJsonParse(p.images, p.image ? [p.image] : [])
        : (Array.isArray(p.images) ? p.images : [p.image].filter(Boolean));

      const serialized = {
        ...p,
        image: convertImageUrl(p.image || ''),
        images: rawImages.map(convertImageUrl),
        keywords: typeof p.keywords === 'string' ? safeJsonParse(p.keywords, []) : (Array.isArray(p.keywords) ? p.keywords : []),
        aplus: normalizedAplus,
        aplusBlocks: p.aplusBlocks || parsedAplusBlocks,
        packagingInfo: p.packagingInfo || null,
        bulletPoints,
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        rating: Number(p.rating || 0),
      };
      return res.json(serialized);
    }

    // Database product: parse JSON fields
    const p = product as any;
    const parsedAplus = typeof p.aplus === 'string' ? safeJsonParse(p.aplus, null) : p.aplus;

    // Extract new-format aplus blocks (text-only; image fields dropped).
    let parsedAplusBlocks: { type: string; heading?: string; text?: string }[] = [];
    let normalizedAplus = parsedAplus;
    if (Array.isArray(parsedAplus)) {
      parsedAplusBlocks = parsedAplus
        .filter((b: any) => b && typeof b.type === 'string')
        .map((b: any) => ({
          type: b.type,
          heading: b.heading,
          text: b.text,
        }));
      normalizedAplus = null; // not old format
    }

    // Always compute fresh bulletPoints for quality
    const computedBulletPoints = computeBulletPoints({
      name: p.name,
      material: p.material || null,
      moq: Number(p.moq) || 1,
      categoryId: p.categoryId || '',
      aplus: normalizedAplus,
    });

    const serialized = {
      ...p,
      images: typeof p.images === 'string'
        ? safeJsonParse(p.images, [])
        : (Array.isArray(p.images) ? p.images : []),
      keywords: typeof p.keywords === 'string' ? safeJsonParse(p.keywords, []) : p.keywords,
      aplus: normalizedAplus,
      aplusBlocks: p.aplusBlocks || parsedAplusBlocks,
      bulletPoints: computedBulletPoints,
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
