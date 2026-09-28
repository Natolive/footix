import { BaseRepository } from '../../common/domain/base.repository.js';
import type { EmailDomain } from './email-domain.entity.js';
import type { NewEmailDomain } from './new-email-domain.entity.js';

export abstract class EmailDomainRepository extends BaseRepository<EmailDomain, NewEmailDomain> {
  abstract findByDomain(domain: string): Promise<EmailDomain | null>;
}
