// Image URL resolver. Works on both server and client.
// Server code can check the local filesystem. Client uses a number-range heuristic.

declare const require: any;
const isServer: boolean = typeof window === 'undefined';

let _localFileCache: Set<string> | null = null;
let _fs: any = null;
let _path: any = null;

function ensureNodeDeps(): boolean {
  if (!isServer) return false;
  if (_fs !== null) return true;
  try {
    // eslint-disable-next-line no-eval
    _fs = eval('require')('fs');
    // eslint-disable-next-line no-eval
    _path = eval('require')('path');
    return true;
  } catch {
    _fs = null;
    _path = null;
    return false;
  }
}

function getLocalFiles(): Set<string> {
  if (!ensureNodeDeps()) return new Set();
  if (_localFileCache) return _localFileCache;
  _localFileCache = new Set();
  try {
    const dir = _path.join(process.cwd(), 'public', 'images', 'item-list');
    if (_fs.existsSync(dir)) {
      const files: string[] = _fs.readdirSync(dir);
      for (const f of files) _localFileCache.add(f.toLowerCase());
    }
  } catch {
    // ignore
  }
  return _localFileCache;
}

function extractSkuFilename(url: string): string | null {
  const skuMatch = url.match(/[?/]((?:ycs|ywc|yw|ywx)-[^/?#]+\.(?:jpg|jpeg|png|JPG|JPEG|PNG))(?:[?#]|$)/i);
  return skuMatch ? skuMatch[1] : null;
}

/**
 * Resolves an image URL to a renderable src.
 *
 * Server behaviour (preferred):
 *   - Checks if SKU-based image exists in /public/images/item-list/
 *   - If yes => local path   /images/item-list/<sku>.jpg
 *   - If no  => canonical CDN URL https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/<FILE>
 *
 * Client behaviour (fallback heuristic):
 *   - SKU number segment >= 37 -> new product -> CDN
 *   - Smaller numbers         -> old product -> local path
 */
export function resolveImageUrlServerSide(url: string | null | undefined): string {
  if (!url) return '/images/product-placeholder.svg';
  if (url.startsWith('/images/') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return url;

  const skuFilename = extractSkuFilename(url);
  if (skuFilename) {
    const lower = skuFilename.toLowerCase();
    const localFiles = getLocalFiles();
    if (localFiles.size > 0 && localFiles.has(lower)) {
      return `/images/item-list/${lower}`;
    }
    return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${skuFilename}`;
  }

  if (url.includes('raw.githubusercontent.com/Preeasy/')) {
    const match = url.match(/raw\.githubusercontent\.com\/Preeasy\/[^/]+\/main\/(.+)/);
    if (match) {
      const sub = match[1].replace(/^(Images|images|%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87|商品图片)\//, '');
      return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${sub}`;
    }
  }

  if (url.includes('cdn.jsdelivr.net/gh/Preeasy/')) {
    const fileMatch = url.match(/\/([^/]+\.(?:jpg|jpeg|png|JPG|JPEG|PNG))(?:[?#]|$)/i);
    if (fileMatch) {
      const fn = fileMatch[1];
      if (/^(?:ycs|ywc|yw|ywx)-/i.test(fn)) {
        const lower = fn.toLowerCase();
        const localFiles = getLocalFiles();
        if (localFiles.size > 0 && localFiles.has(lower)) return `/images/item-list/${lower}`;
        return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${fn}`;
      }
    }
    const pathMatch = url.match(/cdn\.jsdelivr\.net\/gh\/Preeasy\/[^/]+\/[^/]+\/(.+)/);
    if (pathMatch) {
      let subPath = pathMatch[1];
      subPath = subPath
        .replace(/^%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87\//, '')
        .replace(/^商品图片\//, '')
        .replace(/^[Ii]mages\//, '');
      return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${subPath}`;
    }
    return url
      .replace('Preeasy/images@main/', 'Preeasy/Images@main/')
      .replace('Preeasy/Images@main/images/', 'Preeasy/Images@main/Images/')
      .replace('Preeasy/Images@main/%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87/', 'Preeasy/Images@main/Images/')
      .replace('Preeasy/Images@main/商品图片/', 'Preeasy/Images@main/Images/');
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const bareMatch = url.match(/^(?:Images|images|%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87|商品图片)\/(.+)$/);
  if (bareMatch) return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${bareMatch[1]}`;
  if (/^[^/]+\.(?:jpg|jpeg|png)$/i.test(url)) return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${url}`;

  return url;
}

/**
 * Client-safe resolver (works server-side too, but server should prefer
 * resolveImageUrlServerSide which uses real file existence check).
 */
export function proxyImageUrl(url: string | null | undefined): string {
  return resolveImageUrlServerSide(url);
}

export async function buildGitHubLookup(): Promise<Map<string, string>> {
  const lookup = new Map<string, string>();
  try {
    const response = await fetch('https://api.github.com/repos/Preeasy/images/contents/Images', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) return lookup;
    const data = await response.json();
    if (!Array.isArray(data)) return lookup;
    for (const item of data) {
      if (item.name && item.download_url) {
        const key = item.name.replace(/\.png$/i, '').replace(/\.jpg$/i, '').toLowerCase();
        lookup.set(key, `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${item.name}`);
      }
    }
  } catch {
    // silent fail
  }
  return lookup;
}

export function findGitHubImage(name: string, lookup: Map<string, string>): string {
  if (name.startsWith('http://') || name.startsWith('https://')) return name;
  if (name.startsWith('/')) return name;
  const key = name.replace(/\.png$/i, '').replace(/\.jpg$/i, '').toLowerCase();
  const directMatch = lookup.get(key);
  if (directMatch) return directMatch;
  const pngMatch = lookup.get(`${key}.png`);
  if (pngMatch) return pngMatch;
  const jpgMatch = lookup.get(`${key}.jpg`);
  if (jpgMatch) return jpgMatch;
  return name;
}
