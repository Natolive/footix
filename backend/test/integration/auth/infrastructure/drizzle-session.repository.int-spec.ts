import { DrizzleSessionRepository } from '@src/auth/infrastructure/drizzle-session.repository.js';
import { DrizzleUserRepository } from '@src/users/infrastructure/drizzle-user.repository.js';
import { users as usersTable } from '@src/users/infrastructure/user.table.js';
import { connect, person } from '@test/integration/database.js';
import { eq } from 'drizzle-orm';

describe('DrizzleSessionRepository', () => {
  const db = connect();
  const sessions = new DrizzleSessionRepository(db);
  const email = `int-session-${Date.now()}@solem.fr`;
  const HOUR = 60 * 60 * 1000;

  afterAll(async () => {
    // Les sessions partent en cascade avec le compte.
    await db.delete(usersTable).where(eq(usersTable.email, email));
    await db.$client.end();
  });

  it('finds a session only while it is valid, and deletes all but the one kept', async () => {
    const { id: userId } = await new DrizzleUserRepository(db).create(person(email));
    const now = new Date();
    await sessions.create({ userId, tokenHash: `here-${email}`, expiresAt: new Date(now.getTime() + HOUR) });
    await sessions.create({ userId, tokenHash: `elsewhere-${email}`, expiresAt: new Date(now.getTime() + HOUR) });
    await sessions.create({ userId, tokenHash: `old-${email}`, expiresAt: new Date(now.getTime() - HOUR) });

    expect(await sessions.findValidByTokenHash(`here-${email}`, now)).toMatchObject({ userId });
    expect(await sessions.findValidByTokenHash(`old-${email}`, now)).toBeNull();
    expect(await sessions.findValidByTokenHash('unknown', now)).toBeNull();

    await sessions.deleteByUserId(userId, `here-${email}`);
    expect(await sessions.findValidByTokenHash(`elsewhere-${email}`, now)).toBeNull();
    await sessions.deleteByTokenHash(`here-${email}`);
    expect(await sessions.findValidByTokenHash(`here-${email}`, now)).toBeNull();
  });
});
