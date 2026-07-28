import { Html, Head, Main, NextScript } from 'next/document';

const SITE_URL = 'https://etruemart.vercel.app';
const SITE_NAME = 'eTrue Mark';
const SITE_DESCRIPTION = 'Wholesale jewelry, accessories & crafts direct from Yiwu factories. Low MOQ, factory-direct pricing, global shipping. Trusted B2B sourcing platform.';

export default function Document() {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Charset & Viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Primary Meta Tags */}
        <meta name="title" content={`${SITE_NAME} | Wholesale Jewelry & Accessories from Yiwu`} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content="wholesale jewelry, Yiwu market, fashion jewelry wholesale, bag accessories, hair accessories, garment accessories, home decor crafts, toys gift, B2B sourcing China, low MOQ, factory direct" />
        <meta name="author" content="eTrue Mark / Yiwu Yeatru Trading Co., Ltd." />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />

        {/* GEO Meta Tags */}
        <meta name="geo.region" content="CN-33" />
        <meta name="geo.placename" content="Yiwu, Zhejiang, China" />
        <meta name="geo.position" content="29.3056;120.0762" />
        <meta name="ICBM" content="29.3056, 120.0762" />
        <meta name="language" content="English" />
        <meta name="distribution" content="global" />

        {/* hreflang Tags */}
        <link rel="alternate" hrefLang="en" href={SITE_URL} />
        <link rel="alternate" hrefLang="zh-CN" href={`${SITE_URL}/zh-CN`} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={`${SITE_NAME} | Wholesale Jewelry & Accessories from Yiwu`} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og-image.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_CN" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={`${SITE_NAME} | Wholesale Jewelry & Accessories`} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.jpg`} />

        {/* Canonical */}
        <link rel="canonical" href={SITE_URL} />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0F2A4A" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://raw.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />

        {/* Organization Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'eTrue Mark',
              alternateName: 'Yiwu Yeatru Trading Co., Ltd.',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description: SITE_DESCRIPTION,
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Yiwu International Trade City, Chouzhou Road',
                addressLocality: 'Yiwu',
                addressRegion: 'Zhejiang',
                postalCode: '322000',
                addressCountry: 'CN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 29.3056,
                longitude: 120.0762,
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+86-579-85000000',
                contactType: 'sales',
                availableLanguage: ['English', 'Chinese'],
              },
              sameAs: [
                'https://www.facebook.com/etruemark',
                'https://www.linkedin.com/company/etruemark',
                'https://www.instagram.com/etruemark',
              ],
            }),
          }}
        />

        {/* LocalBusiness Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WholesaleStore',
              name: 'eTrue Mark - Wholesale Sourcing Platform',
              image: `${SITE_URL}/og-image.jpg`,
              url: SITE_URL,
              telephone: '+86-579-85000000',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Yiwu International Trade City, Chouzhou Road',
                addressLocality: 'Yiwu',
                addressRegion: 'Zhejiang',
                postalCode: '322000',
                addressCountry: 'CN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 29.3056,
                longitude: 120.0762,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '08:30',
                closes: '17:30',
              },
              areaServed: 'Worldwide',
            }),
          }}
        />

        {/* WebSite Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: SITE_URL,
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/products?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
