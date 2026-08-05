/**
 * 从 SQLite 数据库导出数据为 JSON 格式
 * 用于迁移到 PostgreSQL
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
const OUTPUT_PATH = path.join(__dirname, '..', 'prisma', 'sqlite-export.json');

console.log(`[export] Connecting to SQLite database: ${DB_PATH}`);

const db = new Database(DB_PATH, { readonly: true });

const tables = ['categories', 'products', 'product_variants', 'shipping_templates'];
const exportData = {};

for (const table of tables) {
  try {
    const stmt = db.prepare(`SELECT * FROM "${table}"`);
    const rows = stmt.all();
    exportData[table] = rows;
    console.log(`[export] Exported ${rows.length} records from ${table}`);
  } catch (err) {
    console.warn(`[export] Warning: Could not export ${table}: ${err.message}`);
    exportData[table] = [];
  }
}

db.close();

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(exportData, null, 2), 'utf-8');
console.log(`[export] Data exported to: ${OUTPUT_PATH}`);
console.log(`[export] Total products: ${exportData.products?.length || 0}`);
console.log(`[export] Total categories: ${exportData.categories?.length || 0}`);
