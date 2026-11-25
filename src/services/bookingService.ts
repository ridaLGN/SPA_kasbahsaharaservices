/**
 * Booking service – the single place where a booking request leaves the page.
 *
 * Today: the request is sent by WhatsApp (no server, no database, nothing stored).
 *
 * Later (admin area): set VITE_BOOKING_API_URL to an endpoint that stores
 * requests (e.g. Supabase, Firebase or a small Node API). The request is then
 * ALSO posted to that endpoint so it appears in the back-office with the
 * status "requested", and staff can mark it "confirmed" / "declined" there.
 * WhatsApp stays the guest-facing channel either way.
 */
import { site } from '../config/site'
import { buildWhatsAppMessage, whatsappUrl, type BookingRequest } from '../lib/booking'

const API_URL = import.meta.env.VITE_BOOKING_API_URL as string | undefined

export interface PreparedBooking {
  whatsappUrl: string
  message: string
}

export function prepareBooking(req: BookingRequest): PreparedBooking {
  const message = buildWhatsAppMessage(req)
  return { message, whatsappUrl: whatsappUrl(site.bookingWhatsApp, message) }
}

/** Optional: records the request in a future back-office. Never blocks the guest. */
export function recordBooking(req: BookingRequest) {
  if (!API_URL) return
  const payload = {
    name: req.name,
    room: req.room,
    massageId: req.massageId,
    variantId: req.variantId || null,
    optionId: req.optionId,
    minutes: req.option.minutes,
    price: req.option.price,
    date: req.date,
    time: req.time,
    message: req.message,
    lang: req.lang,
    status: req.status,
    createdAt: req.createdAt,
  }
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* WhatsApp remains the source of truth for the guest */
  })
}
