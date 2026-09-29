import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class EventCancelledError extends ConflictError {
  constructor() {
    super('Le créneau est annulé : plus de réponse, d’invité ni de modification possible.');
  }
}
