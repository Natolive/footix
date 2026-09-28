import { AllowEmailDomainService } from '@src/email-domains/application/allow-email-domain.service.js';
import { EmailDomainAlreadyAllowedError } from '@src/email-domains/domain/errors/email-domain-already-allowed.error.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';

describe('AllowEmailDomainService', () => {
  it('refuses a domain already allowed', async () => {
    const allow = new AllowEmailDomainService(new InMemoryEmailDomainRepository());
    await allow.execute({ domain: 'solem.fr' });
    await expect(allow.execute({ domain: 'solem.fr' })).rejects.toBeInstanceOf(EmailDomainAlreadyAllowedError);
  });
});
