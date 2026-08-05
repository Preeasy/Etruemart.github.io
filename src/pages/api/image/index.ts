import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import http from 'http';
import { HttpsProxyAgent } from 'https-proxy-agent';

const ALLOWED_HOSTS = ['cdn.jsdelivr.net', 'raw.githubusercontent.com'];

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }
  
  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return res.status(403).json({ error: 'Host not allowed' });
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
    
    response.pipe(res);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
}
