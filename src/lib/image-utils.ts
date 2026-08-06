export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/product-placeholder.svg';
  if (url.startsWith('/images/') || url.startsWith('data:')) return url;

  // Convert raw.githubusercontent.com to cdn.jsdelivr.net for reliability
  // raw.githubusercontent.com/Preeasy/images/main/path -> cdn.jsdelivr.net/gh/Preeasy/images@main/path
  if (url.includes('raw.githubusercontent.com/Preeasy/images/')) {
    let path = url.replace('https://raw.githubusercontent.com/Preeasy/images/', '');
    // Strip the "main/" branch prefix - jsdelivr uses @main/ instead
    path = path.replace(/^main\//, '');
    try {
      const decoded = decodeURIComponent(path);
      return `https://cdn.jsdelivr.net/gh/Preeasy/images@main/${decoded}`;
    } catch {
      return `https://cdn.jsdelivr.net/gh/Preeasy/images@main/${path}`;
    }
  }

  // Convert raw.githubusercontent.com/Preeasy/Images/ (capital I)
  if (url.includes('raw.githubusercontent.com/Preeasy/Images/')) {
    let path = url.replace('https://raw.githubusercontent.com/Preeasy/Images/', '');
    path = path.replace(/^main\//, '');
    try {
      const decoded = decodeURIComponent(path);
      return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/${decoded}`;
    } catch {
      return `https://cdn.jsdelivr.net/gh/Preeasy/Images@main/${path}`;
    }
  }

  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return url;
}

export async function buildGitHubLookup(): Promise<Map<string, string>> {
  const lookup = new Map<string, string>();
  try {
    const response = await fetch('https://api.github.com/repos/Preeasy/Images/contents/images', {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!response.ok) return lookup;
    const data = await response.json();
    if (!Array.isArray(data)) return lookup;
    for (const item of data) {
      if (item.name && item.download_url) {
        const key = item.name.replace(/\.png$/i, '').replace(/\.jpg$/i, '').toLowerCase();
        lookup.set(key, item.download_url);
      }
    }
  } catch {
    // silent fail
  }
  return lookup;
}

export function findGitHubImage(name: string, lookup: Map<string, string>): string {
  if (name.startsWith('http://') || name.startsWith('https://')) return name;
  const key = name.replace(/\.png$/i, '').replace(/\.jpg$/i, '').toLowerCase();
  const directMatch = lookup.get(key);
  if (directMatch) return directMatch;
  const pngMatch = lookup.get(`${key}.png`);
  if (pngMatch) return pngMatch;
  const jpgMatch = lookup.get(`${key}.jpg`);
  if (jpgMatch) return jpgMatch;
  return name;
}
