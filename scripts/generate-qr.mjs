#!/usr/bin/env node
/**
 * Kasbah Sahara Services – QR code + room poster generator.
 *
 *   npm run qr -- --url https://spa.kasbahsaharaservices.com
 *   npm run qr -- --url https://spa.kasbahsaharaservices.com --rooms 1-24
 *   npm run qr -- --url https://spa.kasbahsaharaservices.com --rooms 1,2,3,101,102
 *
 * The URL can also come from VITE_PUBLIC_SITE_URL (environment or .env file).
 *
 * Outputs (folder qr/):
 *   qr-code.png         2048 px, plain QR (maximum compatibility)
 *   qr-code.svg         vector, plain QR (for a printer / designer)
 *   qr-code-logo.png    2048 px, QR with the Kasbah logo in the centre
 *   qr-code-logo.svg    vector, QR with logo
 *   poster-A5.pdf       printable room poster, 148 × 210 mm, vector QR
 *   poster-A5.png       same poster, 300 dpi
 *   rooms/room-<n>.pdf  (with --rooms) one poster per room; the QR opens the
 *                       page with the room number already filled in (?room=n)
 *
 * Every PNG is decoded after generation; the script fails if a QR code does
 * not decode to exactly the expected URL.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { chromium } from '@playwright/test'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const arg = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`)
  process.exit(1)
}

function readDotEnv() {
  for (const f of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    const p = path.join(root, f)
    if (!fs.existsSync(p)) continue
    const m = fs.readFileSync(p, 'utf8').match(/^\s*VITE_PUBLIC_SITE_URL\s*=\s*(.*)\s*$/m)
    if (m && m[1].trim()) return m[1].trim().replace(/^["']|["']$/g, '')
  }
}

// ── 1. URL ────────────────────────────────────────────────────────────────
const raw = arg('url') ?? process.env.VITE_PUBLIC_SITE_URL ?? readDotEnv()
if (!raw) fail('No URL. Run: npm run qr -- --url https://spa.kasbahsaharaservices.com')
let url
try {
  url = new URL(raw)
} catch {
  fail(`Not a valid URL: ${raw}`)
}
const host = url.hostname.toLowerCase()
const problems = []
if (url.protocol !== 'https:') problems.push('must start with https://')
if (/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0)/.test(host) || host.endsWith('.local')) problems.push('is a local address')
if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) problems.push('is a bare IP address')
if (host.endsWith('.netlify.app') && host.includes('--')) problems.push('is a temporary Netlify preview URL')
if (url.port) problems.push('contains a port number')
if (problems.length) fail(`Refusing to generate a QR code for ${url.href}:\n  - ${problems.join('\n  - ')}`)

url.hash = ''
const target = url.href
const outDir = path.resolve(root, arg('out') ?? 'qr')
fs.mkdirSync(outDir, { recursive: true })
console.log(`\nTarget URL : ${target}\nOutput dir : ${outDir}\n`)

// ── 2. Assets ────────────────────────────────────────────────────────────
const b64 = (rel) => fs.readFileSync(path.join(root, rel)).toString('base64')
const dataUri = (rel, mime) => `data:${mime};base64,${b64(rel)}`
const MARK = dataUri('public/brand/mark-brown.png', 'image/png')
const LOGO = dataUri('public/brand/logo-brown.png', 'image/png')
const DUNES = dataUri('public/images/hero-dunes-1400.webp', 'image/webp')
const font = (family, file, weight, style = 'normal') =>
  `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${b64(`node_modules/@fontsource/${file}`)}) format('woff2');font-weight:${weight};font-style:${style}}`
const FONTS = [
  font('Cormorant Garamond', 'cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2', 500),
  font('Cormorant Garamond', 'cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2', 600),
  font('Cormorant Garamond', 'cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2', 500, 'italic'),
  font('Jost', 'jost/files/jost-latin-300-normal.woff2', 300),
  font('Jost', 'jost/files/jost-latin-400-normal.woff2', 400),
  font('Jost', 'jost/files/jost-latin-500-normal.woff2', 500),
  font('Noto Naskh Arabic', 'noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2', 400),
].join('\n')

const DARK = '#2A1C12' // deep brown: strong contrast on white, on-brand

/**
 * QR as SVG. With a logo, error correction H (30 % redundancy) is used and the
 * logo plate covers ~ 20 % of the width (≈ 4 % of the surface), well within
 * the safe margin.
 */
async function qrSvg(text, { logo }) {
  const svg = await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: logo ? 'H' : 'Q',
    margin: 4,
    color: { dark: DARK, light: '#FFFFFF' },
  })
  if (!logo) return svg
  const size = Number(svg.match(/viewBox="0 0 (\d+) \d+"/)[1])
  const plate = size * 0.22
  const pos = (size - plate) / 2
  const pad = plate * 0.14
  const overlay = `<rect x="${pos}" y="${pos}" width="${plate}" height="${plate}" rx="${plate * 0.18}" fill="#FFFFFF"/>
<image href="${MARK}" x="${pos + pad}" y="${pos + pad}" width="${plate - 2 * pad}" height="${plate - 2 * pad}" preserveAspectRatio="xMidYMid meet"/>`
  return svg.replace('</svg>', `${overlay}</svg>`)
}

const posterHtml = (qr, { room, displayUrl }) => `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
@page { size: 148mm 210mm; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: 148mm; height: 210mm; background: #F7EFE2 }
body { font-family: 'Jost', sans-serif; color: #45291A; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.page { position: relative; width: 148mm; height: 210mm; overflow: hidden; display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 15mm }
.frame { position: absolute; inset: 6mm; border: .35mm solid #B4552D; border-radius: 40mm 40mm 2mm 2mm; pointer-events: none; z-index: 3 }
.frame::after { content: ''; position: absolute; inset: 1.5mm; border: .15mm solid rgba(180,85,45,.45); border-radius: 38.5mm 38.5mm 1mm 1mm }
.logo { height: 15mm; position: relative; z-index: 2 }
.eyebrow { margin-top: 6mm; font-size: 6.8pt; letter-spacing: .42em; color: #B4552D; font-weight: 500 }
h1 { margin-top: 2.5mm; font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 25pt; line-height: 1.05; letter-spacing: .06em; color: #2A1C12; padding: 0 14mm }
.rule { display: flex; align-items: center; gap: 3mm; margin-top: 4mm; color: #C9A677 }
.rule span { width: 12mm; height: .25mm; background: currentColor }
.rule i { width: 1.6mm; height: 1.6mm; border: .25mm solid currentColor; transform: rotate(45deg) }
.qrbox { position: relative; z-index: 2; margin-top: 5mm; background: #FFF; padding: 1.5mm; border-radius: 3mm; box-shadow: 0 .6mm 3mm rgba(42,28,18,.12) }
.qr { display: block; width: 52mm; height: 52mm }
.room { margin-top: 3mm; font-size: 8pt; letter-spacing: .3em; color: #7A5034 }
.cta { position: relative; z-index: 2; margin-top: 4.5mm; padding: 0 19mm; font-size: 9.6pt; line-height: 1.5; font-weight: 400; color: #45291A }
.alt { position: relative; z-index: 2; margin-top: 2.6mm; padding: 0 18mm; font-size: 7.4pt; line-height: 1.55; color: #7A5034 }
.alt .ar { font-family: 'Noto Naskh Arabic', serif; font-size: 8.4pt; display: block; margin-top: .6mm }
.url { position: relative; z-index: 2; margin-top: 2.6mm; font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 10.5pt; color: #B4552D }
.dunes { position: absolute; left: 0; right: 0; bottom: 0; height: 44mm; background: url(${DUNES}) center 35% / cover no-repeat; z-index: 0 }
.fade { position: absolute; left: 0; right: 0; bottom: 26mm; height: 20mm; background: linear-gradient(#F7EFE2, rgba(247,239,226,0)); z-index: 1 }
</style></head><body><div class="page">
  <div class="dunes"></div><div class="fade"></div><div class="frame"></div>
  <img class="logo" src="${LOGO}" alt="">
  <p class="eyebrow">SPA &amp; WELLNESS</p>
  <h1>YOUR MOMENT OF RELAXATION</h1>
  <div class="rule"><span></span><i></i><span></span></div>
  <div class="qrbox">${qr.replace('<svg ', '<svg class="qr" ')}</div>
  ${room ? `<p class="room">ROOM ${room}</p>` : ''}
  <p class="cta">Scan the QR Code to discover our exclusive massage services and book your wellness experience.</p>
  <p class="alt">Scannez pour découvrir nos massages et réserver votre moment de bien-être.
    <span class="ar" dir="rtl" lang="ar">امسحوا الرمز لاكتشاف خدمات التدليك وحجز لحظة استرخائكم.</span></p>
  <p class="url">${displayUrl}</p>
</div></body></html>`

// ── 3. Generate ──────────────────────────────────────────────────────────
function decodePng(file) {
  const png = PNG.sync.read(fs.readFileSync(file))
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height, { inversionAttempts: 'dontInvert' })?.data
}

const browser = await chromium.launch()
const checks = []
try {
  async function renderPng(svg, file, px = 2048) {
    const ctx = await browser.newContext({ viewport: { width: 512, height: 512 }, deviceScaleFactor: px / 512 })
    const page = await ctx.newPage()
    await page.setContent(
      `<html><body style="margin:0;background:#fff">${svg.replace('<svg ', '<svg style="display:block;width:512px;height:512px" ')}</body></html>`,
    )
    await page.locator('svg').screenshot({ path: file })
    await ctx.close()
  }

  async function renderPoster(html, pdfFile, pngFile) {
    // 148 × 210 mm at 96 css px/in = 559 × 794 css px; scale 3.125 ⇒ 300 dpi
    const ctx = await browser.newContext({ viewport: { width: 559, height: 794 }, deviceScaleFactor: 3.125 })
    const page = await ctx.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    if (pngFile) await page.screenshot({ path: pngFile })
    await page.pdf({ path: pdfFile, width: '148mm', height: '210mm', printBackground: true, preferCSSPageSize: true })
    await ctx.close()
  }

  const displayUrl = target.replace(/^https:\/\//, '').replace(/\/$/, '')

  const plain = await qrSvg(target, { logo: false })
  const withLogo = await qrSvg(target, { logo: true })
  fs.writeFileSync(path.join(outDir, 'qr-code.svg'), plain)
  fs.writeFileSync(path.join(outDir, 'qr-code-logo.svg'), withLogo)
  await renderPng(plain, path.join(outDir, 'qr-code.png'))
  await renderPng(withLogo, path.join(outDir, 'qr-code-logo.png'))
  await renderPoster(
    posterHtml(withLogo, { displayUrl }),
    path.join(outDir, 'poster-A5.pdf'),
    path.join(outDir, 'poster-A5.png'),
  )
  checks.push(['qr-code.png', target], ['qr-code-logo.png', target], ['poster-A5.png', target])

  // Optional: one poster per room
  const roomsArg = arg('rooms')
  if (roomsArg) {
    const rooms = roomsArg.split(',').flatMap((part) => {
      const m = part.trim().match(/^(\d+)-(\d+)$/)
      if (!m) return [part.trim()]
      const out = []
      for (let n = Number(m[1]); n <= Number(m[2]); n++) out.push(String(n))
      return out
    }).filter((r) => /^[\w-]{1,10}$/.test(r))
    const roomDir = path.join(outDir, 'rooms')
    fs.mkdirSync(roomDir, { recursive: true })
    for (const room of rooms) {
      const u = new URL(target)
      u.searchParams.set('room', room)
      const svg = await qrSvg(u.href, { logo: true })
      const png = path.join(roomDir, `room-${room}.png`)
      await renderPoster(posterHtml(svg, { room, displayUrl }), path.join(roomDir, `room-${room}.pdf`), png)
      checks.push([`rooms/room-${room}.png`, u.href])
    }
    console.log(`Generated ${rooms.length} room posters in ${roomDir}`)
  }
} finally {
  await browser.close()
}

// ── 4. Verify ────────────────────────────────────────────────────────────
let ok = true
for (const [name, expected] of checks) {
  const decoded = decodePng(path.join(outDir, name))
  const pass = decoded === expected
  ok &&= pass
  console.log(`${pass ? '✔' : '✖'} ${name.padEnd(22)} → ${decoded ?? '(could not decode)'}`)
}
if (!ok) fail('QR verification failed.')
console.log('\nAll QR codes verified (decoded back to the expected URL).\n')
