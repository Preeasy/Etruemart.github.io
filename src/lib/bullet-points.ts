interface ProductData {
  name?: string;
  material?: string | null;
  moq?: number | string | null;
  categoryId?: string | null;
  aplus?: any;
}

interface ProductTypeInfo {
  type: string;
  features: string[];
}

function detectProductType(name: string): ProductTypeInfo | null {
  const n = name.toLowerCase();

  // Gift boxes (check before jewelry since names may contain both)
  if (/\b(gift box|jewelry box|velvet box|ring box)\b/.test(n)) {
    return { type: 'gift-box', features: ['Soft velvet interior protects contents', 'Compact and elegant presentation'] };
  }

  // Jewelry & accessories
  if (/\b(bracelet|necklace|ring|earring|brooch|pin|pendant|chain|bead)\b/.test(n)) {
    return { type: 'jewelry', features: ['Hypoallergenic materials safe for sensitive skin', 'Elegant plating with lasting shine'] };
  }

  // Apparel & shoes
  if (/\b(shoe|sneaker|boot|sandal|slipper)\b/.test(n)) {
    return { type: 'shoes', features: ['Comfortable fit for all-day wear', 'Durable sole with anti-slip grip'] };
  }
  if (/\b(t-shirt|shirt|tee|top|blouse)\b/.test(n)) {
    return { type: 't-shirt', features: ['Breathable fabric for everyday comfort', 'Machine washable, colorfast dyes'] };
  }
  if (/\b(underwear|briefs|panties|boxer)\b/.test(n)) {
    return { type: 'underwear', features: ['Soft, breathable cotton blend', 'Comfortable elastic waistband'] };
  }
  if (/\b(sock|stocking)\b/.test(n)) {
    return { type: 'socks', features: ['Breathable knit for all-day comfort', 'Reinforced heel and toe for durability'] };
  }
  if (/\b(swim|swimsuit|bikini|swimwear)\b/.test(n)) {
    return { type: 'swimwear', features: ['Quick-drying, chlorine-resistant fabric', 'Stretchy material for comfortable fit'] };
  }
  if (/\b(vest|jacket|coat|hoodie|sweater)\b/.test(n)) {
    return { type: 'outerwear', features: ['Layered warmth without bulk', 'Durable stitching and quality zippers'] };
  }
  if (/\b(dress|skirt)\b/.test(n)) {
    return { type: 'dress', features: ['Flattering cut for everyday wear', 'Lightweight, breathable fabric'] };
  }
  if (/\b(legging|tight)\b/.test(n)) {
    return { type: 'leggings', features: ['Four-way stretch for full mobility', 'Opaque, squat-proof fabric'] };
  }

  // Bags
  if (/\b(bag|backpack|handbag|tote|purse|wallet|clutch|pouch)\b/.test(n)) {
    return { type: 'bag', features: ['Stylish design with practical compartments', 'Durable stitching and quality hardware'] };
  }

  // Electronics
  if (/\b(earbud|earphone|headphone|tws|speaker|sound)\b/.test(n)) {
    return { type: 'audio', features: ['Clear sound with noise isolation', 'Long battery life on single charge'] };
  }
  if (/\b(led|light|lamp|fill light|ring light)\b/.test(n)) {
    return { type: 'lighting', features: ['Adjustable brightness levels', 'Energy-efficient LED with long lifespan'] };
  }
  if (/\b(charger|cable|adapter|power bank|charging)\b/.test(n)) {
    return { type: 'charging', features: ['Fast charging with safety protection', 'Universal compatibility with devices'] };
  }
  if (/\b(phone|holder|stand|mount|tripod)\b/.test(n)) {
    return { type: 'phone-mount', features: ['Adjustable angle for optimal viewing', 'Sturdy grip, won\'t scratch device'] };
  }

  // Home & living
  if (/\b(storage|organizer|shelf|rack|holder|container)\b/.test(n)) {
    return { type: 'storage', features: ['Space-saving design for tidy organization', 'Sturdy construction, holds weight well'] };
  }
  if (/\b(towel|compressed|cleaning|wipe|cloth)\b/.test(n)) {
    return { type: 'cleaning', features: ['Highly absorbent material', 'Lint-free, streak-free cleaning'] };
  }
  if (/\b(food|container|fresh|wrap|film)\b/.test(n)) {
    return { type: 'food-storage', features: ['Food-safe, BPA-free materials', 'Airtight seal keeps food fresh longer'] };
  }
  if (/\b(hose|garden|water)\b/.test(n)) {
    return { type: 'garden', features: ['Flexible and kink-resistant design', 'Expands with water pressure, easy to store'] };
  }
  if (/\b(lint|roller|pet hair|remover)\b/.test(n)) {
    return { type: 'pet-care', features: ['Reusable and easy to clean', 'Effectively removes pet hair and lint'] };
  }

  // Beauty & personal care
  if (/\b(makeup|cosmetic|sponge|blender|brush)\b/.test(n)) {
    return { type: 'beauty', features: ['Soft, skin-friendly material', 'Easy to clean and reusable'] };
  }
  if (/\b(earplug|sleep|mask|eye cover)\b/.test(n)) {
    return { type: 'sleep-aid', features: ['Soft, comfortable fit for restful sleep', 'Reusable and easy to clean'] };
  }

  // Toys & kids
  if (/\b(puzzle|building block|educational|toy|kids)\b/.test(n)) {
    return { type: 'toys', features: ['Safe, non-toxic materials for children', 'Encourages learning through play'] };
  }

  // Auto & tools
  if (/\b(auto|car|tool|wrench|screw|sticker)\b/.test(n)) {
    return { type: 'auto', features: ['Durable materials for long-term use', 'Easy installation, no special tools needed'] };
  }

  // Safety vests (check before generic outerwear vest)
  if (/\b(safety vest|hi-vis|reflective|workwear)\b/.test(n)) {
    return { type: 'safety', features: ['High-visibility reflective material', 'Lightweight and breathable for all-day wear'] };
  }

  // Sports
  if (/\b(knee|support|brace|sport|protection)\b/.test(n)) {
    return { type: 'sports', features: ['Breathable, moisture-wicking material', 'Provides stable support during activity'] };
  }

  // Stationery
  if (/\b(copybook|writing|pen|pencil|stationery|office)\b/.test(n)) {
    return { type: 'stationery', features: ['Quality paper for smooth writing', 'Eco-friendly materials'] };
  }

  return null;
}

const fallbackFeatures = [
  'Quality materials and reliable construction',
  'Factory-direct pricing from Yiwu, China',
  'Global shipping to 180+ countries',
  'Custom packaging & private label available',
  'Trade assurance with quality guarantee',
  'Flexible MOQ for businesses of all sizes',
];

export function computeBulletPoints(product: ProductData): string[] {
  const allFeatures: string[] = [];
  const addFeature = (f: string) => {
    const clean = f.trim();
    if (clean && clean.length > 3) allFeatures.push(clean);
  };

  // Extract useful data from specs block
  let specsMaterial: string | null = null;
  let specsPackaging: string | null = null;
  let specsMoq: number | null = null;

  const aplus = product.aplus;
  if (aplus?.blocks && Array.isArray(aplus.blocks)) {
    for (const block of aplus.blocks) {
      if (block.type === 'specs' && block.content) {
        const html = String(block.content);
        const matMatch = html.match(/<strong>Material:<\/strong>\s*([^<]+)/i);
        if (matMatch) specsMaterial = matMatch[1].trim();
        const packMatch = html.match(/<strong>Packaging:<\/strong>\s*([^<]+)/i);
        if (packMatch) specsPackaging = packMatch[1].trim();
        const moqMatch = html.match(/<strong>MOQ:<\/strong>\s*(\d+)/i);
        if (moqMatch) specsMoq = parseInt(moqMatch[1]);
      }
    }
  }

  const name = product.name || '';

  // 1. Material feature (from product or specs)
  const material = product.material || specsMaterial;
  if (material) {
    addFeature(`Material: ${material}`);
  }

  // 2. Product name analysis — extract set size, color
  const setMatch = name.match(/(\d+)[-\s]?(?:piece|pc|pack|pcs|count|set)/i);
  if (setMatch) {
    addFeature(`Set of ${setMatch[1]} pieces`);
  }
  const colorMatch = name.match(/^(Black|White|Blue|Red|Pink|Gold|Silver|Green|Purple|Orange|Yellow|Brown|Gray|Grey)\s/i);
  if (colorMatch) {
    addFeature(`Available in ${colorMatch[1]}`);
  }

  // 3. Product type features (from name analysis — more accurate than category)
  const productType = detectProductType(name);
  if (productType) {
    for (const f of productType.features) {
      addFeature(f);
    }
  }

  // 4. MOQ feature
  const moq = Number(product.moq) || specsMoq || 1;
  if (moq <= 10) addFeature(`Low MOQ: ${moq} pcs — start small, scale as needed`);
  else if (moq <= 50) addFeature(`Flexible MOQ: ${moq} pcs for growing businesses`);
  else addFeature(`Wholesale MOQ: ${moq} pcs | Volume pricing available`);

  // 5. Packaging info
  if (specsPackaging) {
    const weightMatch = specsPackaging.match(/G\.W\.\s*([\d.]+)\s*kg/i);
    const qtyMatch = specsPackaging.match(/(\d+)\s*pcs?\/ctn/i);
    if (weightMatch && qtyMatch) {
      addFeature(`${qtyMatch[1]} pcs per carton | G.W. ${weightMatch[1]} kg`);
    } else if (weightMatch) {
      addFeature(`Packaging: G.W. ${weightMatch[1]} kg per carton`);
    }
  }

  // 6. Universal value props
  addFeature('Factory-direct pricing from Yiwu, China');
  addFeature('Global shipping to 180+ countries');
  addFeature('Custom packaging & private label available');

  // Deduplicate and cap at 6
  const bulletPoints: string[] = [];
  const seen = new Set<string>();
  for (const f of allFeatures) {
    const key = f.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      bulletPoints.push(f.trim());
    }
    if (bulletPoints.length >= 6) break;
  }

  // Ensure at least 4 features
  if (bulletPoints.length < 4) {
    for (const fb of fallbackFeatures) {
      if (bulletPoints.length >= 6) break;
      if (!seen.has(fb.toLowerCase())) {
        seen.add(fb.toLowerCase());
        bulletPoints.push(fb);
      }
    }
  }

  return bulletPoints;
}
