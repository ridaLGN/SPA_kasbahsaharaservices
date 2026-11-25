/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  KASBAH SAHARA SERVICES – SITE SETTINGS
 *  Edit this file to change contacts, the WhatsApp number that receives
 *  booking requests, or the spa opening hours.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Contact {
  id: string
  /** Shown as-is (no translation). */
  name: string
  /** Translation key for the role line (see src/i18n). */
  roleKey: 'contact.role.manager' | 'contact.role.reception'
  /** International format, digits only, no "+" and no leading zeros. */
  phone: string
  /** Human-readable phone number. */
  phoneDisplay: string
  whatsapp: boolean
}

export const site = {
  name: 'Kasbah Sahara Services',
  website: 'https://kasbahsaharaservices.com/',
  email: 'contact@kasbahsaharaservices.com',
  locationLine: "M'hamid El Ghizlane · Zagora · Morocco",

  /**
   * WhatsApp number that receives booking requests (digits only, with country
   * code). Default: the hotel reception line. Change to "212620202610"
   * (Redouan) or "33625027415" (Isabelle) if a person should receive them.
   */
  bookingWhatsApp: '212661776766',

  /**
   * Spa opening hours used to validate the requested time.
   * Set to null to accept any time (current setting – hours not yet provided).
   * Example: { open: '09:00', close: '20:00' }
   */
  spaHours: null as null | { open: string; close: string },

  /** Currency symbol used for prices. */
  currency: '€',

  contacts: [
    {
      id: 'hotel',
      name: 'Kasbah Sahara Services',
      roleKey: 'contact.role.reception',
      phone: '212661776766',
      phoneDisplay: '+212 661 776 766',
      whatsapp: true,
    },
    {
      id: 'redouan',
      name: 'Redouan',
      roleKey: 'contact.role.manager',
      phone: '212620202610',
      phoneDisplay: '+212 620 202 610',
      whatsapp: true,
    },
    {
      id: 'isabelle',
      name: 'Isabelle',
      roleKey: 'contact.role.manager',
      phone: '33625027415',
      phoneDisplay: '+33 6 25 02 74 15',
      whatsapp: true,
    },
  ] satisfies Contact[],
}
