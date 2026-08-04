const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'prisma', 'seed-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log('Products:', data.products.length);
console.log('Categories:', data.categories.length);

// Split products into batches of 100
const batchSize = 100;
const batches = [];
for (let i = 0; i < data.products.length; i += batchSize) {
  batches.push(data.products.slice(i, i + batchSize));
}
console.log('Batches of 100:', batches.length);

// Write batch files
for (let i = 0; i < batches.length; i++) {
  const batchData = {
    categories: data.categories,
    products: batches[i],
    batchIndex: i,
    totalBatches: batches.length
  };
  const fileName = 'seed-batch-' + String(i).padStart(2, '0') + '.json';
  const batchPath = path.join(__dirname, '..', 'prisma', fileName);
  fs.writeFileSync(batchPath, JSON.stringify(batchData));
  console.log('Wrote:', fileName, '-', batches[i].length, 'products');
}

console.log('Done!');