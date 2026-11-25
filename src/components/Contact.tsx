import { Globe, MapPin, Phone } from 'lucide-react'
import { useI18n } from '../i18n'
import { site } from '../config/site'
import { whatsappUrl } from '../lib/booking'
import { WhatsAppIcon } from './WhatsAppIcon'

export function Contact() {
  const { t } = useI18n()
  return (
    <section id="contact" className="pattern-bg py-20 sm:py-28" aria-labelledby="contact-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h2 id="contact-title" className="mt-4 font-display text-4xl font-medium text-cocoa-900 sm:text-5xl">
            {t('contact.title')}
          </h2>
          <p className="mt-5 leading-relaxed text-cocoa-700">{t('contact.intro')}</p>
        </header>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {site.contacts.map((c) => (
            <li
              key={c.id}
              data-testid={`contact-${c.id}`}
              className="flex flex-col rounded-3xl bg-sand-50 p-6 text-center shadow-lg shadow-cocoa-900/5 ring-1 ring-sand-200"
            >
              <p className="font-display text-2xl font-semibold text-cocoa-900">{c.name}</p>
              <p className="mt-1 text-sm text-cocoa-500">{t(c.roleKey)}</p>
              <p className="mt-3 font-medium text-cocoa-800" dir="ltr">
                {c.phoneDisplay}
              </p>
              <div className={`mt-auto grid gap-2 pt-5 ${c.whatsapp ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <a href={`tel:+${c.phone}`} className="btn-outline px-3" data-testid={`call-${c.id}`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {t('contact.call')}
                </a>
                {c.whatsapp && (
                  <a
                    href={whatsappUrl(c.phone, t('wa.contactMessage'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp px-3"
                    data-testid={`wa-${c.id}`}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {t('contact.whatsapp')}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={site.website} target="_blank" rel="noopener" className="btn-outline" data-testid="website-link">
            <Globe className="h-4 w-4" aria-hidden="true" />
            {t('contact.website')}
          </a>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="bg-cocoa-900 pb-28 pt-14 text-center text-sand-200 sm:pb-14">
      <img src="/brand/logo-white.png" alt="Kasbah Sahara Services" width={945} height={347} loading="lazy" className="mx-auto h-14 w-auto opacity-90" />
      <p className="mt-5 flex items-center justify-center gap-2 text-sm text-sand-300">
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {site.locationLine}
      </p>
      <p className="mt-6 text-xs text-sand-400">
        © {new Date().getFullYear()} {site.name}. {t('footer.rights')} {t('footer.photos')}
      </p>
      <p className="mt-4 text-xs text-sand-400">
        {t('footer.credit')}{' '}
        <a
          href={site.developer.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="developer-link"
          className="font-medium text-sand-200 underline decoration-sand-400/50 underline-offset-4 transition hover:text-desert-400"
        >
          {site.developer.name}
        </a>
      </p>
    </footer>
  )
}

export function WhatsAppFab() {
  const { t } = useI18n()
  return (
    <a
      href={whatsappUrl(site.bookingWhatsApp, t('wa.fabMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('wa.fab')}
      title={t('wa.fab')}
      data-testid="whatsapp-fab"
      className="fixed bottom-5 end-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-xl shadow-cocoa-900/30 transition hover:scale-105 active:scale-95"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
