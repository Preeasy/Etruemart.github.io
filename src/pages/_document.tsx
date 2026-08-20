import { Html, Head, Main, NextScript } from 'next/document';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_PHONE, SITE_COMPANY, SITE_OG_IMAGE } from '@/lib/site';

export default function Document() {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Charset */}
        <meta charSet="utf-8" />

        {/* Primary Meta Tags */}
        <meta name="title" content={`${SITE_NAME} | Wholesale Jewelry & Accessories from Yiwu`} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content="wholesale jewelry, Yiwu market, fashion jewelry wholesale, bag accessories, hair accessories, garment accessories, home decor crafts, toys gift, B2B sourcing China, low MOQ, factory direct" />
        <meta name="author" content="eTrue Mart / Yiwu Yichu Trading Co., Ltd. / 义乌弋楚贸易有限公司" />
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
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        {/* Open Graph — global defaults only; page-specific og:title/url/image/type are set in each page's <Head> to avoid duplicates */}
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_CN" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0F2A4A" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Organization Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              alternateName: SITE_COMPANY,
              additionalName: '义乌弋楚贸易有限公司',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description: SITE_DESCRIPTION,
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Yiwu',
                addressRegion: 'Zhejiang',
                addressCountry: 'CN',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 29.3056,
                longitude: 120.0762,
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: SITE_PHONE,
                contactType: 'sales',
                availableLanguage: ['English', 'Chinese'],
              },
              sameAs: [
                'https://www.facebook.com/etruemart',
                'https://www.linkedin.com/company/etruemart',
                'https://www.instagram.com/etruemart',
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
              name: `${SITE_NAME} - Wholesale Sourcing Platform`,
              image: SITE_OG_IMAGE,
              url: SITE_URL,
              telephone: SITE_PHONE,
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Yiwu',
                addressRegion: 'Zhejiang',
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

        {/* WebSite Structured Data — GEO: tells AI engines this is a searchable site */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: 'en',
              publisher: {
                '@type': 'Organization',
                name: SITE_COMPANY,
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
                },
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
