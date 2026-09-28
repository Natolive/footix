import { FindUsersService } from '@src/users/application/find-users.service.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';
import { person } from './setup.js';

describe('FindUsersService', () => {
  it('lists everyone sorted by name, without the password hash', async () => {
    const users = new InMemoryUserRepository();
    await users.create(person('lea@solem.fr'));
    await users.create({ ...person('max@solem.fr'), lastName: 'Allard' });
    const list = await new FindUsersService(users).execute();
    expect(list.map((u) => u.email)).toEqual(['max@solem.fr', 'lea@solem.fr']);
    expect(list[0]).not.toHaveProperty('passwordHash');
  });
});
