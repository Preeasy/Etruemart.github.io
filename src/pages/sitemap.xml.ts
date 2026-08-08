import fs from 'fs';
import path from 'path';
import { SITE_URL } from '@/lib/site';

// Next.js Pages Router: sitemap.xml rendered via getServerSideProps.
// Files under src/pages/ are page components, NOT API routes, so we use
// getServerSideProps and write the response via `res` from context. Using an
// `(req, res)` API handler signature here causes `res.setHeader is not a function`.

function escapeXml(s: string): string {
  return String(s == null ? '' : s).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export default function SitemapPage() {
  return null;
}

export async function getServerSideProps({ res }: { res: any }) {
  const urls: { loc: string; lastmod?: string; image?: string }[] = [
    { loc: SITE_URL, lastmod: new Date().toISOString() },
    { loc: `${SITE_URL}/products` },
  ];

  try {
    const seedPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      (data.categories || []).forEach((cat: any) => {
        if (cat.slug) urls.push({ loc: `${SITE_URL}/products?category=${cat.slug}` });
      });
      // 过滤子变体、未发布、零价商品，避免低质/重复 URL
      (data.products || []).forEach((prod: any) => {
        const isChild = !!prod.parentId;
        const published = prod.isPublished !== false;
        const hasPrice = Number(prod.price) > 0 || Number(prod.priceMax) > 0;
        if (isChild || !published || !hasPrice) return;
        const id = prod.slug || prod.id;
        if (!id) return;
        const image = typeof prod.image === 'string' && prod.image.startsWith('http') ? prod.image : undefined;
        urls.push({
          loc: `${SITE_URL}/products/${id}`,
          lastmod: prod.updatedAt,
          image,
        });
      });
    }
  } catch (e: any) {
    if (typeof console !== 'undefined') console.warn('[sitemap] failed to load seed data:', e?.message || e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => {
  let entry = `  <url>\n    <loc>${escapeXml(u.loc)}</loc>`;
  if (u.lastmod) entry += `\n    <lastmod>${new Date(u.lastmod).toISOString().split('T')[0]}</lastmod>`;
  entry += `\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>`;
  if (u.image) entry += `\n    <image:image><image:loc>${escapeXml(u.image)}</image:loc></image:image>`;
  entry += `\n  </url>`;
  return entry;
}).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(xml);
  res.end();
  return { props: {} };
}
