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
    
    // First, ensure all categories exist - build mapping from seed ID -> DB ID
    // seedIdToDbId maps old seed IDs to new DB IDs
    const seedIdToDbId = new Map<string, string>();
    
    // Sort categories: root first, then children
    const rootCats = seedCategories.filter((c: any) => !c.parentId);
    const childCats = seedCategories.filter((c: any) => c.parentId);
    const sortedCats = [...rootCats, ...childCats];
    
    for (const cat of sortedCats) {
      const seedCatId = String(cat.id);
      
      // Check if this category already exists in DB by slug
      let dbCatId: string | null = null;
      if (catSlugToId.has(cat.slug)) {
        dbCatId = catSlugToId.get(cat.slug)!;
      }
      
      if (!dbCatId) {
        // Need to create this category
        // Resolve parentId: it might reference a seed ID, need to convert to DB ID
        let parentId: string | null = null;
        if (cat.parentId) {
          const seedParentId = String(cat.parentId);
          // Check if we've already created the parent
          if (seedIdToDbId.has(seedParentId)) {
            parentId = seedIdToDbId.get(seedParentId)!;
          } else {
            // Parent might already exist in DB - look it up by slug
            const parentSeedCat = seedCategories.find((c: any) => c.id === seedParentId);
            if (parentSeedCat && catSlugToId.has(parentSeedCat.slug)) {
              parentId = catSlugToId.get(parentSeedCat.slug)!;
            }
          }
        }
        
        try {
          const created = await prisma.category.create({
            data: {
              slug: cat.slug,
              name: cat.name || cat.slug,
              description: cat.description || '',
              parentId,
            },
          });
          dbCatId = created.id;
          catSlugToId.set(cat.slug, created.id);
          catCreated++;
          console.log(`[fix-product-data] Created category: ${cat.slug} (id: ${created.id}, parent: ${parentId || 'none'})`);
        } catch (e: any) {
          // If slug is unique constraint violation, it already exists
          const existing = await prisma.category.findFirst({ where: { slug: cat.slug } });
          if (existing) {
            dbCatId = existing.id;
            catSlugToId.set(cat.slug, existing.id);
          } else {
            console.error(`[fix-product-data] Error creating category ${cat.slug}:`, e?.message?.substring(0, 100));
            continue;
          }
        }
      }
      
      // Map seed ID to DB ID
      if (dbCatId) {
        seedIdToDbId.set(seedCatId, dbCatId);
      }
    }
    
    console.log(`[fix-product-data] Categories: ${catCreated} created, ${catSlugToId.size} total in DB`);
    
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
          } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/fix-product-data] silent error:', e?.message || e);
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
        
        // Fix category mapping - use the seedIdToDbId mapping directly
        if (seedProduct && seedProduct.categoryId) {
          const seedCatId = String(seedProduct.categoryId);
          
          // Method 1: Direct mapping from seed ID to DB ID
          if (seedIdToDbId.has(seedCatId)) {
            const correctCatId = seedIdToDbId.get(seedCatId)!;
            if (product.categoryId !== correctCatId) {
              updates.categoryId = correctCatId;
              needsUpdate = true;
            }
          }
          
          // Method 2: Fallback via slug lookup
          if (!updates.categoryId) {
            const seedCatSlug = seedOldIdToSlug.get(seedCatId);
            if (seedCatSlug && catSlugToId.has(seedCatSlug)) {
              const correctCatId = catSlugToId.get(seedCatSlug)!;
              if (product.categoryId !== correctCatId) {
                updates.categoryId = correctCatId;
                needsUpdate = true;
              }
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
