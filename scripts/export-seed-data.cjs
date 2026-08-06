/**
 * 导出数据库到 seed-data.json
 *
 * 将 SQLite 数据库中的所有分类和产品导出为 seed-data.json 格式，
 * 确保 Vercel 部署（使用 seed-data.json）与本地数据库保持同步。
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
const SEED_PATH = path.join(__dirname, '..', 'prisma', 'seed-data.json');

const db = new Database(DB_PATH, { readonly: true });

// 读取 admin 用户
const admin = db.prepare("SELECT email, name FROM users WHERE role = 'ADMIN' LIMIT 1").get();
console.log('Admin:', admin);

// 读取所有分类
const categories = db.prepare(`
  SELECT id, name, slug, description, image, parentId, sortOrder, seoTitle, seoDesc
  FROM categories
  ORDER BY sortOrder ASC, name ASC
`).all();
console.log('Categories:', categories.length);

// 读取所有产品
const products = db.prepare(`
  SELECT id, name, slug, description, price, priceMax, originalPrice,
         image, images, categoryId, stock, rating, reviewCount, salesCount,
         isPublished, shippingCost, shippingMethod, sku, material, plating,
         process, color, size, packSize, pkgLength, pkgWidth, pkgHeight,
         pkgWeight, keywords, origin, supplierCity, stockStatus, moq, aplus,
         authorId
  FROM products
  ORDER BY createdAt ASC
`).all();
console.log('Products:', products.length);

// 转换布尔值和数字类型（SQLite 存储为 0/1）
for (const p of products) {
  p.isPublished = p.isPublished === 1 || p.isPublished === true;
  p.price = Number(p.price) || 0;
  if (p.priceMax !== null) p.priceMax = Number(p.priceMax);
  if (p.originalPrice !== null) p.originalPrice = Number(p.originalPrice);
  p.stock = Number(p.stock) || 0;
  p.rating = Number(p.rating) || 0;
  p.reviewCount = Number(p.reviewCount) || 0;
  p.salesCount = Number(p.salesCount) || 0;
  p.shippingCost = Number(p.shippingCost) || 0;
  p.packSize = Number(p.packSize) || 1;
  p.moq = Number(p.moq) || 1;
  // keywords, images, aplus 已经是 JSON 字符串，保持不变
}

db.close();

// 写入 seed-data.json
const seedData = {
  admin: admin ? { email: admin.email, name: admin.name } : undefined,
  categories,
  products,
};

fs.writeFileSync(SEED_PATH, JSON.stringify(seedData, null, 2));
console.log('\n已写入:', SEED_PATH);
console.log('文件大小:', (fs.statSync(SEED_PATH).size / 1024 / 1024).toFixed(2), 'MB');

// 验证新添加的产品
const newProducts = products.filter(p =>
  p.sku && (
    /^YCS-CLO-03[789]/.test(p.sku) ||
    /^YCS-CLO-04[0-5]/.test(p.sku) ||
    /^YCS-SHO-03[5-9]/.test(p.sku) ||
    /^YCS-SHO-04[0-3]/.test(p.sku) ||
    p.sku === 'YCS-OFC-004'
  )
);
console.log('\n新增产品验证:', newProducts.length, '个');
const newCats = categories.filter(c => ['clothing', 'shoes', 'office-supplies'].includes(c.slug));
console.log('新增子分类:', newCats.map(c => `${c.slug}(${c.name})`).join(', '));
