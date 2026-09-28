import { Injectable } from '@nestjs/common';
import { EmailDomainRepository } from '../domain/email-domain.repository.js';
import { EmailDomainNotFoundError } from '../domain/errors/email-domain-not-found.error.js';

@Injectable()
export class DeleteEmailDomainService {
  constructor(private readonly repository: EmailDomainRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new EmailDomainNotFoundError();
  }
}
