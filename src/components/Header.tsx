import { useEffect, useState } from 'react'
import { LANG_LABELS, useI18n } from '../i18n'
import { LANGS } from '../i18n/types'

export function LanguageSwitcher({ light }: { light: boolean }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className={`flex items-center rounded-full border p-0.5 text-xs font-medium backdrop-blur-sm transition ${
        light ? 'border-sand-50/40 bg-cocoa-900/20' : 'border-cocoa-700/20 bg-white/70'
      }`}
    >
      {LANGS.map((l) => {
        const active = l === lang
        return (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            aria-label={LANG_LABELS[l].native}
            title={LANG_LABELS[l].native}
            data-testid={`lang-${l}`}
            className={`min-h-9 min-w-10 rounded-full px-3 transition ${
              active
                ? light
                  ? 'bg-sand-50 text-cocoa-900'
                  : 'bg-cocoa-700 text-sand-50'
                : light
                  ? 'text-sand-50 hover:bg-sand-50/15'
                  : 'text-cocoa-700 hover:bg-sand-200'
            } ${l === 'ar' ? 'font-arabic text-sm' : 'tracking-wider'}`}
          >
            {LANG_LABELS[l].short}
          </button>
        )
      })}
    </div>
  )
}

export function Header() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const light = !scrolled
  const links = [
    ['#massages', t('nav.massages')],
    ['#booking', t('nav.booking')],
    ['#contact', t('nav.contact')],
  ] as const

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-sand-50/92 shadow-sm shadow-cocoa-900/5 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <a href="#top" className="shrink-0" aria-label="Kasbah Sahara Services">
          <img
            src={light ? '/brand/logo-white.png' : '/brand/logo-brown.png'}
            alt="Kasbah Sahara Services"
            width={945}
            height={347}
            className="h-9 w-auto sm:h-11"
          />
        </a>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex gap-8 text-sm">
            {links.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className={`tracking-eyebrow text-xs uppercase transition hover:text-terracotta-500 ${
                    light ? 'text-sand-50' : 'text-cocoa-800'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher light={light} />
      </div>
    </header>
  )
}
