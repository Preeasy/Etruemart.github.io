/**
 * Excel 产品导入 - 共享映射模块
 * 供 API 接口和命令行脚本共用
 */

// 分类映射: Excel 分类名 -> 网站 slug
const CATEGORY_MAP: Record<string, string> = {
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
  'Seasonal & Festival': 'gift',
  '时尚首饰': 'fashion-jewelry',
  '服装辅料': 'garment-accessories',
  '箱包配件': 'accessories',
  '发饰': 'accessories',
  '玩具礼品': 'toys',
  '家居装饰工艺品': 'home-decor-crafts',
  '家居': 'home-decor-crafts',
};

const SUBCATEGORY_MAP: Record<string, string> = {
  'Necklaces': 'necklaces', '项链': 'necklaces',
  'Earrings': 'earrings', '耳环': 'earrings',
  'Rings': 'rings', '戒指': 'rings',
  'Bracelets': 'bracelets-bangles', '手链': 'bracelets-bangles',
  '手镯': 'bracelets-bangles',
  'Brooches': 'brooches-pins', '胸针': 'brooches-pins',
  'Jewelry Sets': 'jewelry-sets', '套装': 'jewelry-sets',
  'Zippers': 'zippers', '拉链': 'zippers',
  'Buttons': 'buttons', '纽扣': 'buttons',
  'Lace': 'lace-trim', '蕾丝': 'lace-trim',
  'Patches': 'embroidery-patches', '绣花贴': 'embroidery-patches',
  'Hair Clips': 'hair-clips', '发夹': 'hair-clips',
  'Headbands': 'headbands', '发箍': 'headbands',
  'Hair Ties': 'hair-ties', '发圈': 'hair-ties',
  'Hair Pins': 'hair-pins', '发针': 'hair-pins',
  'Bag Charms': 'bag-charms', '包包挂件': 'bag-charms',
  'Keychains': 'keychains', '钥匙扣': 'keychains',
  'Belt Buckles': 'belt-buckles', '皮带扣': 'belt-buckles',
  'Beads': 'beads-charms', '珠子': 'beads-charms',
  'Rhinestones': 'rhinestones', '水钻': 'rhinestones',
  'Craft Supplies': 'craft-supplies', '手工': 'craft-supplies',
  'Stress Relief': 'stress-relief-toys', '解压': 'stress-relief-toys',
  'Fidget Toys': 'fidget-toys', '指尖玩具': 'fidget-toys',
  'Educational Toys': 'educational-toys', '益智玩具': 'educational-toys',
  'Gift Sets': 'gift-sets', '礼品套装': 'gift-sets',
  'Vases': 'home-decor-crafts', '花瓶': 'home-decor-crafts',
  'Tea Sets': 'home-decor-crafts', '茶具': 'home-decor-crafts',
  'Sculptures': 'home-decor-crafts', '摆件': 'home-decor-crafts',
  'Wall Art': 'home-decor-crafts', '壁饰': 'home-decor-crafts',
  'Table Decor': 'home-decor-crafts', '桌饰': 'home-decor-crafts',
};

const COLUMN_PATTERNS: Record<string, RegExp[]> = {
  itemNo: [
    /^item\s*no\.?$/i, /^item\s*code$/i, /^item$/i, /^item号$/i, /^编号$/i,
    /^货号$/i, /^product\s*no\.?$/i, /^product\s*code$/i, /^art\.?\s*no\.?$/i,
  ],
  sku: [/^sku$/i, /^sku\s*code$/i, /^产品编码$/i],
  nameCn: [/^.*name.*\(cn\).*$/i, /^中文名称$/i, /^中文产品名.*$/i, /^产品名称$/i, /^名称$/i],
  nameEn: [
    /^.*name.*\(en\).*$/i, /^英文名称$/i, /^英文产品名.*$/i,
    /^product\s*name$/i, /^product\s*title$/i, /^name$/i, /^title$/i,
  ],
  priceMin: [
    /^price\s*\(min\)$/i, /^price\s*min/i, /^min\s*price/i,
    /^最低价.*$/i, /^价格$/i, /^price$/i, /^unit\s*price/i,
  ],
  priceMax: [
    /^price\s*\(max\)$/i, /^price\s*max/i, /^max\s*price/i,
    /^最高价.*$/i,
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

export function detectColumns(headers: any[]): Record<string, number> {
  const mapping: Record<string, number> = {};
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

export function matchCategory(
  categoryL1: any,
  categoryL2: any,
  slugToId: Map<string, string>
): string | null {
  if (categoryL2) {
    const cat2 = String(categoryL2).trim();
    const subSlug = SUBCATEGORY_MAP[cat2] || SUBCATEGORY_MAP[cat2.toLowerCase()];
    if (subSlug && slugToId.has(subSlug)) {
      return slugToId.get(subSlug)!;
    }
  }
  if (categoryL1) {
    const cat1 = String(categoryL1).trim();
    const slug = CATEGORY_MAP[cat1] || CATEGORY_MAP[cat1.toLowerCase()];
    if (slug && slugToId.has(slug)) {
      return slugToId.get(slug)!;
    }
  }
  return null;
}

export function slugify(text: any): string {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function toNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(/[^\d.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

/**
 * 从 GitHub 图库匹配图片
 * 需要传入图片清单和映射
 */
export function matchImage(
  itemNo: any,
  imageMap: Record<string, string>,
  allImages: string[]
): string | null {
  if (!itemNo) return null;
  const key = String(itemNo).trim();
  const RAW_BASE = 'https://raw.githubusercontent.com/Preeasy/images/main/Images/';

  // 精确匹配
  if (imageMap[key]) return imageMap[key];
  // 不区分大小写
  const lowerKey = key.toLowerCase();
  for (const [k, url] of Object.entries(imageMap)) {
    if (k.toLowerCase() === lowerKey) return url;
  }
  // 去除 YCS- 前缀
  const noPrefix = key.replace(/^YCS-/i, '');
  for (const [k, url] of Object.entries(imageMap)) {
    if (k.replace(/^YCS-/i, '').toLowerCase() === noPrefix.toLowerCase()) return url;
  }
  // 纯数字匹配
  if (/^\d+$/.test(key)) {
    const padded = key.padStart(3, '0');
    for (const name of allImages) {
      const m = name.match(/^(\d+)\.\w+$/);
      if (m && (m[1] === padded || m[1] === key || parseInt(m[1]) === parseInt(key))) {
        return RAW_BASE + encodeURIComponent(name);
      }
    }
  }
  // 全量搜索
  for (const name of allImages) {
    const base = name.replace(/\.\w+$/, '');
    if (base.toLowerCase() === key.toLowerCase()) {
      return RAW_BASE + encodeURIComponent(name);
    }
  }

  return null;
}

/**
 * 人民币转美元：CNY / 6.7 × 1.15（上浮15%）
 */
export function cnyToUsd(cny: number): number {
  return Math.round((cny / 6.7) * 1.15 * 100) / 100;
}
