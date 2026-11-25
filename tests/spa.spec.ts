import { expect, test, type Page } from '@playwright/test'

const SPA_WA = '212620202610'

/** Date at the hotel (Africa/Casablanca) + n days, as YYYY-MM-DD. */
function hotelDate(offsetDays: number) {
  const d = new Date(Date.now() + offsetDays * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(d)
}

/** Replaces window.open so the WhatsApp URL can be inspected instead of leaving the page. */
async function captureWindowOpen(page: Page) {
  await page.addInitScript(() => {
    ;(window as unknown as { __opened: string[] }).__opened = []
    window.open = ((url?: string | URL) => {
      ;(window as unknown as { __opened: string[] }).__opened.push(String(url))
      return null
    }) as typeof window.open
  })
}
const opened = (page: Page) => page.evaluate(() => (window as unknown as { __opened: string[] }).__opened)

async function fillValidForm(page: Page) {
  const form = page.getByTestId('booking-form')
  await form.getByLabel('Full name').fill('Jane Doe')
  await form.getByLabel('Room number').fill('12')
  await form.getByLabel('Oriental Massage with Argan Oil').check()
  await form.getByLabel('Revitalising', { exact: true }).check()
  await form.getByRole('radio', { name: /^60 min/ }).check()
  await form.getByLabel('Preferred date').fill(hotelDate(1))
  await form.getByLabel('Preferred time').fill('15:30')
  await form.getByLabel(/Message or special request/).fill('Medium pressure please')
}

test.describe('Kasbah Sahara – spa page', () => {
  test('home page shows logo, title, subtitle and both CTAs', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Kasbah Sahara Services/)
    await expect(page.getByRole('img', { name: 'Kasbah Sahara Services' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to Your Desert Wellness Experience')
    await expect(page.getByText('Enjoy a unique moment of relaxation in the heart of the Moroccan desert.')).toBeVisible()
    await expect(page.getByTestId('cta-discover')).toHaveText(/Discover Our Massages/i)
    await expect(page.getByTestId('cta-book')).toHaveText(/Book Your Massage/i)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  })

  test('CTA buttons navigate to the massage menu and to the form', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('cta-discover').click()
    await expect(page.locator('#massages')).toBeInViewport()
    await expect(page).toHaveURL(/#massages$/)
    await page.goto('/')
    await page.getByTestId('cta-book').click()
    await expect(page.getByTestId('booking-form')).toBeInViewport()
  })

  test('massage menu lists every duration and price from the card', async ({ page }) => {
    await page.goto('/')
    const argan = page.getByTestId('massage-oriental-argan')
    for (const [min, price] of [['30', '30 €'], ['60', '60 €'], ['90', '80 €']]) {
      await expect(argan.getByRole('button', { name: new RegExp(`${min} minutes, ${price}`) })).toBeVisible()
    }
    const thera = page.getByTestId('massage-therapeutic-essential-oils')
    for (const [min, price] of [['15', '20 €'], ['30', '30 €'], ['60', '60 €'], ['90', '85 €']]) {
      await expect(thera.getByRole('button', { name: new RegExp(`${min} minutes, ${price}`) })).toBeVisible()
    }
    const img = page.locator('img[src*="massage-argan"]')
    await img.scrollIntoViewIfNeeded()
    const width = await img.evaluate(async (el: HTMLImageElement) => {
      el.loading = 'eager'
      await el.decode()
      return el.naturalWidth
    })
    expect(width).toBeGreaterThan(0)
  })

  test('"Book" on a card pre-selects that massage and duration', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('book-therapeutic-essential-oils-90').click()
    const form = page.getByTestId('booking-form')
    await expect(form).toBeInViewport()
    await expect(form.getByLabel('Therapeutic Massage with Essential Oils')).toBeChecked()
    await expect(form.getByRole('radio', { name: /^90 min/ })).toBeChecked()
    await expect(page.getByTestId('price-summary')).toContainText('85 €')
    await expect(form.getByLabel('Full name')).toBeFocused()
  })

  test('empty submission shows errors and does not open WhatsApp', async ({ page }) => {
    await captureWindowOpen(page)
    await page.goto('/#booking')
    await page.getByTestId('submit-booking').click()
    await expect(page.getByRole('alert')).toContainText('Please check the highlighted fields')
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByLabel('Full name')).toBeFocused()
    expect(await opened(page)).toEqual([])
  })

  test('past dates are refused', async ({ page }) => {
    await captureWindowOpen(page)
    await page.goto('/#booking')
    await fillValidForm(page)
    await page.getByLabel('Preferred date').fill(hotelDate(-2))
    await page.getByTestId('submit-booking').click()
    await expect(page.getByText('Please choose today or a future date.')).toBeVisible()
    expect(await opened(page)).toEqual([])
  })

  test('valid request opens WhatsApp with the full booking details and is shown as NOT confirmed', async ({ page }) => {
    await captureWindowOpen(page)
    await page.goto('/#booking')
    await fillValidForm(page)
    await expect(page.getByTestId('price-summary')).toContainText('60 €')
    await page.getByTestId('submit-booking').click()

    const urls = await opened(page)
    expect(urls).toHaveLength(1)
    const url = new URL(urls[0])
    expect(url.origin + url.pathname).toBe(`https://wa.me/${SPA_WA}`)
    const text = url.searchParams.get('text')!
    for (const part of [
      'Jane Doe',
      'Room number : 12',
      'Oriental Massage with Argan Oil (Revitalising)',
      '60 min – Full body',
      '60 €',
      'Preferred time : 15:30',
      'Medium pressure please',
      'awaiting your confirmation',
    ])
      expect(text).toContain(part)

    const panel = page.getByTestId('sent-panel')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Awaiting confirmation')
    await expect(panel).toContainText('not booked until we confirm')
    await expect(panel.getByTestId('sent-open-whatsapp')).toHaveAttribute('href', urls[0])

    // "Edit my request" returns to the filled form
    await panel.getByRole('button', { name: 'Edit my request' }).click()
    await expect(page.getByLabel('Full name')).toHaveValue('Jane Doe')
  })

  test('room number is pre-filled from a room QR code (?room=)', async ({ page }) => {
    await page.goto('/?room=7#booking')
    await expect(page.getByLabel('Room number')).toHaveValue('7')
  })

  test('language switcher: French and Arabic (RTL), remembered after reload', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('lang-fr').click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bienvenue dans votre expérience bien-être au cœur du désert')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
    await expect(page).toHaveURL(/\?lang=fr/)
    await expect(page.getByTestId('submit-booking')).toContainText('Confirmer ma réservation')

    await page.getByTestId('lang-ar').click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('مرحباً بكم في تجربة العافية في قلب الصحراء')
    await expect(page.getByTestId('submit-booking')).toContainText('تأكيد حجزي')
    // FAB sits on the left in RTL
    const fab = await page.getByTestId('whatsapp-fab').boundingBox()
    expect(fab!.x).toBeLessThan(100)

    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await page.getByTestId('lang-en').click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  })

  test('Arabic booking produces an Arabic WhatsApp message', async ({ page }) => {
    await captureWindowOpen(page)
    await page.goto('/?lang=ar#booking')
    const form = page.getByTestId('booking-form')
    await form.getByLabel('الاسم الكامل').fill('محمد')
    await form.getByLabel('رقم الغرفة').fill('3')
    await form.getByLabel('التدليك العلاجي بالزيوت العطرية').check()
    await form.getByRole('radio', { name: /^15/ }).check()
    await form.getByLabel('التاريخ المفضّل').fill(hotelDate(2))
    await form.getByLabel('الوقت المفضّل').fill('10:00')
    await page.getByTestId('submit-booking').click()
    const text = new URL((await opened(page))[0]).searchParams.get('text')!
    expect(text).toContain('أودّ طلب جلسة تدليك')
    expect(text).toContain('محمد')
    expect(text).toContain('20 €')
    await expect(page.getByTestId('sent-panel')).toContainText('في انتظار التأكيد')
  })

  test('WhatsApp button stays visible while scrolling, and contact links are correct', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByTestId('whatsapp-fab')
    await expect(fab).toBeVisible()
    await expect(fab).toHaveAttribute('href', new RegExp(`^https://wa\\.me/${SPA_WA}\\?text=`))
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await expect(fab).toBeInViewport()

    await expect(page.getByTestId('call-hotel')).toHaveAttribute('href', 'tel:+212661776766')
    await expect(page.getByTestId('call-redouan')).toHaveAttribute('href', 'tel:+212620202610')
    await expect(page.getByTestId('call-isabelle')).toHaveAttribute('href', 'tel:+33625027415')
    // Every WhatsApp button on the page goes to the spa number, and no e-mail link is offered
    const waLinks = await page.locator('a[href^="https://wa.me/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
    expect(waLinks.length).toBeGreaterThanOrEqual(2)
    for (const href of waLinks) expect(href!.startsWith(`https://wa.me/${SPA_WA}?text=`), href!).toBe(true)
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0)
    await expect(page.getByTestId('developer-link')).toHaveText('Rida Lagnaoui')
    await expect(page.getByTestId('developer-link')).toHaveAttribute('href', 'https://www.linkedin.com/in/lagnaouirida')
    await expect(page.getByTestId('website-link')).toHaveAttribute('href', 'https://kasbahsaharaservices.com/')
  })

  test('no horizontal scrolling in any language', async ({ page }) => {
    for (const lang of ['en', 'fr', 'ar']) {
      await page.goto(`/?lang=${lang}`)
      await page.getByTestId('book-oriental-argan-90').click()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, `overflow in ${lang}`).toBeLessThanOrEqual(0)
    }
  })

  test('SEO basics are present in the built page', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /massage/i)
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!)
    expect(ld['@type']).toBe('DaySpa')
    expect(ld.hasOfferCatalog.itemListElement).toHaveLength(7)
    const robots = await page.request.get('/robots.txt')
    expect(robots.ok()).toBeTruthy()
  })
})
