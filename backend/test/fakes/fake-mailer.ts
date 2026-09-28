import type { Mail } from '@src/mail/domain/mail.js';
import { Mailer } from '@src/mail/domain/mailer.js';

// Garde les emails envoyés : les tests suivent le lien sans boîte mail.
export class FakeMailer extends Mailer {
  sent: Mail[] = [];
  // Simule une panne du fournisseur d'email.
  failing = false;

  async send(mail: Mail) {
    if (this.failing) throw new Error('Envoi impossible');
    this.sent.push(mail);
  }

  // Jeton du dernier lien envoyé (confirmation, réinitialisation).
  lastToken() {
    return this.sent.at(-1)!.html.match(/token=([\w-]+)/)![1];
  }
}
