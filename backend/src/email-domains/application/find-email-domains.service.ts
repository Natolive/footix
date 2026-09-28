import { Injectable } from '@nestjs/common';
import type { EmailDomainDto } from '@footix/shared';
import { EmailDomainRepository } from '../domain/email-domain.repository.js';
import { toEmailDomainDto } from '../domain/to-email-domain-dto.js';

@Injectable()
export class FindEmailDomainsService {
  constructor(private readonly repository: EmailDomainRepository) {}

  async execute(): Promise<EmailDomainDto[]> {
    return (await this.repository.findAll()).map(toEmailDomainDto).sort((a, b) => a.domain.localeCompare(b.domain));
  }
}
