import { AssertEmailAllowedService } from '@src/email-domains/application/assert-email-allowed.service.js';
import { DeleteEmailDomainService } from '@src/email-domains/application/delete-email-domain.service.js';
import { FindEmailDomainsService } from '@src/email-domains/application/find-email-domains.service.js';
import { EmailDomainNotAllowedError } from '@src/email-domains/domain/errors/email-domain-not-allowed.error.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';

describe('AssertEmailAllowedService', () => {
  let repository: InMemoryEmailDomainRepository;
  let assertAllowed: AssertEmailAllowedService;

  beforeEach(async () => {
    repository = new InMemoryEmailDomainRepository();
    await repository.create({ domain: 'solem.fr' });
    assertAllowed = new AssertEmailAllowedService(repository, new FindEmailDomainsService(repository));
  });

  it('accepts only emails of an allowed domain, and lists them in the error', async () => {
    await expect(assertAllowed.execute('lea@solem.fr')).resolves.toBeUndefined();
    await expect(assertAllowed.execute('lea@gmail.com')).rejects.toThrow('@solem.fr');
    await expect(assertAllowed.execute('lea@sub.solem.fr')).rejects.toBeInstanceOf(EmailDomainNotAllowedError);
    await expect(assertAllowed.execute('solem.fr')).rejects.toBeInstanceOf(EmailDomainNotAllowedError);
  });

  it('closes signups once every domain is removed', async () => {
    await new DeleteEmailDomainService(repository).execute(repository.rows[0].id);
    await expect(assertAllowed.execute('lea@solem.fr')).rejects.toThrow('Les inscriptions sont fermées');
  });
});
