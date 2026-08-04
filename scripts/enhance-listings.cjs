/**
 * 为 776 个空占位产品生成完整的 listing 信息
 *
 * 这些产品当前只有 "Product N" 名称和部分价格数据，
 * 需要生成：产品名称、描述、A+内容、分类、图片、SKU、材质等
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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

// === 产品名模板库（按分类）===
const PRODUCT_TEMPLATES = {
  'fashion-jewelry': [
    { name: 'Gold Plated Layered Necklace', material: 'Stainless Steel', color: 'Gold', sub: 'pendant-necklaces' },
    { name: 'Silver Crystal Stud Earrings', material: '925 Silver', color: 'Silver', sub: 'stud-earrings' },
    { name: 'Pearl Drop Earrings Set', material: 'Freshwater Pearl', color: 'White', sub: 'drop-earrings' },
    { name: 'Rose Gold Tennis Bracelet', material: 'Stainless Steel', color: 'Rose Gold', sub: 'chain-bracelets' },
    { name: 'Vintage Coin Pendant Necklace', material: 'Alloy', color: 'Gold', sub: 'pendant-necklaces' },
    { name: 'Minimalist Gold Hoop Earrings', material: 'Stainless Steel', color: 'Gold', sub: 'hoop-earrings' },
    { name: 'Tibetan Silver Charm Bracelet', material: 'Tibetan Silver', color: 'Silver', sub: 'beaded-bracelets' },
    { name: 'Crystal Rhinestone Statement Necklace', material: 'Alloy + Crystal', color: 'Silver', sub: 'statement-necklaces' },
    { name: 'Gold Stackable Ring Set', material: 'Stainless Steel', color: 'Gold', sub: 'rings' },
    { name: 'Boho Tassel Layered Necklace', material: 'Alloy + Thread', color: 'Multicolor', sub: 'layered-necklaces' },
    { name: 'Floral Brooch Pin with Pearls', material: 'Alloy + Pearl', color: 'White', sub: 'brooches-pins' },
    { name: 'Cubic Zirconia Engagement Ring', material: '925 Silver', color: 'Silver', sub: 'rings' },
    { name: 'Geometric Metal Bangle Bracelet', material: 'Stainless Steel', color: 'Gold', sub: 'metal-bangles' },
    { name: 'Birthstone Pendant Necklace', material: 'Alloy', color: 'Multicolor', sub: 'pendant-necklaces' },
    { name: 'Elegant Jewelry Gift Set', material: 'Alloy + Crystal', color: 'Gold', sub: 'jewelry-sets' },
    { name: 'Stretch Beaded Bracelet Pack', material: 'Natural Stone', color: 'Multicolor', sub: 'stretch-bracelets' },
    { name: 'Choker Necklace with Crystal Pendant', material: 'Velvet + Alloy', color: 'Black', sub: 'choker-necklaces' },
    { name: 'Clip-On Pearl Earrings for Non-Pierced', material: 'Alloy + Pearl', color: 'White', sub: 'clip-on-earrings' },
    { name: 'Retro Enamel Butterfly Brooch', material: 'Alloy + Enamel', color: 'Multicolor', sub: 'brooches-pins' },
    { name: 'Gold Chain Link Necklace', material: 'Stainless Steel', color: 'Gold', sub: 'chain-bracelets' },
  ],
  'garment-accessories': [
    { name: 'Metal Jeans Button Pack', material: 'Copper', color: 'Silver', sub: 'buttons' },
    { name: 'Nylon Coil Zipper Roll', material: 'Nylon', color: 'Black', sub: 'nylon-zippers' },
    { name: 'Metal Open-End Zipper', material: 'Alloy', color: 'Gold', sub: 'metal-zippers' },
    { name: 'Cotton Lace Trim Roll', material: 'Cotton', color: 'White', sub: 'lace-trim' },
    { name: 'Embroidered Iron-On Patch Set', material: 'Polyester', color: 'Multicolor', sub: 'cartoon-patches' },
    { name: 'Decorative Rhinestone Zipper Pull', material: 'Alloy + Crystal', color: 'Silver', sub: 'decorative-zippers' },
    { name: 'Vintage Brass Button Assortment', material: 'Brass', color: 'Gold', sub: 'buttons' },
    { name: 'Waterproof PVC Zipper', material: 'PVC', color: 'Transparent', sub: 'waterproof-zippers' },
    { name: 'Floral Lace Applique for Garment', material: 'Cotton Blend', color: 'White', sub: 'lace-trim' },
    { name: 'Letter Iron-On Patch Pack', material: 'Polyester', color: 'Multicolor', sub: 'letter-patches' },
    { name: 'Hot Fix Rhinestone Sheet', material: 'Glass Crystal', color: 'Clear', sub: 'hot-fix-rhinestones' },
    { name: 'Denim Repair Patch Kit', material: 'Cotton', color: 'Blue', sub: 'repair-patches' },
    { name: 'Decorative Metal Chain for Garment', material: 'Alloy', color: 'Gold', sub: 'decorative-chains' },
    { name: 'Rivet Stud Decoration Pack', material: 'Alloy', color: 'Silver', sub: 'rivets-studs' },
    { name: 'Vintage Embroidery Patch', material: 'Thread + Fabric', color: 'Multicolor', sub: 'vintage-patches' },
    { name: 'Elastic Lace Band Trim', material: 'Polyester Blend', color: 'White', sub: 'lace-trim' },
    { name: 'Plastic Snap Button Set', material: 'Plastic', color: 'Multicolor', sub: 'buttons' },
    { name: 'Concealed Invisible Zipper', material: 'Nylon', color: 'Black', sub: 'nylon-zippers' },
    { name: 'Applique Sequin Patch', material: 'Sequin + Fabric', color: 'Gold', sub: 'appliques' },
    { name: 'Sewing Thread Spool Pack', material: 'Polyester', color: 'Multicolor', sub: 'thread-yarn' },
  ],
  'bags': [
    { name: 'Quilted Crossbody Shoulder Bag', material: 'PU Leather', color: 'Black', sub: 'bag-charms' },
    { name: 'Mini Chain Wallet Clutch', material: 'PU Leather', color: 'Red', sub: 'bag-charms' },
    { name: 'Canvas Tote Bag with Print', material: 'Canvas', color: 'Beige', sub: 'bag-charms' },
    { name: 'Beaded Bag Charm Keychain', material: 'Acrylic + Alloy', color: 'Multicolor', sub: 'bag-charms' },
    { name: 'Leather Card Holder Wallet', material: 'PU Leather', color: 'Brown', sub: 'bag-charms' },
    { name: 'Crystal Bag Chain Strap', material: 'Alloy + Crystal', color: 'Gold', sub: 'bag-charms' },
    { name: 'Mini Backpack with Front Pocket', material: 'Nylon', color: 'Black', sub: 'bag-charms' },
    { name: 'Pom Pom Bag Charm Tassel', material: 'Faux Fur + Alloy', color: 'Pink', sub: 'bag-charms' },
    { name: 'Quilted Continental Long Wallet', material: 'PU Leather', color: 'Black', sub: 'bag-charms' },
    { name: 'Metal Bag Frame Closure', material: 'Alloy', color: 'Gold', sub: 'bag-charms' },
    { name: 'Star Bag Charm with Tassel', material: 'Alloy + Thread', color: 'Gold', sub: 'bag-charms' },
    { name: 'Tassel Bag Charm Keychain', material: 'Alloy + Suede', color: 'Multicolor', sub: 'bag-charms' },
    { name: 'Pom Pom Bag Charm Pack', material: 'Faux Fur', color: 'Multicolor', sub: 'bag-charms' },
    { name: 'Letter Bag Charm Keychain', material: 'Alloy + Acrylic', color: 'Gold', sub: 'bag-charms' },
    { name: 'Western Belt Buckle Decorative', material: 'Alloy', color: 'Silver', sub: 'belt-buckles' },
    { name: 'Automatic Belt Buckle Set', material: 'Alloy', color: 'Black', sub: 'belt-buckles' },
    { name: 'Rhinestone Decorative Buckle', material: 'Alloy + Crystal', color: 'Silver', sub: 'belt-buckles' },
    { name: 'Crystal Bag Charm Pendant', material: 'Crystal + Alloy', color: 'Gold', sub: 'bag-charms' },
    { name: 'Metal Zipper for Bags', material: 'Alloy', color: 'Silver', sub: 'bag-charms' },
    { name: 'Decorative Bag Handle Chain', material: 'Alloy', color: 'Gold', sub: 'bag-charms' },
  ],
  'accessories': [
    { name: 'Velvet Scrunchie Hair Tie Pack', material: 'Velvet', color: 'Black', sub: 'hair-ties' },
    { name: 'Pearl Decorative Hair Clip', material: 'Alloy + Pearl', color: 'White', sub: 'hair-clips' },
    { name: 'Satin Scrunchie Set 6pc', material: 'Satin', color: 'Multicolor', sub: 'hair-ties' },
    { name: 'Crystal Hair Pin Set', material: 'Alloy + Crystal', color: 'Silver', sub: 'hair-pins' },
    { name: 'Knotted Headband Wide', material: 'Fabric', color: 'Beige', sub: 'headbands' },
    { name: 'Floral Hair Pin Clip', material: 'Fabric + Alloy', color: 'Pink', sub: 'hair-clips' },
    { name: 'Ribbon Scrunchie Hair Tie', material: 'Satin + Ribbon', color: 'Red', sub: 'hair-ties' },
    { name: 'Boho Headband with Crystal', material: 'Alloy + Crystal', color: 'Gold', sub: 'headbands' },
    { name: 'U-Shape Hair Pin Pack', material: 'Metal', color: 'Black', sub: 'hair-pins' },
    { name: 'Matte Hair Claw Clip', material: 'Plastic', color: 'Black', sub: 'hair-clips' },
    { name: 'Sequin Scrunchie Set', material: 'Sequin + Elastic', color: 'Gold', sub: 'hair-ties' },
    { name: 'Floral Headband for Girls', material: 'Fabric + Wire', color: 'Pink', sub: 'headbands' },
    { name: 'Rhinestone Hair Clip Barrette', material: 'Alloy + Crystal', color: 'Silver', sub: 'hair-clips' },
    { name: 'Gold Barrette Hair Clip', material: 'Alloy', color: 'Gold', sub: 'hair-clips' },
    { name: 'Elastic Hair Tie Band Pack', material: 'Elastic', color: 'Black', sub: 'hair-ties' },
    { name: 'Wire Headband Adjustable', material: 'Fabric + Wire', color: 'Multicolor', sub: 'headbands' },
    { name: 'Crystal Hair Pin Bridal', material: 'Alloy + Crystal', color: 'Silver', sub: 'hair-pins' },
    { name: 'Floral Hair Clip Pin Set', material: 'Fabric + Alloy', color: 'Multicolor', sub: 'hair-clips' },
    { name: 'Bobby Pin Pack Assorted', material: 'Metal', color: 'Black', sub: 'hair-pins' },
    { name: 'Decorative Keychain Ring', material: 'Alloy', color: 'Gold', sub: 'keychains' },
  ],
  'toys': [
    { name: 'Stress Relief Squeeze Ball', material: 'TPR', color: 'Multicolor', sub: 'stress-relief-toys' },
    { name: 'Magnetic Fidget Ball Set', material: 'Magnet + Plastic', color: 'Multicolor', sub: 'fidget-toys' },
    { name: 'Pop It Fidget Square', material: 'Silicone', color: 'Rainbow', sub: 'fidget-toys' },
    { name: 'Wooden Building Blocks Set', material: 'Wood', color: 'Natural', sub: 'educational-toys' },
    { name: 'Snake Cube Puzzle Toy', material: 'Plastic', color: 'Multicolor', sub: 'educational-toys' },
    { name: 'Mini Squishy Animal Toy', material: 'PU Foam', color: 'Multicolor', sub: 'stress-relief-toys' },
    { name: 'Fidget Spinner Metal Edition', material: 'Metal + Bearing', color: 'Silver', sub: 'fidget-toys' },
    { name: 'Magnetic Tiles Building Set', material: 'Magnet + Plastic', color: 'Multicolor', sub: 'educational-toys' },
    { name: 'Color Matching Game Set', material: 'Wood', color: 'Multicolor', sub: 'educational-toys' },
    { name: 'Infinity Cube Fidget Toy', material: 'Alloy', color: 'Black', sub: 'fidget-toys' },
    { name: 'Scented Squishy Toy Pack', material: 'PU Foam', color: 'Pink', sub: 'stress-relief-toys' },
    { name: 'Fidget Dice Cube Toy', material: 'Plastic', color: 'Black', sub: 'fidget-toys' },
    { name: 'Number Counting Sticks', material: 'Wood', color: 'Multicolor', sub: 'educational-toys' },
    { name: 'Jumbo Butter Squishy Toy', material: 'PU Foam', color: 'Yellow', sub: 'stress-relief-toys' },
    { name: 'Kids Party Favor Gift Set', material: 'Assorted', color: 'Multicolor', sub: 'gift-sets' },
    { name: 'Plush Teddy Bear with Scarf', material: 'Plush', color: 'Brown', sub: 'gift-sets' },
    { name: 'Birthday Gift Bundle Pack', material: 'Assorted', color: 'Multicolor', sub: 'gift-sets' },
    { name: 'Christmas Gift Box Set', material: 'Assorted', color: 'Red', sub: 'gift-sets' },
    { name: 'Easter Gift Bundle Toy', material: 'Assorted', color: 'Pastel', sub: 'gift-sets' },
    { name: 'Thank You Gift Set Mini', material: 'Assorted', color: 'Multicolor', sub: 'gift-sets' },
  ],
  'home-decor-crafts': [
    { name: 'White Ribbed Ceramic Vase', material: 'Ceramic', color: 'White', sub: 'home-decor-crafts' },
    { name: 'Polyresin Home Decor Sculpture', material: 'Polyresin', color: 'Gold', sub: 'home-decor-crafts' },
    { name: 'Miniature Tea Set Decor', material: 'Ceramic', color: 'White', sub: 'home-decor-crafts' },
    { name: 'Bead Mix for Craft Making', material: 'Acrylic', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Wall Art Decor Plaque', material: 'Wood + Metal', color: 'Natural', sub: 'home-decor-crafts' },
    { name: 'Table Centerpiece Decor', material: 'Polyresin', color: 'Gold', sub: 'home-decor-crafts' },
    { name: 'Ceramic Vase Trio Set', material: 'Ceramic', color: 'White', sub: 'home-decor-crafts' },
    { name: 'Craft Wire Pack for DIY', material: 'Aluminum', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Acrylic Bead Pack for Crafts', material: 'Acrylic', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Wooden Bead Set for Crafting', material: 'Wood', color: 'Natural', sub: 'home-decor-crafts' },
    { name: 'Decorative Gemstone Pack', material: 'Glass', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Crackle Glass Bead Mix', material: 'Glass', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Ceramic Tea Set Mini', material: 'Ceramic', color: 'White', sub: 'home-decor-crafts' },
    { name: 'Leaf Lapel Pin Brooch Decor', material: 'Alloy', color: 'Gold', sub: 'home-decor-crafts' },
    { name: 'Crystal Jewelry Set Display', material: 'Crystal + Alloy', color: 'Silver', sub: 'home-decor-crafts' },
    { name: 'Gemstone Bead Strand', material: 'Natural Stone', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Shell Button Decor Pack', material: 'Shell', color: 'White', sub: 'home-decor-crafts' },
    { name: 'Resin Art Decor Piece', material: 'Resin', color: 'Gold', sub: 'home-decor-crafts' },
    { name: 'Festival Gift Pack Decor', material: 'Assorted', color: 'Multicolor', sub: 'home-decor-crafts' },
    { name: 'Holiday Gift Box Set', material: 'Assorted', color: 'Red', sub: 'home-decor-crafts' },
  ],
};

// 分类映射
const CATEGORY_MAP = {
  'fashion-jewelry': { slug: 'fashion-jewelry', name: 'Fashion Jewelry' },
  'garment-accessories': { slug: 'garment-accessories', name: 'Garment Accessories' },
  'bags': { slug: 'bags', name: 'Bags' },
  'accessories': { slug: 'accessories', name: 'Accessories' },
  'toys': { slug: 'toys', name: 'Toys' },
  'home-decor-crafts': { slug: 'home-decor-crafts', name: 'Home Decor & Crafts' },
};

// SKU 前缀
const SKU_PREFIX = {
  'fashion-jewelry': 'YW-FJ',
  'garment-accessories': 'YW-GA',
  'bags': 'YW-BA',
  'accessories': 'YW-HA',
  'toys': 'YW-TG',
  'home-decor-crafts': 'YW-HD',
};

// 可用图片池（按分类）
let imagePool = {};

function buildImagePool() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'products');
  const files = fs.readdirSync(dir);
  const jpgFiles = files.filter(f => f.endsWith('.jpg') && !f.startsWith('fallback_'));

  // GitHub 图片按分类名前缀分组
  const categoryImgMap = {
    'fashion-jewelry': ['Fashion_Jewelry'],
    'garment-accessories': ['Garment_Accessories'],
    'bags': ['github_00', 'github_01', 'github_02', 'github_03', 'github_04', 'github_05'],
    'accessories': ['Hair_Accessories'],
    'toys': ['Toys_Gift'],
    'home-decor-crafts': ['Home_Decor_Crafts'],
  };

  for (const [cat, prefixes] of Object.entries(categoryImgMap)) {
    imagePool[cat] = jpgFiles.filter(f => prefixes.some(p => f.includes(p)));
    // 也加入 v2_ 和 v3_ 前缀图片作为补充
    const extras = jpgFiles.filter(f => f.startsWith('v2_') || f.startsWith('v3_') || f.startsWith('pi_') || f.startsWith('matched'));
    if (imagePool[cat].length < 20) {
      imagePool[cat] = [...imagePool[cat], ...extras].slice(0, 50);
    }
  }

  // 补充 SVG 产品图
  const svgFiles = files.filter(f => f.endsWith('.svg')).sort();
  for (const cat of Object.keys(imagePool)) {
    if (imagePool[cat].length < 10) {
      imagePool[cat] = [...imagePool[cat], ...svgFiles];
    }
  }

  console.log('Image pool built:');
  for (const [cat, imgs] of Object.entries(imagePool)) {
    console.log(`  ${cat}: ${imgs.length} images`);
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('=== 完善 776 个空占位产品 ===\n');

  buildImagePool();

  // 获取分类 ID 映射
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map();
  categories.forEach(c => slugToId.set(c.slug, c.id));

  // 获取已有产品的 slug 和 SKU 集合
  const existingProducts = await prisma.product.findMany({ select: { slug: true, sku: true } });
  const existingSlugs = new Set(existingProducts.map(p => p.slug).filter(Boolean));
  const existingSkus = new Set(existingProducts.map(p => p.sku).filter(Boolean));
  console.log('已有产品:', existingProducts.length);

  // 获取 776 个空占位产品
  const emptyProducts = await prisma.product.findMany({
    where: { description: '' },
    select: { id: true, name: true, slug: true, price: true, priceMax: true, originalPrice: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('空占位产品:', emptyProducts.length, '\n');

  // 分类轮询计数器
  const catKeys = Object.keys(PRODUCT_TEMPLATES);
  const catCounters = {};
  catKeys.forEach(k => { catCounters[k] = 0; });

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < emptyProducts.length; i++) {
    const product = emptyProducts[i];
    try {
      // 轮询分配分类
      const catKey = catKeys[i % catKeys.length];
      const templates = PRODUCT_TEMPLATES[catKey];
      const template = templates[i % templates.length];
      const catInfo = CATEGORY_MAP[catKey];
      const skuPrefix = SKU_PREFIX[catKey];

      // 序号
      catCounters[catKey]++;
      const seq = catCounters[catKey];
      const seqStr = String(seq).padStart(3, '0');

      // 生成 SKU
      let sku = `${skuPrefix}-${seqStr}`;
      let skuCounter = seq;
      while (existingSkus.has(sku)) {
        skuCounter++;
        sku = `${skuPrefix}-${String(skuCounter).padStart(3, '0')}`;
      }
      existingSkus.add(sku);

      // 产品名称（加序号保证唯一性）
      let name = template.name;
      // 检查是否有重名，加序号
      let nameSuffix = '';
      let slug = slugify(name);
      let finalSlug = slug;
      let counter = 1;
      while (existingSlugs.has(finalSlug)) {
        finalSlug = `${slug}-${seqStr}`;
        if (existingSlugs.has(finalSlug)) {
          finalSlug = `${slug}-${skuPrefix.toLowerCase()}-${seqStr}`;
        }
        counter++;
      }
      slug = finalSlug;
      existingSlugs.add(slug);

      // 价格处理
      let price = product.price || 0;
      if (price === 0) {
        // 根据分类生成合理价格
        const priceRanges = {
          'fashion-jewelry': [0.5, 15],
          'garment-accessories': [0.1, 5],
          'bags': [1, 20],
          'accessories': [0.2, 8],
          'toys': [0.5, 12],
          'home-decor-crafts': [1, 25],
        };
        const [min, max] = priceRanges[catKey];
        price = Math.round((min + Math.random() * (max - min)) * 100) / 100;
      }
      const originalPrice = Math.round(price * 1.4 * 100) / 100;
      const moq = [12, 24, 36, 48, 60, 100][seq % 6];

      // 图片
      const pool = imagePool[catKey] || imagePool['fashion-jewelry'];
      const imgFile = pool[seq % pool.length] || 'product-placeholder.svg';
      const imageUrl = `/images/products/${imgFile}`;
      const imagesStr = JSON.stringify([imageUrl]);

      // 子分类
      let subSlug = template.sub;
      let subCategoryId = slugToId.has(subSlug) ? slugToId.get(subSlug) : null;
      // 如果子分类不存在，用主分类
      if (!subCategoryId) {
        subSlug = catInfo.slug;
        subCategoryId = slugToId.get(catInfo.slug);
      }

      // 描述（Listing）
      const descParts = [
        `<p>Premium ${name.toLowerCase()} wholesale from Yiwu. ${catInfo.name} for retailers, boutiques, and online sellers.</p>`,
        `<p><strong>Material:</strong> ${template.material}</p>`,
        `<p><strong>Color:</strong> ${template.color}</p>`,
        `<p><strong>MOQ:</strong> ${moq} pcs</p>`,
        `<p><strong>Lead Time:</strong> 7-15 days</p>`,
        `<p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>`,
        `<p>Factory direct pricing, reliable quality. Bulk orders welcome.</p>`,
      ];
      const description = descParts.join('\n');

      // A+ 内容
      const aplusObj = {
        description: `Discover our ${name} — premium ${catInfo.name.toLowerCase()} crafted with care. Perfect for ${template.material.toLowerCase()} ${template.color.toLowerCase()} applications.`,
        bulletPoints: [
          `Premium ${template.material} materials for lasting durability`,
          `Competitive wholesale pricing — direct from Yiwu factory`,
          `MOQ: ${moq} pcs | Lead Time: 7-15 days`,
          `Available in ${template.color}`,
          `Custom packaging, labeling and logos available`,
          `Fast turnaround and reliable worldwide shipping`,
          `Rigorous QC ensures consistent quality every batch`,
        ],
        blocks: [
          { id: 'overview', type: 'text', content: `<h2>About This ${name}</h2><p>${name} is carefully crafted with premium ${template.material.toLowerCase()} materials to meet the highest quality standards. Available in ${template.color}. Perfect for retailers and wholesalers.</p>` },
          { id: 'features', type: 'text', content: `<h3>Key Features</h3><ul><li>Premium ${template.material} construction</li><li>Competitive factory-direct pricing</li><li>Custom packaging & labeling available</li><li>MOQ starting from ${moq} pcs</li><li>Lead time: 7-15 days</li><li>Available in ${template.color}</li></ul>` },
          { id: 'specs', type: 'specs', content: `<h3>Specifications</h3><p><strong>SKU:</strong> ${sku}</p><p><strong>MOQ:</strong> ${moq} pcs</p><p><strong>Material:</strong> ${template.material}</p><p><strong>Color:</strong> ${template.color}</p><p><strong>Shipping:</strong> Calculated at checkout based on destination, weight and volume.</p>` },
        ],
      };
      const aplus = JSON.stringify(aplusObj);

      // 关键词
      const keywords = JSON.stringify([name, sku, catInfo.name, template.material, template.color, 'wholesale', 'yiwu']);

      // 更新产品
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name,
          slug,
          description,
          aplus,
          sku,
          image: imageUrl,
          images: imagesStr,
          categoryId: subCategoryId || slugToId.get(catInfo.slug),
          material: template.material,
          color: template.color,
          moq,
          price,
          originalPrice,
          priceMax: originalPrice,
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

      if (updated % 50 === 0) {
        console.log(`进度: ${updated}/${emptyProducts.length}`);
      }
    } catch (err) {
      console.error(`产品 ${product.id} (${product.name}) 更新失败:`, err.message);
      errors++;
    }
  }

  console.log(`\n=== 完成 ===`);
  console.log(`更新: ${updated}`);
  console.log(`错误: ${errors}`);

  // 统计最终状态
  const total = await prisma.product.count();
  const noDesc = await prisma.product.count({ where: { description: '' } });
  const noAplus = await prisma.product.count({ where: { aplus: null } });
  const noImage = await prisma.product.count({ where: { image: '/images/product-placeholder.svg' } });
  const noCategory = await prisma.product.count({ where: { categoryId: null } });
  const noSku = await prisma.product.count({ where: { sku: null } });
  console.log(`\n数据库产品总数: ${total}`);
  console.log(`无描述: ${noDesc}`);
  console.log(`无A+: ${noAplus}`);
  console.log(`无图片: ${noImage}`);
  console.log(`无分类: ${noCategory}`);
  console.log(`无SKU: ${noSku}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error('失败:', e); process.exit(1); });
