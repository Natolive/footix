import { Injectable } from '@nestjs/common';
import type { Mail } from '../domain/mail.js';
import { Mailer } from '../domain/mailer.js';

// Dev : Mailpit garde les emails au lieu de les envoyer, lisibles sur http://mail.footix.localhost.
// API d'envoi : https://mailpit.axllent.org/docs/api-v1/view.html#post-/api/v1/send
@Injectable()
export class MailpitMailer extends Mailer {
  async send({ to, subject, html, attachments }: Mail): Promise<void> {
    const res = await fetch(`${process.env.MAILPIT_URL}/api/v1/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        From: { Name: 'Footix', Email: 'noreply@footix.localhost' },
        To: [{ Name: to.name, Email: to.email }],
        Subject: subject,
        HTML: html,
        Attachments: attachments?.map((a) => ({
          Filename: a.name,
          ContentType: a.contentType,
          Content: Buffer.from(a.content).toString('base64'),
        })),
      }),
    });
    if (!res.ok) throw new Error(`Mailpit a refusé l'email (${res.status}) : ${await res.text()}`);
  }
}
