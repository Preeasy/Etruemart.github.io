// Image URL resolver. All product images served from GitHub CDN.
// Format: https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/{FILENAME}
//
// Image identification is by Item number (SKU). The SKU is encoded directly
// in the image filename (e.g. SKU `YCS-AUS-012` -> `YCS-AUS-012.png` or
// `YCS-AUS-012-001.png` for additional images). JPG/PNG case is ignored
// during fallback resolution (see getAltExtensionCdnUrl).

function extractSkuBase(url: string): string | null {
  const skuMatch = url.match(/[?/]((?:ycs|ywc|yw|ywx|ys)-[^/?#]+?)\.(jpg|jpeg|png|JPG|JPEG|PNG)(?:[?#]|$)/i);
  return skuMatch ? skuMatch[1] : null;
}

function extractFilename(url: string): string | null {
  const match = url.match(/[?/]([^/?#]+\.(?:jpg|jpeg|png|JPG|JPEG|PNG))(?:[?#]|$)/i);
  return match ? match[1] : null;
}

const PREEASY_CDN_BASE = 'https://cdn.jsdelivr.net/gh/Preeasy/Images@main';

/**
 * Rewrite a Yeatru CDN URL (cdn.jsdelivr.net/gh/Yeatru/Image@main or
 * raw.githubusercontent.com/Yeatru/Image/main) to the equivalent Preeasy
 * CDN URL. The filename/path after `/Images/` is preserved so SKU-based
 * identification continues to work. Returns null if the URL is not a
 * Yeatru URL.
 */
function rewriteYeatruToPreeasy(url: string): string | null {
  // cdn.jsdelivr.net/gh/Yeatru/Image@main/Images/foo.png
  let m = url.match(/^https:\/\/cdn\.jsdelivr\.net\/gh\/Yeatru\/Image@main\/(.*)$/i);
  if (m) {
    const rest = m[1];
    // Normalize to Preeasy/Images@main/Images/...
    const path = rest.startsWith('Images/') ? rest : `Images/${rest.replace(/^\/+/, '')}`;
    return `${PREEASY_CDN_BASE}/${path}`;
  }
  // raw.githubusercontent.com/Yeatru/Image/main/Images/foo.png
  m = url.match(/^https:\/\/raw\.githubusercontent\.com\/Yeatru\/Image\/main\/(.*)$/i);
  if (m) {
    const rest = m[1];
    const path = rest.startsWith('Images/') ? rest : `Images/${rest.replace(/^\/+/, '')}`;
    return `${PREEASY_CDN_BASE}/${path}`;
  }
  return null;
}

/**
 * Primary resolver used by server code (getStaticProps / getServerSideProps / API routes).
 *
 * All SKU-based product images resolve to the Preeasy CDN in the canonical format:
 *   https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/{FILENAME}
 *
 * Identification is by Item number (SKU). The filename encodes the SKU directly.
 * JPG/PNG case is handled at render time via getAltExtensionCdnUrl fallback.
 *
 * NOTE: We never serve images from the Yeatru CDN — any Yeatru URL is rewritten
 * to the corresponding Preeasy URL (filename preserved).
 */
export function resolveImageUrlServerSide(url: string | null | undefined): string {
  if (!url) return '/images/product-placeholder.svg';
  if (url.startsWith('data:')) return url;

  // Non-SKU static files (placeholder, logo etc.) keep as-is
  if (url.startsWith('/') && !url.includes('item-list/')) return url;

  // ===============================================
  // YEATRU -> PREEASY REMAP
  // Don't use Yeatru图床 images; rewrite to Preeasy图床.
  // Filename is preserved so SKU/Item-number identification
  // still works. JPG/PNG case differences are tolerated at
  // render time via the alt-extension fallback chain.
  // ===============================================
  const remapped = rewriteYeatruToPreeasy(url);
  if (remapped) return remapped;

  // ===============================================
  // Preeasy CDN (canonical) & other GitHub CDN URLs:
  // keep as-is. Includes Preeasy/Images and any other
  // cdn.jsdelivr.net/gh/<user>/<repo>/... reference.
  // ===============================================
  if (url.startsWith('https://cdn.jsdelivr.net/gh/') ||
      url.startsWith('https://raw.githubusercontent.com/') ||
      url.startsWith('https://user-images.githubusercontent.com/')) {
    return url;
  }

  // SKU file referenced as local path (legacy) => map to CDN
  if (url.startsWith('/images/item-list/')) {
    const fn = url.split('/').pop() || '';
    return `${PREEASY_CDN_BASE}/Images/${fn}`;
  }

  // SKU filename embedded in an URL (legacy CDN / raw.github URLs)
  const skuBase = extractSkuBase(url);
  if (skuBase) {
    const extMatch = url.match(/[?/](?:ycs|ywc|yw|ywx|ys)-[^/?#]+\.(jpg|jpeg|png|JPG|JPEG|PNG)(?:[?#]|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const skuUpper = skuBase.toUpperCase();
    return `${PREEASY_CDN_BASE}/Images/${skuUpper}.${ext}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Bare path like "Images/foo.png" or plain filename
  const bareMatch = url.match(/^(?:Images|images|%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87|商品图片)\/(.+)$/);
  if (bareMatch) return `${PREEASY_CDN_BASE}/Images/${bareMatch[1]}`;
  if (/^[^/]+\.(?:jpg|jpeg|png)$/i.test(url)) {
    return `${PREEASY_CDN_BASE}/Images/${url}`;
  }

  return url;
}

/**
 * Client-safe resolver. Identical logic to server version because all product
 * images now live on CDN.
 */
export function proxyImageUrl(url: string | null | undefined): string {
  return resolveImageUrlServerSide(url);
}

/**
 * Helper for the onerror fallback chain in <ProductCard>:
 * Given a CDN URL, return the alternate-extension counterpart.
 *   e.g. .../Images/YCS-SHO-022.png  <->  .../Images/YCS-SHO-022.jpg
 * Returns null if all alternates have been exhausted.
 */
export function getAltExtensionCdnUrl(
  currentSrc: string,
  triedExts: Set<string>
): string | null {
  const match = currentSrc.match(
    /(https:\/\/cdn\.jsdelivr\.net\/gh\/Preeasy\/Images@main\/Images\/[^/?#]+\.)(jpg|jpeg|png|JPG|JPEG|PNG)([?#]|$)/i
  );
  if (!match) return null;
  const prefix = match[1];
  const currentExt = match[2].toLowerCase();
  const alternates = currentExt === 'png'
    ? ['jpg', 'jpeg']
    : currentExt === 'jpg' || currentExt === 'jpeg'
      ? ['png']
      : ['jpg', 'png'];
  for (const alt of alternates) {
    if (!triedExts.has(alt)) {
      return `${prefix}${alt}`;
    }
  }
  return null;
}

export async function buildGitHubLookup(): Promise<Map<string, string>> {
  const lookup = new Map<string, string>();
  try {
    const response = await fetch('https://api.github.com/repos/Preeasy/Images/contents/Images', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) return lookup;
    const data = await response.json();
    if (!Array.isArray(data)) return lookup;
    for (const item of data) {
      if (item.name && item.download_url) {
        const key = item.name.replace(/\.(png|jpg|jpeg)$/i, '').toLowerCase();
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
  const key = name.replace(/\.(png|jpg|jpeg)$/i, '').toLowerCase();
  const directMatch = lookup.get(key);
  if (directMatch) return directMatch;
  const pngMatch = lookup.get(`${key}.png`);
  if (pngMatch) return pngMatch;
  const jpgMatch = lookup.get(`${key}.jpg`);
  if (jpgMatch) return jpgMatch;
  return name;
}
