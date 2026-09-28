import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class EventStartedError extends ConflictError {
  constructor() {
    super('Le créneau a déjà commencé : le sondage est fermé.');
  }
}
