import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class NotAttendingError extends ConflictError {
  constructor() {
    super('Réponds « je viens » avant de ramener quelqu’un.');
  }
}
