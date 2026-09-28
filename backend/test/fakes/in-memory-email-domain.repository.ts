import type { EmailDomain } from '@src/email-domains/domain/email-domain.entity.js';
import type { NewEmailDomain } from '@src/email-domains/domain/new-email-domain.entity.js';
import { EmailDomainRepository } from '@src/email-domains/domain/email-domain.repository.js';
import { InMemoryRepository } from './in-memory.repository.js';

export class InMemoryEmailDomainRepository
  extends InMemoryRepository<EmailDomain, NewEmailDomain>
  implements EmailDomainRepository
{
  async findByDomain(domain: string) {
    return this.rows.find((d) => d.domain === domain) ?? null;
  }
}
