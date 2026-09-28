import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class EmailDomainAlreadyAllowedError extends ConflictError {
  constructor() {
    super('Ce domaine est déjà autorisé.');
  }
}
