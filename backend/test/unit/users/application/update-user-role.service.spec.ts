import { UpdateUserRoleService } from '@src/users/application/update-user-role.service.js';
import { OwnAccessLockedError } from '@src/users/domain/errors/own-access-locked.error.js';
import { SuperAdminOnlyError } from '@src/users/domain/errors/super-admin-only.error.js';
import { setupUsers } from './setup.js';

describe('UpdateUserRoleService', () => {
  it('lets a super admin name another super admin', async () => {
    const { users, admin, lea } = await setupUsers();
    expect(await new UpdateUserRoleService(users).execute(admin, lea.id, { role: 'super_admin' })).toMatchObject({ role: 'super_admin' });
  });

  it('never changes its own role', async () => {
    const { users, admin } = await setupUsers();
    await expect(new UpdateUserRoleService(users).execute(admin, admin.id, { role: 'user' })).rejects.toBeInstanceOf(OwnAccessLockedError);
  });

  it('keeps super_admin in the hands of super admins', async () => {
    const { users, admin, manager, lea } = await setupUsers();
    const updateRole = new UpdateUserRoleService(users);
    await expect(updateRole.execute(manager, lea.id, { role: 'super_admin' })).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await expect(updateRole.execute(manager, admin.id, { role: 'user' })).rejects.toBeInstanceOf(SuperAdminOnlyError);
  });
});
