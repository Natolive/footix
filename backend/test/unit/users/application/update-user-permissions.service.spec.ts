import { UpdateUserPermissionsService } from '@src/users/application/update-user-permissions.service.js';
import { OwnAccessLockedError } from '@src/users/domain/errors/own-access-locked.error.js';
import { SuperAdminOnlyError } from '@src/users/domain/errors/super-admin-only.error.js';
import { setupUsers } from './setup.js';

describe('UpdateUserPermissionsService', () => {
  it('adds permissions to someone else', async () => {
    const { users, manager, lea } = await setupUsers();
    expect(await new UpdateUserPermissionsService(users).execute(manager, lea.id, { extraPermissions: ['users.read'] })).toMatchObject({
      extraPermissions: ['users.read'],
    });
  });

  it('never changes its own permissions, nor those of a super admin without being one', async () => {
    const { users, admin, manager } = await setupUsers();
    const updatePermissions = new UpdateUserPermissionsService(users);
    await expect(updatePermissions.execute(admin, admin.id, { extraPermissions: [] })).rejects.toBeInstanceOf(OwnAccessLockedError);
    await expect(updatePermissions.execute(manager, admin.id, { extraPermissions: [] })).rejects.toBeInstanceOf(SuperAdminOnlyError);
  });
});
