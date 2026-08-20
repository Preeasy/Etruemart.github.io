#!/usr/bin/env node
/**
 * update-moq-by-price-tier.mjs
 * -----------------------------
 * MOQ tiers (per unit price in USD):
 *   price <  0.50        → MOQ = 100 pcs
 *   0.50  ≤ price ≤ 8.99 → MOQ = 48 pcs
 *   9.00  ≤ price < 100  → MOQ = 5 pcs
 *   price ≥ 100          → MOQ = 1 pcs
 *
 * Applies to seed-data.json AND SQLite dev.db (products table) simultaneously.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'prisma', 'seed-data.json');
const DB_PATH = (() => {
  const p1 = path.join(ROOT, 'prisma', 'dev.db');
  const p2 = path.join(ROOT, 'prisma', 'prisma', 'dev.db');
  if (existsSync(p1)) return p1;
  if (existsSync(p2)) return p2;
  return null;
})();

function tierFor(price) {
  const p = Number(price);
  if (p < 0.5)  return 100;
  if (p <= 8.99) return 48;
  if (p < 100)   return 5;
  return 1;
}
function tierLabel(moq) {
  switch (moq) {
    case 100: return '< $0.50 → 100';
    case 48:  return '$0.50–$8.99 → 48';
    case 5:   return '$9.00–$99.99 → 5';
    case 1:   return '≥ $100 → 1';
    default:  return '?';
  }
}

// ========== 1. Seed ==========
if (!existsSync(SEED_PATH)) { console.error('seed not found'); process.exit(1); }
const seed = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));
const products = Array.isArray(seed.products) ? seed.products : [];

let seedTotal = 0, seedChanged = 0;
const seedStats = { 100: 0, 48: 0, 5: 0, 1: 0 };
for (const p of products) {
  seedTotal++;
  const newMoq = tierFor(p.price);
  const oldMoq = Number(p.moq);
  if (oldMoq !== newMoq) {
    p.moq = newMoq;
    seedChanged++;
  }
  seedStats[newMoq] = (seedStats[newMoq] || 0) + 1;
}
writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));

console.log('=== seed-data.json ===');
console.log(`Products: ${seedTotal}`);
console.log(`MOQ tiers:`, seedStats);
console.log(`Changed: ${seedChanged}`);

// ========== 2. DB ==========
if (!DB_PATH) {
  console.log('\n=== DB ===');
  console.log('DB not found — skipping');
} else {
  const db = new Database(DB_PATH);
  const allStmt = db.prepare('SELECT id, price, moq FROM products');
  const updStmt = db.prepare('UPDATE products SET moq = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
  const all = allStmt.all();
  let dbTotal = 0, dbChanged = 0;
  const dbStats = { 100: 0, 48: 0, 5: 0, 1: 0 };
  const tx = db.transaction(() => {
    for (const r of all) {
      dbTotal++;
      const newMoq = tierFor(r.price);
      const oldMoq = Number(r.moq);
      if (oldMoq !== newMoq) {
        updStmt.run(newMoq, r.id);
        dbChanged++;
      }
      dbStats[newMoq] = (dbStats[newMoq] || 0) + 1;
    }
  });
  tx();
  db.close();
  console.log('\n=== prisma/dev.db ===');
  console.log(`Products: ${dbTotal}`);
  console.log(`MOQ tiers:`, dbStats);
  console.log(`Changed: ${dbChanged}`);
}

console.log('\nDone.');
console.log(`\nTier legend: ${tierLabel(100)}, ${tierLabel(48)}, ${tierLabel(5)}, ${tierLabel(1)}`);
