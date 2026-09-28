import { UnauthorizedError } from '../../../common/domain/errors/unauthorized.error.js';

// Même message que l'email soit inconnu ou le mot de passe faux : ne révèle pas quels comptes existent.
export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Email ou mot de passe incorrect.');
  }
}
