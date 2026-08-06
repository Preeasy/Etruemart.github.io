/**
 * Item List 批量导入脚本
 *
 * 读取 Item list.xlsx，导入 776 个产品到数据库。
 *
 * 规则:
 *   1. 保留原始 Item Number 作为 SKU
 *   2. 价格按 CNY / 6.7 * 1.15 转美元
 *   3. 1688 链接不展示在前台（仅存数据库 keywords 备用）
 *   4. 为每个产品生成完整 listing（描述）和 A+ 内容
 *   5. 分类原来没有的新增
 *   6. 图片从本地 all-github-images 按类目最佳匹配，无匹配用占位图
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
      if (!(key in process.env)) process.env[key] = value;
    }
  });
}

const prisma = new PrismaClient();

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

// === 一级类目映射（中文 -> slug + 英文名）===
// 已有的复用，没有的新增
const CATEGORY_MAP = {
  '手机配件':   { slug: 'phone-accessories',    en: 'Phone Accessories' },
  '厨房用品':   { slug: 'kitchen-supplies',     en: 'Kitchen Supplies' },
  '箱包':       { slug: 'bags',                 en: 'Bags' },
  '服装鞋帽':   { slug: 'apparel-shoes',        en: 'Apparel & Shoes' },
  '数码电子':   { slug: 'electronics',          en: 'Electronics' },
  '家居日用':   { slug: 'home-living',          en: 'Home & Living' },
  '五金家居':   { slug: 'hardware-home',        en: 'Hardware & Home' },
  '文具办公':   { slug: 'stationery-office',    en: 'Stationery & Office' },
  '美妆个护':   { slug: 'beauty-personal-care', en: 'Beauty & Personal Care' },
  '汽配工具':   { slug: 'auto-tools',           en: 'Auto & Tools' },
  '运动户外':   { slug: 'sports-outdoor',       en: 'Sports & Outdoor' },
  '其他':       { slug: 'other',                en: 'Other' },
  '母婴玩具':   { slug: 'mother-baby-toys',     en: 'Mother, Baby & Toys' },
  '家用电器':   { slug: 'home-appliances',      en: 'Home Appliances' },
  '乐器':       { slug: 'musical-instruments',  en: 'Musical Instruments' },
  '宠物用品':   { slug: 'pet-supplies',         en: 'Pet Supplies' },
};

// === 图片匹配 ===
const IMG_DIR = path.join(__dirname, '..', 'all-github-images');
const PUBLIC_IMG_DIR = path.join(__dirname, '..', 'public', 'images', 'item-list');
if (!fs.existsSync(PUBLIC_IMG_DIR)) {
  fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
}

// 构建图片池
const imagePools = {};
if (fs.existsSync(IMG_DIR)) {
  const files = fs.readdirSync(IMG_DIR);
  // 编号图片 001-022
  imagePools['numbered'] = files.filter(f => /^\d+\.(jpg|jpeg|png|webp)$/i.test(f)).sort();
  // 分类图片
  imagePools['Fashion_Jewelry'] = files.filter(f => /^Fashion Jewelry\(\d+\)/i.test(f)).sort();
  imagePools['Bag_accessories'] = files.filter(f => /^Bag accessories \(\d+\)/i.test(f)).sort();
  imagePools['Garment_Accessories'] = files.filter(f => /^Garment Accessories \(\d+\)/i.test(f)).sort();
  imagePools['Hair_Accessories'] = files.filter(f => /^Hair Accessories \(\d+\)/i.test(f)).sort();
  imagePools['Home_Decor_Crafts'] = files.filter(f => /^Home_Decor_Crafts\(\d+\)/i.test(f)).sort();
  imagePools['Toys_Gift'] = files.filter(f => /^Toys_Gift\(\d+\)/i.test(f)).sort();
}

// 一级类目 -> 图片池映射
const CATEGORY_IMAGE_MAP = {
  '手机配件':   'numbered',
  '厨房用品':   'numbered',
  '箱包':       'Bag_accessories',
  '服装鞋帽':   'Fashion_Jewelry',
  '数码电子':   'numbered',
  '家居日用':   'Home_Decor_Crafts',
  '五金家居':   'numbered',
  '文具办公':   'numbered',
  '美妆个护':   'Hair_Accessories',
  '汽配工具':   'numbered',
  '运动户外':   'numbered',
  '其他':       'numbered',
  '母婴玩具':   'Toys_Gift',
  '家用电器':   'numbered',
  '乐器':       'numbered',
  '宠物用品':   'numbered',
};

let imgCounters = {};
function getImageForCategory(catCn, itemNumber) {
  const poolKey = CATEGORY_IMAGE_MAP[catCn] || 'numbered';
  const pool = imagePools[poolKey] || imagePools['numbered'] || [];
  if (pool.length === 0) return '/images/product-placeholder.svg';

  if (imgCounters[poolKey] === undefined) imgCounters[poolKey] = 0;
  const file = pool[imgCounters[poolKey] % pool.length];
  imgCounters[poolKey]++;

  // 复制到 public 目录
  const src = path.join(IMG_DIR, file);
  const ext = path.extname(file).toLowerCase();
  const safeName = slugify(itemNumber) + ext;
  const dest = path.join(PUBLIC_IMG_DIR, safeName);
  try {
    fs.copyFileSync(src, dest);
    return '/images/item-list/' + safeName;
  } catch (e) {
    return '/images/product-placeholder.svg';
  }
}

// === 生成 A+ 内容 ===
function generateAplus(name, catEn, material, color, moq, sku, price, pkgInfo) {
  const aplusObj = {
    description: `Discover our ${name} — premium ${catEn.toLowerCase()} from Yiwu wholesale market. Quality guaranteed, factory-direct pricing.`,
    bulletPoints: [
      `Premium quality ${catEn.toLowerCase()} for retail and wholesale`,
      'Competitive factory-direct pricing from Yiwu',
      `MOQ: ${moq} pcs | Lead Time: 7-15 days`,
      color ? `Available in: ${color}` : 'Multiple options available',
      material ? `Material: ${material}` : 'High-quality construction',
      'Custom packaging and labeling available on request',
      'Fast worldwide shipping with tracking',
    ],
    blocks: [
      {
        id: 'overview',
        type: 'text',
        content: `<h2>About This ${name}</h2><p>${name} is a premium ${catEn.toLowerCase()} product sourced directly from Yiwu wholesale market. ${material ? 'Crafted with ' + material + '.' : ''} ${color ? 'Available in ' + color + '.' : ''} Designed for quality and value.</p>`
      },
      {
        id: 'features',
        type: 'text',
        content: `<h3>Key Features</h3><ul><li>Premium quality construction</li><li>Factory-direct wholesale pricing</li><li>Custom packaging & labeling available</li><li>MOQ: ${moq} pcs</li><li>Lead time: 7-15 days</li><li>Worldwide shipping supported</li></ul>`
      },
      {
        id: 'specs',
        type: 'specs',
        content: `<h3>Specifications</h3><p><strong>Item No:</strong> ${sku}</p><p><strong>MOQ:</strong> ${moq} pcs</p>${material ? `<p><strong>Material:</strong> ${material}</p>` : ''}${color ? `<p><strong>Color:</strong> ${color}</p>` : ''}${pkgInfo ? `<p><strong>Packaging:</strong> ${pkgInfo}</p>` : ''}<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>`
      },
    ],
  };
  return JSON.stringify(aplusObj);
}

// === 主流程 ===
async function main() {
  console.log('=== Item List 批量导入 ===\n');

  const excelPath = path.resolve(__dirname, '..', 'Item list.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('文件不存在:', excelPath);
    process.exit(1);
  }

  // 读取 Excel
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

  // 表头在第0行，第1行是子表头（L长/W宽/H高），数据从第2行开始
  console.log('表头:', rawRows[0]);
  console.log('子表头:', rawRows[1]);
  console.log('数据行:', rawRows.length - 2);

  const dataRows = XLSX.utils.sheet_to_json(worksheet, { defval: null }).slice(1); // 跳过子表头行
  console.log('有效数据行:', dataRows.length, '\n');

  // 获取 admin 用户
  const admin = await prisma.user.findUnique({ where: { email: 'yeatrusourcing@gmail.com' }, select: { id: true } });
  if (!admin) {
    console.error('管理员账号不存在');
    process.exit(1);
  }
  console.log('Admin ID:', admin.id);

  // 获取现有分类
  const existingCats = await prisma.category.findMany({ select: { id: true, slug: true, name: true, parentId: true } });
  const slugToCat = new Map(existingCats.map(c => [c.slug, c]));
  console.log('现有分类数:', existingCats.length);

  // 新增缺失的分类
  console.log('\n=== 创建新分类 ===');
  for (const [cnName, catInfo] of Object.entries(CATEGORY_MAP)) {
    if (!slugToCat.has(catInfo.slug)) {
      const newCat = await prisma.category.create({
        data: {
          slug: catInfo.slug,
          name: catInfo.en,
          description: `${catInfo.en} - wholesale from Yiwu`,
        }
      });
      slugToCat.set(catInfo.slug, newCat);
      console.log('  新增:', catInfo.slug, '|', catInfo.en);
    }
  }

  // 获取现有产品 SKU
  const existingProducts = await prisma.product.findMany({ select: { id: true, sku: true, slug: true } });
  const existingBySku = new Map(existingProducts.map(p => [p.sku, p]));
  const existingSlugs = new Set(existingProducts.map(p => p.slug).filter(Boolean));
  console.log('\n现有产品数:', existingProducts.length);

  // 导入
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    try {
      const itemNumber = row['Item Number'];
      if (!itemNumber) { skipped++; continue; }

      const catL1Cn = row['一级类目'] || '其他';
      const catL2Cn = row['二级类目'] || '';
      const descEn = row['Item Desc.'] || '';
      const nameCn = row['中文名'] || '';
      const unitPriceCny = row['Unit Price'] || 0;
      const packSize = row['装箱数(pcs/ctn)'] || 1;
      const length = row['L长'] || row['__EMPTY_7'] || null;
      const width = row['W宽'] || row['__EMPTY_8'] || null;
      const height = row['H高'] || null;
      const grossWeight = row['每件毛重\nG.W./ctn'] || row['每件毛重G.W./ctn'] || null;
      const cbm = row['单件体积CBM/ctn(M³)'] || null;
      const link1688 = row['Link'] || '';

      // 产品名称：英文描述优先，无则用中文名
      const name = descEn || nameCn || itemNumber;

      // 分类
      const catInfo = CATEGORY_MAP[catL1Cn] || CATEGORY_MAP['其他'];
      const categoryId = slugToCat.get(catInfo.slug)?.id;

      // 价格转美元
      let priceUsd = cnyToUsd(Number(unitPriceCny));
      // Detect carton-level pricing: if UnitPrice seems to be the total for the whole carton
      // (common when UnitPrice is high but per-piece price would be reasonable after dividing by packSize)
      if (packSize > 1 && priceUsd > 20) {
        const perPieceUsd = cnyToUsd(Number(unitPriceCny) / Number(packSize));
        if (perPieceUsd < 10) {
          // UnitPrice is carton total, not per-piece — use per-piece price
          priceUsd = Math.round(perPieceUsd * 100) / 100;
          console.log(`  [PRICE FIX] ${itemNumber}: carton price detected. UnitPrice(${unitPriceCny}CNY)/Qty(${packSize}) = ${priceUsd} USD/pc`);
        }
      }
      const originalPrice = priceUsd > 0 ? Math.round(priceUsd * 1.4 * 100) / 100 : 0;
      const moq = Math.max(1, Math.min(packSize || 1, 100));

      // 图片
      const imageUrl = getImageForCategory(catL1Cn, itemNumber);
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
      if (length && width && height) pkgInfo = `${length}×${width}×${height} cm`;
      if (grossWeight) pkgInfo += (pkgInfo ? ', ' : '') + `G.W. ${grossWeight} kg`;
      if (packSize && packSize > 1) pkgInfo += (pkgInfo ? ', ' : '') + `${packSize} pcs/ctn`;

      // listing 描述
      const descParts = [
        `<p>Premium ${name} wholesale from Yiwu. ${catInfo.en} for retailers, boutiques, and online sellers.</p>`,
      ];
      if (nameCn && nameCn !== name) descParts.push(`<p><strong>中文名:</strong> ${nameCn}</p>`);
      if (catL2Cn) descParts.push(`<p><strong>Category:</strong> ${catInfo.en} / ${catL2Cn}</p>`);
      descParts.push(`<p><strong>Item No:</strong> ${itemNumber}</p>`);
      if (priceUsd > 0) descParts.push(`<p><strong>Price:</strong> $${priceUsd} USD</p>`);
      descParts.push(`<p><strong>MOQ:</strong> ${moq} pcs</p>`);
      descParts.push(`<p><strong>Lead Time:</strong> 7-15 days</p>`);
      if (pkgInfo) descParts.push(`<p><strong>Packaging:</strong> ${pkgInfo}</p>`);
      descParts.push(`<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>`);
      descParts.push(`<p>Factory direct pricing, reliable quality. Bulk orders welcome.</p>`);
      const description = descParts.join('\n');

      // A+ 内容
      const aplus = generateAplus(name, catInfo.en, '', '', moq, itemNumber, priceUsd, pkgInfo);

      // 关键词（不包含 1688 链接）
      const keywords = JSON.stringify([name, itemNumber, catInfo.en, catL2Cn, nameCn, 'wholesale', 'yiwu'].filter(Boolean));

      // 检查是否已存在
      const existing = existingBySku.get(itemNumber);
      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name,
            slug,
            description,
            aplus,
            sku: itemNumber,
            price: priceUsd,
            priceMax: null,
            originalPrice,
            image: imageUrl,
            images: imagesStr,
            categoryId,
            moq,
            packSize: packSize || 1,
            pkgWeight: grossWeight ? Number(grossWeight) : null,
            pkgLength: length ? Number(length) : null,
            pkgWidth: width ? Number(width) : null,
            pkgHeight: height ? Number(height) : null,
            keywords,
            stockStatus: 'IN_STOCK',
            stock: 9999,
            isPublished: true,
            supplierCity: 'Yiwu',
            shippingCost: 0,
            shippingMethod: 'Standard Shipping',
            updatedAt: new Date(),
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            name,
            slug,
            description,
            aplus,
            sku: itemNumber,
            price: priceUsd,
            priceMax: null,
            originalPrice,
            image: imageUrl,
            images: imagesStr,
            categoryId,
            moq,
            packSize: packSize || 1,
            pkgWeight: grossWeight ? Number(grossWeight) : null,
            pkgLength: length ? Number(length) : null,
            pkgWidth: width ? Number(width) : null,
            pkgHeight: height ? Number(height) : null,
            keywords,
            stockStatus: 'IN_STOCK',
            stock: 9999,
            isPublished: true,
            supplierCity: 'Yiwu',
            shippingCost: 0,
            shippingMethod: 'Standard Shipping',
            authorId: admin.id,
            variants: {
              create: [{
                color: 'Default',
                size: 'One Size',
                price: priceUsd,
                stock: 9999,
              }],
            },
          },
        });
        created++;
      }

      if ((created + updated) % 50 === 0) {
        console.log(`进度: ${created + updated}/${dataRows.length} (创建:${created} 更新:${updated})`);
      }
    } catch (err) {
      console.error(`第 ${i + 2} 行失败:`, err.message.substring(0, 100));
      errors++;
    }
  }

  console.log('\n=== 导入完成 ===');
  console.log(`总行数: ${dataRows.length}`);
  console.log(`创建: ${created}`);
  console.log(`更新: ${updated}`);
  console.log(`跳过: ${skipped}`);
  console.log(`错误: ${errors}`);

  // 最终统计
  const total = await prisma.product.count();
  const noDesc = await prisma.$queryRaw`SELECT COUNT(*) as c FROM products WHERE description = '' OR description IS NULL`;
  const noAplus = await prisma.$queryRaw`SELECT COUNT(*) as c FROM products WHERE aplus IS NULL`;
  const noSku = await prisma.$queryRaw`SELECT COUNT(*) as c FROM products WHERE sku IS NULL`;
  console.log(`\n数据库产品总数: ${total}`);
  console.log(`无描述: ${noDesc[0].c}`);
  console.log(`无A+: ${noAplus[0].c}`);
  console.log(`无SKU: ${noSku[0].c}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error('导入失败:', e); process.exit(1); });
