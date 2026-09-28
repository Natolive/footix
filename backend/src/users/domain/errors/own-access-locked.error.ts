import { ForbiddenError } from '../../../common/domain/errors/forbidden.error.js';

export class OwnAccessLockedError extends ForbiddenError {
  constructor() {
    super('Tu ne peux pas modifier ton propre accès : demande à un autre administrateur.');
  }
}
