import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class EventFullError extends ConflictError {
  constructor() {
    super('Le créneau est complet : attends qu’une place se libère.');
  }
}
