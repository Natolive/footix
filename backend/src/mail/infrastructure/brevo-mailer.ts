import { Injectable, Logger } from '@nestjs/common';
import type { Mail } from '../domain/mail.js';
import { Mailer } from '../domain/mailer.js';

// API transactionnelle de Brevo : https://developers.brevo.com/reference/sendtransacemail
// MAIL_FROM doit être un expéditeur validé dans Brevo. Sans BREVO_API_KEY (CI), l'email est seulement loggé.
@Injectable()
export class BrevoMailer extends Mailer {
  private readonly logger = new Logger(BrevoMailer.name);

  async send({ to, subject, html, attachments }: Mail): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      this.logger.warn(`BREVO_API_KEY absente, email « ${subject} » non envoyé à ${to.email} :\n${html}`);
      return;
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Footix', email: process.env.MAIL_FROM },
        to: [to],
        subject,
        htmlContent: html,
        // Brevo déduit le type de l'extension (`.ics` autorisé).
        attachment: attachments?.map((a) => ({ name: a.name, content: Buffer.from(a.content).toString('base64') })),
      }),
    });
    if (!res.ok) throw new Error(`Brevo a refusé l'email (${res.status}) : ${await res.text()}`);
  }
}
