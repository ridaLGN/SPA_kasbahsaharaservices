import { ChevronDown } from 'lucide-react'
import { useI18n } from '../i18n'
import { Picture } from './Picture'

export function Hero() {
  const { t } = useI18n()
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-cocoa-900 text-sand-50">
      <Picture
        base="/images/hero-dunes"
        widths={[800, 1400]}
        sizes="100vw"
        alt=""
        priority
        width={1400}
        height={933}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cocoa-900/55 via-cocoa-900/25 to-cocoa-900/85" />

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-6 sm:pb-24">
        <div className="max-w-2xl animate-rise">
          <p className="tracking-eyebrow text-xs font-medium uppercase text-desert-400">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-5 font-display text-[2.6rem] font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg font-light leading-relaxed text-sand-100/90 sm:text-xl">
            {t('hero.subtitle')}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#massages" className="btn-ghost-light" data-testid="cta-discover">
              {t('hero.discover')}
            </a>
            <a href="#booking" className="btn-primary" data-testid="cta-book">
              {t('hero.book')}
            </a>
          </div>
        </div>
      </div>
      <a
        href="#welcome"
        aria-label={t('nav.skip')}
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-sand-100/70 sm:block"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </a>
    </section>
  )
}
