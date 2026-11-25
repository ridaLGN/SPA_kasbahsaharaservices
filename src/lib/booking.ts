/**
 * Booking domain logic – pure functions, no UI.
 * Kept independent from React so the same rules can be reused by a future
 * admin back-office or API (see src/services/bookingService.ts).
 */
import { site } from '../config/site'
import { activeMassages, type Massage, type MassageOption } from '../data/massages'
import type { DictKey } from '../i18n/en'
import { translate } from '../i18n'
import type { Lang } from '../i18n/types'

export const HOTEL_TIMEZONE = 'Africa/Casablanca'

export const LIMITS = { name: 80, room: 10, message: 500 } as const

export interface BookingForm {
  name: string
  room: string
  massageId: string
  variantId: string
  optionId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  message: string
}

/** A validated request, ready to be sent to the hotel. */
export interface BookingRequest extends BookingForm {
  massage: Massage
  option: MassageOption
  lang: Lang
  /** Always "requested" from the guest side; only the hotel can confirm. */
  status: 'requested'
  createdAt: string
}

export type BookingErrors = Partial<Record<keyof BookingForm, { key: DictKey; vars?: Record<string, string> }>>

export const emptyForm = (): BookingForm => ({
  name: '',
  room: '',
  massageId: '',
  variantId: '',
  optionId: '',
  date: '',
  time: '',
  message: '',
})

/** Removes control characters and collapses whitespace; keeps line breaks in multiline text. */
export function clean(value: string, max: number, multiline = false) {
  // eslint-disable-next-line no-control-regex
  let v = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '')
  v = multiline
    ? v.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
    : v.replace(/\s+/g, ' ')
  return v.trim().slice(0, max)
}

/** Current date (YYYY-MM-DD) and time (HH:MM) at the hotel, whatever the phone's time zone. */
export function hotelNow(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: HOTEL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}

export function findMassage(id: string) {
  return activeMassages().find((m) => m.id === id)
}

export function validate(form: BookingForm, now: Date = new Date()): BookingErrors {
  const e: BookingErrors = {}
  const name = clean(form.name, LIMITS.name)
  const room = clean(form.room, LIMITS.room)

  if (!name) e.name = { key: 'error.required' }
  else if (name.length < 2) e.name = { key: 'error.name' }

  if (!room) e.room = { key: 'error.required' }
  else if (!/^[\p{L}\p{N}][\p{L}\p{N} \-/]*$/u.test(room)) e.room = { key: 'error.room' }

  const massage = findMassage(form.massageId)
  if (!massage) e.massageId = { key: 'error.required' }
  else {
    if (!massage.options.some((o) => o.id === form.optionId)) e.optionId = { key: 'error.required' }
    if (massage.variants?.length && !massage.variants.some((v) => v.id === form.variantId))
      e.variantId = { key: 'error.required' }
  }

  const { date: today, time: nowTime } = hotelNow(now)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) e.date = { key: 'error.required' }
  else if (form.date < today) e.date = { key: 'error.datePast' }

  if (!/^\d{2}:\d{2}$/.test(form.time)) e.time = { key: 'error.required' }
  else if (site.spaHours && (form.time < site.spaHours.open || form.time > site.spaHours.close))
    e.time = { key: 'error.hours', vars: { open: site.spaHours.open, close: site.spaHours.close } }
  else if (!e.date && form.date === today && form.time <= nowTime) e.time = { key: 'error.timePast' }

  return e
}

export function toRequest(form: BookingForm, lang: Lang, now: Date = new Date()): BookingRequest | null {
  if (Object.keys(validate(form, now)).length) return null
  const massage = findMassage(form.massageId)!
  const option = massage.options.find((o) => o.id === form.optionId)!
  return {
    ...form,
    name: clean(form.name, LIMITS.name),
    room: clean(form.room, LIMITS.room),
    message: clean(form.message, LIMITS.message, true),
    variantId: massage.variants?.length ? form.variantId : '',
    massage,
    option,
    lang,
    status: 'requested',
    createdAt: now.toISOString(),
  }
}

export const formatPrice = (price: number) => `${price} ${site.currency}`

export function formatDate(date: string, locale: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

const LOCALES: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', ar: 'ar-MA' }

/** Plain-text WhatsApp message, written in the guest's language. */
export function buildWhatsAppMessage(req: BookingRequest): string {
  const t = (k: DictKey) => translate(req.lang, k)
  const variant = req.massage.variants?.find((v) => v.id === req.variantId)
  const massageName = req.massage.name[req.lang] + (variant ? ` (${variant.label[req.lang]})` : '')
  const lines = [
    t('wa.intro'),
    '',
    `• ${t('booking.name')} : ${req.name}`,
    `• ${t('booking.room')} : ${req.room}`,
    `• ${t('booking.massage')} : ${massageName}`,
    `• ${t('booking.duration')} : ${req.option.minutes} ${t('menu.minutes')} – ${req.option.area[req.lang]}`,
    `• ${t('booking.total')} : ${formatPrice(req.option.price)}`,
    `• ${t('booking.date')} : ${formatDate(req.date, LOCALES[req.lang])}`,
    `• ${t('booking.time')} : ${req.time}`,
  ]
  if (req.message) lines.push(`• ${t('booking.message')} : ${req.message}`)
  lines.push('', t('wa.footer'))
  return lines.join('\n')
}

/** https://wa.me link – opens the WhatsApp app on phones and WhatsApp Web on computers. */
export function whatsappUrl(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
