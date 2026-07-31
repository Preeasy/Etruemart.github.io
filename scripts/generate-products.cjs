const fs = require('fs');
const path = require('path');

const categories = [
  { slug: 'fashion-jewelry', name: 'Fashion Jewelry', count: 35, keywords: ['fashion jewelry', 'wholesale jewelry', 'necklace', 'earrings', 'bracelet', 'ring', 'chain'], basePrice: 1.5 },
  { slug: 'bags-accessories', name: 'Bags & Accessories', count: 35, keywords: ['bags', 'handbags', 'shoulder bag', 'crossbody', 'tote bag', 'wholesale bags', 'Yiwu bags'], basePrice: 8.5 },
  { slug: 'hair-accessories', name: 'Hair Accessories', count: 30, keywords: ['hair accessories', 'hair clips', 'hair bows', 'hair bands', 'scrunchies', 'wholesale hair'], basePrice: 0.8 },
  { slug: 'garment-accessories', name: 'Garment Accessories', count: 30, keywords: ['garment accessories', 'buttons', 'zippers', 'patches', 'lace', 'trim', 'wholesale'], basePrice: 0.6 },
  { slug: 'home-decor-crafts', name: 'Home Decor & Crafts', count: 35, keywords: ['home decor', 'ceramic', 'vase', 'figurine', 'tea set', 'wholesale crafts'], basePrice: 5.5 },
  { slug: 'toys-gift', name: 'Toys & Gift', count: 35, keywords: ['toys', 'plush', 'stuffed animal', 'gift set', 'educational toy', 'wholesale toys'], basePrice: 3.5 },
];

const productAdjectives = [
  'Premium', 'Elegant', 'Charming', 'Delicate', 'Stylish', 'Luxury', 'Vintage', 'Modern',
  'Classic', 'Contemporary', 'Minimalist', 'Handcrafted', 'Artisan', 'Designer', 'Couture',
  'Exclusive', 'Boutique', 'Refined', 'Sophisticated', 'Artisan'
];

const productMaterials = {
  'fashion-jewelry': ['Sterling Silver', 'Gold Plated', 'Rose Gold', 'Stainless Steel', 'Brass', 'Copper', 'Titanium', 'Alloy'],
  'bags-accessories': ['Genuine Leather', 'Faux Leather', 'Canvas', 'Nylon', 'PU Leather', 'Suede', 'Velvet', 'Satin'],
  'hair-accessories': ['Rhinestone', 'Pearl', 'Acrylic', 'Resin', 'Metal Alloy', 'Fabric', 'Satin Ribbon', 'Silk'],
  'garment-accessories': ['Metal', 'Plastic', 'Resin', 'Wood', 'Horn', 'Bone', 'Ceramic', 'Enamel'],
  'home-decor-crafts': ['Ceramic', 'Porcelain', 'Resin', 'Wood', 'Metal', 'Glass', 'Polyresin', 'Terracotta'],
  'toys-gift': ['Plush', 'Cotton', 'Wood', 'ABS Plastic', 'Silicone', 'Felt', 'Chenille', 'Velvet']
};

const productFeatures = [
  'Premium quality sourced from verified Yiwu factories',
  'Low MOQ starting from 12 pieces',
  'Factory-direct wholesale pricing with volume discounts',
  'Rigorous QC ensures consistent quality every batch',
  'Global shipping to 180+ countries',
  'Custom OEM/ODM services available',
  'Flexible payment terms for bulk orders',
  'Dedicated account manager for wholesale clients',
  'Private labeling and custom packaging available',
  'Fast turnaround time for bulk orders',
  'Trade assurance protected transactions',
  '24/7 customer support',
  'Wide range of designs and styles',
  'Seasonal and trendy collections',
  'Eco-friendly material options available'
];

const itemTypes = {
  'Fashion Jewelry': ['Necklace Set', 'Earrings', 'Bracelet', 'Ring Set', 'Choker', 'Pendant', 'Brooch', 'Cufflinks'],
  'Bags & Accessories': ['Shoulder Bag', 'Crossbody Bag', 'Handbag', 'Tote Bag', 'Clutch', 'Wallet', 'Backpack', 'Waist Bag'],
  'Hair Accessories': ['Hair Clip Set', 'Hair Bow', 'Headband', 'Scrunchie', 'Hair Pin Set', 'Hair Comb', 'Barrette', 'Hair Tie'],
  'Garment Accessories': ['Button Set', 'Zipper Pull', 'Iron-On Patch', 'Lace Trim', 'Ribbon Bow', 'Snap Fastener', 'Hook & Eye', 'Appliqué'],
  'Home Decor & Crafts': ['Ceramic Vase', 'Figurine Set', 'Tea Set', 'Wall Art', 'Table Decor', 'Sculpture', 'Candle Holder', 'Ornament'],
  'Toys & Gift': ['Plush Toy', 'Stuffed Animal', 'Gift Box Set', 'Educational Toy', 'Board Game', 'Puzzle Set', 'Action Figure', 'Craft Kit'],
};

const colors = ['Black', 'White', 'Red', 'Pink', 'Blue', 'Green', 'Gold', 'Silver', 'Rose', 'Beige', 'Brown', 'Purple'];
const styles = ['Elegant', 'Charming', 'Classic', 'Modern', 'Vintage', 'Trendy', 'Minimalist', 'Luxury', 'Cute', 'Bohemian'];

function generateProductNames(catName, count) {
  const names = [];
  const items = itemTypes[catName] || ['Item'];
  
  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    const style = styles[Math.floor(i / colors.length) % styles.length];
    const item = items[i % items.length];
    names.push(`${color} ${style} ${item}`);
  }
  return names;
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

function generateBulletPoints(cat, material) {
  const basePoints = [
    `Crafted from premium ${material} for lasting quality`,
    `${cat.name} category bestseller with proven market demand`,
    `Factory direct from Yiwu - no middleman markup`,
    `Low MOQ of 12 pieces - perfect for small businesses`,
    `Fast shipping within 3-5 business days`,
    `Full QC inspection before every shipment`,
    `Custom packaging and private label available`,
    `Volume discounts for orders over 500 pieces`,
    `Trade assurance guarantee on all orders`,
    `Dedicated wholesale account manager`,
    `Wide range of colors and sizes available`,
    `New designs added monthly - stay on-trend`,
  ];
  return basePoints;
}

function generateAplusContent(name, cat, material, price) {
  return {
    description: `Transform your ${cat.name} collection with our stunning ${name}. Crafted from premium ${material}, each piece is meticulously designed to meet the highest quality standards. Our factory-direct pricing ensures you get the best margins for your business.`,
    bulletPoints: [
      `Premium ${material} construction guarantees durability`,
      `Hand-finished by skilled artisans in Yiwu, China`,
      `Wholesale pricing starting at just $${price} per piece`,
      `Minimum order quantity of 12 pieces for flexibility`,
      `Ships within 3-5 business days from our warehouse`,
      `Custom OEM/ODM services for private label brands`,
      `Trade assurance protected - your investment is safe`,
      `24/7 dedicated wholesale customer support`,
    ],
    blocks: [
      {
        type: 'banner',
        content: `https://raw.githubusercontent.com/Preeasy/images/main/Images/new-banner-${cat.slug.replace(/-/g, '')}.svg`,
        caption: `Premium ${cat.name} Wholesale Collection`
      },
      {
        type: 'image',
        content: `https://raw.githubusercontent.com/Preeasy/images/main/Images/new-gallery-${cat.slug.replace(/-/g, '')}.svg`,
        caption: `${name} - Detail View`
      },
      {
        type: 'text',
        content: `Why choose our ${name}? We partner with verified Yiwu factories to bring you the best quality at wholesale prices. Every batch undergoes rigorous QC testing to ensure consistency. Our trade assurance program protects every order, and our dedicated account managers help you scale your business.`
      },
      {
        type: 'comparison',
        content: 'Price Match Guarantee: Find a lower price elsewhere and we\'ll beat it by 5%. Bulk discounts available for orders over 500 pieces.',
        caption: 'Bulk Pricing Tiers'
      }
    ]
  };
}

// Generate products
const products = [];
let imageCounter = 200;
const usedSlugs = new Set();

categories.forEach(cat => {
  const names = generateProductNames(cat.name, cat.count);
  for (let i = 0; i < cat.count; i++) {
    const name = names[i];
    const slug = generateSlug(name, cat.slug, usedSlugs);
    const priceVariance = 0.5 + (i % 7) * 0.25;
    const price = parseFloat((cat.basePrice * priceVariance).toFixed(2));
    const originalPrice = parseFloat((price * 1.35).toFixed(2));
    const material = productMaterials[cat.slug][i % productMaterials[cat.slug].length];
    
    const imgBase = `new-${String(imageCounter).padStart(4, '0')}`;
    
    products.push({
      name,
      slug,
      description: generateDescription(name, cat, material, price),
      priceMin: price,
      priceMax: originalPrice,
      image: `https://raw.githubusercontent.com/Preeasy/images/main/Images/${imgBase}.svg`,
      images: [
        `https://raw.githubusercontent.com/Preeasy/images/main/Images/${imgBase}.svg`,
        `https://raw.githubusercontent.com/Preeasy/images/main/Images/new-${String(imageCounter + 1).padStart(4, '0')}.svg`,
        `https://raw.githubusercontent.com/Preeasy/images/main/Images/new-${String(imageCounter + 2).padStart(4, '0')}.svg`,
        `https://raw.githubusercontent.com/Preeasy/images/main/Images/new-${String(imageCounter + 3).padStart(4, '0')}.svg`,
      ],
      category: { slug: cat.slug },
      sku: `YW-${cat.slug.replace(/-/g, '').toUpperCase()}-${String(200 + products.length).padStart(4, '0')}`,
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
      bulletPoints: generateBulletPoints(cat, material),
      aplus: generateAplusContent(name, cat, material, price),
      isPublished: true,
    });
    imageCounter += 4;
  }
});

console.log(`Generated ${products.length} products`);
console.log(`Categories breakdown:`);
categories.forEach(cat => {
  const count = products.filter(p => p.category.slug === cat.slug).length;
  console.log(`  ${cat.name}: ${count}`);
});

fs.writeFileSync(path.join(__dirname, '..', 'new-products.json'), JSON.stringify({ products }, null, 2));
console.log('Saved to new-products.json');
