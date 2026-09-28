import type { Mail } from '../../domain/mail.js';
import { html } from '../html.js';
import { appUrl, button, layout, note, paragraph } from './layout.js';

export const passwordResetMail = (to: { email: string; firstName: string }, token: string): Mail => ({
  to: { email: to.email, name: to.firstName },
  subject: 'Choisis un nouveau mot de passe Footix',
  html: layout({
    title: 'Nouveau mot de passe',
    preheader: 'Le lien pour choisir ton nouveau mot de passe, valable 1 heure.',
    content: html`${paragraph(`Salut ${to.firstName}, tu as demandé à changer ton mot de passe. Choisis-en un nouveau pour revenir sur le terrain.`)}
${button('Choisir un mot de passe', appUrl(`/reset-password?token=${token}`))}
${note('Le lien est valable 1 heure. Tu n’as rien demandé ? Ignore ce message, ton mot de passe ne change pas.')}`,
  }),
});
