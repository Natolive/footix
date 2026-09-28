import { ConflictError } from '@src/common/domain/errors/conflict.error.js';
import { DrizzleUserRepository } from '@src/users/infrastructure/drizzle-user.repository.js';
import { users as usersTable } from '@src/users/infrastructure/user.table.js';
import { connect, person } from '@test/integration/database.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

// Méthodes communes de DrizzleRepository, vues à travers le repository des utilisateurs.
describe('DrizzleRepository', () => {
  const db = connect();
  const users = new DrizzleUserRepository(db);
  const email = `int-repo-${Date.now()}@solem.fr`;

  afterAll(async () => {
    await db.delete(usersTable).where(eq(usersTable.email, email));
    await db.$client.end();
  });

  it('answers null or false for an unknown id', async () => {
    const id = randomUUID();
    expect(await users.findById(id)).toBeNull();
    expect(await users.update(id, { firstName: 'Léna' })).toBeNull();
    expect(await users.delete(id)).toBe(false);
  });

  it('creates, reads, updates and deletes a row', async () => {
    const { id } = await users.create(person(`other-${email}`));
    expect(await users.findById(id)).toMatchObject({ email: `other-${email}`, role: 'user' });
    expect(await users.update(id, { firstName: 'Léna' })).toMatchObject({ firstName: 'Léna' });
    expect(await users.delete(id)).toBe(true);
  });

  it('turns a unique violation into a ConflictError, on create as on update', async () => {
    const lea = await users.create(person(email));
    await expect(users.create(person(email))).rejects.toBeInstanceOf(ConflictError);
    const other = await users.create(person(`second-${email}`));
    await expect(users.update(other.id, { email: lea.email })).rejects.toBeInstanceOf(ConflictError);
    await users.delete(other.id);
  });

  it('lets any other database error through', async () => {
    const error = await users.create({ ...person(`null-${email}`), firstName: null as unknown as string }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(ConflictError);
  });

  it('answers null for an email or a token nobody has', async () => {
    expect(await users.findByEmail(`nobody-${email}`)).toBeNull();
    expect(await users.findByVerificationTokenHash('nope')).toBeNull();
    expect(await users.findByPasswordResetTokenHash('nope')).toBeNull();
  });
});
