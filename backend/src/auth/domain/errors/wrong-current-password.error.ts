import { UnauthorizedError } from '../../../common/domain/errors/unauthorized.error.js';

export class WrongCurrentPasswordError extends UnauthorizedError {
  constructor() {
    super("Ce n'est pas ton mot de passe actuel : ressaisis-le, ou passe par « Mot de passe oublié » depuis la connexion.");
  }
}
