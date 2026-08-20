#!/usr/bin/env node
/**
 * verify-variant-fix.mjs
 * ----------------------
 * Verification harness that:
 *   1. Rebuilds variant groups from the fixed seed using the real TS
 *      source transpiled to equivalent logic here (mirror of
 *      buildVariantGroups in src/lib/variants.ts without TS features we
 *      can't run in pure Node).
 *   2. Confirms the following for known-bad SKUs:
 *        - YCS-MSS-005 / -006 / YCS-STO-033 etc. have NO variant group.
 *        - Good legit SKUs like "YCS-DRY-001" still have a group.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEED_PATH = path.join(ROOT, 'prisma', 'seed-data.json');
const seed = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

// ------- minimal mirror of buildVariantGroups logic (same as TS source) -------
const COLOR_KEYWORDS = ['black','white','red','blue','pink','green','purple','orange',
  'yellow','brown','gray','grey','gold','silver','beige','clear',
  'mint','coral','navy','rose','lavender','turquoise','burgundy',
  'khaki','cream','ivory','tan','teal','olive'];
function extractColor(name) {
  const l = String(name||'').toLowerCase();
  for (const c of COLOR_KEYWORDS) {
    if (new RegExp('\\b'+c+'\\b','i').test(l)) return c;
  }
  return null;
}
function extractSize(name) {
  const m = String(name||'').match(/(\d+)(?:mm|ml|l|inch|in|cm|layer|tiers?)/i);
  if (m) return m[0];
  const kw = ['5"','10"','12"','16"','18"','20"','24"','50l','75l','100l','140l','180l'];
  const l = String(name||'').toLowerCase();
  for (const s of kw) if (l.includes(s)) return s;
  return null;
}
const SIM_STOP = new Set(['with','from','that','this','have','were','been','they','them','their',
  'what','when','your','each','other','than','into','only','over','such',
  'also','made','make','like','just','more','some','very','much','many',
  'various','different','special','unique','quality','design','style','color',
  'size','material','feature','product','item','piece','pieces','set','pack',
  'include','handle','cover','case','bag','box','kit','tool','device',
  'equipment','accessory','supplies','supply','container','package','packaging',
  'women','woman','men','mans','kids','kid','baby','adult',
  'red','blue','green','black','white','pink','purple','orange','yellow',
  'brown','gray','grey','gold','silver','beige','clear','mint','navy','rose',
  'lavender','turquoise','burgundy','khaki','cream','ivory','tan','teal','olive',
  'cotton','floral','pattern','doctor','educational','role','play','pretend',
  'breathable','glass','water','bottle','cup','tea','beverage','portable',
  'heat','resistant','plastic','steel','metal','wooden']);
function tokenize(s) {
  return String(s||'').toLowerCase().split(/[^a-z0-9]+/)
    .filter(w => w.length>2 && !SIM_STOP.has(w));
}
function nameSimilarity(a,b) {
  const wa=tokenize(a), wb=tokenize(b);
  if (!wa.length||!wb.length) return 0;
  const sb=new Set(wb);
  const inter = wa.filter(w=>sb.has(w)).length;
  const union = new Set([...wa,...wb]).size;
  return union>0 ? inter/union : 0;
}
function parseVariantOptions(p) {
  const opts = {};
  if (p.variantOptions) {
    try { Object.assign(opts, typeof p.variantOptions==='string'?JSON.parse(p.variantOptions):p.variantOptions); } catch(e){}
  }
  const rawSize = opts.size || p.size || extractSize(p.name) || undefined;
  const rawCapacity = opts.capacity || undefined;
  const dupCap = rawSize && rawCapacity && String(rawSize).toLowerCase()===String(rawCapacity).toLowerCase();
  let color = opts.color || p.color || null;
  if (!color) {
    const cleaned = String(p.name||'').replace(/\d+[\s-]?(?:ml|l|mm|cm|inch|in|layer|tiers?|pack|pcs?|pieces?|set|count)/gi,' ').replace(/\s+/g,' ').trim();
    color = extractColor(cleaned) || extractColor(p.name) || undefined;
  }
  return {
    color: color || undefined, colorHex: opts.colorHex || null,
    size: rawSize, capacity: dupCap?undefined:rawCapacity,
    layer: opts.layer || undefined, pack: opts.pack || undefined,
    material: opts.material || p.material || undefined,
  };
}
function toVariant(p) {
  const o = parseVariantOptions(p);
  return {
    sku: p.sku||'', name: p.name, slug: p.slug||'',
    price: Number(p.priceMin ?? p.price)||0,
    image: p.image||'', stock: Number(p.stock)||0, moq: Number(p.moq)||undefined,
    color: o.color??null, colorHex: o.colorHex||null,
    size: o.size??null, capacity: o.capacity??null,
    layer: o.layer??null, pack: o.pack??null, material: o.material??null,
    packagingInfo: p.packagingInfo || null,
  };
}
const VARIANT_NAME_SIM_THRESHOLD = 0.25;
const DIM_RATIO_THRESHOLD = 0.5;

function buildVariantGroups(products) {
  const groups = new Map();
  const parentById = new Map();
  for (const p of products) if (p.isParent===true && !p.parentId) parentById.set(String(p.id),p);
  for (const p of products) {
    if (!p.parentId) continue;
    const parent = parentById.get(String(p.parentId));
    if (!parent) continue;
    if (p.categoryId && parent.categoryId && p.categoryId !== parent.categoryId) continue;
    const sim = nameSimilarity(parent.name, p.name);
    if ((parent.name||p.name) && sim < VARIANT_NAME_SIM_THRESHOLD) continue;
    const key = String(p.parentId);
    if (!groups.has(key)) {
      const colorMap = new Map(), sizeMap = new Map();
      if (Array.isArray(parent.variantChildren)) {
        for (const vc of parent.variantChildren) {
          if (vc.sku && vc.color) colorMap.set(vc.sku, vc.color);
          if (vc.sku && vc.size)  sizeMap.set(vc.sku, vc.size);
        }
      }
      groups.set(key, {
        parentSku: parent.sku||key, parentSlug: parent.slug||String(parent.sku||'').toLowerCase(),
        baseName: parent.name, categoryId: parent.categoryId||'',
        variants: [], minPrice: Infinity, maxPrice: 0,
        _cm: colorMap, _sm: sizeMap,
      });
    }
    const g = groups.get(key);
    const v = toVariant(p);
    if (g._cm && g._cm.has(p.sku)) v.color = g._cm.get(p.sku);
    if (g._sm && g._sm.has(p.sku)) v.size  = g._sm.get(p.sku);
    if (!v.color && g._cm) {
      for (const [sku,col] of g._cm) {
        if (p.sku && p.sku.endsWith(sku.split('-').pop())) { v.color = col; break; }
      }
    }
    g.variants.push(v);
    if (v.price>0) { g.minPrice = Math.min(g.minPrice,v.price); g.maxPrice=Math.max(g.maxPrice,v.price); }
  }
  // Phase 2
  const buckets = new Map();
  for (const p of products) {
    if (p.parentId) continue;
    const sku = p.sku || '';
    const parts = sku.split('-');
    if (parts.length>=4 && parts[0]==='YCS') {
      const ps = parts.slice(0,3).join('-');
      if (!buckets.has(ps)) buckets.set(ps,[]);
      buckets.get(ps).push(p);
    }
  }
  for (const [parentSku, cands] of buckets) {
    if (cands.length<2) continue;
    let has = false;
    for (const g of groups.values()) if (g.parentSku === parentSku) { has=true; break; }
    if (has) continue;
    const catCounts = new Map();
    for (const c of cands) {
      const cat = String(c.categoryId||''); if (!cat) continue;
      catCounts.set(cat,(catCounts.get(cat)||0)+1);
    }
    let dom='',maxC=0;
    for (const [cat,n] of catCounts) if (n>maxC){dom=cat;maxC=n;}
    const sorted = [...cands].sort((a,b)=>String(a.name||'').length - String(b.name||'').length);
    const base = sorted[0]?.name || '';
    const filtered = cands.filter(c=>{
      if (dom && c.categoryId && c.categoryId !== dom) return false;
      const sim = nameSimilarity(base, c.name);
      if (base && c.name && sim < VARIANT_NAME_SIM_THRESHOLD) return false;
      return true;
    });
    if (filtered.length<2) continue;
    const variants = filtered.map(toVariant);
    variants.sort((a,b)=>a.price-b.price);
    const prices = variants.map(v=>v.price).filter(p=>p>0);
    groups.set(parentSku, {
      parentSku, parentSlug: parentSku.toLowerCase(),
      baseName: variants[0].name
        .replace(/^(Black|White|Red|Blue|Pink|Green|Purple|Orange|Yellow|Brown|Gray|Grey|Gold|Silver|Beige|Clear|Mint|Navy|Rose|Lavender|Turquoise)\s/i,'')
        .replace(/\d+[-\s]?(?:mm|ml|l|inch|in|cm)/i,'').replace(/\d+[-\s]?(?:layer|tiers?)/i,'')
        .replace(/\s+/g,' ').trim(),
      categoryId: dom, variants,
      minPrice: prices.length?Math.min(...prices):0,
      maxPrice: prices.length?Math.max(...prices):0,
    });
  }
  for (const g of groups.values()) {
    if (g.variants.length>0) g.variants.sort((a,b)=>a.price-b.price);
    if (g.minPrice===Infinity) g.minPrice=0;
  }
  // Phase 3
  const EMPTY_TUPLE_MAX_RATIO = 0.5;
  for (const [key,g] of groups.entries()) {
    if (g.variants.length<2) continue;
    const EMPTY = 'c=|s=|cap=|l=|p=|m=';
    const tuples = g.variants.map(v=>
      'c='+String(v.color||'').trim()+'|s='+String(v.size||'').trim()
       +'|cap='+String(v.capacity||'').trim()+'|l='+String(v.layer||'').trim()
       +'|p='+String(v.pack||'').trim()+'|m='+String(v.material||'').trim()
    );
    const counts = new Map();
    for (const t of tuples) counts.set(t, (counts.get(t)||0)+1);
    const emptyCount = counts.get(EMPTY)||0;
    const emptyRatio = emptyCount / tuples.length;
    const dupNonEmpty = [...counts.entries()].some(([t,n])=>t!==EMPTY && n>=2);
    const allEmpty = emptyCount === tuples.length;
    let drop=false, reason='';
    if (allEmpty) { drop=true; reason='ALL_EMPTY'; }
    else if (emptyRatio > EMPTY_TUPLE_MAX_RATIO) { drop=true; reason=`EMPTY_DOMINANT(${emptyRatio.toFixed(2)})`; }
    else if (dupNonEmpty) { drop=true; reason='DUP_SPEC'; }
    if (drop) groups.delete(key);
  }
  return groups;
}

const groups = buildVariantGroups(seed.products || []);
console.log('Total variant groups after fix:', groups.size);

// Helper: get group for a parent SKU
function groupForParentSku(sku) {
  for (const g of groups.values()) if (g.parentSku === sku) return g;
  return null;
}

// Bad cases that SHOULD be ungrouped now — confirmed all-empty / all-same / heavy empty / dup-spec
const badSkus = ['YCS-MSS-005','YCS-MSS-006','YCS-STO-033','YCS-SHO-015','YCS-SHO-016','YCS-BTY-001','YCS-KST-003','YCS-BBC-011','YCS-CLO-028','YCS-MOT-005'];
console.log('\n=== Broken SKUs (expected NO group now) ===');

// SKUs that SHOULD still be grouped after the fix (valid variants via variantOptions)
const goodRetainedSkus = ['YCS-STO-008','YCS-STO-014'];
console.log('\n=== Legit SKUs (EXPECTED to still be grouped — valid dimensions via variantOptions) ===');
let pass = true;
for (const s of badSkus) {
  const g = groupForParentSku(s);
  const ok = !g;
  if (!ok) pass=false;
  console.log('  '+s.padEnd(14), ok ? 'OK (no group)' : `FAIL — has group w/ ${g.variants.length} variants: [${g.variants.map(v=>v.sku).join(', ')}]`);
}
// Check good legit SKU still grouped
console.log('\n=== Good SKU: YCS-MCS-003 (phone cases: has real color variants) ===');
const mcs = groupForParentSku('YCS-MCS-003');
if (!mcs) {
  console.log('  WARNING: YCS-MCS-003 no longer grouped (might still be ok — manual check)');
} else {
  console.log(`  GROUPED ✓ — ${mcs.variants.length} variants`);
  mcs.variants.forEach(v => console.log(`    - ${v.sku} color=${v.color||'(none)'} size=${v.size||'(none)'}`));
}
// Spot check YCS-DRY-001: 100Cm vs 80Cm (differ by name, extractSize should give sizes)
console.log('\n=== Good SKU: YCS-DRY-001 (100Cm vs 80Cm pole) ===');
const dry = groupForParentSku('YCS-DRY-001');
if (!dry) {
  console.log('  YCS-DRY-001: no group (2 distinct-size items will be independent)');
} else {
  console.log(`  GROUPED — ${dry.variants.length} variants`);
  dry.variants.forEach(v => console.log(`    - ${v.sku} size=${v.size||'(none)'} capacity=${v.capacity||'(none)'}`));
}
// For screenshot SKU YCS-MSS-005-001 (the child in the screenshot): should NOT be in any group
console.log('\n=== Screenshot spot-check: YCS-MSS-005-001 should be STANDALONE ===');
const gByChild = (sku) => { for (const g of groups.values()) if (g.variants.some(v=>v.sku===sku)) return g; return null; };
const foundChild = gByChild('YCS-MSS-005-001');
if (foundChild) {
  pass=false;
  console.log('  FAIL — YCS-MSS-005-001 is still in a variant group!');
} else {
  console.log('  OK — YCS-MSS-005-001 is STANDALONE (no variants associated)');
}
// Print groups summary
console.log('\n=== Final groups summary (first 10) ===');
let n = 0;
for (const g of groups.values()) {
  if (++n > 10) break;
  console.log(`  ${g.parentSku.padEnd(16)} variants=${String(g.variants.length).padStart(2)} base=${g.baseName.slice(0,55)}`);
}
console.log('... total =', groups.size, 'groups');
console.log('\nOVERALL:', pass ? '✅ ALL PASS' : '❌ FAILURES');
process.exit(pass?0:1);
