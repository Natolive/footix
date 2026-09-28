import { FindRolesService } from '@src/roles/application/find-roles.service.js';
import { RolePermissionsService } from '@src/roles/application/role-permissions.service.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';

describe('FindRolesService', () => {
  it('lists every role, super_admin not editable', async () => {
    const roles = await new FindRolesService(new RolePermissionsService(new InMemoryRolePermissionRepository())).execute();
    expect(roles.map((r) => [r.role, r.editable])).toEqual([
      ['user', true],
      ['admin', true],
      ['super_admin', false],
    ]);
  });
});
