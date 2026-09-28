import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import type { EmailDomain } from '../domain/email-domain.entity.js';
import type { NewEmailDomain } from '../domain/new-email-domain.entity.js';
import { EmailDomainRepository } from '../domain/email-domain.repository.js';
import { emailDomains } from './email-domain.table.js';

@Injectable()
export class DrizzleEmailDomainRepository
  extends DrizzleRepository<typeof emailDomains, EmailDomain, NewEmailDomain>
  implements EmailDomainRepository
{
  constructor(@Inject(DB) db: Database) {
    super(db, emailDomains);
  }

  async findByDomain(domain: string): Promise<EmailDomain | null> {
    const [row] = await this.db.select().from(emailDomains).where(eq(emailDomains.domain, domain)).limit(1);
    return row ?? null;
  }
}
