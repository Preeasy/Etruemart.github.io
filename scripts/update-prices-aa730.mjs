#!/usr/bin/env node
/**
 * Update product prices based on AA-730价格汇总表.xlsx (Sheet: 价格汇总)
 *
 * Reads:
 *   - 附件: /workspace/AA-730价格汇总表.xlsx
 *   - Seed data: /workspace/prisma/seed-data.json
 *   - SQLite DB: /workspace/prisma/dev.db
 *
 * Updates:
 *   - product.price (USD) by SKU match
 *   - For parent products: also updates priceMax, children prices (when variant SKUs listed)
 *
 * Honest rule: if 美金价格 is null/undefined, SKIP (do not overwrite with 0)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const XLSX_PATH = path.join(ROOT, 'AA-730价格汇总表.xlsx');
const SEED_PATH = path.join(ROOT, 'prisma', 'seed-data.json');
// DB can live at prisma/dev.db or prisma/prisma/dev.db depending on environment
const DB_PATH = (() => {
  const p1 = path.join(ROOT, 'prisma', 'dev.db');
  const p2 = path.join(ROOT, 'prisma', 'prisma', 'dev.db');
  if (existsSync(p1)) return p1;
  if (existsSync(p2)) return p2;
  return p1; // return the conventional one anyway (will skip in script)
})();

// ---------- 1. Parse Excel ----------
if (!existsSync(XLSX_PATH)) {
  console.error('XLSX not found:', XLSX_PATH);
  process.exit(1);
}
const wb = XLSX.readFile(XLSX_PATH);
const sheet = wb.Sheets['价格汇总'];
if (!sheet) { console.error('Sheet 价格汇总 not found'); process.exit(1); }
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });

const header = rows.shift();
console.log('Columns:', header.map((h, i) => `[${i}]${h}`).join(' '));
console.log('Data rows:', rows.length);

// Column indices (reliable by header name)
const colIdx = (name) => header.findIndex(h => String(h).trim() === name);
const iItem = colIdx('Item号');
const iUsd  = colIdx('美金价格');
const iOrig = colIdx('原单价');
const iVarCount = colIdx('变体数量');
const iVars = colIdx('对应变体Item号');
if (iItem < 0 || iUsd < 0) {
  console.error('Required columns missing: Item号 or 美金价格');
  process.exit(1);
}

const updates = [];
let rowsWithNullPrice = 0;

for (const row of rows) {
  if (!row || row.length === 0) continue;
  const sku = row[iItem] == null ? null : String(row[iItem]).trim();
  const usdPriceRaw = row[iUsd];
  const usdPrice = usdPriceRaw == null || usdPriceRaw === '' ? null : Number(usdPriceRaw);
  if (!sku) continue;
  if (usdPrice == null || Number.isNaN(usdPrice)) {
    rowsWithNullPrice++;
    continue;
  }
  if (usdPrice < 0) continue;
  updates.push({
    sku,
    usdPrice, // preserve Excel full precision (UI will format to cents on display)
    origCny: row[iOrig] ?? null,
    variantCount: row[iVarCount] ?? null,
    variantSkusRaw: row[iVars] ?? null,
  });
}
console.log(`Parsed ${updates.length} valid rows (skipped ${rowsWithNullPrice} with empty 美金价格)`);

// ---------- 2. Build SKU index ----------
const bySku = new Map(updates.map(u => [u.sku, u]));

// ---------- 3. Update seed-data.json ----------
if (!existsSync(SEED_PATH)) { console.error('seed-data.json not found'); process.exit(1); }
const seed = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));
const products = seed.products || [];

const stats = {
  matchedSeed: 0,
  notMatchedSeed: [],
  seedChanged: 0,
  seedChildUpdated: 0,
  dbUpdated: 0,
  dbChildUpdated: 0,
  dbNotFound: [],
  dbUnchanged: 0,
};

function setProductPrice(p, newUsd, { fromChild = false } = {}) {
  const oldPrice = Number(p.price || 0);
  if (Number.isNaN(newUsd)) return false;
  if (Math.abs(oldPrice - newUsd) < 1e-9) return false;
  p.price = newUsd;
  // Set priceMin to same as price (single product), or min of children later
  if (!p.isParent && (fromChild === false)) {
    // single product — priceMin not applicable, keep existing
  }
  return true;
}

// 3a. Build product index for seed
const seedBySku = new Map();
const seedById = new Map();
products.forEach(p => {
  if (p.sku) seedBySku.set(p.sku, p);
  seedById.set(String(p.id), p);
});

// 3b. Apply by SKU
for (const u of updates) {
  const p = seedBySku.get(u.sku);
  if (!p) {
    stats.notMatchedSeed.push(u.sku);
    continue;
  }
  stats.matchedSeed++;
  // 1) Update the SKU-matched product itself
  const changed = setProductPrice(p, u.usdPrice);
  if (changed) stats.seedChanged++;

  // 2) If it's a parent product, also push min/max for priceMin/priceMax
  //    and update its child products that exist in variant SKUs (if column has multiple)
  if (p.isParent === true) {
    const children = products.filter(x => String(x.parentId) === String(p.id));
    // Try to parse 对应变体Item号 (column may contain comma-separated SKUs)
    let variantSkuList = [];
    if (u.variantSkusRaw) {
      const raw = String(u.variantSkusRaw);
      variantSkuList = raw.split(/[,，、;；\s]+/).map(s => s.trim()).filter(Boolean);
    }
    let childPrices = [];
    for (const c of children) {
      // If this child SKU is in the explicit variant list or matches parent-like pattern, apply same price
      const matchVariant = variantSkuList.includes(c.sku);
      // If explicit variant SKU list is empty, we assume the 美金价格 applies uniformly to all variants
      // (this is how AA-730 sheet is structured — 1 row per 产品 with 美金价格)
      if (matchVariant || variantSkuList.length === 0) {
        if (setProductPrice(c, u.usdPrice, { fromChild: true })) stats.seedChildUpdated++;
      }
      childPrices.push(Number(c.price || 0));
    }
    // Parent: priceMin/priceMax reflect the range among children
    if (childPrices.length > 0) {
      const mn = Math.min(...childPrices);
      const mx = Math.max(...childPrices);
      if (!Number.isNaN(mn)) {
        const curMn = Number(p.priceMin || p.price || 0);
        const curMx = Number(p.priceMax || 0);
        let needPriceUpdate = false;
        if (Math.abs(curMn - mn) > 1e-9) { p.priceMin = mn; needPriceUpdate = true; }
        if (mx - mn > 1e-9) {
          if (Math.abs(curMx - mx) > 1e-9) { p.priceMax = mx; needPriceUpdate = true; }
        } else {
          if (p.priceMax != null) { p.priceMax = null; needPriceUpdate = true; }
        }
        // Set parent's own "price" to lowest in group for display purposes (consistent with old data)
        if (Math.abs(Number(p.price || 0) - mn) > 1e-9) {
          p.price = mn;
          needPriceUpdate = true;
        }
        if (needPriceUpdate) stats.seedChanged++;
      }
    }
  }
}

// 3c. Rewrite seed
writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));
console.log('\n=== seed-data.json ===');
console.log('Products matched:', stats.matchedSeed, '/', updates.length);
console.log('Products price changed:', stats.seedChanged, '(including parent priceMin/Max recompute)');
console.log('Child variants price adjusted:', stats.seedChildUpdated);
if (stats.notMatchedSeed.length) {
  console.log('NOT matched (first 20):', stats.notMatchedSeed.slice(0, 20).join(', '));
  console.log('NOT matched total:', stats.notMatchedSeed.length);
}

// ---------- 4. Update SQLite DB ----------
if (!existsSync(DB_PATH)) {
  console.warn('\n!!! DB not found at', DB_PATH, '— skipping DB update');
} else {
  console.log('\n=== prisma/dev.db ===');
  const db = new Database(DB_PATH);

  const getBySku = db.prepare('SELECT id, sku, price, priceMax FROM products WHERE sku = ?');
  const updatePrice = db.prepare('UPDATE products SET price = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
  const countVariants = db.prepare('SELECT COUNT(*) AS n FROM product_variants WHERE productId = ?');

  let dbMatched = 0, dbNotFound = [], dbUnchanged = 0, dbUpdated = 0;
  let tx = db.transaction(() => {
    for (const u of updates) {
      const p = getBySku.get(u.sku);
      if (!p) { dbNotFound.push(u.sku); continue; }
      dbMatched++;

      if (Math.abs(Number(p.price || 0) - u.usdPrice) > 1e-9) {
        updatePrice.run(u.usdPrice, p.id);
        dbUpdated++;
      } else {
        dbUnchanged++;
      }
      // Note: product_variants table also has a price column but AA-730 does not
      // provide per-color/size breakdown (only per product), so we leave variants alone.
    }
  });
  tx();
  db.close();

  console.log('Products matched in DB:', dbMatched, '/', updates.length);
  console.log('Products rows updated:', dbUpdated);
  console.log('Products DB unchanged (same price):', dbUnchanged);
  if (dbNotFound.length) {
    console.log('NOT found in DB (first 20):', dbNotFound.slice(0, 20).join(', '));
    console.log('NOT found in DB total:', dbNotFound.length);
  }
}

console.log('\nDone.');
