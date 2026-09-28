import type { Mail } from '../../domain/mail.js';
import { html } from '../html.js';
import { appUrl, button, layout, note, paragraph } from './layout.js';

export const emailVerificationMail = (to: { email: string; firstName: string }, token: string): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: 'Confirme ton email pour rejoindre Footix',
  html: layout({
    title: `Bienvenue ${to.firstName} !`,
    preheader: 'Un clic pour activer ton compte et réserver ta place au prochain match.',
    content: html`${paragraph('Plus qu’une étape : confirme ton email pour activer ton compte. Tu pourras ensuite voir les prochains créneaux et réserver ta place.')}
${button('Confirmer mon email', appUrl(`/verify-email?token=${token}`))}
${note('Le lien est valable 48 heures. Tu n’as pas créé de compte sur Footix ? Ignore ce message, rien ne sera activé.')}`,
  }),
});
