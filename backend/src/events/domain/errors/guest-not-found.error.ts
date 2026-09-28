import { NotFoundError } from '../../../common/domain/errors/not-found.error.js';

export class GuestNotFoundError extends NotFoundError {
  constructor() {
    super('Invité introuvable.');
  }
}
