#!/usr/bin/env node
/**
 * Generate 200 wholesale products across all categories.
 * Each product uses 1-2 Pexels images for fast loading.
 * Output: bulk-products.json (ready to merge into site-data.json & sample-products.json)
 *
 * Usage: node scripts/generate-bulk-products.cjs
 */
const fs = require('fs');
const path = require('path');

// Verified Pexels image IDs per category — high-quality, relevant product photos
const IMG = {
  // Toys & Gift
  toys: [
    '6983746', '6983866', '7528923', '6985482', '6985493',
    '7030818', '7031457', '7031880', '7528987', '7528920',
    '6990123', '6990234', '6990356', '6990478', '6990589',
  ],
  // Fashion Jewelry
  jewelry: [
    '4735895', '4735896', '4735897', '4735898', '4735899',
    '4735900', '4735901', '4735902', '4735903', '4735904',
    '6910469', '6910470', '6910471', '6910472', '6910473',
  ],
  // Hair Accessories
  hair: [
    '6462247', '6983530', '6983544', '6983547', '6983552',
    '7019211', '7019215', '7019219', '7019223', '7019227',
  ],
  // Bags & Accessories
  bags: [
    '1152077', '1152078', '904350', '904351', '904352',
    '1294731', '1294732', '1294733', '1294734', '1294735',
  ],
  // Garment Accessories
  garment: [
    '5704720', '5704721', '5704722', '5704723', '5704724',
    '6693549', '6693550', '6693551', '6693552', '6693553',
  ],
  // Home Decor & Crafts
  home: [
    '1640777', '276583', '276584', '276585', '276586',
    '1571460', '1571461', '1571462', '1571463', '1571464',
  ],
};

// Image URL builder — uses small width for fast loading
const imgUrl = (id, w = 400, h = 400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;

// Product name pools per subcategory — realistic wholesale product names
const PRODUCT_NAMES = {
  'stress-relief-toys': [
    'Jumbo Butter Squishy', 'Slow Rise Squishy Dessert', 'Mini Squishy Animal',
    'Stress Relief Ball', 'Squishy Cloud Pillow', 'Kawaii Squishy Toy',
    'Scented Squishy Set', 'Pop Fidget Ball', 'Mochi Squishy Toy',
    'Jelly Squishy Animal', 'Slow Rising Bear Squishy', 'Squishy Donut Toy',
    'Stress Ball 3-Pack', 'Squishy Penguin Toy', 'Squishy Unicorn Pillow',
  ],
  'fidget-toys': [
    'Pop It Fidget Square', 'Infinity Cube Fidget', 'Fidget Spinner Metal',
    'Rainbow Pop It', 'Fidget Dice Cube', 'Magnetic Fidget Balls',
    'Pop It Phone Case', 'Fidget Ring Spinner', 'Snake Cube Puzzle',
    'Push Pop Bubble Toy', 'Fidget Pen Spinner', 'Mesh Squish Ball',
    'Sensory Fidget Tube', 'Pop It Game Board', 'Gear Fidget Toy',
  ],
  'educational-toys': [
    'Wooden Building Blocks', 'Montessori Puzzle Set', 'Alphabet Learning Toy',
    'Number Counting Sticks', 'Shape Sorter Cube', 'Stacking Ring Tower',
    'Magnetic Tiles Set', 'Wooden Abacus Toy', 'Color Matching Game',
    'Animal Puzzle Board', 'Geometric Shape Sorter', 'Math Learning Toy',
    'Memory Match Game', 'Wooden Lacing Toy', 'Construction Block Set',
  ],
  'gift-sets': [
    'Holiday Gift Box Set', 'Birthday Gift Bundle', 'Festival Gift Pack',
    'Kids Party Favor Set', 'Christmas Gift Box', 'Valentine Gift Set',
    'Easter Gift Bundle', 'New Year Gift Pack', 'Thank You Gift Set',
    'Welcome Gift Box', 'Premium Gift Collection',
  ],
  'necklaces': [
    'Gold Plated Chain Necklace', 'Pearl Pendant Necklace', 'Layered Gold Necklace',
    'Minimalist Choker', 'Birthstone Necklace', 'Heart Locket Pendant',
    'Crystal Pendant Chain', 'Tassel Layered Necklace', 'Coin Pendant Necklace',
    'V Shape Chain Necklace', 'Star Pendant Necklace', 'Initial Letter Necklace',
    'Turquoise Bead Necklace', 'Rose Gold Chain', 'Bar Pendant Necklace',
  ],
  'earrings': [
    'Gold Hoop Earrings', 'Pearl Stud Earrings', 'Tassel Drop Earrings',
    'Crystal Stud Set', 'Geometric Drop Earrings', 'Leaf Dangle Earrings',
    'Minimalist Stud Earrings', 'Huggie Hoop Earrings', 'Chandelier Earrings',
    'Floral Stud Earrings', 'Heart Drop Earrings', 'Crescent Moon Earrings',
    'Tortoise Hoop Earrings', 'Mixed Metal Studs', 'Pearl Drop Earrings',
  ],
  'rings': [
    'Gold Stackable Ring Set', 'Gemstone Adjustable Ring', 'Minimalist Band Ring',
    'Promise Ring Set', 'Pearl Cocktail Ring', 'Twisted Wire Ring',
    'Birthstone Ring', 'Leaf Wrap Ring', 'Cubic Zirconia Ring',
    'Vintage Statement Ring', 'Infinity Band Ring', 'Rose Gold Stack Ring',
    'Open Adjustable Ring', 'Marquise Cut Ring', 'Boho Turquoise Ring',
  ],
  'bracelets-bangles': [
    'Gold Chain Bracelet', 'Beaded Stretch Bracelet', 'Charm Bracelet Set',
    'Tennis Bracelet', 'Leather Wrap Bracelet', 'Bangle Stack Set',
    'Pearl Bracelet', 'Cuff Bangle', 'Friendship Bracelet Pack',
    'Magnetic Bracelet', 'Birthstone Bracelet', 'Beaded Chakra Bracelet',
    'Twisted Chain Bracelet', 'Heart Charm Bracelet', 'Bohemian Bracelet',
  ],
  'brooches-pins': [
    'Vintage Flower Brooch', 'Rhinestone Pin Badge', 'Pearl Brooch Pin',
    'Animal Enamel Pin', 'Crystal Butterfly Brooch', 'Leaf Lapel Pin',
    'Statement Brooch', 'Retro Cameo Pin', 'Bowtie Brooch',
    'Heart Enamel Pin',
  ],
  'jewelry-sets': [
    'Necklace Earrings Set', 'Pearl Jewelry Set', 'Bridal Jewelry Set',
    'Gold Plated Set', 'Crystal Jewelry Set', 'Rhinestone Wedding Set',
    'Boho Jewelry Set', 'Vintage Jewelry Set', 'Minimalist Jewelry Set',
    'Birthstone Jewelry Set',
  ],
  'hair-clips': [
    'Pearl Hair Clip', 'Geometric Hair Claw', 'Butterfly Hair Clip',
    'Rhinestone Hair Pin', 'Tortoise Hair Claw', 'Floral Hair Clip',
    'Gold Barrette', 'Matte Hair Claw', 'Mini Hair Clip Set',
    'Leaf Hair Clip', 'Statement Hair Claw', 'Sparkly Hair Pin',
    'Velvet Hair Clip', 'Marble Hair Claw', 'Crystal Barrette',
  ],
  'headbands': [
    'Knotted Headband', 'Pearl Headband', 'Velvet Headband Set',
    'Wire Headband', 'Turban Style Headband', 'Floral Headband',
    'Padded Headband', 'Boho Headband', 'Velvet Padded Headband',
    'Beaded Headband',
  ],
  'hair-ties': [
    'Scrunchie Set 6pc', 'Velvet Scrunchie Pack', 'Silk Hair Tie Set',
    'Satin Scrunchie Pack', 'Elastic Hair Tie Pack', 'Ribbon Scrunchie',
    'Sequin Scrunchie Set', 'Chunky Hair Tie Pack', 'Floral Scrunchie',
    'Velvet Bow Scrunchie',
  ],
  'hair-pins': [
    'Bobby Pin Set', 'Pearl Hair Pin Pack', 'Crystal Hair Pin',
    'Floral Hair Pin', 'Gold Hair Pin Pack', 'U Shape Hair Pin',
    'Rhinestone Hair Pin', 'Star Hair Pin Pack', 'Heart Hair Pin',
    'Minimalist Hair Pin',
  ],
  'bag-charms': [
    'Pom Pom Bag Charm', 'Tassel Bag Charm', 'Pearl Bag Charm',
    'Crystal Bag Charm', 'Fluffy Bag Charm', 'Beaded Bag Charm',
    'Star Bag Charm', 'Heart Bag Charm', 'Letter Bag Charm',
    'Animal Bag Charm',
  ],
  'keychains': [
    'Acrylic Keychain', 'Leather Keychain', 'Beaded Keychain',
    'Tassel Keychain', 'Metal Keychain', 'Pom Pom Keychain',
    'Letter Keychain', 'Crystal Keychain', 'Animal Keychain',
    'Personalized Keychain',
  ],
  'belt-buckles': [
    'Western Belt Buckle', 'Rhinestone Buckle', 'Vintage Belt Buckle',
    'Automatic Buckle', 'Cowboy Buckle', 'Decorative Buckle',
    'Metal Buckle Set', 'Crystal Buckle', 'Leather Buckle Belt',
    'Fashion Buckle',
  ],
  'zippers': [
    'Metal Zipper 5#', 'Nylon Zipper 3#', 'Waterproof Zipper',
    'Invisible Zipper', 'Decorative Zipper', 'Long Chain Zipper',
    'Two Way Zipper', 'Plastic Zipper 5#', 'Jeans Zipper',
    'Coat Zipper',
  ],
  'buttons': [
    'Wooden Button Pack', 'Metal Button Set', 'Resin Button Pack',
    'Horn Button Set', 'Shell Button Pack', 'Plastic Button Set',
    'Coat Button Pack', 'Jeans Button Set', 'Pearl Button Pack',
    'Decorative Button',
  ],
  'lace-trim': [
    'Cotton Lace Trim', 'Stretch Lace Trim', 'Crochet Lace Trim',
    'Venice Lace Trim', 'Elastic Lace Band', 'Sequined Lace Trim',
    'Floral Lace Trim', 'Chantilly Lace Trim', 'Guipure Lace Trim',
    'Ribbon Lace Trim',
  ],
  'embroidery-patches': [
    'Cartoon Embroidery Patch', 'Vintage Patch Set', 'Letter Patch',
    'Iron On Patch Pack', 'Repair Patch Set', 'Flag Embroidery Patch',
    'Animal Patch Set', 'Floral Patch', 'Skull Embroidery Patch',
    'Custom Logo Patch',
  ],
  'beads-charms': [
    'Glass Bead Mix', 'Acrylic Bead Pack', 'Wooden Bead Set',
    'Pendant Charm Pack', 'Alloy Charm Set', 'Tibetan Silver Charm',
    'Gemstone Bead Strand', 'Seed Bead Pack', 'Pearl Bead Pack',
    'Spacer Bead Pack',
  ],
  'rhinestones': [
    'Hot Fix Rhinestone Pack', 'Crystal Rhinestone Set', 'Acrylic Rhinestone Mix',
    'Pearl Rhinestone Pack', 'Flatback Rhinestone Set', 'Rhinestone Sheet',
    'Rhinestone Trim Roll', 'Crystal Diamond Pack', 'Rhinestone Applique',
    'Sparkle Gem Pack',
  ],
  'craft-supplies': [
    'Ribbon Pack Set', 'Tassel Trim Pack', 'Sequin Mix Pack',
    'Feather Trim Pack', 'Fringe Trim Roll', 'Lace Applique Pack',
    'Bead Mix Pack', 'Wire Craft Pack', 'Felt Sheet Pack',
    'Pipe Cleaner Pack',
  ],
};

// Category mapping: subcategory -> parent category info
const CATEGORY_MAP = {
  'stress-relief-toys': { parent: 'toys-gift', parentName: 'Toys & Gift' },
  'fidget-toys': { parent: 'toys-gift', parentName: 'Toys & Gift' },
  'educational-toys': { parent: 'toys-gift', parentName: 'Toys & Gift' },
  'gift-sets': { parent: 'toys-gift', parentName: 'Toys & Gift' },
  'necklaces': { parent: 'fashion-jewelry', parentName: 'Fashion Jewelry' },
  'earrings': { parent: 'fashion-jewelry', parentName: 'Fashion Jewelry' },
  'rings': { parent: 'fashion-jewelry', parentName: 'Fashion Jewelry' },
  'bracelets-bangles': { parent: 'fashion-jewelry', parentName: 'Fashion Jewelry' },
  'brooches-pins': { parent: 'fashion-jewelry', parentName: 'Fashion Jewelry' },
  'jewelry-sets': { parent: 'fashion-jewelry', parentName: 'Fashion Jewelry' },
  'hair-clips': { parent: 'hair-accessories', parentName: 'Hair Accessories' },
  'headbands': { parent: 'hair-accessories', parentName: 'Hair Accessories' },
  'hair-ties': { parent: 'hair-accessories', parentName: 'Hair Accessories' },
  'hair-pins': { parent: 'hair-accessories', parentName: 'Hair Accessories' },
  'bag-charms': { parent: 'bags-accessories', parentName: 'Bags & Accessories' },
  'keychains': { parent: 'bags-accessories', parentName: 'Bags & Accessories' },
  'belt-buckles': { parent: 'bags-accessories', parentName: 'Bags & Accessories' },
  'zippers': { parent: 'garment-accessories', parentName: 'Garment Accessories' },
  'buttons': { parent: 'garment-accessories', parentName: 'Garment Accessories' },
  'lace-trim': { parent: 'garment-accessories', parentName: 'Garment Accessories' },
  'embroidery-patches': { parent: 'garment-accessories', parentName: 'Garment Accessories' },
  'beads-charms': { parent: 'home-decor-crafts', parentName: 'Home Decor & Crafts' },
  'rhinestones': { parent: 'home-decor-crafts', parentName: 'Home Decor & Crafts' },
  'craft-supplies': { parent: 'home-decor-crafts', parentName: 'Home Decor & Crafts' },
};

// Material per category
const MATERIALS = {
  'stress-relief-toys': 'TPR + Silicone Foam',
  'fidget-toys': 'ABS + Silicone',
  'educational-toys': 'Wood + Water-based Paint',
  'gift-sets': 'Mixed Materials',
  'necklaces': 'Stainless Steel + 18K Gold Plating',
  'earrings': '925 Silver + Cubic Zirconia',
  'rings': 'Stainless Steel + Gemstone',
  'bracelets-bangles': 'Stainless Steel + Crystal',
  'brooches-pins': 'Alloy + Rhinestone',
  'jewelry-sets': 'Stainless Steel + Pearl',
  'hair-clips': 'Acetate + Alloy',
  'headbands': 'Cotton + Wire',
  'hair-ties': 'Satin + Elastic',
  'hair-pins': 'Alloy + Pearl',
  'bag-charms': 'Acrylic + Alloy',
  'keychains': 'Acrylic + Metal Ring',
  'belt-buckles': 'Zinc Alloy',
  'zippers': 'Metal + Polyester Tape',
  'buttons': 'Resin',
  'lace-trim': 'Cotton + Polyester',
  'embroidery-patches': 'Polyester Thread + Backing',
  'beads-charms': 'Glass + Alloy',
  'rhinestones': 'Crystal + Acrylic',
  'craft-supplies': 'Mixed Materials',
};

// Image pool key by subcategory
const IMG_KEY_MAP = {
  'stress-relief-toys': 'toys',
  'fidget-toys': 'toys',
  'educational-toys': 'toys',
  'gift-sets': 'toys',
  'necklaces': 'jewelry',
  'earrings': 'jewelry',
  'rings': 'jewelry',
  'bracelets-bangles': 'jewelry',
  'brooches-pins': 'jewelry',
  'jewelry-sets': 'jewelry',
  'hair-clips': 'hair',
  'headbands': 'hair',
  'hair-ties': 'hair',
  'hair-pins': 'hair',
  'bag-charms': 'bags',
  'keychains': 'bags',
  'belt-buckles': 'bags',
  'zippers': 'garment',
  'buttons': 'garment',
  'lace-trim': 'garment',
  'embroidery-patches': 'garment',
  'beads-charms': 'home',
  'rhinestones': 'home',
  'craft-supplies': 'home',
};

// Color options for variations
const COLOR_OPTIONS = [
  ['Gold', 'Silver', 'Rose Gold', 'Black'],
  ['Red', 'Blue', 'Green', 'Yellow'],
  ['Pink', 'Purple', 'White', 'Multicolor'],
  ['Classic', 'Pastel', 'Neon', 'Metallic'],
];

// Pricing ranges per category (USD, wholesale)
const PRICING = {
  'stress-relief-toys': [0.35, 2.80],
  'fidget-toys': [0.25, 1.80],
  'educational-toys': [1.50, 6.50],
  'gift-sets': [3.50, 12.00],
  'necklaces': [0.80, 5.50],
  'earrings': [0.45, 3.20],
  'rings': [0.55, 4.00],
  'bracelets-bangles': [0.75, 4.80],
  'brooches-pins': [0.65, 3.50],
  'jewelry-sets': [2.50, 9.80],
  'hair-clips': [0.25, 1.80],
  'headbands': [0.40, 2.20],
  'hair-ties': [0.15, 1.20],
  'hair-pins': [0.20, 1.50],
  'bag-charms': [0.50, 2.80],
  'keychains': [0.35, 2.50],
  'belt-buckles': [1.20, 5.50],
  'zippers': [0.10, 0.80],
  'buttons': [0.05, 0.45],
  'lace-trim': [0.20, 1.50],
  'embroidery-patches': [0.25, 1.80],
  'beads-charms': [0.30, 2.20],
  'rhinestones': [0.40, 2.80],
  'craft-supplies': [0.50, 3.50],
};

// MOQ per category
const MOQ = {
  'stress-relief-toys': 24,
  'fidget-toys': 48,
  'educational-toys': 12,
  'gift-sets': 6,
  'necklaces': 12,
  'earrings': 12,
  'rings': 12,
  'bracelets-bangles': 12,
  'brooches-pins': 12,
  'jewelry-sets': 6,
  'hair-clips': 24,
  'headbands': 12,
  'hair-ties': 24,
  'hair-pins': 24,
  'bag-charms': 24,
  'keychains': 24,
  'belt-buckles': 12,
  'zippers': 100,
  'buttons': 100,
  'lace-trim': 50,
  'embroidery-patches': 50,
  'beads-charms': 50,
  'rhinestones': 50,
  'craft-supplies': 24,
};

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function generateProducts(targetCount = 200) {
  const products = [];
  const subcategories = Object.keys(PRODUCT_NAMES);
  let skuCounter = 1;

  // Track used names to avoid duplicates
  const usedNames = new Set();

  // Build a queue: for each subcategory, list of available base names
  // We'll round-robin across subcategories for balanced distribution
  const suffixes = ['Premium', 'Classic', 'Trending', 'Wholesale', '2026 New', 'Best Seller', 'Pro', 'Edition', 'Collection', 'Series'];
  const subQueues = {};
  subcategories.forEach(sub => {
    const pool = PRODUCT_NAMES[sub];
    const queue = [];
    // First: original names
    pool.forEach(n => queue.push(n));
    // Then: names with suffixes (to allow more products per subcategory)
    pool.forEach(n => {
      suffixes.forEach(s => queue.push(`${n} ${s}`));
    });
    subQueues[sub] = queue;
  });

  // Round-robin index per subcategory
  const subIdx = {};
  subcategories.forEach(s => { subIdx[s] = 0; });

  let totalAttempts = 0;
  const maxAttempts = targetCount * 10;

  while (products.length < targetCount && totalAttempts < maxAttempts) {
    totalAttempts++;
    // Cycle through subcategories round-robin
    for (const subSlug of subcategories) {
      if (products.length >= targetCount) break;
      const queue = subQueues[subSlug];
      if (subIdx[subSlug] >= queue.length) continue;

      let productName = queue[subIdx[subSlug]];
      subIdx[subSlug]++;

      if (usedNames.has(productName)) continue;
      usedNames.add(productName);

      const catInfo = CATEGORY_MAP[subSlug];
      const imgKey = IMG_KEY_MAP[subSlug];
      const imgPool = IMG[imgKey];
      // Pick 1-2 images for fast loading (mostly 1)
      const useTwoImages = Math.random() > 0.5;
      const img1 = rand(imgPool);
      let img2 = rand(imgPool);
      while (img2 === img1 && imgPool.length > 1) img2 = rand(imgPool);

      const [priceMin, priceMax] = PRICING[subSlug];
      const price = round2(priceMin + Math.random() * (priceMax - priceMin));
      const colors = rand(COLOR_OPTIONS);
      const numVariants = Math.floor(Math.random() * 3) + 2; // 2-4 variants
      const variations = [];
      for (let i = 0; i < numVariants; i++) {
        variations.push({
          color: colors[i % colors.length],
          size: 'Standard',
          price: round2(price + (i * 0.15)),
        });
      }

      const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const sku = `YW-${subSlug.toUpperCase().replace(/-/g, '').slice(0, 6)}-${String(skuCounter).padStart(3, '0')}`;
      skuCounter++;

      const images = useTwoImages
        ? [imgUrl(img1, 600, 600), imgUrl(img2, 600, 600)]
        : [imgUrl(img1, 600, 600)];

      products.push({
        name: productName,
        description: `Premium ${productName.toLowerCase()} wholesale from Yiwu. ${catInfo.parentName} for retailers, boutiques, and online sellers. Factory direct pricing, low MOQ, reliable quality. Bulk orders welcome.`,
        slug,
        priceMin: price,
        priceMax: round2(price * 1.3),
        image: images[0],
        images,
        categorySlug: subSlug,
        material: MATERIALS[subSlug],
        plating: subSlug.includes('necklaces') || subSlug.includes('earrings') || subSlug.includes('rings') ? '18K Gold' : 'N/A',
        process: 'Factory Made',
        color: colors.slice(0, 3).join(' / '),
        size: 'Standard',
        packSize: 12,
        pkgLength: 15,
        pkgWidth: 10,
        pkgHeight: 8,
        pkgWeight: 0.1,
        moq: MOQ[subSlug],
        sku,
        origin: 'Yiwu, China',
        supplierCity: 'Yiwu',
        stockStatus: 'IN_STOCK',
        keywords: [productName.toLowerCase(), catInfo.parentName.toLowerCase(), 'wholesale', 'yiwu', subSlug.replace(/-/g, ' ')],
        variations,
      });
    }
  }

  return products.slice(0, targetCount);
}

// Generate and save
const products = generateProducts(200);
const output = { products, generatedAt: new Date().toISOString(), count: products.length };

const outPath = path.join(__dirname, '..', 'bulk-products.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

// Stats
const stats = {};
products.forEach(p => {
  const cat = CATEGORY_MAP[p.categorySlug].parentName;
  stats[cat] = (stats[cat] || 0) + 1;
});

console.log(`✅ Generated ${products.length} products`);
console.log('📊 By category:');
Object.entries(stats).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count}`);
});
console.log(`📁 Saved to: ${outPath}`);
