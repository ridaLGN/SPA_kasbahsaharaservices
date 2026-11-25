import { Clock } from 'lucide-react'
import { useI18n } from '../i18n'
import { activeMassages } from '../data/massages'
import { formatPrice } from '../lib/booking'
import { Picture } from './Picture'

export function MassageMenu({ onSelect }: { onSelect: (massageId: string, optionId: string) => void }) {
  const { t, lang } = useI18n()
  const list = activeMassages()

  return (
    <section id="massages" className="pattern-bg py-20 sm:py-28" aria-labelledby="massages-title">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t('menu.eyebrow')}</p>
          <h2 id="massages-title" className="mt-4 font-display text-4xl font-medium text-cocoa-900 sm:text-5xl">
            {t('menu.title')}
          </h2>
          <div className="ornament mt-6" aria-hidden="true">
            <span className="h-2 w-2 rotate-45 border border-current" />
          </div>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-8">
          {list.map((m) => (
            <article
              key={m.id}
              data-testid={`massage-${m.id}`}
              className="flex flex-col overflow-hidden rounded-[1.75rem] bg-sand-50 shadow-xl shadow-cocoa-900/10 ring-1 ring-sand-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Picture
                  base={m.image.base}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  alt={m.image.alt[lang]}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
                <span className="absolute start-4 top-4 rounded-full bg-sand-50/90 px-3 py-1 text-xs font-medium text-terracotta-600 backdrop-blur">
                  {m.tagline[lang]}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h3 className="font-display text-[1.75rem] font-semibold leading-tight text-cocoa-900">{m.name[lang]}</h3>
                <p className="mt-3 leading-relaxed text-cocoa-700">{m.description[lang]}</p>

                <ul className="mt-6 divide-y divide-sand-200 border-y border-sand-200">
                  {m.options.map((o) => (
                    <li key={o.id} className="flex items-center gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-medium text-cocoa-900">
                          <Clock className="h-4 w-4 shrink-0 text-terracotta-500" aria-hidden="true" />
                          <span className="whitespace-nowrap">
                            {o.minutes} {t('menu.minutes')}
                          </span>
                        </p>
                        <p className="mt-0.5 text-sm text-cocoa-500">{o.area[lang]}</p>
                      </div>
                      <p className="font-display text-2xl font-semibold text-terracotta-600" dir="ltr">
                        {formatPrice(o.price)}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelect(m.id, o.id)}
                        aria-label={t('menu.bookAria', { name: m.name[lang], minutes: o.minutes, price: formatPrice(o.price) })}
                        data-testid={`book-${m.id}-${o.id}`}
                        className="min-h-10 rounded-full border border-terracotta-500/40 px-4 text-xs font-medium uppercase tracking-wider text-terracotta-600 transition hover:bg-terracotta-500 hover:text-sand-50"
                      >
                        {t('menu.book')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-cocoa-500">{t('menu.note')}</p>
      </div>
    </section>
  )
}

export function RitualStrip() {
  const { t } = useI18n()
  return (
    <section className="relative isolate overflow-hidden bg-cocoa-900 py-24 text-center text-sand-50 sm:py-32">
      <Picture
        base="/images/hot-stones"
        sizes="100vw"
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cocoa-900/80 via-cocoa-900/40 to-cocoa-900/80" />
      <blockquote className="mx-auto max-w-3xl px-6 font-display text-3xl font-medium italic leading-snug rtl:not-italic sm:text-4xl">
        “{t('ritual.quote')}”
      </blockquote>
    </section>
  )
}
