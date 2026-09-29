import type { UserSort } from '@footix/shared';
import type { UserFilter } from '@src/users/domain/user-filter.entity.js';
import { DrizzleUserRepository } from '@src/users/infrastructure/drizzle-user.repository.js';
import { users as usersTable } from '@src/users/infrastructure/user.table.js';
import { connect, person } from '@test/integration/database.js';
import { inArray } from 'drizzle-orm';

describe('DrizzleUserRepository', () => {
  const db = connect();
  const users = new DrizzleUserRepository(db);
  const stamp = String(Date.now());
  const emails = ['lea', 'max', 'tom'].map((n) => `int-user-${n}-${stamp}@solem.fr`);
  const [lea, max, tom] = emails;

  beforeAll(async () => {
    await users.create({ ...person(lea), lastName: `Dupont${stamp}` });
    await users.create({ ...person(max), firstName: 'Hélène', lastName: `O'Neil-${stamp}`, role: 'super_admin' });
    await users.create({ ...person(tom), firstName: 'Jean-Pierre', lastName: `Allard ${stamp}`, role: 'admin', extraPermissions: ['users.read'] });
    await db.update(usersTable).set({ emailVerifiedAt: new Date() }).where(inArray(usersTable.email, [max]));
  });

  afterAll(async () => {
    await db.delete(usersTable).where(inArray(usersTable.email, emails));
    await db.$client.end();
  });

  // Le mot `stamp` isole les comptes de ce test des autres comptes de la base.
  const term = (text: string, labelled: Partial<UserFilter['terms'][number]> = {}) => ({ text, roles: [], permissions: [], emailVerified: [], ...labelled });
  const filter = (more: Partial<UserFilter> = {}): UserFilter => ({ terms: [term(stamp)], roles: [], emailVerified: null, withExtraPermissions: null, ...more });
  const page = async (f: UserFilter, sort: UserSort = 'name', desc = false, offset = 0, limit = 10) =>
    (await users.findPage(f, { sort, desc, offset, limit })).map((u) => u.email);

  it('searches names and emails without accents or punctuation', async () => {
    expect(await page(filter({ terms: [term(stamp), term('helene'), term(`oneil${stamp}`)] }))).toEqual([max]);
    expect(await page(filter({ terms: [term(stamp), term('jeanpierre')] }))).toEqual([tom]);
    expect(await page(filter({ terms: [term(`intuserlea${stamp}@`)] }))).toEqual([lea]);
    expect(await page(filter({ terms: [term(stamp), term('nobody', { roles: ['admin'], permissions: ['users.read'], emailVerified: [true] })] }))).toEqual([tom, max]);
  });

  it('filters and counts', async () => {
    expect(await page(filter({ roles: ['user', 'admin'] }))).toEqual([tom, lea]);
    expect(await page(filter({ emailVerified: true }))).toEqual([max]);
    expect(await page(filter({ emailVerified: false, withExtraPermissions: false }))).toEqual([lea]);
    expect(await page(filter({ withExtraPermissions: true }))).toEqual([tom]);
    const { total, overall } = await users.count(filter({ withExtraPermissions: true }));
    expect(total).toBe(1);
    expect(overall).toBeGreaterThanOrEqual(3);
    expect((await users.count(filter({ terms: [] }))).total).toBe(overall);
  });

  it('sorts by each column, then by name, and paginates', async () => {
    expect(await page(filter())).toEqual([tom, lea, max]);
    expect(await page(filter(), 'name', true)).toEqual([max, lea, tom]);
    expect(await page(filter(), 'email')).toEqual([lea, max, tom]);
    expect(await page(filter(), 'emailVerified', true)).toEqual([max, tom, lea]);
    expect(await page(filter(), 'role')).toEqual([lea, tom, max]);
    expect(await page(filter(), 'extraPermissions', true)).toEqual([tom, lea, max]);
    expect(await page(filter(), 'createdAt')).toEqual([lea, max, tom]);
    expect(await page(filter(), 'name', false, 1, 1)).toEqual([lea]);
  });
});
