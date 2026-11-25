import { Droplets, Leaf, Sunset } from 'lucide-react'
import { useI18n } from '../i18n'
import { Picture } from './Picture'

export function Welcome() {
  const { t } = useI18n()
  const features = [
    { icon: Droplets, title: t('welcome.f1.title'), text: t('welcome.f1.text') },
    { icon: Leaf, title: t('welcome.f2.title'), text: t('welcome.f2.text') },
    { icon: Sunset, title: t('welcome.f3.title'), text: t('welcome.f3.text') },
  ]
  return (
    <section id="welcome" className="relative bg-sand-50 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div>
          <p className="eyebrow">{t('welcome.eyebrow')}</p>
          <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-cocoa-900 sm:text-5xl">
            {t('welcome.title')}
          </h2>
          <p className="mt-6 text-lg font-light leading-relaxed text-cocoa-700">{t('welcome.text')}</p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sand-100 text-terracotta-500">
                  <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-cocoa-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-cocoa-500">{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
          <div className="arch aspect-[4/5] bg-sand-200 shadow-2xl shadow-cocoa-900/20">
            <Picture
              base="/images/kasbah-pool"
              widths={[800, 1600]}
              width={1600}
              height={1067}
              sizes="(min-width: 768px) 40vw, 90vw"
              alt="Kasbah Sahara Services – pool at dusk"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="arch absolute -bottom-6 -start-6 hidden aspect-[3/4] w-32 border-4 border-sand-50 bg-sand-200 shadow-xl sm:block">
            <Picture
              base="/images/amber-oil"
              widths={[600, 1000]}
              sizes="128px"
              alt=""
              width={1000}
              height={1500}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
