import { useCallback, useState } from 'react'
import { useI18n } from './i18n'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Welcome } from './components/Welcome'
import { MassageMenu, RitualStrip } from './components/MassageMenu'
import { BookingForm, type Selection } from './components/BookingForm'
import { Contact, Footer, WhatsAppFab } from './components/Contact'

export default function App() {
  const { t } = useI18n()
  const [selection, setSelection] = useState<Selection | null>(null)
  const select = useCallback(
    (massageId: string, optionId: string) => setSelection({ massageId, optionId, nonce: Date.now() }),
    [],
  )
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-cocoa-900 px-4 py-2 text-sand-50 focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t('nav.skip')}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Welcome />
        <MassageMenu onSelect={select} />
        <RitualStrip />
        <BookingForm selection={selection} />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
