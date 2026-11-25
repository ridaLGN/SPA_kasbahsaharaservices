import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { en, type DictKey } from './en'
import { fr } from './fr'
import { ar } from './ar'
import { DEFAULT_LANG, RTL_LANGS, isLang, type Lang } from './types'

export const dictionaries = { en, fr, ar }
export const LANG_LABELS: Record<Lang, { short: string; native: string; locale: string }> = {
  en: { short: 'EN', native: 'English', locale: 'en-GB' },
  fr: { short: 'FR', native: 'Français', locale: 'fr-FR' },
  ar: { short: 'ع', native: 'العربية', locale: 'ar-MA' },
}

const STORAGE_KEY = 'kss-lang'

export function translate(lang: Lang, key: DictKey, vars?: Record<string, string | number>) {
  let s: string = dictionaries[lang][key] ?? en[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

/** Priority: ?lang= in the URL → saved choice → English (default). */
function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (isLang(q)) return q
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    /* storage unavailable (private mode) */
  }
  return DEFAULT_LANG
}

interface I18nValue {
  lang: Lang
  dir: 'ltr' | 'rtl'
  locale: string
  setLang: (l: Lang) => void
  t: (key: DictKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    document.title = translate(lang, 'meta.title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', translate(lang, 'meta.description'))
  }, [lang, dir])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
    // Keep the URL shareable without reloading the page.
    const url = new URL(window.location.href)
    if (l === DEFAULT_LANG) url.searchParams.delete('lang')
    else url.searchParams.set('lang', l)
    window.history.replaceState(null, '', url)
  }, [])

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, locale: LANG_LABELS[lang].locale, setLang, t: (k, v) => translate(lang, k, v) }),
    [lang, dir, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
