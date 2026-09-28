import { ForbiddenError } from '../../../common/domain/errors/forbidden.error.js';

export class EmailNotVerifiedError extends ForbiddenError {
  constructor() {
    super("Confirme ton email avec le lien reçu à l'inscription (pense aux spams), ou réinscris-toi pour en recevoir un nouveau.");
  }
}
