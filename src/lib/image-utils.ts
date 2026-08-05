import https from 'https';

const GITHUB_RAW_BASE = 'https://cdn.jsdelivr.net/gh/Preeasy/Images@main/Images';

let githubFileLookup: Map<string, string> | null = null;

export async function buildGitHubLookup(): Promise<Map<string, string>> {
  if (githubFileLookup) return githubFileLookup;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/Preeasy/Images/git/trees/main?recursive=1',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
      },
      timeout: 3000,
    };
    
    const req = https.get(options, (res) => {
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
            lookup.set(filename.toLowerCase(), filePath);
            const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
            lookup.set(nameWithoutExt.toLowerCase(), filePath);
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
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('GitHub API timeout'));
    });
  });
}

export function findGitHubImage(localPath: string, lookup: Map<string, string>): string {
  if (!localPath || localPath.startsWith('http')) {
    return localPath || '/images/product-placeholder.svg';
  }
  
  const filename = localPath.split('/').pop() || '';
  
  const filenameLower = filename.toLowerCase();
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toLowerCase();
  const filenameUpper = filename.toUpperCase();
  const nameWithoutExtUpper = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').toUpperCase();
  
  if (lookup.has(filenameLower)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(filenameLower)}`;
  }
  if (lookup.has(filenameUpper)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(filenameUpper)}`;
  }
  
  if (lookup.has(nameWithoutExt)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(nameWithoutExt)}`;
  }
  if (lookup.has(nameWithoutExtUpper)) {
    return `${GITHUB_RAW_BASE}/${lookup.get(nameWithoutExtUpper)}`;
  }
  
  if (localPath.includes('/images/item-list/')) {
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
  
  if (localPath.includes('/images/products/')) {
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
  
  const cleanPath = localPath.replace(/^\//, '');
  return `${GITHUB_RAW_BASE}/${cleanPath}`;
}

export function resetGitHubLookup() {
  githubFileLookup = null;
}
