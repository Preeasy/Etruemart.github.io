import { SITE_URL } from '@/lib/site';

// Next.js Pages Router: robots.txt rendered via getServerSideProps.
// (Using an `(req, res)` API handler signature in src/pages/ breaks with
// `res.setHeader is not a function`.)

export default function RobotsPage() {
  return null;
}

export async function getServerSideProps({ res }: { res: any }) {
  const txt = `User-agent: *
Allow: /

# 屏蔽私有/接口/账户路由，避免被索引
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /orders
Disallow: /sell
Disallow: /login
Disallow: /register
Disallow: /init

Sitemap: ${SITE_URL}/sitemap.xml`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(txt);
  res.end();
  return { props: {} };
}
