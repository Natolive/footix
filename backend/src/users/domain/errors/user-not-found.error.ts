import { NotFoundError } from '../../../common/domain/errors/not-found.error.js';

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('Utilisateur introuvable.');
  }
}
