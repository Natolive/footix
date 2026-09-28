import { UnauthorizedError } from '../../../common/domain/errors/unauthorized.error.js';

export class VerificationPasswordMismatchError extends UnauthorizedError {
  constructor() {
    super("Ce n'est pas le mot de passe choisi à l'inscription : ressaisis-le, ou réinscris-toi pour en choisir un nouveau.");
  }
}
