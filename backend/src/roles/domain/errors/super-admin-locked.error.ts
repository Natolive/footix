import { ForbiddenError } from '../../../common/domain/errors/forbidden.error.js';

export class SuperAdminLockedError extends ForbiddenError {
  constructor() {
    super('Le super admin a toujours tous les droits : modifie plutôt un autre rôle.');
  }
}
