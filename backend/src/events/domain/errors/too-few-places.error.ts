import { ConflictError } from '../../../common/domain/errors/conflict.error.js';

export class TooFewPlacesError extends ConflictError {
  constructor(taken: number) {
    super(`${taken} personnes viennent déjà : prévois au moins ${taken} places.`);
  }
}
