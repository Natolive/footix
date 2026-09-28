import { NotFoundError } from '../../../common/domain/errors/not-found.error.js';

export class EmailDomainNotFoundError extends NotFoundError {
  constructor() {
    super('Domaine introuvable.');
  }
}
