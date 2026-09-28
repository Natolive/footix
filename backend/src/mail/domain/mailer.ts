import type { Mail } from './mail.js';

export abstract class Mailer {
  abstract send(mail: Mail): Promise<void>;
}
