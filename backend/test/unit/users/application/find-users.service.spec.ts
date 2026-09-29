import { findUsersQuerySchema } from '@footix/shared';
import { FindUsersService } from '@src/users/application/find-users.service.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';
import { person } from './setup.js';

describe('FindUsersService', () => {
  const setup = async () => {
    const users = new InMemoryUserRepository();
    await users.create(person('lea@solem.fr'));
    await users.create({ ...person('max@solem.fr'), firstName: 'Hélène', lastName: "O'Neil", role: 'super_admin', emailVerifiedAt: new Date() });
    await users.create({ ...person('tom@solem.fr'), firstName: 'Jean-Pierre', lastName: 'Allard', role: 'admin', extraPermissions: ['users.read'] });
    const find = (query: object = {}) => new FindUsersService(users).execute(findUsersQuerySchema.parse(query));
    const emails = async (query: object) => (await find(query)).items.map((u) => u.email);
    return { find, emails };
  };

  it('lists a page sorted by name, without the password hash', async () => {
    const { find } = await setup();
    const page = await find();
    expect(page).toMatchObject({ total: 3, overall: 3, page: 1 });
    expect(page.items.map((u) => u.email)).toEqual(['tom@solem.fr', 'lea@solem.fr', 'max@solem.fr']);
    expect(page.items[0]).not.toHaveProperty('passwordHash');
  });

  it('finds every typed word, ignoring accents, case and punctuation', async () => {
    const { emails } = await setup();
    expect(await emails({ q: 'helene oneil' })).toEqual(['max@solem.fr']);
    expect(await emails({ q: '  jean pierre ' })).toEqual(['tom@solem.fr']);
    expect(await emails({ q: 'léa lea@' })).toEqual(['lea@solem.fr']);
    expect(await emails({ q: 'léa inconnu' })).toEqual([]);
  });

  it('finds role, extra permission and email status by their label', async () => {
    const { emails } = await setup();
    expect(await emails({ q: 'admin' })).toEqual(['tom@solem.fr', 'max@solem.fr']);
    expect(await emails({ q: 'super admin' })).toEqual(['max@solem.fr']);
    expect(await emails({ q: 'voir les utilisateurs' })).toEqual(['tom@solem.fr']);
    expect(await emails({ q: 'confirmé' })).toEqual(['max@solem.fr']);
    expect(await emails({ q: 'attente' })).toEqual(['tom@solem.fr', 'lea@solem.fr']);
  });

  it('filters by role, email status and extra permissions', async () => {
    const { find, emails } = await setup();
    expect(await emails({ roles: ['admin', 'user'] })).toEqual(['tom@solem.fr', 'lea@solem.fr']);
    expect(await emails({ roles: 'super_admin' })).toEqual(['max@solem.fr']);
    expect(await emails({ emailVerified: 'verified' })).toEqual(['max@solem.fr']);
    expect(await emails({ emailVerified: 'pending', extraPermissions: 'without' })).toEqual(['lea@solem.fr']);
    expect(await emails({ extraPermissions: 'with' })).toEqual(['tom@solem.fr']);
    expect(await find({ extraPermissions: 'with' })).toMatchObject({ total: 1, overall: 3 });
  });

  it('falls back to the last page that exists', async () => {
    const { find } = await setup();
    expect(await find({ page: '9', pageSize: '10' })).toMatchObject({ page: 1, total: 3 });
    expect(await find({ q: 'personne', page: 3 })).toMatchObject({ page: 1, total: 0, items: [] });
  });

  it('refuses a page size outside the list', () => {
    expect(findUsersQuerySchema.safeParse({ pageSize: 1000 }).success).toBe(false);
    expect(findUsersQuerySchema.parse({ desc: 'true' }).desc).toBe(true);
  });
});
