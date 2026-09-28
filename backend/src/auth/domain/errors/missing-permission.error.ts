import { ForbiddenError } from '../../../common/domain/errors/forbidden.error.js';

export class MissingPermissionError extends ForbiddenError {
  constructor() {
    super("Tu n'as pas le droit de faire cette action, demande-le à un administrateur.");
  }
}
