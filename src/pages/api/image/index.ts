import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';

const ALLOWED_HOSTS = ['cdn.jsdelivr.net', 'raw.githubusercontent.com'];

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

const CACHE_DIR = path.join(process.cwd(), '.image-cache');

// Ensure cache directory exists
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/image] cache dir mkdir failed:', e?.message || e); }

function getCachePath(url: string): string {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const ext = url.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'png';
  return path.join(CACHE_DIR, `${hash}.${ext}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/image-proxy] silent error:', e?.message || e);
      return res.status(400).json({ error: 'Invalid url' 
});
  }
  
  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return res.status(403).json({ error: 'Host not allowed' });
  }
  
  // Check cache first
  const cachePath = getCachePath(url);
  if (fs.existsSync(cachePath)) {
    const cached = fs.readFileSync(cachePath);
    const ext = path.extname(cachePath).slice(1);
    res.setHeader('Content-Type', `image/${ext}`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cached);
  }
  
  const client = parsedUrl.protocol === 'https:' ? https : http;
  
  try {
    const response = await new Promise<http.IncomingMessage>((resolve, reject) => {
      const options: https.RequestOptions = {
        headers: { 'User-Agent': 'NextJS-ImageProxy' },
        timeout: 15000,
        agent: proxyAgent,
      };
      const request = client.get(parsedUrl, options, resolve);
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Timeout'));
      });
    });
    
    if (response.statusCode !== 200) {
      return res.status(response.statusCode || 502).json({ error: 'Upstream error' });
    }
    
    const contentType = response.headers['content-type'] || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    // Collect data and cache
    const chunks: Buffer[] = [];
    response.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    response.on('end', () => {
      const buffer = Buffer.concat(chunks);
      // Save to cache
      try {
        fs.writeFileSync(cachePath, buffer);
      } catch (e: any) { if (typeof console !== 'undefined') console.warn('[api/image] cache write failed:', e?.message || e); }
      res.send(buffer);
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
}
