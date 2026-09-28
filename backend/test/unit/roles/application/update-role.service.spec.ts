import { RolePermissionsService } from '@src/roles/application/role-permissions.service.js';
import { UpdateRoleService } from '@src/roles/application/update-role.service.js';
import { SuperAdminLockedError } from '@src/roles/domain/errors/super-admin-locked.error.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';

describe('UpdateRoleService', () => {
  let rolePermissions: RolePermissionsService;
  let updateRole: UpdateRoleService;

  beforeEach(() => {
    const repository = new InMemoryRolePermissionRepository();
    rolePermissions = new RolePermissionsService(repository);
    updateRole = new UpdateRoleService(repository, rolePermissions);
  });

  it('applies the permissions saved by an admin', async () => {
    expect(await updateRole.execute('user', { permissions: ['roles.update'] })).toMatchObject({ permissions: ['roles.update'] });
    expect(await rolePermissions.execute('user')).toEqual(['roles.update']);
    await updateRole.execute('user', { permissions: [] });
    expect(await rolePermissions.execute('user')).toEqual([]);
  });

  it('never lets super_admin lose a permission', async () => {
    await expect(updateRole.execute('super_admin', { permissions: [] })).rejects.toBeInstanceOf(SuperAdminLockedError);
  });
});
