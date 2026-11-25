export const LANGS = ['en', 'fr', 'ar'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'en'
export const RTL_LANGS: Lang[] = ['ar']
export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v)
