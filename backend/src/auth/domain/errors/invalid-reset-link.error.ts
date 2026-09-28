import { NotFoundError } from '../../../common/domain/errors/not-found.error.js';

export class InvalidResetLinkError extends NotFoundError {
  constructor() {
    super('Lien de réinitialisation invalide, expiré ou déjà utilisé : redemande un lien depuis « Mot de passe oublié ».');
  }
}
