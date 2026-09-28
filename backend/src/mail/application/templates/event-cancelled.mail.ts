import type { Mail } from '../../domain/mail.js';
import { html } from '../html.js';
import { appUrl, button, layout, note, paragraph, when } from './layout.js';

export const eventCancelledMail = (
  to: { email: string; firstName: string },
  event: { title: string; location: string; startsAt: Date },
): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: `Match annulé : ${event.title}`,
  html: layout({
    title: 'Le match est annulé',
    preheader: `${event.title}, ${when(event.startsAt)} à ${event.location} n'aura pas lieu.`,
    content: html`${paragraph(`Salut ${to.firstName}, le créneau « ${event.title} » du ${when(event.startsAt)} à ${event.location} a été supprimé par les organisateurs.`)}
${button('Voir les autres créneaux', appUrl('/'))}
${note('Pense à retirer le match de ton agenda. Si tu avais déjà payé ta place, vois avec les organisateurs pour le remboursement.')}`,
  }),
});
