import { DomainError } from '../../../common/domain/errors/domain.error.js';

export class EmailDomainNotAllowedError extends DomainError {
  constructor(domains: string[]) {
    super(
      domains.length
        ? `Utilise ton adresse pro (${domains.map((d) => `@${d}`).join(', ')}).`
        : 'Les inscriptions sont fermées : aucun domaine email n’est autorisé, préviens un administrateur.',
    );
  }
}
