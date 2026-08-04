import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { buildGitHubLookup, findGitHubImage } from '@/lib/image-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = req.query.secret || req.headers['x-secret'];
  if (secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ error: 'Invalid or missing secret key' });
  }

  try {
    // Build GitHub lookup
    const lookup = await buildGitHubLookup();
    
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
    
    // Get existing categories in DB
    const dbCategories = await prisma.category.findMany({ select: { id: true, slug: true } });
    const catSlugToId = new Map<string, string>();
    dbCategories.forEach(c => {
      if (c.slug) catSlugToId.set(c.slug, c.id);
    });
    
    let updated = 0;
    let errors = 0;
    let catCreated = 0;
    let imagesFixed = 0;
    let imagesFailed = 0;
    
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
          const newImage = findGitHubImage(currentImage, lookup);
          if (newImage !== currentImage) {
            updates.image = newImage;
            needsUpdate = true;
            if (newImage.includes('raw.githubusercontent.com')) {
              imagesFixed++;
            } else {
              imagesFailed++;
            }
          }
        } else if (currentImage && !currentImage.includes('raw.githubusercontent.com')) {
          // Image already has some URL but might still be wrong
          const newImage = findGitHubImage(currentImage, lookup);
          if (newImage !== currentImage) {
            updates.image = newImage;
            needsUpdate = true;
            imagesFixed++;
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
                return findGitHubImage(img, lookup);
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
    
    console.log(`[fix-product-data] Updated ${updated} products, ${errors} errors`);
    console.log(`  Images fixed: ${imagesFixed}`);
    console.log(`  Images failed: ${imagesFailed}`);
    console.log(`  Categories created: ${catCreated}`);
    
    res.json({
      success: true,
      updated,
      errors,
      imagesFixed,
      imagesFailed,
      categoriesCreated: catCreated,
      totalProducts: products.length,
    });
    
  } catch (error) {
    console.error('[fix-product-data] Error:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
