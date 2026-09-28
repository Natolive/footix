import { Injectable } from '@nestjs/common';
import type { EmailDomainDto, SaveEmailDomainDto } from '@footix/shared';
import { EmailDomainRepository } from '../domain/email-domain.repository.js';
import { EmailDomainAlreadyAllowedError } from '../domain/errors/email-domain-already-allowed.error.js';
import { toEmailDomainDto } from '../domain/to-email-domain-dto.js';

@Injectable()
export class AllowEmailDomainService {
  constructor(private readonly repository: EmailDomainRepository) {}

  async execute(dto: SaveEmailDomainDto): Promise<EmailDomainDto> {
    if (await this.repository.findByDomain(dto.domain)) throw new EmailDomainAlreadyAllowedError();
    return toEmailDomainDto(await this.repository.create(dto));
  }
}
