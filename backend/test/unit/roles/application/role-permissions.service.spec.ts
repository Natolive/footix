import { PERMISSIONS } from '@footix/shared';
import { RolePermissionsService } from '@src/roles/application/role-permissions.service.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';

describe('RolePermissionsService', () => {
  it('gives user everything but administration, admin the events on top, super_admin everything', async () => {
    const rolePermissions = new RolePermissionsService(new InMemoryRolePermissionRepository());
    expect(await rolePermissions.execute('user')).toEqual(['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'events.read', 'events.participate', 'events.invite_guest']);
    expect(await rolePermissions.execute('super_admin')).toEqual([...PERMISSIONS]);
    expect(await rolePermissions.execute('admin')).toEqual([
      'profile.read',
      'profile.update',
      'profile.change_password',
      'profile.update_availability',
      'profile.complete_onboarding',
      'events.read',
      'events.participate',
      'events.invite_guest',
      'planning.create_event',
      'planning.update_event',
      'planning.delete_event',
      'planning.read_availability',
    ]);
  });
});
