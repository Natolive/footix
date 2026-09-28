import { DeleteUserService } from '@src/users/application/delete-user.service.js';
import { OwnAccessLockedError } from '@src/users/domain/errors/own-access-locked.error.js';
import { SuperAdminOnlyError } from '@src/users/domain/errors/super-admin-only.error.js';
import { setupUsers } from './setup.js';

describe('DeleteUserService', () => {
  it('deletes someone else, never oneself, and a super admin only by a super admin', async () => {
    const { users, admin, manager, lea } = await setupUsers();
    const deleteUser = new DeleteUserService(users);
    await expect(deleteUser.execute(manager, manager.id)).rejects.toBeInstanceOf(OwnAccessLockedError);
    await expect(deleteUser.execute(manager, admin.id)).rejects.toBeInstanceOf(SuperAdminOnlyError);
    await deleteUser.execute(manager, lea.id);
    expect(users.rows.map((u) => u.email)).toEqual(['admin@solem.fr', 'manager@solem.fr']);
  });
});
