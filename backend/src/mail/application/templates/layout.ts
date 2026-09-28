import { html } from '../html.js';
import type { SafeHtml } from '../safe-html.js';

// Adresse du front, pour les liens des emails.
export const appUrl = (path: string) => `${process.env.APP_URL}${path}`;

// Date et heure d'un match, en heure de Paris (« jeudi 1 octobre 2026 à 18:30 »).
export const when = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(d);

// Couleurs de l'appli (frontend/app/assets/css/main.css), en dur : les clients mail ignorent les variables CSS.
const GREEN = '#15803d';
const NIGHT = '#062112';
const TEXT = '#404040';
const MUTED = '#525252';
// Version dans l'URL : les messageries (proxy d'images de Gmail…) gardent l'image en cache par URL ; à changer avec l'image.
const HEADER = '/email/header.png?v=2';
const FONT = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// Bouton en tableau : seul rendu fiable partout, Outlook compris. Le lien est aussi donné en clair en dessous.
export const button = (label: string, href: string) =>
  html`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0 8px">
  <tr><td style="border-radius:12px;background:${GREEN}">
    <a href="${href}" style="display:inline-block;padding:15px 28px;font-family:${FONT};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:12px">${label}</a>
  </td></tr>
</table>
<p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:${MUTED}">Le bouton ne marche pas ? Copie ce lien dans ton navigateur :<br><a href="${href}" style="color:${GREEN};word-break:break-all">${href}</a></p>`;

// Précision en petit sous le bouton (validité du lien, que faire si ce n'est pas toi).
export const note = (text: string) =>
  html`<p style="margin:0;padding-top:24px;border-top:1px solid #e5e5e5;font-size:14px;line-height:1.6;color:${MUTED}">${text}</p>`;

export const paragraph = (text: string) => html`<p style="margin:0 0 16px">${text}</p>`;

// Cadre commun à tous les emails : bandeau terrain + logo, titre, contenu, pied de page.
// `preheader` : aperçu affiché après l'objet dans la boîte de réception, invisible dans l'email.
export const layout = ({ title, preheader, content }: { title: string; preheader: string; content: SafeHtml }): string =>
  html`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#effaf3">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#effaf3">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden">
          <tr><td style="background:${GREEN}">
            <a href="${appUrl('/')}"><img src="${appUrl(HEADER)}" width="600" alt="Footix" style="display:block;width:100%;height:auto;border:0;color:#ffffff;font-family:${FONT};font-size:28px;font-weight:bold;line-height:80px;text-indent:44px"></a>
          </td></tr>
          <tr><td style="padding:40px 44px 44px;font-family:${FONT};font-size:16px;line-height:1.6;color:${TEXT}">
            <h1 style="margin:0 0 20px;font-size:26px;line-height:1.2;letter-spacing:-0.02em;color:${NIGHT}">${title}</h1>
            ${content}
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED}">
          Footix, les créneaux de foot de la boîte.<br>
          <a href="${appUrl('/')}" style="color:${MUTED}">${appUrl('/')}</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`.value;
