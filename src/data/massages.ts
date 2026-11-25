/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MASSAGE MENU – edit prices, durations and texts here.
 *
 *  • price: number in euros (currency symbol set in src/config/site.ts)
 *  • minutes: duration in minutes
 *  • Every text exists in en / fr / ar. Keep all three when you edit.
 *  • To add a massage, copy one block, give it a new unique `id`, and add an
 *    image to public/images/ (800 px and 1600 px .webp versions).
 *  • To hide a massage or a duration temporarily, set `available: false`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Lang } from '../i18n/types'

export type Localized = Record<Lang, string>

export interface MassageOption {
  id: string
  minutes: number
  price: number
  area: Localized
  available?: boolean
}

export interface Massage {
  id: string
  name: Localized
  tagline: Localized
  description: Localized
  /** Optional choice offered to the guest (e.g. relaxing / revitalising). */
  variants?: { id: string; label: Localized }[]
  image: { base: string; alt: Localized }
  options: MassageOption[]
  available?: boolean
}

const AREA = {
  feet: { en: 'Feet', fr: 'Pieds', ar: 'القدمان' },
  backOrLegs: {
    en: 'Back, or feet & legs',
    fr: 'Face dorsale ou pieds et jambes',
    ar: 'الظهر، أو القدمان والساقان',
  },
  fullBody: { en: 'Full body', fr: 'Corps complet', ar: 'الجسم كاملاً' },
  fullBodyFace: { en: 'Full body + face', fr: 'Corps complet + visage', ar: 'الجسم كاملاً + الوجه' },
} satisfies Record<string, Localized>

export const massages: Massage[] = [
  {
    id: 'oriental-argan',
    name: {
      en: 'Oriental Massage with Argan Oil',
      fr: "Massage Oriental à l'Huile d'Argan",
      ar: 'التدليك الشرقي بزيت الأركان',
    },
    tagline: {
      en: 'Relaxing or revitalising',
      fr: 'Relaxant ou revitalisant',
      ar: 'مُريح أو مُنشِّط',
    },
    description: {
      en: 'A relaxing massage designed to release tension, calm the mind and bring deep physical relaxation, in a natural and cocooning setting.',
      fr: "Un massage relaxant conçu pour libérer les tensions, apaiser l'esprit et favoriser une profonde relaxation corporelle dans un cadre naturel et cocooning.",
      ar: 'تدليك مُريح صُمِّم لتحرير التوتر وتهدئة الذهن ومنح الجسم استرخاءً عميقاً، في أجواء طبيعية دافئة ومريحة.',
    },
    variants: [
      { id: 'relaxing', label: { en: 'Relaxing', fr: 'Relaxant', ar: 'مُريح' } },
      { id: 'revitalising', label: { en: 'Revitalising', fr: 'Revitalisant', ar: 'مُنشِّط' } },
    ],
    image: {
      base: '/images/massage-argan',
      alt: {
        en: 'Warm argan oil poured onto a guest’s back during a massage',
        fr: "Huile d'argan chaude versée sur le dos lors d'un massage",
        ar: 'زيت أركان دافئ يُسكب على الظهر أثناء التدليك',
      },
    },
    options: [
      { id: '30', minutes: 30, price: 30, area: AREA.backOrLegs },
      { id: '60', minutes: 60, price: 60, area: AREA.fullBody },
      { id: '90', minutes: 90, price: 80, area: AREA.fullBodyFace },
    ],
  },
  {
    id: 'therapeutic-essential-oils',
    name: {
      en: 'Therapeutic Massage with Essential Oils',
      fr: 'Massage Thérapeutique aux Huiles Essentielles',
      ar: 'التدليك العلاجي بالزيوت العطرية',
    },
    tagline: {
      en: 'Muscles & joints',
      fr: 'Muscles & articulations',
      ar: 'العضلات والمفاصل',
    },
    description: {
      en: 'A massage with natural essential oils that enhances the sensory experience and brings a feeling of well-being and relief to muscles and joints.',
      fr: "Un massage aux huiles essentielles naturelles destiné à améliorer l'expérience sensorielle et à apporter une sensation de bien-être et de détente musculaire et articulaire.",
      ar: 'تدليك بالزيوت العطرية الطبيعية يُثري التجربة الحسية ويمنح شعوراً بالراحة واسترخاء العضلات والمفاصل.',
    },
    image: {
      base: '/images/massage-essential-oils',
      alt: {
        en: 'Essential oil dropper above open hands',
        fr: "Flacon compte-gouttes d'huile essentielle au-dessus des mains",
        ar: 'قطّارة زيت عطري فوق كفّين مفتوحتين',
      },
    },
    options: [
      { id: '15', minutes: 15, price: 20, area: AREA.feet },
      { id: '30', minutes: 30, price: 30, area: AREA.backOrLegs },
      { id: '60', minutes: 60, price: 60, area: AREA.fullBody },
      { id: '90', minutes: 90, price: 85, area: AREA.fullBody },
    ],
  },
]

export const activeMassages = () =>
  massages
    .filter((m) => m.available !== false)
    .map((m) => ({ ...m, options: m.options.filter((o) => o.available !== false) }))
    .filter((m) => m.options.length > 0)
