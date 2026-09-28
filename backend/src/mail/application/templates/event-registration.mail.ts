import type { Mail } from '../../domain/mail.js';
import { html } from '../html.js';
import { ics } from '../ics.js';
import { appUrl, button, layout, note, paragraph, when } from './layout.js';

export const eventRegistrationMail = (
  to: { email: string; firstName: string },
  event: { id: string; title: string; description: string | null; location: string; startsAt: Date; durationMinutes: number; paymentUrl: string | null },
): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: `Inscription confirmée : ${event.title}`,
  html: layout({
    title: 'Ta place est réservée',
    preheader: `${event.title}, ${when(event.startsAt)} à ${event.location}.`,
    content: html`${paragraph(`Salut ${to.firstName}, tu es inscrit à « ${event.title} » le ${when(event.startsAt)} à ${event.location}.`)}
${event.paymentUrl ? button('Payer ma place', event.paymentUrl) : button('Voir les créneaux', appUrl('/'))}
${note('Ajoute le match à ton agenda avec le fichier joint. Un empêchement ? Réponds « je ne viens pas » sur Footix pour libérer ta place.')}`,
  }),
  attachments: [
    {
      name: 'match.ics',
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
      content: ics({
        uid: `${event.id}@footix`,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt,
        endsAt: new Date(event.startsAt.getTime() + event.durationMinutes * 60_000),
        url: appUrl('/'),
      }),
    },
  ],
});
