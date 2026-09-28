import { ForbiddenError } from '../../../common/domain/errors/forbidden.error.js';

export class SuperAdminOnlyError extends ForbiddenError {
  constructor() {
    super('Seul un super admin peut nommer ou modifier un super admin.');
  }
}
