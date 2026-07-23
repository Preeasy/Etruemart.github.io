import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({
      where: { id: id as string },
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

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const serializedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      keywords: product.keywords ? JSON.parse(product.keywords) : [],
      aplus: product.aplus ? JSON.parse(product.aplus) : null,
    };

    return res.json(serializedProduct);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Permission check: ADMIN can edit anything; others must be the author
    if (product.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Seller permission: non-ADMIN cannot change categoryId to a category outside their allowedCategoryId
    if (session.user.role !== 'ADMIN' && session.user.allowedCategoryId) {
      // If updating categoryId, must match allowedCategoryId
      const newCategoryId = req.body.categoryId;
      if (newCategoryId && newCategoryId !== session.user.allowedCategoryId) {
        return res.status(403).json({ error: 'You can only assign products to your allowed category' });
      }
      // If not updating categoryId, existing product must already be in allowedCategoryId
      if (!newCategoryId && product.categoryId !== session.user.allowedCategoryId) {
        return res.status(403).json({ error: 'You can only edit products in your allowed category' });
      }
    }

    const {
      name, description, price, originalPrice, image, images, categoryId, stock,
      isPublished, shippingCost, shippingMethod, sku, material, moq,
      plating, process, color, size, packSize,
      pkgLength, pkgWidth, pkgHeight, pkgWeight,
      keywords, stockStatus,
    } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (image !== undefined) data.image = image;
    if (images !== undefined) data.images = typeof images === 'string' ? images : JSON.stringify(images);
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
    if (keywords !== undefined) data.keywords = typeof keywords === 'string' ? keywords : JSON.stringify(keywords);
    if (stockStatus !== undefined) data.stockStatus = stockStatus;

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data,
    });

    return res.json(updatedProduct);
  }

  if (req.method === 'DELETE') {
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product || (product.authorId !== session.user.id && session.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.product.delete({ where: { id: id as string } });
    return res.status(204).end();
  }

  res.status(405).json({ error: 'Method not allowed' });
}
