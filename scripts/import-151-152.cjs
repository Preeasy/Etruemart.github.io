/**
 * Item list 151-152 导入脚本
 *
 * 读取 Item list 151-152.xlsx，将 54 个新产品导入数据库。
 *
 * 规则（沿用之前逻辑）:
 *   1. 保留原始 Item Number 作为 SKU
 *   2. 价格按 CNY / 6.7 * 1.15 转美元，检测整箱价并修正
 *   3. 1688 链接不展示在前台（仅存数据库 keywords 备用）
 *   4. 为每个产品生成完整 listing（描述）和 A+ 内容
 *   5. 图片从 GitHub 图床按 Item 号匹配 (商品图片/YCS-XXX.png)
 *   6. 变体通过 SKU 模式自动检测（YCS-XXX-NNN-NNN 为子，YCS-XXX-NNN 为父）
 *   7. 创建子分类（服装/鞋类/办公用品）以优化站点结构
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const crypto = require('crypto');

// === 数据库 ===
const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// === Admin 用户 ===
const ADMIN_ID = 'cms9v6m5e0000twrnlnvirdpm';

// === 人民币转美元：CNY / 6.7 × 1.15 ===
function cnyToUsd(cny) {
  if (!cny || cny <= 0) return 0;
  return Math.round((cny / 6.7) * 1.15 * 100) / 100;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// === GitHub 图床图片匹配 ===
// 图片位于 Preeasy/images 仓库的「商品图片」目录，按 Item 号命名
const GH_IMG_BASE = 'https://raw.githubusercontent.com/Preeasy/images/main/%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87/';

// 从 GitHub 获取的完整文件列表（54 个文件）
const GH_IMAGE_FILES = [
  'YCS-CLO-037-001.png', 'YCS-CLO-037-002.png', 'YCS-CLO-037-003.png',
  'YCS-CLO-038.png',
  'YCS-CLO-039-001.png', 'YCS-CLO-039-002.png',
  'YCS-CLO-040-001.png', 'YCS-CLO-040-002.png',
  'YCS-CLO-041.png',
  'YCS-CLO-042-001.png', 'YCS-CLO-042-002.png', 'YCS-CLO-042-003.png',
  'YCS-CLO-043.jpg',
  'YCS-CLO-044-001.jpg', 'YCS-CLO-044-002.jpg', 'YCS-CLO-044-003.jpg',
  'YCS-CLO-045-001.png', 'YCS-CLO-045-002.png', 'YCS-CLO-045-003.png', 'YCS-CLO-045-004.png',
  'YCS-OFC-004.png',
  'YCS-SHO-035-001.png', 'YCS-SHO-035-002.png', 'YCS-SHO-035-003.png', 'YCS-SHO-035-004.png',
  'YCS-SHO-036-001.png', 'YCS-SHO-036-002.png', 'YCS-SHO-036-003.png', 'YCS-SHO-036-004.png', 'YCS-SHO-036-005.png',
  'YCS-SHO-037-001.png', 'YCS-SHO-037-002.png', 'YCS-SHO-037-003.png', 'YCS-SHO-037-004.png', 'YCS-SHO-037-005.png',
  'YCS-SHO-038-001.png', 'YCS-SHO-038-002.png',
  'YCS-SHO-039-001.png', 'YCS-SHO-039-002.png',
  'YCS-SHO-040-001.png', 'YCS-SHO-040-002.png',
  'YCS-SHO-041-001.png', 'YCS-SHO-041-002.png', 'YCS-SHO-041-003.png', 'YCS-SHO-041-004.png',
  'YCS-SHO-042-001.png', 'YCS-SHO-042-002.png', 'YCS-SHO-042-003.png', 'YCS-SHO-042-004.png', 'YCS-SHO-042-005.png', 'YCS-SHO-042-006.png',
  'YCS-SHO-043-001.jpg', 'YCS-SHO-043-002.jpg', 'YCS-SHO-043-003.jpg',
];

// 构建 SKU -> 图片URL 映射
const imageMap = new Map();
for (const file of GH_IMAGE_FILES) {
  const sku = file.replace(/\.(png|jpg|jpeg|webp)$/i, '');
  imageMap.set(sku, GH_IMG_BASE + encodeURIComponent(file));
}

function getImageForSku(sku) {
  return imageMap.get(sku) || '/images/product-placeholder.svg';
}

// === 从产品名称提取颜色 ===
function extractColor(name) {
  const match = name.match(/^(Black|White|Gray|Grey|Red|Blue|Green|Pink|Yellow|Orange|Purple|Brown|Beige|Khaki|Navy|Light Blue|Light Gray|Light Brown|Pure White|White Black|White Gray|White Blue|White Red|White Green|Black Blue|Black Orange|Black White|Color Block|Multicolor)\b/i);
  return match ? match[1] : '';
}

// === 分类映射 ===
// 二级类目(中文) -> { parentSlug, slug, en, cn }
const SUBCATEGORY_MAP = {
  '服装':   { parentSlug: 'apparel-shoes',     slug: 'clothing',        en: 'Clothing',        cn: '服装' },
  '鞋类':   { parentSlug: 'apparel-shoes',     slug: 'shoes',           en: 'Shoes',           cn: '鞋类' },
  '办公用品': { parentSlug: 'stationery-office', slug: 'office-supplies', en: 'Office Supplies', cn: '办公用品' },
};

// === 生成 A+ 内容 ===
function generateAplus(name, catEn, subCatEn, color, moq, sku, price, pkgInfo) {
  const aplusObj = {
    description: `Discover our ${name} — premium ${subCatEn || catEn.toLowerCase()} from Yiwu wholesale market. Quality guaranteed, factory-direct pricing.`,
    bulletPoints: [
      `Premium quality ${subCatEn ? subCatEn.toLowerCase() : catEn.toLowerCase()} for retail and wholesale`,
      'Competitive factory-direct pricing from Yiwu',
      `MOQ: ${moq} pcs | Lead Time: 7-15 days`,
      color ? `Available in: ${color}` : 'Multiple color options available',
      'Custom packaging and labeling available on request',
      'Fast worldwide shipping with tracking',
    ],
    blocks: [
      {
        id: 'overview',
        type: 'text',
        content: `<h2>About This ${name}</h2><p>${name} is a premium ${subCatEn ? subCatEn.toLowerCase() : catEn.toLowerCase()} product sourced directly from Yiwu wholesale market. ${color ? 'Available in ' + color + '.' : ''} Designed for quality and value, ideal for retailers, boutiques, and online sellers.</p>`
      },
      {
        id: 'features',
        type: 'text',
        content: `<h3>Key Features</h3><ul><li>Premium quality construction</li><li>Factory-direct wholesale pricing</li><li>Custom packaging & labeling available</li><li>MOQ: ${moq} pcs</li><li>Lead time: 7-15 days</li><li>Worldwide shipping supported</li></ul>`
      },
      {
        id: 'specs',
        type: 'specs',
        content: `<h3>Specifications</h3><p><strong>Item No:</strong> ${sku}</p><p><strong>MOQ:</strong> ${moq} pcs</p>${color ? `<p><strong>Color:</strong> ${color}</p>` : ''}${pkgInfo ? `<p><strong>Packaging:</strong> ${pkgInfo}</p>` : ''}<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>`
      },
    ],
  };
  return JSON.stringify(aplusObj);
}

// === 主流程 ===
function main() {
  console.log('=== Item list 151-152 导入 ===\n');

  const excelPath = path.resolve(__dirname, '..', 'Item list 151-152.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('文件不存在:', excelPath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const dataRows = XLSX.utils.sheet_to_json(worksheet, { defval: null }).slice(1); // 跳过子表头行
  console.log('有效数据行:', dataRows.length, '\n');

  // === 创建子分类 ===
  console.log('=== 创建/获取子分类 ===');
  const parentCatMap = new Map();
  const allCats = db.prepare('SELECT id, slug, parentId FROM categories').all();
  for (const c of allCats) parentCatMap.set(c.slug, c);

  const subcatIdMap = new Map(); // cn -> categoryId

  for (const [cn, info] of Object.entries(SUBCATEGORY_MAP)) {
    const parent = parentCatMap.get(info.parentSlug);
    if (!parent) {
      console.error(`  父分类不存在: ${info.parentSlug}`);
      continue;
    }
    // 检查子分类是否已存在
    let sub = db.prepare('SELECT id FROM categories WHERE slug = ? AND parentId = ?').get(info.slug, parent.id);
    if (!sub) {
      const id = 'cat-' + crypto.randomBytes(12).toString('hex');
      db.prepare(`INSERT INTO categories (id, name, slug, description, parentId, sortOrder, createdAt, updatedAt)
                  VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
        .run(id, info.en, info.slug, `${info.en} - wholesale from Yiwu`, parent.id, 0);
      sub = { id };
      console.log(`  新增子分类: ${info.slug} | ${info.en} (under ${info.parentSlug})`);
    } else {
      console.log(`  子分类已存在: ${info.slug} | ${info.en}`);
    }
    subcatIdMap.set(cn, sub.id);
  }

  // === 获取现有产品 SKU 与 slug ===
  const existingProducts = db.prepare('SELECT id, sku, slug FROM products').all();
  const existingBySku = new Map(existingProducts.map(p => [p.sku, p]));
  const existingSlugs = new Set(existingProducts.map(p => p.slug).filter(Boolean));
  console.log('\n现有产品数:', existingProducts.length);

  // === 导入 ===
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  let priceFixed = 0;

  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, name, slug, description, aplus, sku, price, priceMax, originalPrice,
      image, images, categoryId, stock, rating, reviewCount, salesCount,
      isPublished, shippingCost, shippingMethod, material, plating, process,
      color, size, packSize, pkgLength, pkgWidth, pkgHeight, pkgWeight,
      keywords, origin, supplierCity, stockStatus, moq, createdAt, updatedAt, authorId
    ) VALUES (
      @id, @name, @slug, @description, @aplus, @sku, @price, @priceMax, @originalPrice,
      @image, @images, @categoryId, @stock, @rating, @reviewCount, @salesCount,
      @isPublished, @shippingCost, @shippingMethod, @material, @plating, @process,
      @color, @size, @packSize, @pkgLength, @pkgWidth, @pkgHeight, @pkgWeight,
      @keywords, @origin, @supplierCity, @stockStatus, @moq, datetime('now'), datetime('now'), @authorId
    )
  `);

  const updateStmt = db.prepare(`
    UPDATE products SET
      name=@name, slug=@slug, description=@description, aplus=@aplus, price=@price,
      priceMax=@priceMax, originalPrice=@originalPrice, image=@image, images=@images,
      categoryId=@categoryId, packSize=@packSize, pkgLength=@pkgLength, pkgWidth=@pkgWidth,
      pkgHeight=@pkgHeight, pkgWeight=@pkgWeight, keywords=@keywords, color=@color,
      moq=@moq, updatedAt=datetime('now')
    WHERE id=@id
  `);

  const insertVariantStmt = db.prepare(`
    INSERT INTO product_variants (id, productId, color, size, price, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    try {
      const itemNumber = row['Item Number'];
      if (!itemNumber) { skipped++; continue; }

      const catL1Cn = row['一级类目'] || '其他';
      const catL2Cn = row['二级类目'] || '';
      const descEn = row['Item Desc.'] || '';
      const nameCn = row['中文名'] || '';
      const unitPriceCny = Number(row['Unit Price']) || 0;
      const packSize = Number(row['装箱数(pcs/ctn)']) || 1;
      const grossWeight = row['每件毛重\nG.W./ctn'] || row['每件毛重G.W./ctn'] || null;
      const cbm = row['单件体积CBM/ctn(M³)'] || null;
      const link1688 = row['Link'] || '';

      // 产品名称：英文描述优先
      const name = descEn || nameCn || itemNumber;
      const color = extractColor(name);

      // 分类：优先用二级类目对应子分类，否则用一级类目
      const subcatInfo = SUBCATEGORY_MAP[catL2Cn];
      let categoryId = null;
      let catEn = 'Other';
      let subCatEn = '';
      if (subcatInfo) {
        categoryId = subcatIdMap.get(catL2Cn);
        catEn = subcatInfo.parentSlug === 'apparel-shoes' ? 'Apparel & Shoes' : 'Stationery & Office';
        subCatEn = subcatInfo.en;
      } else {
        // 回退到一级类目
        const parentSlug = catL1Cn === '服装鞋帽' ? 'apparel-shoes' : (catL1Cn === '文具办公' ? 'stationery-office' : 'other');
        const parent = parentCatMap.get(parentSlug);
        categoryId = parent?.id || null;
        catEn = parent?.slug === 'apparel-shoes' ? 'Apparel & Shoes' : (parent?.slug === 'stationery-office' ? 'Stationery & Office' : 'Other');
      }

      // 价格转美元
      let priceUsd = cnyToUsd(unitPriceCny);
      // 检测整箱价：如果 UnitPrice 是整箱总价
      if (packSize > 1 && priceUsd > 20) {
        const perPieceUsd = cnyToUsd(unitPriceCny / packSize);
        if (perPieceUsd < 10) {
          priceUsd = Math.round(perPieceUsd * 100) / 100;
          priceFixed++;
          console.log(`  [PRICE FIX] ${itemNumber}: 整箱价 ¥${unitPriceCny}/箱(${packSize}pcs) -> $${priceUsd}/pc`);
        }
      }
      const originalPrice = priceUsd > 0 ? Math.round(priceUsd * 1.4 * 100) / 100 : 0;
      const moq = Math.max(1, Math.min(packSize || 1, 100));

      // 图片：按 SKU 匹配 GitHub 图床
      const imageUrl = getImageForSku(itemNumber);
      const imagesStr = JSON.stringify([imageUrl]);

      // slug（确保唯一）
      let slug = slugify(name) || slugify(itemNumber);
      let finalSlug = slug;
      let counter = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = finalSlug;
      existingSlugs.add(slug);

      // 包装信息
      let pkgInfo = '';
      if (packSize && packSize > 1) pkgInfo = `${packSize} pcs/ctn`;
      if (grossWeight) pkgInfo += (pkgInfo ? ', ' : '') + `G.W. ${grossWeight} kg`;
      if (cbm) pkgInfo += (pkgInfo ? ', ' : '') + `CBM ${cbm} m³`;

      // listing 描述（简洁、SEO 友好、无冗余）
      const descParts = [
        `<p>Premium ${name} wholesale from Yiwu. ${subCatEn || catEn} for retailers, boutiques, and online sellers.</p>`,
      ];
      if (nameCn && nameCn !== name) descParts.push(`<p><strong>中文名:</strong> ${nameCn}</p>`);
      descParts.push(`<p><strong>Item No:</strong> ${itemNumber}</p>`);
      if (color) descParts.push(`<p><strong>Color:</strong> ${color}</p>`);
      if (priceUsd > 0) descParts.push(`<p><strong>Price:</strong> $${priceUsd} USD/pc</p>`);
      descParts.push(`<p><strong>MOQ:</strong> ${moq} pcs</p>`);
      descParts.push(`<p><strong>Lead Time:</strong> 7-15 days</p>`);
      if (pkgInfo) descParts.push(`<p><strong>Packaging:</strong> ${pkgInfo}</p>`);
      descParts.push(`<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>`);
      descParts.push(`<p>Factory direct pricing, reliable quality. Bulk orders welcome.</p>`);
      const description = descParts.join('\n');

      // A+ 内容
      const aplus = generateAplus(name, catEn, subCatEn, color, moq, itemNumber, priceUsd, pkgInfo);

      // 关键词（不包含 1688 链接）
      const keywordsArr = [name, itemNumber, catEn, subCatEn, catL2Cn, nameCn, color, 'wholesale', 'yiwu'].filter(Boolean);
      const keywords = JSON.stringify(keywordsArr);

      // 检查是否已存在
      const existing = existingBySku.get(itemNumber);
      if (existing) {
        updateStmt.run({
          id: existing.id,
          name, slug, description, aplus, price: priceUsd, priceMax: null, originalPrice,
          image: imageUrl, images: imagesStr, categoryId, packSize: packSize || 1,
          pkgLength: null, pkgWidth: null, pkgHeight: null,
          pkgWeight: grossWeight ? Number(grossWeight) : null,
          keywords, color: color || null, moq,
        });
        updated++;
      } else {
        const id = 'prod-' + crypto.randomBytes(12).toString('hex');
        insertStmt.run({
          id, name, slug, description, aplus, sku: itemNumber, price: priceUsd, priceMax: null,
          originalPrice, image: imageUrl, images: imagesStr, categoryId,
          stock: 9999, rating: 0, reviewCount: 0, salesCount: 0, isPublished: 1,
          shippingCost: 0, shippingMethod: 'Standard Shipping',
          material: null, plating: null, process: null,
          color: color || null, size: null, packSize: packSize || 1,
          pkgLength: null, pkgWidth: null, pkgHeight: null,
          pkgWeight: grossWeight ? Number(grossWeight) : null,
          keywords, origin: 'Yiwu, China', supplierCity: 'Yiwu',
          stockStatus: 'IN_STOCK', moq, authorId: ADMIN_ID,
        });
        // 创建默认变体
        const variantId = 'var-' + crypto.randomBytes(12).toString('hex');
        insertVariantStmt.run(variantId, id, color || 'Default', 'One Size', priceUsd, 9999);
        created++;
      }

      if ((created + updated) % 10 === 0) {
        console.log(`进度: ${created + updated}/${dataRows.length} (创建:${created} 更新:${updated})`);
      }
    } catch (err) {
      console.error(`第 ${i + 2} 行失败:`, err.message.substring(0, 120));
      errors++;
    }
  }

  console.log('\n=== 导入完成 ===');
  console.log(`总行数: ${dataRows.length}`);
  console.log(`创建: ${created}`);
  console.log(`更新: ${updated}`);
  console.log(`跳过: ${skipped}`);
  console.log(`错误: ${errors}`);
  console.log(`价格修正(整箱价): ${priceFixed}`);

  // 最终统计
  const total = db.prepare('SELECT COUNT(*) as c FROM products').get();
  const newCount = db.prepare("SELECT COUNT(*) as c FROM products WHERE sku LIKE 'YCS-CLO-03%' OR sku LIKE 'YCS-CLO-04%' OR sku LIKE 'YCS-SHO-03%' OR sku LIKE 'YCS-SHO-04%' OR sku LIKE 'YCS-OFC-004'").get();
  console.log(`\n数据库产品总数: ${total.c}`);
  console.log(`本次新增系列产品数: ${newCount.c}`);

  // 变体组统计
  const variantGroups = db.prepare(`
    SELECT substr(sku, 1, 11) as parent, COUNT(*) as cnt
    FROM products
    WHERE sku LIKE 'YCS-CLO-03%' OR sku LIKE 'YCS-CLO-04%' OR sku LIKE 'YCS-SHO-03%' OR sku LIKE 'YCS-SHO-04%'
    GROUP BY substr(sku, 1, 11)
    HAVING cnt > 1
    ORDER BY parent
  `).all();
  console.log(`\n变体组 (父SKU 下多个子产品):`);
  for (const g of variantGroups) {
    console.log(`  ${g.parent}: ${g.cnt} variants`);
  }

  db.close();
}

main();
