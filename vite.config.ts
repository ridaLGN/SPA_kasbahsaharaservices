import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { site } from './src/config/site.ts'
import { massages } from './src/data/massages.ts'

/**
 * SEO plugin
 *  - JSON-LD (DaySpa + offer catalogue) generated from src/data/massages.ts → always in sync with prices
 *  - canonical, og:url, og:image, hreflang alternates when VITE_PUBLIC_SITE_URL is set
 *  - robots.txt and sitemap.xml written into the build
 */
function seo(publicUrl: string | undefined): Plugin {
  const base = publicUrl ? new URL(publicUrl).href : undefined
  const abs = (p: string) => (base ? new URL(p, base).href : p)
  const prices = massages.flatMap((m) => m.options.map((o) => o.price))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DaySpa',
    name: `${site.name} – Spa & Massages`,
    url: base ?? site.website,
    image: abs('/images/og-image.jpg'),
    logo: abs('/brand/logo-brown.png'),
    email: site.email,
    telephone: `+${site.contacts[0].phone}`,
    priceRange: `${Math.min(...prices)}–${Math.max(...prices)} EUR`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: "M'hamid El Ghizlane",
      addressRegion: 'Zagora',
      addressCountry: 'MA',
    },
    containedInPlace: { '@type': 'Hotel', name: site.name, url: site.website },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Massages',
      itemListElement: massages.flatMap((m) =>
        m.options.map((o) => ({
          '@type': 'Offer',
          price: o.price,
          priceCurrency: 'EUR',
          itemOffered: {
            '@type': 'Service',
            name: `${m.name.en} – ${o.minutes} min (${o.area.en})`,
            description: m.description.en,
          },
        })),
      ),
    },
  }

  return {
    name: 'kss-seo',
    transformIndexHtml(html) {
      const tags = [`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`]
      if (base) {
        tags.push(
          `<link rel="canonical" href="${base}" />`,
          `<link rel="alternate" hreflang="en" href="${base}" />`,
          `<link rel="alternate" hreflang="fr" href="${base}?lang=fr" />`,
          `<link rel="alternate" hreflang="ar" href="${base}?lang=ar" />`,
          `<link rel="alternate" hreflang="x-default" href="${base}" />`,
          `<meta property="og:url" content="${base}" />`,
          `<meta property="og:image" content="${abs('/images/og-image.jpg')}" />`,
        )
      } else {
        tags.push(`<meta property="og:image" content="/images/og-image.jpg" />`)
      }
      return html.replace('</head>', `  ${tags.join('\n    ')}\n  </head>`)
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n${base ? `Sitemap: ${abs('/sitemap.xml')}\n` : ''}`,
      })
      if (!base) return
      const alt = (l: string, h: string) =>
        `    <xhtml:link rel="alternate" hreflang="${l}" href="${h.replace(/&/g, '&amp;')}"/>`
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          '  <url>',
          `    <loc>${base}</loc>`,
          alt('en', base),
          alt('fr', `${base}?lang=fr`),
          alt('ar', `${base}?lang=ar`),
          '  </url>',
          '</urlset>',
          '',
        ].join('\n'),
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [react(), tailwindcss(), seo(env.VITE_PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL)],
    build: { target: 'es2020', sourcemap: false },
  }
})
