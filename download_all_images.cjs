const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const { HttpsProxyAgent } = require('https-proxy-agent');

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:18080';
const agent = new HttpsProxyAgent(PROXY_URL);

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'item-list');
const CACHE_DIR = path.join(process.cwd(), '.image-cache');

// 确保目录存在
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const db = new Database(path.join(process.cwd(), 'prisma', 'dev.db'));

// 获取所有产品及其图片URL
const products = db.prepare(`
  SELECT id, sku, slug, image, 
         CASE WHEN image LIKE 'https://cdn.jsdelivr.net%' THEN 'cdn' 
              WHEN image LIKE '/images/item-list/%' THEN 'local_item'
              WHEN image LIKE '/images/products/%' THEN 'local_product'
              ELSE 'other' END as source
  FROM products
  ORDER BY source, sku
`).all();

console.log(`总产品: ${products.length}`);

// 获取所有需要处理的CDN图片URL
const cdnProducts = products.filter(p => p.source === 'cdn');
const localProducts = products.filter(p => p.source === 'local_item' || p.source === 'local_product');

console.log(`CDN图片产品: ${cdnProducts.length}`);
console.log(`本地图片产品: ${localProducts.length}`);

// 从缓存或下载所有CDN图片到public/images/item-list/
function getLocalPathFromCdnUrl(cdnUrl, sku) {
  // 从URL提取文件名
  const fileName = cdnUrl.split('/').pop();
  // 使用SKU命名以确保唯一性
  const ext = fileName.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'png';
  return path.join(PUBLIC_DIR, `${sku.toLowerCase()}.${ext}`);
}

function downloadOrCopy(cdnUrl, localPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(localPath)) {
      resolve({ ok: true, cached: true });
      return;
    }
    
    // 先检查.image-cache
    const hash = crypto.createHash('md5').update(cdnUrl).digest('hex');
    const ext = cdnUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'png';
    const cachePath = path.join(CACHE_DIR, `${hash}.${ext}`);
    
    if (fs.existsSync(cachePath)) {
      fs.copyFileSync(cachePath, localPath);
      resolve({ ok: true, fromCache: true });
      return;
    }
    
    // 下载
    const parsed = new URL(cdnUrl);
    const req = https.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'NextJS-ImageProxy' },
      timeout: 30000,
      agent,
    }, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          try {
            fs.writeFileSync(localPath, buf);
            // 同时写入缓存
            try { fs.writeFileSync(cachePath, buf); } catch {}
            resolve({ ok: true, downloaded: true });
          } catch (e) {
            resolve({ ok: false, error: e.message });
          }
        });
      } else {
        resolve({ ok: false, status: res.statusCode });
        res.resume();
      }
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
  });
}

async function processAll() {
  let done = 0, failed = 0, fromCache = 0, downloaded = 0;
  const FAIL_LOG = [];
  
  const BATCH = 8;
  const urls = cdnProducts.map(p => ({ sku: p.sku, cdnUrl: p.image }));
  
  async function worker(start, end) {
    for (let i = start; i < end; i++) {
      const { sku, cdnUrl } = urls[i];
      const localPath = getLocalPathFromCdnUrl(cdnUrl, sku);
      const r = await downloadOrCopy(cdnUrl, localPath);
      done++;
      if (r.ok) {
        if (r.fromCache) fromCache++;
        else downloaded++;
      } else {
        failed++;
        FAIL_LOG.push({ sku, cdnUrl, error: r.error || r.status });
      }
      if (done % 100 === 0 || done === urls.length) {
        console.log(`进度: ${done}/${urls.length} (缓存: ${fromCache}, 下载: ${downloaded}, 失败: ${failed})`);
      }
    }
  }
  
  const workers = [];
  for (let w = 0; w < BATCH; w++) {
    const start = Math.floor(w * urls.length / BATCH);
    const end = Math.floor((w + 1) * urls.length / BATCH);
    workers.push(worker(start, end));
  }
  await Promise.all(workers);
  
  console.log(`\n下载完成: 缓存${fromCache}, 下载${downloaded}, 失败${failed}`);
  if (FAIL_LOG.length > 0) {
    console.log('失败详情:');
    for (const f of FAIL_LOG) {
      console.log(`  SKU=${f.sku}, error=${f.error}`);
    }
  }
  
  // 统计public/images/item-list目录
  const files = fs.readdirSync(PUBLIC_DIR);
  const size = files.reduce((a, f) => a + fs.statSync(path.join(PUBLIC_DIR, f)).size, 0);
  console.log(`\npublic/images/item-list: ${files.length} 个文件, ${(size/1024/1024).toFixed(1)} MB`);
  
  // 输出需要更新的映射
  console.log('\n=== 需要更新的数据库映射 ===');
  const updates = [];
  for (const p of cdnProducts) {
    const localPath = getLocalPathFromCdnUrl(p.image, p.sku);
    const exists = fs.existsSync(localPath);
    if (exists) {
      const relPath = `/images/item-list/${p.sku.toLowerCase()}.png`;
      // 修正扩展名
      const actualExt = path.extname(localPath);
      const finalPath = `/images/item-list/${p.sku.toLowerCase()}${actualExt}`;
      updates.push({ id: p.id, sku: p.sku, old: p.image, new: finalPath });
    }
  }
  console.log(`可更新的产品: ${updates.length}`);
  
  // 保存映射供后续脚本使用
  fs.writeFileSync('/tmp/image_mapping.json', JSON.stringify(updates, null, 2));
  console.log('映射已保存到 /tmp/image_mapping.json');
}

processAll().catch(console.error);
