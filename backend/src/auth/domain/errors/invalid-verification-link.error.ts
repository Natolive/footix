import { NotFoundError } from '../../../common/domain/errors/not-found.error.js';

export class InvalidVerificationLinkError extends NotFoundError {
  constructor() {
    super('Lien de confirmation invalide, expiré ou déjà utilisé : connecte-toi, ou réinscris-toi pour en recevoir un nouveau.');
  }
}
