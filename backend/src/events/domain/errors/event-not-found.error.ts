import { NotFoundError } from '../../../common/domain/errors/not-found.error.js';

export class EventNotFoundError extends NotFoundError {
  constructor() {
    super('Créneau introuvable.');
  }
}
