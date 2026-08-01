const fs = require('fs');
const path = require('path');

const data = require('../site-data.json');

const products = data.products || [];
const imageDir = path.join(__dirname, '..', 'public', 'images', 'products');

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// SVG templates by category/theme
const svgTemplates = [
  // Jewelry theme - gold/silver tones
  (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/></linearGradient></defs>
    <rect fill="url(#bg)" width="400" height="400"/>
    <circle cx="200" cy="180" r="80" fill="none" stroke="#d4a017" stroke-width="3"/>
    <circle cx="200" cy="180" r="60" fill="none" stroke="#d4a017" stroke-width="2" opacity="0.5"/>
    <circle cx="200" cy="180" r="30" fill="#d4a017" opacity="0.3"/>
    <circle cx="200" cy="180" r="12" fill="#fbbf24"/>
    <line x1="200" y1="100" x2="200" y2="60" stroke="#d4a017" stroke-width="2"/>
    <circle cx="200" cy="55" r="8" fill="#d4a017"/>
    <text x="200" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#92400e">${name.substring(0,24)}</text>
  </svg>`,
  // Bag/accessories theme
  (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fce7f3"/><stop offset="100%" stop-color="#fbcfe8"/></linearGradient></defs>
    <rect fill="url(#bg2)" width="400" height="400"/>
    <rect x="120" y="120" width="160" height="140" rx="12" fill="none" stroke="#be185d" stroke-width="3"/>
    <rect x="135" y="140" width="130" height="100" rx="8" fill="#fce7f3" stroke="#be185d" stroke-width="1.5"/>
    <path d="M160 120 Q160 90 200 90 Q240 90 240 120" fill="none" stroke="#be185d" stroke-width="3"/>
    <circle cx="200" cy="190" r="15" fill="#be185d" opacity="0.3"/>
    <circle cx="200" cy="190" r="8" fill="#be185d"/>
    <rect x="195" y="115" width="10" height="25" fill="#be185d"/>
    <text x="200" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#9d174d">${name.substring(0,24)}</text>
  </svg>`,
  // Toy/Gift theme
  (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#bfdbfe"/></linearGradient></defs>
    <rect fill="url(#bg3)" width="400" height="400"/>
    <rect x="130" y="150" width="140" height="120" rx="8" fill="#fecaca" stroke="#dc2626" stroke-width="2"/>
    <rect x="125" y="140" width="150" height="20" rx="4" fill="#fca5a5" stroke="#dc2626" stroke-width="2"/>
    <path d="M200 140 Q180 100 200 80 Q220 100 200 140" fill="none" stroke="#dc2626" stroke-width="2"/>
    <rect x="185" y="170" width="30" height="30" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="200" cy="210" r="8" fill="#fef3c7"/>
    <text x="200" y="340" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#1e40af">${name.substring(0,24)}</text>
  </svg>`,
  // Home decor theme
  (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d1fae5"/><stop offset="100%" stop-color="#a7f3d0"/></linearGradient></defs>
    <rect fill="url(#bg4)" width="400" height="400"/>
    <path d="M200 120 L160 180 L180 180 L180 240 L220 240 L220 180 L240 180 Z" fill="#065f46" stroke="#047857" stroke-width="2"/>
    <path d="M200 140 L185 165 L200 165 L200 220 L200 220 L215 165 L200 165 Z" fill="#10b981" opacity="0.6"/>
    <rect x="140" y="240" width="120" height="20" rx="3" fill="#92400e"/>
    <ellipse cx="200" cy="240" rx="60" ry="12" fill="#78350f" opacity="0.3"/>
    <text x="200" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#065f46">${name.substring(0,24)}</text>
  </svg>`,
  // Hair accessory theme
  (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="bg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ede9fe"/><stop offset="100%" stop-color="#ddd6fe"/></linearGradient></defs>
    <rect fill="url(#bg5)" width="400" height="400"/>
    <ellipse cx="200" cy="200" rx="80" ry="60" fill="none" stroke="#7c3aed" stroke-width="3"/>
    <path d="M120 200 Q140 160 200 140 Q260 160 280 200" fill="none" stroke="#7c3aed" stroke-width="3"/>
    <circle cx="170" cy="180" r="10" fill="#a78bfa"/>
    <circle cx="230" cy="180" r="10" fill="#a78bfa"/>
    <circle cx="200" cy="150" r="8" fill="#c4b5fd"/>
    <rect x="155" y="230" width="90" height="4" rx="2" fill="#7c3aed"/>
    <text x="200" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#5b21b6">${name.substring(0,24)}</text>
  </svg>`,
  // General/modern theme
  (name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs><linearGradient id="bg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f3f4f6"/><stop offset="100%" stop-color="#e5e7eb"/></linearGradient></defs>
    <rect fill="url(#bg6)" width="400" height="400"/>
    <rect x="100" y="100" width="200" height="200" rx="16" fill="white" stroke="#9ca3af" stroke-width="2"/>
    <rect x="120" y="120" width="160" height="80" rx="8" fill="#e5e7eb"/>
    <circle cx="200" cy="160" r="20" fill="#d1d5db"/>
    <path d="M120 200 L160 160 L200 180 L240 140 L280 200 L280 280 L120 280 Z" fill="#9ca3af" opacity="0.4"/>
    <text x="200" y="330" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#4b5563">${name.substring(0,24)}</text>
  </svg>`,
];

function getCategoryIndex(category) {
  if (!category) return 5;
  let catStr = '';
  if (typeof category === 'object' && category !== null) {
    catStr = category.name || '';
  } else {
    catStr = String(category || '');
  }
  catStr = catStr.toLowerCase();
  if (catStr.includes('jewel') || catStr.includes('ring') || catStr.includes('necklace') || catStr.includes('earring')) return 0;
  if (catStr.includes('bag') || catStr.includes('handbag') || catStr.includes('wallet') || catStr.includes('accessor')) return 1;
  if (catStr.includes('toy') || catStr.includes('gift') || catStr.includes('plush') || catStr.includes('educational')) return 2;
  if (catStr.includes('home') || catStr.includes('decor') || catStr.includes('craft')) return 3;
  if (catStr.includes('hair') || catStr.includes('beauty') || catStr.includes('cosmetic')) return 4;
  return 5;
}

const imageMap = new Map();

products.forEach((product, index) => {
  const catIdx = getCategoryIndex(product.category);
  const templateIdx = catIdx % svgTemplates.length;
  const fileName = `product-${String(index + 1).padStart(4, '0')}.svg`;
  const filePath = path.join(imageDir, fileName);
  const svg = svgTemplates[templateIdx](product.name || 'Product');
  fs.writeFileSync(filePath, svg);
  imageMap.set(String(product.id), `/images/products/${fileName}`);
});

// Update site-data.json image paths
products.forEach((product) => {
  const newImage = imageMap.get(String(product.id));
  if (newImage) {
    product.image = newImage;
    // Also update images array
    if (product.images && Array.isArray(product.images)) {
      product.images = [newImage, newImage, newImage];
    } else {
      product.images = [newImage, newImage, newImage];
    }
  }
});

data.products = products;

fs.writeFileSync(
  path.join(__dirname, '..', 'site-data.json'),
  JSON.stringify(data, null, 2)
);

console.log(`Generated ${products.length} product SVG images in ${imageDir}`);
console.log('Updated site-data.json with local image paths');

// Also update DB products
const dbProductsPath = path.join(__dirname, '..', 'products-200.json');
if (fs.existsSync(dbProductsPath)) {
  const dbProducts = JSON.parse(fs.readFileSync(dbProductsPath, 'utf-8'));
  dbProducts.forEach((p, i) => {
    const catIdx = getCategoryIndex(p.category);
    const templateIdx = catIdx % svgTemplates.length;
    const fileName = `product-${String(i + 1).padStart(4, '0')}.svg`;
    p.image = `/images/products/${fileName}`;
  });
  fs.writeFileSync(dbProductsPath, JSON.stringify(dbProducts, null, 2));
  console.log(`Updated ${dbProducts.length} DB products with local image paths`);
}
