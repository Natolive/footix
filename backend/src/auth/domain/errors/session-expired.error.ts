import { UnauthorizedError } from '../../../common/domain/errors/unauthorized.error.js';

export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super('Ta session a expiré, reconnecte-toi.');
  }
}
