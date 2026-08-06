// Image URL resolver. All product images served from GitHub CDN.
// Format: https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/{FILENAME}

function extractSkuBase(url: string): string | null {
  const skuMatch = url.match(/[?/]((?:ycs|ywc|yw|ywx)-[^/?#]+?)\.(jpg|jpeg|png|JPG|JPEG|PNG)(?:[?#]|$)/i);
  return skuMatch ? skuMatch[1] : null;
}

function extractFilename(url: string): string | null {
  const match = url.match(/[?/]([^/?#]+\.(?:jpg|jpeg|png|JPG|JPEG|PNG))(?:[?#]|$)/i);
  return match ? match[1] : null;
}

/**
 * Primary resolver used by server code (getStaticProps / getServerSideProps / API routes).
 *
 * All SKU-based product images resolve to CDN in the canonical format:
 *   https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/{FILENAME}
 *
 * Local paths from seed data are preserved for non-SKU files (placeholders, logo etc.),
 * but for SKU files we translate to CDN because the local images dir is gitignored.
 */
export function resolveImageUrlServerSide(url: string | null | undefined): string {
  if (!url) return '/images/product-placeholder.svg';
  if (url.startsWith('data:')) return url;

  // Non-SKU static files (placeholder, logo etc.) keep as-is
  if (url.startsWith('/') && !url.includes('item-list/')) return url;

  // SKU file referenced as local path (legacy) => map to CDN
  // Keeps extension intact but caller may choose case.
  if (url.startsWith('/images/item-list/')) {
    const fn = url.split('/').pop() || '';
    // Just transform to the canonical CDN URL with the same filename.
    // The filename case mismatch is already fixed in seed-data.json directly,
    // so if any leak through, this still yields a valid CDN URL structure.
    return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${fn}`;
  }

  // SKU filename embedded in an URL (legacy CDN / raw.github URLs)
  const skuBase = extractSkuBase(url);
  if (skuBase) {
    // Build canonical CDN URL with a deterministic extension preference:
    // prefer the extension from the original URL if we can derive it
    const extMatch = url.match(/[?/](?:ycs|ywc|yw|ywx)-[^/?#]+\.(jpg|jpeg|png|JPG|JPEG|PNG)(?:[?#]|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    // Preserve original case for the prefix from URL - we already normalised seed data
    // but fall back to uppercase convention used in the CDN (YCS-ACC-001.png).
    const skuUpper = skuBase.toUpperCase();
    return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${skuUpper}.${ext}`;
  }

  // Non-SKU CDN URLs: normalise wrong repo name, wrong subdir, wrong branch, etc.
  if (url.includes('cdn.jsdelivr.net/gh/Preeasy/') || url.includes('raw.githubusercontent.com/Preeasy/')) {
    const fn = extractFilename(url);
    if (fn) {
      return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${fn}`;
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

  // Bare path like "Images/foo.png" or "商品图片/foo.png" or plain "YCS-CLO-037-001.png"
  const bareMatch = url.match(/^(?:Images|images|%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87|商品图片)\/(.+)$/);
  if (bareMatch) return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${bareMatch[1]}`;
  if (/^[^/]+\.(?:jpg|jpeg|png)$/i.test(url)) {
    return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images/${url}`;
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
