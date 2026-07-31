const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'temp-images', 'new');
fs.mkdirSync(outputDir, { recursive: true });

const imageConfigs = [
  { query: 'fashion-jewelry', count: 235, keywords: 'jewelry,necklace,earrings,bracelet,ring' },
  { query: 'bags-accessories', count: 235, keywords: 'handbag,purse,shoulder-bag,tote-bag,leather-bag' },
  { query: 'hair-accessories', count: 235, keywords: 'hair-accessories,hair-clip,hair-bow,headband,scrunchie' },
  { query: 'garment-accessories', count: 235, keywords: 'buttons,zipper,lace,ribbon,patches' },
  { query: 'home-decor-crafts', count: 235, keywords: 'ceramic-vase,figurine,tea-set,home-decor,craft' },
  { query: 'toys-gift', count: 235, keywords: 'plush-toy,stuffed-animal,gift-box,toys,educational-toy' },
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, (res2) => {
          const writeStream = fs.createWriteStream(filepath);
          res2.pipe(writeStream);
          writeStream.on('finish', resolve);
        }).on('error', reject);
      } else {
        const writeStream = fs.createWriteStream(filepath);
        res.pipe(writeStream);
        writeStream.on('finish', resolve);
      }
    }).on('error', reject);
  });
}

async function downloadUnsplashImage(keyword, filepath) {
  const url = `https://source.unsplash.com/600x600/?${encodeURIComponent(keyword)}`;
  try {
    await downloadImage(url, filepath);
    console.log(`Downloaded: ${path.basename(filepath)}`);
  } catch (e) {
    // Create a placeholder if download fails
    console.log(`Failed to download ${path.basename(filepath)}, creating placeholder`);
    createPlaceholder(filepath, keyword);
  }
}

function createPlaceholder(filepath, text) {
  // Create a simple colored SVG as placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="%23f5f5f5"/>
    <text x="300" y="300" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dominant-baseline="middle">${text}</text>
  </svg>`;
  fs.writeFileSync(filepath.replace('.jpg', '.svg'), decodeURIComponent(svg));
}

async function main() {
  const totalImages = 200 * 4; // 4 images per product
  console.log(`Starting download of ${totalImages} images...`);
  
  let counter = 200;
  const allKeywords = [];
  
  imageConfigs.forEach(config => {
    const keywordList = config.keywords.split(',');
    for (let i = 0; i < config.count; i++) {
      const keyword = keywordList[i % keywordList.length];
      allKeywords.push({ keyword, num: counter });
      counter++;
    }
  });

  // Download in batches to avoid overwhelming the server
  const batchSize = 10;
  for (let i = 0; i < allKeywords.length; i += batchSize) {
    const batch = allKeywords.slice(i, i + batchSize);
    await Promise.all(batch.map(({ keyword, num }) => {
      const filepath = path.join(outputDir, `new-${String(num).padStart(4, '0')}.jpg`);
      return downloadUnsplashImage(keyword, filepath);
    }));
    console.log(`Progress: ${Math.min(i + batchSize, allKeywords.length)}/${allKeywords.length}`);
  }

  console.log(`Done! Downloaded images to ${outputDir}`);
}

main().catch(console.error);
