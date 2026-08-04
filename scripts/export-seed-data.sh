#!/bin/bash
# Export all data from SQLite to JSON for Vercel PostgreSQL seeding
cd /workspace

echo "Exporting categories..."
sqlite3 prisma/dev.db "SELECT json_group_array(json_object('id', id, 'slug', slug, 'name', name, 'description', description, 'parentId', parentId)) FROM categories;" > /tmp/categories.json

echo "Exporting products..."
sqlite3 prisma/dev.db "SELECT json_group_array(json_object(
  'id', id,
  'name', name,
  'slug', slug,
  'description', description,
  'aplus', aplus,
  'sku', sku,
  'price', price,
  'priceMax', priceMax,
  'originalPrice', originalPrice,
  'image', image,
  'images', images,
  'categoryId', categoryId,
  'moq', moq,
  'packSize', packSize,
  'stockStatus', stockStatus,
  'stock', stock,
  'keywords', keywords,
  'material', material,
  'plating', plating,
  'process', process,
  'color', color,
  'size', size,
  'origin', origin,
  'supplierCity', supplierCity,
  'shippingCost', shippingCost,
  'shippingMethod', shippingMethod,
  'isPublished', isPublished,
  'rating', rating,
  'reviewCount', reviewCount,
  'salesCount', salesCount,
  'authorId', authorId
)) FROM products;" > /tmp/products.json

echo "Exporting admin user..."
sqlite3 prisma/dev.db "SELECT json_object('id', id, 'email', email, 'name', name, 'role', role) FROM users WHERE email='yeatrusourcing@gmail.com';" > /tmp/admin.json

# Combine into one file
node -e "
const fs = require('fs');
const cats = JSON.parse(fs.readFileSync('/tmp/categories.json', 'utf-8'));
const products = JSON.parse(fs.readFileSync('/tmp/products.json', 'utf-8'));
const admin = JSON.parse(fs.readFileSync('/tmp/admin.json', 'utf-8'));

const data = {
  categories: JSON.parse(cats),
  products: JSON.parse(products),
  admin: JSON.parse(admin),
  exportedAt: new Date().toISOString(),
};

fs.writeFileSync('prisma/seed-data.json', JSON.stringify(data));
console.log('Done:', data.categories.length, 'categories,', data.products.length, 'products');
"

echo "Export complete: prisma/seed-data.json"
