import https from 'https';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Preeasy/images/main';

// Cache for GitHub file lookup
let githubFileLookup: Map<string, string> | null = null;

export async function buildGitHubLookup(): Promise<Map<string, string>> {
  if (githubFileLookup) return githubFileLookup;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/Preeasy/images/git/trees/main?recursive=1',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const tree = json.tree || [];
          const lookup = new Map<string, string>();
          
          for (const f of tree) {
            const filePath = f.path;
            const filename = filePath.split('/').pop() || '';
            // Store multiple lookup keys:
            // 1. Full filename (lowercase) with extension
            lookup.set(filename.toLowerCase(), filePath);
            // 2. Name without extension (lowercase)
            const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
            lookup.set(nameWithoutExt.toLowerCase(), filePath);
            // 3. Uppercase variants (for SKU matching)
            lookup.set(filename.toUpperCase(), filePath);
            lookup.set(nameWithoutExt.toUpperCase(), filePath);
          }
          
          githubFileLookup = lookup;
          console.log(`[image-utils] GitHub lookup built: ${lookup.size} entries`);
          resolve(lookup);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

export function findGitHubImage(localPath: string, lookup: Map<string, string>): string {
  if (!localPath || localPath.startsWith('http')) {
    return localPath || '/images/product-placeholder.svg';
  }
  
  // Extract filename
  const filename = localPath.split('/').pop() || '';
  
  // Try to find in GitHub lookup
  const filenameLower = filename.toLowerCase();
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
  const filenameUpper = filename.toUpperCase();
  const nameWithoutExtUpper = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toUpperCase();
  
  // Try exact filename match (lowercase and uppercase)
  if (lookup.has(filenameLower)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(filenameLower)}`;
  }
  if (lookup.has(filenameUpper)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(filenameUpper)}`;
  }
  
  // Try name without extension (lowercase and uppercase)
  if (lookup.has(nameWithoutExt)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(nameWithoutExt)}`;
  }
  if (lookup.has(nameWithoutExtUpper)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(nameWithoutExtUpper)}`;
  }
  
  // If item-list image, try with various extension combinations
  if (localPath.includes('/images/item-list/')) {
    // Convert to uppercase and try .png, .jpg
    const extensions1: string[] = ['.png', '.jpg', '.jpeg'];
    for (const ext of extensions1) {
      const key = (nameWithoutExtUpper + ext).toLowerCase();
      if (lookup.has(key)) {
        return `${GITHUB_RAW_BASE}/${lookup.get(key)}`;
      }
    }
    for (const ext of extensions1) {
      const key = nameWithoutExtUpper + ext;
      if (lookup.has(key)) {
        return `${GITHUB_RAW_BASE}/${lookup.get(key)}`;
      }
    }
  }
  
  // For products images
  if (localPath.includes('/images/products/')) {
    // Try common patterns
    const patterns: string[] = [
      nameWithoutExt.replace('github_', ''),
      nameWithoutExt.replace(/^github_/, '').replace(/_/g, ' ').trim(),
      nameWithoutExt.replace('v2_', ''),
      nameWithoutExt.replace(/^v2_/, '').replace(/_/g, ' ').trim(),
    ];
    
    for (const pattern of patterns) {
      const key = pattern.toLowerCase();
      if (lookup.has(key)) {
        return `${GITHUB_RAW_BASE}/${lookup.get(key)}`;
      }
    }
    
    // Try numeric patterns (001.jpg, 002.jpg)
    const numMatch = filename.match(/(\d+)/);
    if (numMatch) {
      const num = numMatch[1];
      const extensions2: string[] = ['.jpg', '.png'];
      for (const ext of extensions2) {
        const paddedNum = num.padStart(3, '0');
        const key = (paddedNum + ext).toLowerCase();
        if (lookup.has(key)) {
          return `${GITHUB_RAW_BASE}/${lookup.get(key)}`;
        }
      }
    }
  }
  
  // Default: convert path directly (this might fail but better than nothing)
  const cleanPath = localPath.replace(/^\//, '');
  return `${GITHUB_RAW_BASE}/${cleanPath}`;
}

export function resetGitHubLookup() {
  githubFileLookup = null;
}
