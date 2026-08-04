import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Preeasy/images/main';

// Known image mappings for YCS products (from GitHub repository)
const KNOWN_IMAGE_MAPPINGS: Record<string, string> = {
  // Add specific mappings here if needed
};

function convertImageUrl(localPath: string, sku?: string): string {
  if (!localPath || localPath.startsWith('http')) {
    return localPath || '/images/product-placeholder.svg';
  }
  
  // Extract filename from local path
  const filename = localPath.split('/').pop() || '';
  
  // Remove extension for matching
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  
  // If it's an item-list image, convert to GitHub URL directly
  if (localPath.includes('/images/item-list/')) {
    // The filename in the path should match the GitHub file
    return `${GITHUB_RAW_BASE}/Images/${filename}`;
  }
  
  // If it's a products image, try to match by SKU
  if (localPath.includes('/images/products/')) {
    // First check if we have a known mapping
    if (sku && KNOWN_IMAGE_MAPPINGS[sku]) {
      return KNOWN_IMAGE_MAPPINGS[sku];
    }
    
    // Try to match by SKU (YCS products)
    if (sku && sku.startsWith('YCS')) {
      // Try common extensions
      return `${GITHUB_RAW_BASE}/Images/${sku}.png`;
    }
    
    // For products images, try using the filename directly
    return `${GITHUB_RAW_BASE}/Images/${filename}`;
  }
  
  // Default conversion
  const cleanPath = localPath.replace(/^\//, '');
  return `${GITHUB_RAW_BASE}/${cleanPath}`;
}

function convertImagesArray(images: any, sku?: string): string {
  if (!images) return '[]';
  let arr: string[];
  if (typeof images === 'string') {
    try {
      arr = JSON.parse(images);
    } catch {
      arr = [];
    }
  } else {
    arr = images;
  }
  if (Array.isArray(arr)) {
    const converted = arr.map(img => {
      if (typeof img === 'string' && !img.startsWith('http')) {
        return convertImageUrl(img, sku);
      }
      return img;
    });
    return JSON.stringify(converted);
  }
  return '[]';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.query.secret || req.headers['x-secret'];
  if (secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: 'Invalid or missing secret key' });
  }

  try {
    // Load seed data for reference
    const seedFile = path.join(process.cwd(), 'prisma', 'seed-data.json');
    if (!fs.existsSync(seedFile)) {
      return res.status(404).json({ error: 'seed-data.json not found' });
    }
    
    const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
    const seedProducts = seedData.products || [];
    const seedCategories = seedData.categories || [];
    
    // Build mapping from seed data: slug -> product
    const seedSlugToProduct = new Map<string, any>();
    seedProducts.forEach((p: any) => {
      if (p.slug) seedSlugToProduct.set(p.slug, p);
    });
    
    // Build category mappings
    const seedOldIdToSlug = new Map<string, string>();
    seedCategories.forEach((c: any) => {
      if (c.id) seedOldIdToSlug.set(String(c.id), c.slug);
    });
    
    const seedSlugToCatId = new Map<string, string>();
    seedProducts.forEach((p: any) => {
      if (p.slug && p.categoryId) {
        seedSlugToCatId.set(p.slug, String(p.categoryId));
      }
    });
    
    // Get existing categories in DB
    const dbCategories = await prisma.category.findMany({ select: { id: true, slug: true } });
    const catSlugToId = new Map<string, string>();
    dbCategories.forEach(c => {
      if (c.slug) catSlugToId.set(c.slug, c.id);
    });
    
    let updated = 0;
    let errors = 0;
    let catCreated = 0;
    
    // First, ensure all categories exist
    const rootCats = seedCategories.filter((c: any) => !c.parentId);
    const childCats = seedCategories.filter((c: any) => c.parentId);
    
    for (const cat of [...rootCats, ...childCats]) {
      if (!catSlugToId.has(cat.slug)) {
        const parentId = cat.parentId ? catSlugToId.get(cat.parentId) || null : null;
        try {
          const created = await prisma.category.create({
            data: {
              slug: cat.slug,
              name: cat.name || cat.slug,
              description: cat.description || '',
              parentId,
            },
          });
          catSlugToId.set(cat.slug, created.id);
          catCreated++;
        } catch (e) {
          // Skip if already exists
        }
      }
    }
    
    // Get all products from DB
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      try {
        const updates: any = {};
        let needsUpdate = false;
        
        // Look up seed product by slug
        const seedProduct = product.slug ? seedSlugToProduct.get(product.slug) : undefined;
        const sku = seedProduct?.sku || product.sku || undefined;
        
        // Fix image URL
        const currentImage = product.image;
        if (currentImage && !currentImage.startsWith('http')) {
          const newImage = convertImageUrl(currentImage, sku);
          if (newImage !== currentImage) {
            updates.image = newImage;
            needsUpdate = true;
          }
        }
        
        // Fix images array
        if (product.images) {
          let images;
          try {
            images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          } catch {
            images = [];
          }
          if (Array.isArray(images)) {
            const newImages = images.map(img => {
              if (typeof img === 'string' && !img.startsWith('http')) {
                return convertImageUrl(img, sku);
              }
              return img;
            });
            if (JSON.stringify(newImages) !== JSON.stringify(images)) {
              updates.images = JSON.stringify(newImages);
              needsUpdate = true;
            }
          }
        }
        
        // Fix category mapping
        if (seedProduct && seedProduct.categoryId) {
          const seedCatId = String(seedProduct.categoryId);
          const seedCatSlug = seedOldIdToSlug.get(seedCatId);
          if (seedCatSlug && catSlugToId.has(seedCatSlug)) {
            const correctCatId = catSlugToId.get(seedCatSlug)!;
            if (product.categoryId !== correctCatId) {
              updates.categoryId = correctCatId;
              needsUpdate = true;
            }
          }
        }
        
        if (needsUpdate) {
          await prisma.product.update({
            where: { id: product.id },
            data: updates,
          });
          updated++;
        }
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.error(`[fix-product-data] Error "${product.name}":`, err.message?.substring(0, 150));
        }
      }
    }
    
    console.log(`[fix-product-data] Updated ${updated} products, ${errors} errors, ${catCreated} new categories`);
    
    res.json({
      success: true,
      updated,
      errors,
      categoriesCreated: catCreated,
      totalProducts: products.length,
    });
    
  } catch (error) {
    console.error('[fix-product-data] Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
