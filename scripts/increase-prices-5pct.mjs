#!/usr/bin/env node
/**
 * increase-prices-5pct.mjs
 * -------------------------
 * 全站产品价格上浮 5%（因接入 PayPal 收款需 4% 手续费）。
 *
 * 更新范围：
 *   seed-data.json:
 *     - products[].price × 1.05
 *     - products[].priceMin × 1.05 (if exists)
 *     - products[].priceMax × 1.05 (if exists)
 *     - products[].originalPrice × 1.05 (if exists)
 *     - products[].variantChildren[].price × 1.05 (if exists)
 *
 *   SQLite dev.db:
 *     - products.price × 1.05
 *     - products.priceMin × 1.05 (WHERE NOT NULL)
 *     - products.priceMax × 1.05 (WHERE NOT NULL)
 *     - product_variants.price × 1.05
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

const MULTIPLIER = 1.05;
const round = (v) => Math.round(v * 1e10) / 1e10; // preserve high precision

// ========== 1. seed-data.json ==========
const seed = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));
const products = Array.isArray(seed.products) ? seed.products : [];

let seedPriceUpdated = 0;
let seedPriceMinUpdated = 0;
let seedPriceMaxUpdated = 0;
let seedOrigUpdated = 0;
let seedVariantChildUpdated = 0;

for (const p of products) {
  if (typeof p.price === 'number' && p.price > 0) {
    p.price = round(p.price * MULTIPLIER);
    seedPriceUpdated++;
  }
  if (typeof p.priceMin === 'number' && p.priceMin > 0) {
    p.priceMin = round(p.priceMin * MULTIPLIER);
    seedPriceMinUpdated++;
  }
  if (typeof p.priceMax === 'number' && p.priceMax > 0) {
    p.priceMax = round(p.priceMax * MULTIPLIER);
    seedPriceMaxUpdated++;
  }
  if (typeof p.originalPrice === 'number' && p.originalPrice > 0) {
    p.originalPrice = round(p.originalPrice * MULTIPLIER);
    seedOrigUpdated++;
  }
  if (Array.isArray(p.variantChildren)) {
    for (const vc of p.variantChildren) {
      if (typeof vc.price === 'number' && vc.price > 0) {
        vc.price = round(vc.price * MULTIPLIER);
        seedVariantChildUpdated++;
      }
    }
  }
}

writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));

console.log('=== seed-data.json ===');
console.log(`products.price updated:       ${seedPriceUpdated}`);
console.log(`products.priceMin updated:   ${seedPriceMinUpdated}`);
console.log(`products.priceMax updated:   ${seedPriceMaxUpdated}`);
console.log(`products.originalPrice updated: ${seedOrigUpdated}`);
console.log(`variantChildren[].price updated: ${seedVariantChildUpdated}`);

// ========== 2. SQLite dev.db ==========
if (!DB_PATH) {
  console.log('\n=== DB ===');
  console.log('DB not found — skipping');
} else {
  const db = new Database(DB_PATH);

  // Check which columns exist
  const cols = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
  const hasPriceMin = cols.includes('priceMin');
  const hasPriceMax = cols.includes('priceMax');
  const hasOrigPrice = cols.includes('originalPrice');

  const tx = db.transaction(() => {
    const r1 = db.prepare('UPDATE products SET price = ROUND(price * ?, 10) WHERE price > 0').run(MULTIPLIER);
    console.log('\n=== prisma/dev.db ===');
    console.log(`products.price updated:       ${r1.changes}`);

    if (hasPriceMin) {
      const r2 = db.prepare('UPDATE products SET priceMin = ROUND(priceMin * ?, 10) WHERE priceMin IS NOT NULL AND priceMin > 0').run(MULTIPLIER);
      console.log(`products.priceMin updated:   ${r2.changes}`);
    }
    if (hasPriceMax) {
      const r3 = db.prepare('UPDATE products SET priceMax = ROUND(priceMax * ?, 10) WHERE priceMax IS NOT NULL AND priceMax > 0').run(MULTIPLIER);
      console.log(`products.priceMax updated:   ${r3.changes}`);
    }
    if (hasOrigPrice) {
      const r4 = db.prepare('UPDATE products SET originalPrice = ROUND(originalPrice * ?, 10) WHERE originalPrice IS NOT NULL AND originalPrice > 0').run(MULTIPLIER);
      console.log(`products.originalPrice updated: ${r4.changes}`);
    }

    // product_variants table
    const vtExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_variants'").get();
    if (vtExists) {
      const vCols = db.prepare("PRAGMA table_info(product_variants)").all().map(c => c.name);
      if (vCols.includes('price')) {
        const r5 = db.prepare('UPDATE product_variants SET price = ROUND(price * ?, 10) WHERE price > 0').run(MULTIPLIER);
        console.log(`product_variants.price updated: ${r5.changes}`);
      }
    }

    // Update updatedAt
    db.prepare("UPDATE products SET updatedAt = CURRENT_TIMESTAMP WHERE price > 0").run();
  });
  tx();
  db.close();
}

console.log(`\nDone. All prices multiplied by ${MULTIPLIER} (×${MULTIPLIER}).`);
