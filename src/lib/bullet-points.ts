interface ProductData {
  name?: string;
  material?: string | null;
  moq?: number | string | null;
  categoryId?: string | null;
  aplus?: any;
}

const categoryFeatureMap: Record<string, string[]> = {
  'fashion-jewelry': ['Hypoallergenic materials', 'Elegant design for any occasion'],
  'bags': ['Stylish and functional design', 'Multiple compartments for organization'],
  'electronics': ['Reliable performance with quality components', 'Tested and certified for safety'],
  'beauty-personal-care': ['Gentle formula suitable for daily use', 'Quality ingredients for effective results'],
  'home-living': ['Durable construction for everyday use', 'Modern design to complement any decor'],
  'home-decor-crafts': ['Handcrafted quality with attention to detail', 'Unique piece to enhance your space'],
  'toys': ['Safe and durable materials for kids', 'Educational and fun for all ages'],
  'sports-outdoor': ['Built for performance and durability', 'Weather-resistant for outdoor use'],
  'accessories': ['Versatile accessory for any outfit', 'Premium finish and construction'],
  'auto-tools': ['Professional-grade quality tools', 'Heat-treated steel for durability'],
  'garment-accessories': ['Sewing-grade quality materials', 'Perfect for garments and crafts'],
  'gift': ['Beautifully packaged, ready to gift', 'Premium quality for special occasions'],
  'pet-supplies': ['Pet-safe, non-toxic materials', 'Durable construction for daily use'],
  'kitchen-supplies': ['Food-safe, BPA-free materials', 'Heat-resistant and durable'],
  'hardware-home': ['Heavy-duty steel construction', 'Corrosion-resistant finish'],
  'apparel-shoes': ['Comfortable fit for all-day wear', 'Breathable and durable materials'],
  'phone-accessories': ['Precision-engineered for perfect fit', 'Durable build quality'],
  'stationery-office': ['Premium quality for professional use', 'Eco-friendly materials'],
  'mother-baby-toys': ['Non-toxic, baby-safe materials', 'Educational and developmental'],
  'musical-instruments': ['Tuned and ready to play', 'Quality craftsmanship'],
  'home-appliances': ['Energy-efficient operation', 'Built to last with quality components'],
  'other': ['Premium quality materials', 'Factory-direct pricing'],
};

const fallbackFeatures = [
  'Premium quality materials and construction',
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

  // 1. Material feature
  const material = product.material || specsMaterial;
  if (material) {
    addFeature(`Crafted from ${material}`);
  }

  // 2. Product name analysis
  const name = product.name || '';
  const setMatch = name.match(/(\d+)[-\s]?(?:piece|pc|pack|pcs|count|set)/i);
  if (setMatch) {
    addFeature(`Set of ${setMatch[1]} pieces`);
  }
  const colorMatch = name.match(/^(Black|White|Blue|Red|Pink|Gold|Silver|Green|Purple|Orange|Yellow|Brown|Gray|Grey)\s/i);
  if (colorMatch) {
    addFeature(`Color: ${colorMatch[1]}`);
  }

  // 3. MOQ feature
  const moq = Number(product.moq) || specsMoq || 1;
  if (moq <= 10) addFeature(`Low MOQ: ${moq} pcs — start small, scale as needed`);
  else if (moq <= 50) addFeature(`Flexible MOQ: ${moq} pcs for growing businesses`);
  else addFeature(`Wholesale MOQ: ${moq} pcs | Volume pricing available`);

  // 4. Packaging info
  if (specsPackaging) {
    const weightMatch = specsPackaging.match(/G\.W\.\s*([\d.]+)\s*kg/i);
    const qtyMatch = specsPackaging.match(/(\d+)\s*pcs?\/ctn/i);
    if (weightMatch && qtyMatch) {
      addFeature(`${qtyMatch[1]} pcs per carton | G.W. ${weightMatch[1]} kg`);
    } else if (weightMatch) {
      addFeature(`Packaging: G.W. ${weightMatch[1]} kg per carton`);
    }
  }

  // 5. Category-specific features
  const catSlug = product.categoryId || '';
  const catFeatures = categoryFeatureMap[catSlug];
  if (catFeatures && catFeatures.length > 0) {
    addFeature(catFeatures[0]);
    if (catFeatures[1]) addFeature(catFeatures[1]);
  }

  // 6. Universal value props
  addFeature('Factory-direct pricing from Yiwu, China');
  addFeature('Global shipping to 180+ countries');
  addFeature('Custom packaging & private label available');
  addFeature('Trade assurance with quality guarantee');

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
