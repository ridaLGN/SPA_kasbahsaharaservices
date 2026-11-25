/** English – source dictionary. fr.ts and ar.ts must have the same keys. */
export const en = {
  'meta.title': 'Spa & Massages | Kasbah Sahara Services – M’hamid, Morocco',
  'meta.description':
    'Book an argan oil or essential oil massage at Kasbah Sahara Services, in the heart of the Moroccan desert in M’hamid El Ghizlane. Request your session by WhatsApp.',

  'nav.massages': 'Massages',
  'nav.booking': 'Booking',
  'nav.contact': 'Contact',
  'nav.language': 'Language',
  'nav.skip': 'Skip to content',

  'hero.eyebrow': 'Spa & Wellness',
  'hero.title': 'Welcome to Your Desert Wellness Experience',
  'hero.subtitle': 'Enjoy a unique moment of relaxation in the heart of the Moroccan desert.',
  'hero.discover': 'Discover Our Massages',
  'hero.book': 'Book Your Massage',

  'welcome.eyebrow': 'Welcome, dear guest',
  'welcome.title': 'A pause of silence between sand and stars',
  'welcome.text':
    'At Kasbah Sahara Services, our massages draw on the gentle rituals of Morocco: warm argan oil, natural essential oils and unhurried hands. Let the calm of the desert carry you, and give your body the rest it deserves after the dunes and the road.',
  'welcome.f1.title': 'Pure argan oil',
  'welcome.f1.text': 'The treasure of southern Morocco, nourishing and soothing.',
  'welcome.f2.title': 'Natural essential oils',
  'welcome.f2.text': 'Chosen to relax muscles and awaken the senses.',
  'welcome.f3.title': 'The calm of the desert',
  'welcome.f3.text': 'A cocooning setting, far from the noise of the world.',

  'menu.eyebrow': 'Our massages',
  'menu.title': 'The Massage Menu',
  'menu.minutes': 'min',
  'menu.book': 'Book',
  'menu.bookAria': 'Book {name}, {minutes} minutes, {price}',
  'menu.note': 'Prices in euros. Please let us know about any health condition or pregnancy in your request.',

  'ritual.quote': 'Here, time slows down. Breathe, let go, and let the desert do the rest.',

  'booking.eyebrow': 'Booking request',
  'booking.title': 'Book Your Massage',
  'booking.intro':
    'Fill in the form below. Your request will be sent to our team on WhatsApp, and we will reply to confirm the availability of your time slot.',
  'booking.name': 'Full name',
  'booking.namePh': 'First name and last name',
  'booking.room': 'Room number',
  'booking.roomPh': 'e.g. 12',
  'booking.massage': 'Massage',
  'booking.massagePh': 'Choose a massage',
  'booking.variant': 'Style',
  'booking.duration': 'Duration',
  'booking.durationPh': 'Choose a duration',
  'booking.date': 'Preferred date',
  'booking.time': 'Preferred time',
  'booking.message': 'Message or special request',
  'booking.optional': 'optional',
  'booking.messagePh': 'Allergies, preferred pressure, health condition, a massage for two…',
  'booking.total': 'Indicative price',
  'booking.submit': 'Confirm my booking',
  'booking.disclaimer':
    'WhatsApp will open with your request ready to send. Your booking is confirmed only once our team has replied.',

  'error.required': 'This field is required.',
  'error.name': 'Please enter your name (2 characters minimum).',
  'error.room': 'Please enter a valid room number.',
  'error.datePast': 'Please choose today or a future date.',
  'error.timePast': 'This time has already passed today.',
  'error.hours': 'Please choose a time between {open} and {close}.',
  'error.summary': 'Please check the highlighted fields.',

  'sent.status': 'Awaiting confirmation',
  'sent.title': 'Your request is ready',
  'sent.text':
    'WhatsApp has opened with your booking request. Tap “Send” in WhatsApp to send it. Our team will reply as soon as possible to confirm your appointment.',
  'sent.notConfirmed': 'This is a request: your massage is not booked until we confirm it.',
  'sent.open': 'Open WhatsApp',
  'sent.edit': 'Edit my request',
  'sent.new': 'New request',
  'sent.blocked': 'If WhatsApp did not open, tap the button below.',

  'wa.intro': 'Hello Kasbah Sahara Services, I would like to request a massage:',
  'wa.footer': 'Booking request – awaiting your confirmation. Thank you!',
  'wa.fab': 'Chat with us on WhatsApp',
  'wa.fabMessage': 'Hello, I have a question about your massages.',
  'wa.contactMessage': 'Hello, I am contacting you about the spa and massages.',

  'contact.eyebrow': 'We are here for you',
  'contact.title': 'Contact the Kasbah',
  'contact.intro': 'For any question, call us or write to us on WhatsApp. You can also ask at reception.',
  'contact.role.reception': 'Hotel reception',
  'contact.role.manager': 'Direct contact',
  'contact.call': 'Call',
  'contact.whatsapp': 'WhatsApp',
  'contact.email': 'Email',
  'contact.website': 'Official website',

  'footer.rights': 'All rights reserved.',
  'footer.photos': 'Massage photos: Unsplash.',
}

export type Dict = Record<keyof typeof en, string>
export type DictKey = keyof typeof en
