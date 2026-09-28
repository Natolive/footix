import { toPublicUser } from '@src/users/domain/to-public-user.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

export const person = (email: string) => ({ email, firstName: 'Léa', lastName: 'Dupont', passwordHash: 'x' });

// Comptes de départ : un super admin, un utilisateur sans droit particulier (qui administre dans les tests) et Léa.
export async function setupUsers() {
  const users = new InMemoryUserRepository();
  const admin = toPublicUser(await users.create({ ...person('admin@solem.fr'), role: 'super_admin' }));
  const manager = toPublicUser(await users.create(person('manager@solem.fr')));
  const lea = await users.create(person('lea@solem.fr'));
  return { users, admin, manager, lea };
}
