const fs = require('fs');
const path = require('path');

const productImagesDir = path.join(__dirname, '..', 'public', 'product-images');
const imageFiles = fs.readdirSync(productImagesDir).filter(f => f.endsWith('.jpg'));

const categoryMap = {
  'fashion-jewelry': {
    slug: 'fashion-jewelry',
    name: 'Fashion Jewelry',
    keywords: ['fashion jewelry', 'wholesale jewelry', 'necklace', 'earrings', 'bracelet', 'ring', 'chain', 'jewelry set'],
    basePrice: 1.5,
    priceRange: [0.5, 25],
    materials: ['Sterling Silver', 'Gold Plated', 'Rose Gold', 'Stainless Steel', 'Brass', 'Copper', 'Titanium', 'Alloy'],
    itemTypes: ['Necklace Set', 'Earrings', 'Bracelet', 'Ring Set', 'Choker', 'Pendant', 'Brooch', 'Cufflinks', 'Jewelry Set', 'Chain', 'Beaded Bracelet', 'Stackable Rings']
  },
  'bags-accessories': {
    slug: 'bags-accessories',
    name: 'Bags & Accessories',
    keywords: ['bags', 'handbags', 'shoulder bag', 'crossbody', 'tote bag', 'wholesale bags', 'Yiwu bags', 'wallets', 'backpacks'],
    basePrice: 8.5,
    priceRange: [3, 45],
    materials: ['Genuine Leather', 'Faux Leather', 'Canvas', 'Nylon', 'PU Leather', 'Suede', 'Velvet', 'Satin'],
    itemTypes: ['Shoulder Bag', 'Crossbody Bag', 'Handbag', 'Tote Bag', 'Clutch', 'Wallet', 'Backpack', 'Waist Bag', 'Card Holder', 'Coin Purse']
  },
  'hair-accessories': {
    slug: 'hair-accessories',
    name: 'Hair Accessories',
    keywords: ['hair accessories', 'hair clips', 'hair bows', 'hair bands', 'scrunchies', 'wholesale hair', 'headbands', 'hair pins'],
    basePrice: 0.8,
    priceRange: [0.3, 8],
    materials: ['Rhinestone', 'Pearl', 'Acrylic', 'Resin', 'Metal Alloy', 'Fabric', 'Satin Ribbon', 'Silk'],
    itemTypes: ['Hair Clip Set', 'Hair Bow', 'Headband', 'Scrunchie', 'Hair Pin Set', 'Hair Comb', 'Barrette', 'Hair Tie', 'Hair Claw', 'Hair Band']
  },
  'garment-accessories': {
    slug: 'garment-accessories',
    name: 'Garment Accessories',
    keywords: ['garment accessories', 'buttons', 'zippers', 'patches', 'lace', 'trim', 'wholesale', 'embroidery', 'applique'],
    basePrice: 0.6,
    priceRange: [0.1, 15],
    materials: ['Metal', 'Plastic', 'Resin', 'Wood', 'Horn', 'Bone', 'Ceramic', 'Enamel'],
    itemTypes: ['Button Set', 'Zipper Pull', 'Iron-On Patch', 'Lace Trim', 'Ribbon Bow', 'Snap Fastener', 'Hook & Eye', 'Appliqué', 'Zipper', 'Elastic Band']
  },
  'home-decor-crafts': {
    slug: 'home-decor-crafts',
    name: 'Home Decor & Crafts',
    keywords: ['home decor', 'ceramic', 'vase', 'figurine', 'tea set', 'wholesale crafts', 'wall art', 'candle holder'],
    basePrice: 5.5,
    priceRange: [2, 35],
    materials: ['Ceramic', 'Porcelain', 'Resin', 'Wood', 'Metal', 'Glass', 'Polyresin', 'Terracotta'],
    itemTypes: ['Ceramic Vase', 'Figurine Set', 'Tea Set', 'Wall Art', 'Table Decor', 'Sculpture', 'Candle Holder', 'Ornament', 'Centerpiece', 'Sculpture Set']
  },
  'toys-gift': {
    slug: 'toys-gift',
    name: 'Toys & Gift',
    keywords: ['toys', 'plush', 'stuffed animal', 'gift set', 'educational toy', 'wholesale toys', 'fidget', 'squishy'],
    basePrice: 3.5,
    priceRange: [1, 25],
    materials: ['Plush', 'Cotton', 'Wood', 'ABS Plastic', 'Silicone', 'Felt', 'Chenille', 'Velvet'],
    itemTypes: ['Plush Toy', 'Stuffed Animal', 'Gift Box Set', 'Educational Toy', 'Board Game', 'Puzzle Set', 'Action Figure', 'Craft Kit', 'Fidget Toy', 'Squishy']
  }
};

const categoryKeywords = {
  'fashion-jewelry': ['necklace', 'earring', 'bracelet', 'ring', 'chain', 'choker', 'pendant', 'brooch', 'cufflink', 'jewelry', 'bangle', 'hoop', 'stud', 'diamond', 'crystal', 'pearl', 'gemstone', 'beaded', 'gold', 'silver', 'rose', 'layered', 'stackable', 'locket', 'tennis', 'rhinestone'],
  'bags-accessories': ['bag', 'handbag', 'purse', 'wallet', 'backpack', 'tote', 'clutch', 'crossbody', 'shoulder', 'waist', 'coin', 'card-holder', 'keychain', 'bag-charm', 'tassel'],
  'hair-accessories': ['hair', 'scrunchie', 'headband', 'clip', 'pin', 'barrette', 'bow', 'band', 'tie', 'comb', 'claw', 'bobby', 'chunk', 'ribbon', 'lace'],
  'garment-accessories': ['button', 'zipper', 'patch', 'lace', 'trim', 'applique', 'snap', 'hook', 'eye', 'elastic', 'ribbon', 'bow', 'buckl', 'enamel', 'iron-on', 'embroidery', 'sequin', 'fringe'],
  'home-decor-crafts': ['vase', 'figurine', 'tea', 'decor', 'candle', 'ornament', 'wall', 'sculpture', 'centerpiece', 'statue', 'pot', 'planter', 'bowl', 'jar'],
  'toys-gift': ['toy', 'plush', 'stuffed', 'gift', 'game', 'puzzle', 'action', 'craft', 'fidget', 'squishy', 'dice', 'spinner', 'pop-it', 'learning', 'building', 'wooden', 'educational', 'party', 'bundle', 'holiday', 'christmas', 'easter', 'valentine', 'birthday', 'new-year']
};

const colors = ['Black', 'White', 'Red', 'Pink', 'Blue', 'Green', 'Gold', 'Silver', 'Rose Gold', 'Beige', 'Brown', 'Purple', 'Navy', 'Gray', 'Coral', 'Turquoise'];
const styles = ['Elegant', 'Charming', 'Classic', 'Modern', 'Vintage', 'Trendy', 'Minimalist', 'Luxury', 'Cute', 'Bohemian', 'Romantic', 'Contemporary', 'Artisan', 'Designer', 'Exclusive'];

function categorizeImage(filename) {
  const name = filename.toLowerCase().replace('.jpg', '').replace(/-/g, '-');
  const scores = {};
  for (const [catSlug, keywords] of Object.entries(categoryKeywords)) {
    scores[catSlug] = 0;
    for (const kw of keywords) {
      if (name.includes(kw)) {
        scores[catSlug]++;
      }
    }
  }
  let best = null;
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return bestScore > 0 ? best : 'fashion-jewelry';
}

function generatePrice(cat, index) {
  const [min, max] = cat.priceRange;
  const variance = (Math.sin(index * 1.5) + 1) / 2;
  const price = min + variance * (max - min);
  return parseFloat(price.toFixed(2));
}

function generateProductName(cat, itemType, index) {
  const color = colors[index % colors.length];
  const style = styles[Math.floor(index / colors.length) % styles.length];
  return `${color} ${style} ${itemType}`;
}

function generateSlug(name, catSlug, usedSlugs) {
  let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (usedSlugs.has(slug)) {
    slug += '-' + catSlug.split('-')[0];
  }
  if (usedSlugs.has(slug)) {
    slug += '-' + Math.floor(Math.random() * 1000);
  }
  usedSlugs.add(slug);
  return slug;
}

function generateDescription(name, cat, material, price) {
  const templates = [
    `Premium ${name} wholesale from Yiwu. ${cat.name} for retailers, boutiques, and online sellers. Factory direct pricing, low MOQ, reliable quality. Bulk orders welcome.`,
    `Elegant ${name} crafted with high-quality ${material}. Perfect for ${cat.name} collections. Wholesale prices starting at $${price}. Fast worldwide shipping.`,
    `Trendy ${name} - ${cat.name} wholesale supplier. Factory-direct from Yiwu China. Premium ${material} construction. Low minimum order quantities.`,
    `Luxurious ${name} for ${cat.name} buyers. Premium ${material} ensures durability and style. Competitive wholesale pricing. Custom orders available.`,
    `Charming ${name} made with ${material}. Ideal for ${cat.name} category. Wholesale pricing with volume discounts. Trade assurance protected.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateBulletPoints(cat, material, name) {
  return [
    `Crafted from premium ${material} for lasting quality and durability`,
    `${cat.name} category bestseller with proven market demand worldwide`,
    `Factory direct from Yiwu - no middleman markup, best margins for you`,
    `Low MOQ of 12 pieces - perfect for small businesses and boutiques`,
    `Fast shipping within 3-5 business days from our Yiwu warehouse`,
    `Full QC inspection before every shipment to ensure consistent quality`,
    `Custom packaging and private label available for brand differentiation`,
    `Volume discounts for orders over 500 pieces - save more when you buy more`,
    `Trade assurance guarantee on all orders - your investment is protected`,
    `Dedicated wholesale account manager for personalized service`,
    `Wide range of colors and sizes available to match your inventory needs`,
    `New designs added monthly - stay on-trend with the latest styles`,
  ];
}

function generateAplusContent(name, catInfo, material, price, imageUrl) {
  const catSlug = catInfo.slug.replace(/-/g, '');
  return {
    description: `Transform your ${catInfo.name} collection with our stunning ${name}. Crafted from premium ${material}, each piece is meticulously designed to meet the highest quality standards. Our factory-direct pricing ensures you get the best margins for your business.`,
    bulletPoints: [
      `Premium ${material} construction guarantees durability and lasting beauty`,
      `Hand-finished by skilled artisans in Yiwu, China`,
      `Wholesale pricing starting at just $${price} per piece`,
      `Minimum order quantity of 12 pieces for flexible ordering`,
      `Ships within 3-5 business days from our warehouse`,
      `Custom OEM/ODM services for private label brands`,
      `Trade assurance protected - your investment is safe`,
      `24/7 dedicated wholesale customer support`,
    ],
    blocks: [
      {
        type: 'banner',
        content: imageUrl,
        caption: `Premium ${catInfo.name} Wholesale Collection`
      },
      {
        type: 'image',
        content: imageUrl,
        caption: `${name} - Detail View`
      },
      {
        type: 'text',
        content: `Why choose our ${name}? We partner with verified Yiwu factories to bring you the best quality at wholesale prices. Every batch undergoes rigorous QC testing. Our trade assurance program protects every order, and our dedicated account managers help you scale your business.`
      },
      {
        type: 'comparison',
        content: 'Price Match Guarantee: Find a lower price elsewhere and we will beat it by 5%. Bulk discounts available for orders over 500 pieces.',
        caption: 'Bulk Pricing Tiers'
      }
    ]
  };
}

const groupedImages = {};
imageFiles.forEach((file, idx) => {
  const cat = categorizeImage(file);
  if (!groupedImages[cat]) groupedImages[cat] = [];
  groupedImages[cat].push({ file, idx });
});

const targetCounts = {
  'fashion-jewelry': 40,
  'bags-accessories': 35,
  'hair-accessories': 35,
  'garment-accessories': 35,
  'home-decor-crafts': 30,
  'toys-gift': 25
};

const usedSlugs = new Set();
const products = [];
let globalIndex = 0;

for (const [catSlug, targetCount] of Object.entries(targetCounts)) {
  const cat = categoryMap[catSlug];
  const images = groupedImages[catSlug] || [];
  const itemTypes = cat.itemTypes;

  for (let i = 0; i < targetCount; i++) {
    const globalImageIdx = images.length > 0 ? images[i % images.length].idx : i;
    const imageFile = images.length > 0 ? images[i % images.length].file : `product-${catSlug}-${i}.jpg`;
    const itemType = itemTypes[i % itemTypes.length];
    const name = generateProductName(cat, itemType, i);
    const slug = generateSlug(name, catSlug, usedSlugs);
    const material = cat.materials[i % cat.materials.length];
    const price = generatePrice(cat, i);
    const originalPrice = parseFloat((price * 1.35).toFixed(2));
    
    const localImageUrl = `/product-images/${imageFile}`;
    
    const similarImages = [];
    for (let j = 0; j < 4; j++) {
      const nextIdx = (i + j + 1) % Math.max(images.length, 1);
      const nextFile = images.length > 0 ? images[nextIdx].file : `product-${catSlug}-${nextIdx}.jpg`;
      similarImages.push(`/product-images/${nextFile}`);
    }

    products.push({
      name,
      slug,
      description: generateDescription(name, cat, material, price),
      priceMin: price,
      priceMax: originalPrice,
      image: localImageUrl,
      images: [localImageUrl, ...similarImages.slice(0, 3)],
      category: { slug: catSlug },
      sku: `YW-${catSlug.replace(/-/g, '').toUpperCase()}-${String(500 + products.length).padStart(5, '0')}`,
      material,
      plating: 'N/A',
      process: 'Factory Direct',
      color: colors[i % colors.length],
      size: 'Standard',
      packSize: 12,
      pkgLength: 15 + (i % 10),
      pkgWidth: 10 + (i % 8),
      pkgHeight: 5 + (i % 5),
      pkgWeight: parseFloat((0.1 + (i % 5) * 0.05).toFixed(2)),
      moq: 12,
      keywords: cat.keywords.slice(0, 5),
      origin: 'Yiwu, China',
      supplierCity: 'Yiwu',
      stockStatus: 'IN_STOCK',
      stock: 50 + Math.floor(Math.random() * 200),
      bulletPoints: generateBulletPoints(cat, material, name),
      aplus: generateAplusContent(name, cat, material, price, localImageUrl),
      isPublished: true,
      shippingCost: parseFloat((3.5 + Math.random() * 3).toFixed(2)),
      shippingMethod: 'Standard Shipping',
    });
    globalIndex++;
  }
}

console.log(`Generated ${products.length} products`);
console.log(`Categories breakdown:`);
for (const catSlug of Object.keys(targetCounts)) {
  const count = products.filter(p => p.category.slug === catSlug).length;
  console.log(`  ${categoryMap[catSlug].name}: ${count}`);
}

fs.writeFileSync(
  path.join(__dirname, '..', 'products-200.json'),
  JSON.stringify({ products }, null, 2)
);
console.log('Saved to products-200.json');

console.log('\nImage mapping:');
for (const [cat, imgs] of Object.entries(groupedImages)) {
  console.log(`  ${cat}: ${imgs.length} images available`);
}