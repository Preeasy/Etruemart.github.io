/**
 * Excel 产品批量导入脚本（v2 - 带 SKU 前缀图片匹配 + 本地上传）
 *
 * 用法:
 *   node scripts/import-excel-products.cjs <excel文件路径>
 *
 * 功能:
 *   1. 读取 Excel 文件，自动检测列映射
 *   2. 基于 SKU 前缀 (YW-FJ / YW-GA / YW-BA / ...) 从 all-github-images 目录匹配图片
 *   3. 映射到网站分类
 *   4. 写入数据库（authorId = admin）
 *   5. 人民币价格转美元 (÷6.7 × 1.15)
 *
 * 图片匹配策略:
 *   - 每个 SKU 形如 YW-{PREFIX}-{NNN}，NNN 为序号
 *   - all-github-images 中的文件按规则:
 *       001.jpg - 022.jpg                -> 全局序号 001 ~ 022
 *       Fashion Jewelry(N).jpg           -> YW-FJ  类目序号 N
 *       Garment Accessories (N).jpg      -> YW-GA  类目序号 N
 *       Bag accessories (N).jpg         -> YW-BA  类目序号 N
 *       Hair Accessories (N).jpg        -> YW-HA  类目序号 N
 *       Home_Decor_Crafts(N).jpg        -> YW-HD  类目序号 N
 *       Toys_Gift(N).jpg                 -> YW-TG  类目序号 N
 *     若该序号无对应图片，则回退到最近可用图片或占位图。
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  });
}

const prisma = new PrismaClient();

// === 图片目录准备 ===
const IMG_DIR = path.join(__dirname, '..', 'all-github-images');
const PUBLIC_IMG_DIR = path.join(__dirname, '..', 'public', 'images', 'excel');
if (!fs.existsSync(PUBLIC_IMG_DIR)) {
  fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
}

// === 构建图片索引 ===
// 1. 全局编号索引 (001.jpg - 022.jpg)
const numberedIndex = {};
if (fs.existsSync(IMG_DIR)) {
  const files = fs.readdirSync(IMG_DIR);
  for (const f of files) {
    const m = f.match(/^(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (m) {
      numberedIndex[parseInt(m[1])] = f;
    }
  }
}

// 2. 分类图片索引: prefix -> { [num]: 'filename' }
const CATEGORY_IMG_MAP = {
  FJ: 'Fashion Jewelry',
  GA: 'Garment Accessories',
  BA: 'Bag accessories',
  HA: 'Hair Accessories',
  HD: 'Home_Decor_Crafts',
  TG: 'Toys_Gift',
};

const categoryImgIndex = {}; // { FJ: { 1: 'Fashion Jewelry(1).jpg', ... }, ... }
const categoryImgFiles = {}; // 原始文件名表，用于去重
if (fs.existsSync(IMG_DIR)) {
  const allFiles = fs.readdirSync(IMG_DIR);
  for (const [prefix, catName] of Object.entries(CATEGORY_IMG_MAP)) {
    categoryImgIndex[prefix] = {};
    categoryImgFiles[prefix] = [];
    // 匹配 "(N)" 形式
    const regex = new RegExp(`^${catName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*\\((\\d+)\\)\\.(jpg|jpeg|png|webp)$`, 'i');
    for (const f of allFiles) {
      const m = f.match(regex);
      if (m) {
        const n = parseInt(m[1]);
        categoryImgIndex[prefix][n] = f;
        categoryImgFiles[prefix].push({ num: n, file: f });
      }
    }
    // 排序，用于回退
    categoryImgFiles[prefix].sort((a, b) => a.num - b.num);
  }
}

// === SKU 前缀 -> 分类 slug ===
const SKU_PREFIX_CATEGORY = {
  FJ: 'fashion-jewelry',
  GA: 'garment-accessories',
  BA: 'bags',
  HA: 'accessories',
  TG: 'toys',
  HD: 'home-decor-crafts',
};

// === 子分类映射（基于 SKU 序号分组后的轮询）===
const CATEGORY_SUBCATEGORY_ROTATION = {
  'fashion-jewelry': ['necklaces', 'earrings', 'rings', 'bracelets-bangles', 'brooches-pins', 'jewelry-sets'],
  'garment-accessories': ['zippers', 'buttons', 'lace-trim', 'embroidery-patches'],
  'bags': ['bag-charms', 'keychains', 'handbags'],
  'accessories': ['hair-clips', 'headbands', 'hair-ties', 'hair-pins', 'bag-charms', 'keychains'],
  'toys': ['stress-relief-toys', 'fidget-toys', 'educational-toys', 'gift-sets'],
  'home-decor-crafts': ['home-decor-crafts'],
};

// === 列名自动检测 ===
const COLUMN_PATTERNS = {
  itemNo: [
    /^item\s*no\.?$/i, /^item\s*code$/i, /^item$/i, /^item号$/i, /^编号$/i,
    /^货号$/i, /^product\s*no\.?$/i, /^product\s*code$/i, /^art\.?\s*no\.?$/i,
  ],
  sku: [/^sku$/i, /^sku\s*code$/i, /^产品编码$/i],
  nameCn: [/^.*name.*\(cn\).*$/i, /^中文名称$/i, /^中文产品名.*$/i, /^产品名称$/i, /^名称$/i],
  nameEn: [
    /^.*name.*\(en\).*$/i, /^英文名称$/i, /^英文产品名.*$/i,
    /^product\s*name$/i, /^product\s*title$/i, /^name$/i, /^title$/i,
    /^product\s*name\s*\(en\)$/i,
  ],
  priceMin: [
    /^price\s*\(min\)$/i, /^price\s*min/i, /^min\s*price/i,
    /^最低价.*$/i, /^价格$/i, /^price$/i, /^unit\s*price/i,
    /^price\(min\)$/i,
  ],
  priceMax: [
    /^price\s*\(max\)$/i, /^price\s*max/i, /^max\s*price/i,
    /^最高价.*$/i, /^price\(max\)$/i,
  ],
  moq: [/^moq$/i, /^起订量$/i, /^min\s*order/i, /^minimum\s*order/i],
  categoryL1: [
    /^category\s*l?1$/i, /^category$/i, /^分类$/i, /^一级分类$/i,
    /^category\s*1$/i, /^大类$/i,
  ],
  categoryL2: [
    /^category\s*l?2$/i, /^sub\s*category$/i, /^子分类$/i, /^二级分类$/i,
    /^category\s*2$/i, /^小类$/i, /^subcategory$/i,
  ],
  description: [/^description$/i, /^描述$/i, /^产品描述$/i, /^detail/i, /^详情$/i],
  material: [/^material$/i, /^材质$/i],
  color: [/^color$/i, /^颜色$/i, /^colour$/i],
  size: [/^size$/i, /^尺寸$/i, /^规格$/i],
  origin: [/^origin$/i, /^产地$/i, /^来源$/i],
  pkgWeight: [/^(package\s*)?weight/i, /^包装重量/i, /^重量$/i, /^pkg\s*weight/i],
  pkgLength: [/^(package\s*)?length/i, /^包装长度/i, /^长度$/i, /^pkg\s*length/i],
  pkgWidth: [/^(package\s*)?width/i, /^包装宽度/i, /^宽度$/i, /^pkg\s*width/i],
  pkgHeight: [/^(package\s*)?height/i, /^包装高度/i, /^高度$/i, /^pkg\s*height/i],
  packSize: [/^pack\s*size/i, /^包装规格$/i, /^装箱数$/i],
  image: [/^image$/i, /^图片$/i, /^photo$/i, /^product\s*image/i, /^主图$/i],
};

function detectColumns(headers) {
  const mapping = {};
  for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').trim();
      if (!h) continue;
      for (const p of patterns) {
        if (p.test(h)) {
          if (!(field in mapping)) {
            mapping[field] = i;
          }
          break;
        }
      }
    }
  }
  return mapping;
}

// === 图片匹配 ===
function parseSku(sku) {
  if (!sku) return null;
  const parts = String(sku).split('-');
  if (parts.length < 3) return null;
  return {
    prefix: parts[1].toUpperCase(),
    num: parseInt(parts[2]),
    raw: String(sku),
  };
}

// 将本地图片复制到 public/images/excel，返回可访问的 URL
let uploadedCount = 0;
function stageLocalImage(filename, skuSlug) {
  const src = path.join(IMG_DIR, filename);
  if (!fs.existsSync(src)) return null;
  const ext = path.extname(filename).toLowerCase();
  const safeName = `${skuSlug}${ext}`;
  const dest = path.join(PUBLIC_IMG_DIR, safeName);
  try {
    fs.copyFileSync(src, dest);
    uploadedCount++;
    return `/images/excel/${safeName}`;
  } catch (e) {
    return null;
  }
}

function matchImageForSku(sku) {
  const parsed = parseSku(sku);
  if (!parsed) return null;
  const { prefix, num } = parsed;

  // 1. 优先用分类图片
  if (categoryImgIndex[prefix]) {
    if (categoryImgIndex[prefix][num]) {
      return stageLocalImage(categoryImgIndex[prefix][num], `${prefix}-${String(num).padStart(3, '0')}`);
    }
    // 回退：线性查找最近编号
    const files = categoryImgFiles[prefix];
    if (files.length > 0) {
      // 取不超过 num 的最大；若没有，取最小
      let best = files[0];
      for (const f of files) {
        if (f.num <= num) best = f;
        else break;
      }
      return stageLocalImage(best.file, `${prefix}-${String(num).padStart(3, '0')}`);
    }
  }

  // 2. 回退到全局编号图片（1-22 循环）
  const mod = ((num - 1) % 22) + 1;
  if (numberedIndex[mod]) {
    return stageLocalImage(numberedIndex[mod], `${prefix}-${String(num).padStart(3, '0')}`);
  }

  return null;
}

// === slug 生成 ===
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// 人民币转美元：CNY / 6.7 × 1.15（上浮15%）
function cnyToUsd(cny) {
  if (!cny || cny <= 0) return 0;
  return Math.round((cny / 6.7) * 1.15 * 100) / 100;
}

// === 主流程 ===
async function main() {
  const excelPath = process.argv[2];
  if (!excelPath) {
    console.error('用法: node scripts/import-excel-products.cjs <excel文件路径>');
    process.exit(1);
  }

  const fullPath = path.resolve(excelPath);
  if (!fs.existsSync(fullPath)) {
    console.error('文件不存在:', fullPath);
    process.exit(1);
  }

  console.log('=== Excel 产品批量导入 (v2) ===');
  console.log('文件:', fullPath);
  console.log('图片目录:', IMG_DIR);
  console.log('公共目录:', PUBLIC_IMG_DIR);

  // 读取 Excel
  const workbook = XLSX.readFile(fullPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  console.log('工作表:', sheetName);

  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  if (rawRows.length < 2) {
    console.error('Excel 数据不足');
    process.exit(1);
  }

  const headers = rawRows[0];
  console.log('表头:', headers);
  const colMap = detectColumns(headers);
  console.log('列映射:', JSON.stringify(colMap, null, 2));

  if (colMap.itemNo === undefined && colMap.sku !== undefined) {
    colMap.itemNo = colMap.sku;
  }

  const dataRows = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  console.log(`共 ${dataRows.length} 行数据\n`);

  // 获取 admin 用户
  const adminEmail = 'yeatrusourcing@gmail.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('管理员账号不存在:', adminEmail);
    process.exit(1);
  }
  console.log('管理员:', admin.email);

  // 获取分类
  let categories = [];
  try {
    categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  } catch (e) {
    console.warn('数据库分类查询失败，使用 categories-data.json 作为备选');
    const jsonPath = path.join(__dirname, '..', 'categories-data.json');
    if (fs.existsSync(jsonPath)) {
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      categories = (jsonData.categories || []).map(c => ({ id: c.slug, slug: c.slug }));
    }
  }
  const slugToId = new Map();
  categories.forEach(c => slugToId.set(c.slug, c.id));
  console.log('分类数量:', categories.length);

  // 预加载现有产品
  const existingProducts = await prisma.product.findMany({ select: { id: true, sku: true, slug: true } });
  const existingBySku = new Map();
  const existingBySlug = new Map();
  existingProducts.forEach(p => {
    if (p.sku) existingBySku.set(p.sku, p);
    if (p.slug) existingBySlug.set(p.slug, p);
  });
  console.log('已有产品:', existingProducts.length);

  // 跟踪本轮新增的 slug
  const createdSlugs = new Set(existingProducts.map(p => p.slug).filter(Boolean));

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let noImage = 0;
  let noCategory = 0;
  const errors = [];

  // 每 category 的子分类轮询索引
  const subIdx = {};

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    try {
      const getVal = (field) => {
        if (colMap[field] !== undefined) return row[headers[colMap[field]]];
        return undefined;
      };

      const sku = getVal('sku');
      const itemNo = getVal('itemNo') || sku;
      const nameCn = getVal('nameCn');
      const nameEn = getVal('nameEn');
      const name = nameEn || nameCn || sku || `Product ${i + 1}`;
      const priceMin = cnyToUsd(toNumber(getVal('priceMin')));
      const priceMax = cnyToUsd(toNumber(getVal('priceMax')));
      const moq = getVal('moq') ? Math.max(1, parseInt(getVal('moq'))) : 1;
      const catL1 = getVal('categoryL1');
      const catL2 = getVal('categoryL2');
      const description = getVal('description') || '';
      const material = getVal('material') || '';
      const color = getVal('color') || '';
      const size = getVal('size') || '';
      const origin = getVal('origin') || null;
      const pkgWeight = getVal('pkgWeight') ? toNumber(getVal('pkgWeight')) : null;
      const pkgLength = getVal('pkgLength') ? toNumber(getVal('pkgLength')) : null;
      const pkgWidth = getVal('pkgWidth') ? toNumber(getVal('pkgWidth')) : null;
      const pkgHeight = getVal('pkgHeight') ? toNumber(getVal('pkgHeight')) : null;
      const packSize = getVal('packSize') ? parseInt(getVal('packSize')) : 1;

      // --- 分类：基于 SKU 前缀 ---
      const parsedSku = parseSku(sku);
      let categorySlug = null;
      if (parsedSku && SKU_PREFIX_CATEGORY[parsedSku.prefix]) {
        categorySlug = SKU_PREFIX_CATEGORY[parsedSku.prefix];
      }
      // 回退到 Excel 里的 Category L1/L2
      if (!categorySlug) {
        if (catL1) {
          const m = {
            'Fashion Jewelry': 'fashion-jewelry',
            'Garment Accessories': 'garment-accessories',
            'Accessories': 'accessories',
            'Hair Accessories': 'accessories',
            'Bags': 'bags',
            'Bag Accessories': 'accessories',
            'Home Decor & Crafts': 'home-decor-crafts',
            'Home Decor': 'home-decor-crafts',
            'Toys': 'toys',
            'Toys & Gift': 'toys',
            'Gift': 'gift',
            '时尚首饰': 'fashion-jewelry',
            '服装辅料': 'garment-accessories',
            '箱包': 'bags',
            '发饰': 'accessories',
            '玩具礼品': 'toys',
            '家居装饰工艺品': 'home-decor-crafts',
          };
          categorySlug = m[String(catL1).trim()] || m[String(catL1).trim().toLowerCase()];
        }
      }
      const categoryId = categorySlug && slugToId.has(categorySlug) ? slugToId.get(categorySlug) : null;
      if (!categoryId) noCategory++;

      // 子分类 (轮询)
      let subcategorySlug = null;
      if (categorySlug && CATEGORY_SUBCATEGORY_ROTATION[categorySlug]) {
        if (subIdx[categorySlug] === undefined) subIdx[categorySlug] = 0;
        const subs = CATEGORY_SUBCATEGORY_ROTATION[categorySlug];
        // 用 SKU 序号来确定子分类位置，让同款产品聚集在同一子分类下
        const idx = parsedSku ? (parsedSku.num - 1) % subs.length : subIdx[categorySlug];
        subcategorySlug = subs[idx];
        subIdx[categorySlug]++;
      }

      // --- 图片 ---
      let imageUrl = getVal('image');
      if (!imageUrl && sku) {
        imageUrl = matchImageForSku(sku);
      }
      if (!imageUrl) {
        imageUrl = '/images/product-placeholder.svg';
        noImage++;
      }

      // --- slug（确保唯一）---
      let slug = slugify(name);
      if (!slug) slug = slugify(sku) || `product-${Date.now()}-${i}`;
      let finalSlug = slug;
      let counter = 1;
      while (createdSlugs.has(finalSlug)) {
        finalSlug = `${slug}-${parsedSku ? parsedSku.prefix.toLowerCase() : 'p'}${counter}`;
        counter++;
      }
      slug = finalSlug;
      createdSlugs.add(slug);

      // --- 构建描述（Listing + A+ 结构）---
      const descParts = [];
      if (description) descParts.push(description);
      if (nameCn) descParts.push(`<p><strong>中文名称:</strong> ${nameCn}</p>`);
      if (material) descParts.push(`<p><strong>Material:</strong> ${material}</p>`);
      if (color) descParts.push(`<p><strong>Color:</strong> ${color}</p>`);
      if (size) descParts.push(`<p><strong>Size:</strong> ${size}</p>`);
      if (sku) descParts.push(`<p><strong>Item No:</strong> ${sku}</p>`);
      descParts.push(`<p><strong>MOQ:</strong> ${moq} pcs</p>`);
      descParts.push(`<p><strong>Lead Time:</strong> 7-15 days</p>`);
      descParts.push(`<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>`);
      const finalDesc = descParts.join('\n');

      // A+ 内容（基于产品分类和属性自动生成，存为 JSON 结构）
      const aplusObj = {
        description: `Discover our ${name} — a premium ${categorySlug ? categorySlug.replace(/-/g, ' ') : 'product'} crafted with care. Perfect for ${material ? material.toLowerCase() + ' ' : ''}${color ? color.toLowerCase() + ' ' : ''}applications.`,
        bulletPoints: [
          `Premium ${material || 'quality'} materials for lasting durability`,
          `Competitive wholesale pricing — direct from Yiwu factory`,
          `MOQ: ${moq} pcs | Lead Time: 7-15 days`,
          color ? `Available in ${color}` : 'Multiple color options available',
          size ? `Size: ${size}` : 'Custom sizes available',
          'Custom packaging, labeling and logos available',
          'Fast turnaround and reliable worldwide shipping',
        ],
        blocks: [
          { id: 'overview', type: 'text', content: `<h2>About This ${name}</h2><p>${name} is carefully crafted with premium materials to meet the highest quality standards. ${color ? 'Available in ' + color + '. ' : ''}${size ? 'Size: ' + size + '. ' : ''}${material ? 'Material: ' + material + '.' : ''}</p>` },
          { id: 'features', type: 'text', content: `<h3>Key Features</h3><ul><li>Premium quality construction</li><li>Competitive factory-direct pricing</li><li>Custom packaging & labeling available</li><li>MOQ starting from ${moq} pcs</li><li>Lead time: 7-15 days</li></ul>` },
          { id: 'specs', type: 'specs', content: `<h3>Specifications</h3><p><strong>SKU:</strong> ${sku || 'N/A'}</p><p><strong>MOQ:</strong> ${moq} pcs</p>${pkgWeight ? `<p><strong>Weight:</strong> ${pkgWeight}g</p>` : ''}${pkgLength ? `<p><strong>Package Size:</strong> ${pkgLength} × ${pkgWidth || ''} × ${pkgHeight || ''} cm</p>` : ''}<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>` },
        ],
      };
      const aplus = JSON.stringify(aplusObj);

      // 关键词
      const keywords = [name, sku, itemNo, catL1, catL2, categorySlug, subcategorySlug].filter(Boolean).map(String);

      // 图片列表
      const imagesArr = [imageUrl];
      const imagesStr = JSON.stringify(imagesArr);

      // 价格
      const originalPrice = priceMax > priceMin ? priceMax : (priceMin * 1.3);

      // --- 检查是否已存在 ---
      let existing = null;
      if (sku) existing = existingBySku.get(String(sku));
      if (!existing) existing = existingBySlug.get(slug);

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: String(name),
            description: finalDesc,
            aplus,
            price: priceMin,
            priceMax: priceMax || null,
            originalPrice,
            image: imageUrl,
            images: imagesStr,
            categoryId: categoryId || existing.categoryId,
            material: material || null,
            color: color || null,
            size: size || null,
            moq,
            sku: sku ? String(sku) : null,
            origin,
            stockStatus: 'IN_STOCK',
            stock: 9999,
            packSize,
            pkgWeight,
            pkgLength,
            pkgWidth,
            pkgHeight,
            keywords: JSON.stringify(keywords),
            updatedAt: new Date(),
          },
        });
        updated++;
        // 更新本地索引
        if (sku) existingBySku.set(String(sku), existing);
      } else {
        await prisma.product.create({
          data: {
            name: String(name),
            slug,
            description: finalDesc,
            aplus,
            price: priceMin,
            priceMax: priceMax || null,
            originalPrice,
            image: imageUrl,
            images: imagesStr,
            categoryId: categoryId,
            aplus,
            material: material || null,
            color: color || null,
            size: size || null,
            moq,
            sku: sku ? String(sku) : null,
            origin,
            supplierCity: 'Yiwu',
            stockStatus: 'IN_STOCK',
            stock: 9999,
            isPublished: true,
            packSize,
            pkgWeight,
            pkgLength,
            pkgWidth,
            pkgHeight,
            keywords: JSON.stringify(keywords),
            shippingCost: 0,
            shippingMethod: 'Standard Shipping',
            authorId: admin.id,
            variants: {
              create: [{
                color: color || 'Default',
                size: size || 'One Size',
                price: priceMin,
                stock: 9999,
              }],
            },
          },
        });
        created++;
        if (sku) existingBySku.set(String(sku), { id: null, sku: String(sku), slug });
        existingBySlug.set(slug, { id: null, sku: String(sku) || null, slug });
      }

      if ((created + updated) % 20 === 0) {
        console.log(`进度: ${created + updated}/${dataRows.length} (创建:${created} 更新:${updated})`);
      }
    } catch (err) {
      errors.push(`第 ${i + 2} 行: ${err.message}`);
      skipped++;
    }
  }

  console.log('\n=== 导入完成 ===');
  console.log(`总行数: ${dataRows.length}`);
  console.log(`创建: ${created}`);
  console.log(`更新: ${updated}`);
  console.log(`跳过(错误): ${skipped}`);
  console.log(`未匹配图片: ${noImage}`);
  console.log(`未匹配分类: ${noCategory}`);
  console.log(`上传图片文件: ${uploadedCount}`);
  if (errors.length > 0) {
    console.log('\n错误详情 (前20条):');
    errors.slice(0, 20).forEach(e => console.log('  ' + e));
  }

  const total = await prisma.product.count();
  console.log(`\n数据库产品总数: ${total}`);
}

main()
  .catch(e => { console.error('导入失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
