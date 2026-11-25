import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AlertCircle, CalendarDays, Clock, Hourglass, Send } from 'lucide-react'
import { useI18n } from '../i18n'
import { activeMassages } from '../data/massages'
import {
  LIMITS,
  emptyForm,
  findMassage,
  formatDate,
  formatPrice,
  hotelNow,
  toRequest,
  validate,
  type BookingErrors,
  type BookingForm as Form,
  type BookingRequest,
} from '../lib/booking'
import { prepareBooking, recordBooking, type PreparedBooking } from '../services/bookingService'
import { WhatsAppIcon } from './WhatsAppIcon'

export interface Selection {
  massageId: string
  optionId: string
  nonce: number
}

const FIELD_ORDER: (keyof Form)[] = ['name', 'room', 'massageId', 'variantId', 'optionId', 'date', 'time', 'message']

function initialForm(): Form {
  const f = emptyForm()
  // Optional room pre-fill from a room-specific QR code: ?room=12
  try {
    const room = new URLSearchParams(window.location.search).get('room')
    if (room && /^[\p{L}\p{N} \-/]{1,10}$/u.test(room)) f.room = room
  } catch {
    /* ignore */
  }
  return f
}

export function BookingForm({ selection }: { selection: Selection | null }) {
  const { t, lang, locale } = useI18n()
  const [form, setForm] = useState<Form>(initialForm)
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState<{ req: BookingRequest; prepared: PreparedBooking } | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`

  const massages = activeMassages()
  const massage = findMassage(form.massageId)
  const option = massage?.options.find((o) => o.id === form.optionId)
  const errors: BookingErrors = useMemo(() => (touched ? validate(form) : {}), [form, touched])
  const today = hotelNow().date

  // Pre-select from the massage menu ("Book" buttons)
  useEffect(() => {
    if (!selection) return
    setSent(null)
    setForm((f) => ({ ...f, massageId: selection.massageId, optionId: selection.optionId, variantId: '' }))
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Focus the first field the guest still has to fill in.
    window.setTimeout(() => {
      const fields = ['name', 'room', 'date', 'time'] as const
      const el = fields
        .map((k) => formRef.current?.querySelector<HTMLInputElement>(`[data-field="${k}"]`))
        .find((input) => input && !input.value)
      el?.focus({ preventScroll: true })
    }, 600)
  }, [selection])

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => {
      const next = { ...f, [k]: v }
      if (k === 'massageId') {
        const m = findMassage(v as string)
        if (!m?.options.some((o) => o.id === f.optionId)) next.optionId = ''
        if (!m?.variants?.some((x) => x.id === f.variantId)) next.variantId = ''
      }
      return next
    })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    const errs = validate(form)
    const first = FIELD_ORDER.find((k) => errs[k])
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)
      el?.focus()
      return
    }
    const req = toRequest(form, lang)
    if (!req) return
    const prepared = prepareBooking(req)
    recordBooking(req)
    // Opened synchronously inside the click handler so browsers do not block it.
    window.open(prepared.whatsappUrl, '_blank', 'noopener,noreferrer')
    setSent({ req, prepared })
    window.setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const err = (k: keyof Form) =>
    errors[k] ? (
      <p id={id(`${k}-err`)} className="field-error flex items-center gap-1.5">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t(errors[k]!.key, errors[k]!.vars)}
      </p>
    ) : null
  const aria = (k: keyof Form) => ({
    'aria-invalid': errors[k] ? (true as const) : undefined,
    'aria-describedby': errors[k] ? id(`${k}-err`) : undefined,
  })
  const hasErrors = Object.keys(errors).length > 0

  return (
    <section ref={sectionRef} id="booking" className="bg-sand-50 py-20 sm:py-28" aria-labelledby="booking-title">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="text-center">
          <p className="eyebrow">{t('booking.eyebrow')}</p>
          <h2 id="booking-title" className="mt-4 font-display text-4xl font-medium text-cocoa-900 sm:text-5xl">
            {t('booking.title')}
          </h2>
          {!sent && <p className="mx-auto mt-5 max-w-xl leading-relaxed text-cocoa-700">{t('booking.intro')}</p>}
        </header>

        {sent ? (
          <SentPanel
            req={sent.req}
            prepared={sent.prepared}
            onEdit={() => setSent(null)}
            onNew={() => {
              setForm({ ...emptyForm(), name: sent.req.name, room: sent.req.room })
              setTouched(false)
              setSent(null)
            }}
          />
        ) : (
          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            data-testid="booking-form"
            className="mt-10 rounded-[1.75rem] bg-white/60 p-5 shadow-xl shadow-cocoa-900/5 ring-1 ring-sand-200 sm:p-10"
          >
            {hasErrors && (
              <div role="alert" className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t('error.summary')}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
              <div>
                <label htmlFor={id('name')} className="field-label">
                  {t('booking.name')}
                </label>
                <input
                  id={id('name')}
                  name="name"
                  data-field="name"
                  className="field"
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  placeholder={t('booking.namePh')}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  {...aria('name')}
                />
                {err('name')}
              </div>
              <div>
                <label htmlFor={id('room')} className="field-label">
                  {t('booking.room')}
                </label>
                <input
                  id={id('room')}
                  name="room"
                  data-field="room"
                  className="field"
                  inputMode="text"
                  autoComplete="off"
                  maxLength={LIMITS.room}
                  placeholder={t('booking.roomPh')}
                  value={form.room}
                  onChange={(e) => set('room', e.target.value)}
                  {...aria('room')}
                />
                {err('room')}
              </div>
            </div>

            <Fieldset legend={t('booking.massage')} error={err('massageId')} className="mt-7">
              <div className="grid gap-3">
                {massages.map((m, i) => (
                  <label key={m.id} className="choice">
                    <input
                      type="radio"
                      name="massageId"
                      value={m.id}
                      data-field={i === 0 ? 'massageId' : undefined}
                      checked={form.massageId === m.id}
                      onChange={() => set('massageId', m.id)}
                      className="h-5 w-5 shrink-0 accent-terracotta-500"
                      {...aria('massageId')}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-cocoa-900">{m.name[lang]}</span>
                      <span className="block text-sm text-cocoa-500">
                        {m.tagline[lang]} · {Math.min(...m.options.map((o) => o.minutes))}–
                        {Math.max(...m.options.map((o) => o.minutes))} {t('menu.minutes')}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Fieldset>

            {massage?.variants?.length ? (
              <Fieldset legend={t('booking.variant')} error={err('variantId')} className="mt-6">
                <div className="flex flex-wrap gap-3">
                  {massage.variants.map((v, i) => (
                    <label key={v.id} className="choice py-2.5">
                      <input
                        type="radio"
                        name="variantId"
                        value={v.id}
                        data-field={i === 0 ? 'variantId' : undefined}
                        checked={form.variantId === v.id}
                        onChange={() => set('variantId', v.id)}
                        className="h-5 w-5 accent-terracotta-500"
                        {...aria('variantId')}
                      />
                      <span className="font-medium">{v.label[lang]}</span>
                    </label>
                  ))}
                </div>
              </Fieldset>
            ) : null}

            {massage && (
              <Fieldset legend={t('booking.duration')} error={err('optionId')} className="mt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {massage.options.map((o, i) => (
                    <label key={o.id} className="choice">
                      <input
                        type="radio"
                        name="optionId"
                        value={o.id}
                        data-field={i === 0 ? 'optionId' : undefined}
                        checked={form.optionId === o.id}
                        onChange={() => set('optionId', o.id)}
                        className="h-5 w-5 shrink-0 accent-terracotta-500"
                        {...aria('optionId')}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-cocoa-900">
                          {o.minutes} {t('menu.minutes')}
                        </span>
                        <span className="block text-sm text-cocoa-500">{o.area[lang]}</span>
                      </span>
                      <span className="font-display text-xl font-semibold text-terracotta-600" dir="ltr">
                        {formatPrice(o.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </Fieldset>
            )}

            <div className="mt-7 grid grid-cols-2 gap-4 sm:gap-5">
              <div className="min-w-0">
                <label htmlFor={id('date')} className="field-label flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-terracotta-500" aria-hidden="true" />
                  {t('booking.date')}
                </label>
                <input
                  id={id('date')}
                  name="date"
                  data-field="date"
                  type="date"
                  className="field"
                  min={today}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  {...aria('date')}
                />
                {err('date')}
              </div>
              <div className="min-w-0">
                <label htmlFor={id('time')} className="field-label flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-terracotta-500" aria-hidden="true" />
                  {t('booking.time')}
                </label>
                <input
                  id={id('time')}
                  name="time"
                  data-field="time"
                  type="time"
                  step={900}
                  className="field"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  {...aria('time')}
                />
                {err('time')}
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor={id('message')} className="field-label">
                {t('booking.message')} <span className="font-normal text-cocoa-500">({t('booking.optional')})</span>
              </label>
              <textarea
                id={id('message')}
                name="message"
                data-field="message"
                rows={3}
                maxLength={LIMITS.message}
                className="field resize-y"
                placeholder={t('booking.messagePh')}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
              />
            </div>

            {option && (
              <p className="mt-6 flex items-baseline justify-between rounded-xl bg-sand-100 px-5 py-4" data-testid="price-summary">
                <span className="text-sm uppercase tracking-wider text-cocoa-700">{t('booking.total')}</span>
                <span className="font-display text-3xl font-semibold text-terracotta-600" dir="ltr">
                  {formatPrice(option.price)}
                </span>
              </p>
            )}

            <button type="submit" className="btn-primary mt-7 w-full text-base" data-testid="submit-booking">
              <WhatsAppIcon />
              {t('booking.submit')}
            </button>
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-cocoa-500">
              <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-500" aria-hidden="true" />
              {t('booking.disclaimer')}
            </p>
          </form>
        )}
      </div>
    </section>
  )

  function SentPanel({
    req,
    prepared,
    onEdit,
    onNew,
  }: {
    req: BookingRequest
    prepared: PreparedBooking
    onEdit: () => void
    onNew: () => void
  }) {
    const variant = req.massage.variants?.find((v) => v.id === req.variantId)
    const rows: [string, string][] = [
      [t('booking.name'), req.name],
      [t('booking.room'), req.room],
      [t('booking.massage'), req.massage.name[lang] + (variant ? ` (${variant.label[lang]})` : '')],
      [t('booking.duration'), `${req.option.minutes} ${t('menu.minutes')} – ${req.option.area[lang]}`],
      [t('booking.date'), formatDate(req.date, locale)],
      [t('booking.time'), req.time],
      [t('booking.total'), formatPrice(req.option.price)],
    ]
    if (req.message) rows.push([t('booking.message'), req.message])
    return (
      <div
        role="status"
        data-testid="sent-panel"
        className="mt-10 rounded-[1.75rem] bg-white/70 p-6 text-center shadow-xl shadow-cocoa-900/5 ring-1 ring-sand-200 sm:p-10"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-desert-400/20 px-4 py-1.5 text-sm font-medium text-cocoa-700">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
          {t('sent.status')}
        </span>
        <h3 className="mt-5 font-display text-3xl font-semibold text-cocoa-900">{t('sent.title')}</h3>
        <p className="mx-auto mt-3 max-w-lg leading-relaxed text-cocoa-700">{t('sent.text')}</p>
        <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-terracotta-600">{t('sent.notConfirmed')}</p>

        <dl className="mx-auto mt-7 max-w-md divide-y divide-sand-200 rounded-2xl bg-sand-50 px-5 text-start text-sm ring-1 ring-sand-200">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-cocoa-500">{k}</dt>
              <dd className="text-end font-medium break-words text-cocoa-900">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-7 text-sm text-cocoa-500">{t('sent.blocked')}</p>
        <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={prepared.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            data-testid="sent-open-whatsapp"
          >
            <WhatsAppIcon />
            {t('sent.open')}
          </a>
          <button type="button" className="btn-outline" onClick={onEdit}>
            {t('sent.edit')}
          </button>
          <button type="button" className="btn-outline" onClick={onNew}>
            <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            {t('sent.new')}
          </button>
        </div>
      </div>
    )
  }
}

function Fieldset({ legend, error, className, children }: { legend: string; error: ReactNode; className?: string; children: ReactNode }) {
  return (
    <fieldset className={className}>
      <legend className="field-label">{legend}</legend>
      {children}
      {error}
    </fieldset>
  )
}
