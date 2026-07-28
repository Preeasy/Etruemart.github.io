/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'trae-api-cn.mchost.guru' },
      { protocol: 'https', hostname: 'loremflickr.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
    ],
  },
  output: 'export',
  trailingSlash: true,
  basePath: '/Etruemart.github.io',
  assetPrefix: '/Etruemart.github.io/',
}

export default nextConfig
