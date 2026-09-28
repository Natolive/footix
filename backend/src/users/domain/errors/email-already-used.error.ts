import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class EmailAlreadyUsedError extends ConflictError {
  constructor() {
    super('Un compte existe déjà avec cet email.');
  }
}
