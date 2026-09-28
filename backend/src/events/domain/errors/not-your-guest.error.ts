import { ForbiddenError } from '../../../common/domain/errors/forbidden.error.js';

export class NotYourGuestError extends ForbiddenError {
  constructor() {
    super('Seule la personne qui l’a ramené peut retirer cet invité.');
  }
}
