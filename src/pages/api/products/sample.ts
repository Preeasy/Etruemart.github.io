import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const samplePath = path.join(__dirname, '..', '..', '..', 'sample-products.json');
  
  try {
    const content = fs.readFileSync(samplePath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="sample-products.json"');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read sample file' });
  }
}
