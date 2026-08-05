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
  const stmt = database.prepare('SELECT * FROM products WHERE categoryId = ? AND id != ? LIMIT ?');
  return stmt.all(categoryId, excludeId, limit) as ProductRow[];
}

export function getAllCategories(): CategoryRow[] {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM categories WHERE isActive = 1 ORDER BY sortOrder ASC');
  return stmt.all() as CategoryRow[];
}

export function searchProducts(query: string, limit: number = 50): ProductRow[] {
  const database = getDatabase();
  const searchQuery = `%${query}%`;
  const stmt = database.prepare(
    'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR slug LIKE ? LIMIT ?'
  );
  return stmt.all(searchQuery, searchQuery, searchQuery, limit) as ProductRow[];
}
