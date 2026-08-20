#!/usr/bin/env node
/**
 * fix-variant-groups.mjs
 * ----------------------
 * Fixes incorrectly grouped variants in seed-data.json:
 *   - Parent products whose children ALL share the same
 *     {name, color, size} spec tuple (distinct products accidentally
 *     merged into a variant group).
 *   - Parent products whose children have NO variant dimensions
 *     (color/size all empty) so the UI shows identical rows.
 *
 * Actions on seed-data.json:
 *   1. Identify "bad parent" products using the same heuristic used in
 *      buildVariantGroups validation.
 *   2. Demote bad parents to standalone products:
 *        - isParent = false
 *        - delete variantChildren[]
 *        - priceMin = undefined
 *        - priceMax = null
 *        - parentId = undefined (just in case)
 *   3. Free each child:
 *        - parentId = undefined
 *        - isParent = false
 *        - priceMin/priceMax reset to standalone defaults
 *
 * NOTE: The SQLite DB's `products` table has no parentId/isParent columns
 * and `product_variants` is never read by gSSP, so DB side is intentionally
 * left alone – the UI sources variant groups entirely from seed-data.json
 * via `buildVariantGroups(seed.products)`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'prisma', 'seed-data.json');

if (!existsSync(SEED_PATH)) {
  console.error('seed-data.json not found at:', SEED_PATH);
  process.exit(1);
}

const seed = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));
const products = Array.isArray(seed.products) ? seed.products : [];
const byId = new Map(products.map(p => [String(p.id), p]));

// ---------- 1. Detect bad parents ----------
const byParent = {};
products.forEach(p => {
  const pid = p.parentId ? String(p.parentId) : '';
  if (pid) {
    if (!byParent[pid]) byParent[pid] = [];
    byParent[pid].push(p);
  }
});

const parentProducts = products.filter(p => p.isParent === true);

const badParents = [];
for (const parent of parentProducts) {
  const kids = byParent[String(parent.id)] || [];
  if (kids.length <= 1) continue; // A single child isn't really a group problem

  // Spec-key: {name, color, size}
  const keys = kids.map(k => [
    String(k.name || '').trim(),
    String(k.color || '').trim(),
    String(k.size || '').trim(),
  ].join('|||'));
  const uniqueKeys = new Set(keys);

  const allEmptyColor = kids.every(k => !String(k.color || '').trim());
  const allEmptySize  = kids.every(k => !String(k.size || '').trim());

  let reason = null;
  if (uniqueKeys.size === 1) {
    reason = 'ALL_VARIANTS_SAME_NAME_COLOR_SIZE';
  } else if (allEmptyColor && allEmptySize) {
    // No color/size dims – UI will either fabricate dims or show identical rows
    reason = 'NO_VARIANT_DIMENSIONS';
  }
  if (reason) {
    badParents.push({ parent, kids, reason });
  }
}

console.log(`Seed products: ${products.length}`);
console.log(`Parents scanned: ${parentProducts.length}`);
console.log(`Bad parents detected: ${badParents.length}`);
console.log(`Children to free: ${badParents.reduce((s, b) => s + b.kids.length, 0)}`);

// ---------- 2. Apply fixes ----------
const freedChildrenIds = new Set();
let parentsDemoted = 0, kidsFreed = 0;

for (const bp of badParents) {
  const p = bp.parent;

  // Demote parent
  p.isParent = false;
  delete p.variantChildren;       // embedded array of kid objects
  delete p.priceMin;              // range only applies to a parent
  p.priceMax = null;              // no range since now standalone
  if (p.parentId) delete p.parentId;
  parentsDemoted++;

  // Free children
  for (const c of bp.kids) {
    delete c.parentId;
    c.isParent = false;
    delete c.priceMin;
    if (c.priceMax !== undefined && c.priceMax !== null) c.priceMax = null;
    freedChildrenIds.add(String(c.id));
    kidsFreed++;
  }
}

// ---------- 3. Post: clean up any parent.variantChildren references
//              that still point to now-freed kids.
let orphanRefsDropped = 0;
for (const p of products) {
  if (Array.isArray(p.variantChildren) && p.variantChildren.length > 0) {
    const before = p.variantChildren.length;
    p.variantChildren = p.variantChildren.filter(vc => {
      const id = String(vc && vc.id ? vc.id : '');
      return !freedChildrenIds.has(id);
    });
    orphanRefsDropped += (before - p.variantChildren.length);
    if (p.variantChildren.length === 0) delete p.variantChildren;
  }
}

writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));

console.log(`\n=== seed-data.json updated ===`);
console.log(`Parents demoted to standalone:        ${parentsDemoted}`);
console.log(`Children freed from wrong groups:     ${kidsFreed}`);
console.log(`Dropped stale variantChildren refs:   ${orphanRefsDropped}`);
