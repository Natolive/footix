import { Injectable } from '@nestjs/common';
import { EmailDomainRepository } from '../domain/email-domain.repository.js';
import { EmailDomainNotAllowedError } from '../domain/errors/email-domain-not-allowed.error.js';
import { FindEmailDomainsService } from './find-email-domains.service.js';

// Seules les adresses d'un domaine autorisé peuvent créer un compte.
@Injectable()
export class AssertEmailAllowedService {
  constructor(
    private readonly repository: EmailDomainRepository,
    private readonly findEmailDomains: FindEmailDomainsService,
  ) {}

  async execute(email: string): Promise<void> {
    if (await this.repository.findByDomain(email.split('@')[1] ?? '')) return;
    throw new EmailDomainNotAllowedError((await this.findEmailDomains.execute()).map((d) => d.domain));
  }
}
