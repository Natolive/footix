import { UpdateUserService } from '@src/users/application/update-user.service.js';
import { EmailAlreadyUsedError } from '@src/users/domain/errors/email-already-used.error.js';
import { SuperAdminOnlyError } from '@src/users/domain/errors/super-admin-only.error.js';
import { person, setupUsers } from './setup.js';

describe('UpdateUserService', () => {
  it('updates the name and email of someone else', async () => {
    const { users, admin, lea } = await setupUsers();
    expect(await new UpdateUserService(users).execute(admin, lea.id, { email: 'lea.d@solem.fr', firstName: 'Léa', lastName: 'Durand' })).toMatchObject({
      email: 'lea.d@solem.fr',
      lastName: 'Durand',
    });
  });

  it('refuses an email already used by another account', async () => {
    const { users, admin, lea } = await setupUsers();
    await expect(new UpdateUserService(users).execute(admin, lea.id, person('admin@solem.fr'))).rejects.toBeInstanceOf(EmailAlreadyUsedError);
  });

  it('lets an admin edit their own profile', async () => {
    const { users, admin } = await setupUsers();
    expect(await new UpdateUserService(users).execute(admin, admin.id, { ...person('admin@solem.fr'), firstName: 'Max' })).toMatchObject({ firstName: 'Max' });
  });

  it('leaves a super admin to super admins', async () => {
    const { users, admin, manager } = await setupUsers();
    await expect(new UpdateUserService(users).execute(manager, admin.id, person('admin@solem.fr'))).rejects.toBeInstanceOf(SuperAdminOnlyError);
  });
});
