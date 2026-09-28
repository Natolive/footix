// Fichier calendrier (RFC 5545) d'un seul événement, joint aux emails.
import type { CalendarEvent } from './calendar-event.js';

// Échappement des valeurs texte : \ ; , et retours à la ligne.
const text = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');

// 20260925T180000Z
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Lignes de 75 octets max, suite précédée d'une espace ; coupe entre deux caractères, jamais dans un accent.
const fold = (line: string) => {
  const out: string[] = [];
  let current = '';
  for (const c of line) {
    if (Buffer.byteLength(current + c) > (out.length ? 74 : 75)) {
      out.push(current);
      current = '';
    }
    current += c;
  }
  return [...out, current].join('\r\n ');
};

export const ics = ({ uid, title, description, location, startsAt, endsAt, url }: CalendarEvent): string =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Footix//FR',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(startsAt)}`,
    `DTEND:${utc(endsAt)}`,
    `SUMMARY:${text(title)}`,
    `LOCATION:${text(location)}`,
    ...(description ? [`DESCRIPTION:${text(description)}`] : []),
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n') + '\r\n';
