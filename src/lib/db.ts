import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
  }
  return db;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceMax: number | null;
  originalPrice: number | null;
  image: string;
  images: string;
  categoryId: string | null;
  category?: { name: string; slug: string } | null;
  stock: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isPublished: boolean;
  shippingCost: number;
  shippingMethod: string | null;
  sku: string | null;
  material: string | null;
  plating: string | null;
  process: string | null;
  color: string | null;
  size: string | null;
  packSize: number;
  pkgLength: number | null;
  pkgWidth: number | null;
  pkgHeight: number | null;
  pkgWeight: number | null;
  keywords: string;
  origin: string | null;
  supplierCity: string | null;
  stockStatus: string;
  moq: number;
  aplus: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function getProductBySlug(slug: string): ProductRow | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM products WHERE slug = ? LIMIT 1');
  return stmt.get(slug) as ProductRow | null;
}

export function getProductById(id: string): ProductRow | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM products WHERE id = ? LIMIT 1');
  return stmt.get(id) as ProductRow | null;
}

export function getCategoryById(id: string): CategoryRow | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM categories WHERE id = ? LIMIT 1');
  return stmt.get(id) as CategoryRow | null;
}

export function getRelatedProducts(categoryId: string, excludeId: string, limit: number = 8): ProductRow[] {
  const database = getDatabase();
  // Step 1: get same-category products with price > 0
  let products: any[] = [];
  try {
    const sameCatStmt = database.prepare(
      'SELECT * FROM products WHERE categoryId = ? AND id != ? AND price > 0 ORDER BY RANDOM() LIMIT ?'
    );
    products = sameCatStmt.all(categoryId, excludeId, limit) as any[];
  } catch (e) {
    // Fallback
  }
  if (products.length >= limit) return products;

  // Step 2: fill remaining with any products with price > 0
  const need = limit - products.length;
  const existingIds = new Set([String(excludeId), ...products.map((p: any) => String(p.id))]);
  try {
    const restStmt = database.prepare('SELECT * FROM products WHERE price > 0 ORDER BY RANDOM() LIMIT ?');
    const rest = restStmt.all(need * 3) as any[];
    for (const p of rest) {
      if (products.length >= limit) break;
      if (!existingIds.has(String(p.id))) {
        products.push(p);
        existingIds.add(String(p.id));
      }
    }
  } catch (e) { /* ignore */ }
  return products;
}

export function getAllCategories(): CategoryRow[] {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM categories ORDER BY sortOrder ASC');
  return stmt.all() as CategoryRow[];
}

export function searchProducts(query: string, limit: number = 50): ProductRow[] {
  const database = getDatabase();
  const searchQuery = `%${query}%`;
  const stmt = database.prepare(
    'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR slug LIKE ? OR sku LIKE ? OR keywords LIKE ? LIMIT ?'
  );
  return stmt.all(searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, limit) as ProductRow[];
}
