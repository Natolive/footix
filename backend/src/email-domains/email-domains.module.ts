import { Module } from '@nestjs/common';
import { AllowEmailDomainService } from './application/allow-email-domain.service.js';
import { AssertEmailAllowedService } from './application/assert-email-allowed.service.js';
import { DeleteEmailDomainService } from './application/delete-email-domain.service.js';
import { FindEmailDomainsService } from './application/find-email-domains.service.js';
import { EmailDomainRepository } from './domain/email-domain.repository.js';
import { DrizzleEmailDomainRepository } from './infrastructure/drizzle-email-domain.repository.js';
import { EmailDomainsController } from './infrastructure/http/email-domains.controller.js';

// Routes protégées par le guard global d'AuthModule.
@Module({
  controllers: [EmailDomainsController],
  providers: [
    AllowEmailDomainService,
    AssertEmailAllowedService,
    DeleteEmailDomainService,
    FindEmailDomainsService,
    { provide: EmailDomainRepository, useClass: DrizzleEmailDomainRepository },
  ],
  exports: [AssertEmailAllowedService],
})
export class EmailDomainsModule {}
