#!/usr/bin/env node
/**
 * Merge bulk-products.json into site-data.json and sample-products.json
 * Removes duplicates by product name (keeps new bulk products).
 *
 * Usage: node scripts/merge-bulk-products.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const bulkPath = path.join(root, 'bulk-products.json');
const siteDataPath = path.join(root, 'site-data.json');
const samplePath = path.join(root, 'sample-products.json');

const bulk = JSON.parse(fs.readFileSync(bulkPath, 'utf-8'));
const bulkProducts = bulk.products || [];
console.log(`📦 Loaded ${bulkProducts.length} bulk products`);

// ===== Merge into site-data.json =====
// Format: { id, image, category: {name, slug}, name, sku, material, size, moq, priceMin, priceMax, description, variations, aplus }
const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
const existingSiteProducts = Array.isArray(siteData.products) ? siteData.products : [];
const existingNames = new Set(existingSiteProducts.map(p => p.name));
const maxExistingId = existingSiteProducts.reduce((max, p) => Math.max(max, p.id || 0), 0);

// Subcategory slug -> parent category info
const SUB_TO_PARENT = {
  'stress-relief-toys': { name: 'Toys & Gift', slug: 'toys-gift' },
  'fidget-toys': { name: 'Toys & Gift', slug: 'toys-gift' },
  'educational-toys': { name: 'Toys & Gift', slug: 'toys-gift' },
  'gift-sets': { name: 'Toys & Gift', slug: 'toys-gift' },
  'necklaces': { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  'earrings': { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  'rings': { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  'bracelets-bangles': { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  'brooches-pins': { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  'jewelry-sets': { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
  'hair-clips': { name: 'Hair Accessories', slug: 'hair-accessories' },
  'headbands': { name: 'Hair Accessories', slug: 'hair-accessories' },
  'hair-ties': { name: 'Hair Accessories', slug: 'hair-accessories' },
  'hair-pins': { name: 'Hair Accessories', slug: 'hair-accessories' },
  'bag-charms': { name: 'Bags & Accessories', slug: 'bags-accessories' },
  'keychains': { name: 'Bags & Accessories', slug: 'bags-accessories' },
  'belt-buckles': { name: 'Bags & Accessories', slug: 'bags-accessories' },
  'zippers': { name: 'Garment Accessories', slug: 'garment-accessories' },
  'buttons': { name: 'Garment Accessories', slug: 'garment-accessories' },
  'lace-trim': { name: 'Garment Accessories', slug: 'garment-accessories' },
  'embroidery-patches': { name: 'Garment Accessories', slug: 'garment-accessories' },
  'beads-charms': { name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
  'rhinestones': { name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
  'craft-supplies': { name: 'Home Decor & Crafts', slug: 'home-decor-crafts' },
};

let addedCount = 0;
let nextId = maxExistingId + 1;

const newSiteProducts = [];
for (const bp of bulkProducts) {
  if (existingNames.has(bp.name)) continue;
  existingNames.add(bp.name);

  const parentInfo = SUB_TO_PARENT[bp.categorySlug] || { name: 'Other', slug: 'other' };

  newSiteProducts.push({
    id: nextId++,
    image: bp.image,
    category: parentInfo,
    name: bp.name,
    sku: bp.sku,
    material: bp.material,
    size: bp.size,
    moq: bp.moq,
    priceMin: bp.priceMin,
    priceMax: bp.priceMax,
    description: bp.description,
    variations: (bp.variations || []).map(v => ({
      color: v.color,
      size: v.size,
      image: '',
      price: v.price,
    })),
  });
  addedCount++;
}

// Replace site-data.json products with only the new bulk products (clean slate for 200-product catalog)
siteData.products = newSiteProducts;
siteData.updatedAt = new Date().toISOString();

fs.writeFileSync(siteDataPath, JSON.stringify(siteData, null, 2));
console.log(`✅ site-data.json: ${newSiteProducts.length} products (replaced)`);

// ===== Merge into sample-products.json =====
// Format: { name, description, slug, priceMin, priceMax, image, images, categorySlug, material, plating, process, color, size, packSize, pkgLength, pkgWidth, pkgHeight, pkgWeight, moq, sku, origin, supplierCity, stockStatus, keywords, variations }
const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf-8'));
const existingSampleProducts = Array.isArray(sampleData.products) ? sampleData.products : [];
const existingSampleNames = new Set(existingSampleProducts.map(p => p.name));

const newSampleProducts = [];
for (const bp of bulkProducts) {
  if (existingSampleNames.has(bp.name)) continue;
  existingSampleNames.add(bp.name);
  newSampleProducts.push(bp);
}

// Replace sample-products.json with only new bulk products (clean slate for 200-product catalog)
sampleData.products = newSampleProducts;

fs.writeFileSync(samplePath, JSON.stringify(sampleData, null, 2));
console.log(`✅ sample-products.json: ${newSampleProducts.length} products (replaced)`);

console.log(`\n📊 Summary:`);
console.log(`   Total bulk products: ${bulkProducts.length}`);
console.log(`   Added to site-data.json: ${newSiteProducts.length}`);
console.log(`   Added to sample-products.json: ${newSampleProducts.length}`);
