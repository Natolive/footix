import { DeleteEmailDomainService } from '@src/email-domains/application/delete-email-domain.service.js';
import { EmailDomainNotFoundError } from '@src/email-domains/domain/errors/email-domain-not-found.error.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';

describe('DeleteEmailDomainService', () => {
  it('removes a domain once, then says it is not found', async () => {
    const repository = new InMemoryEmailDomainRepository();
    const { id } = await repository.create({ domain: 'solem.fr' });
    const deleteDomain = new DeleteEmailDomainService(repository);
    await deleteDomain.execute(id);
    expect(repository.rows).toEqual([]);
    await expect(deleteDomain.execute(id)).rejects.toBeInstanceOf(EmailDomainNotFoundError);
  });
});
