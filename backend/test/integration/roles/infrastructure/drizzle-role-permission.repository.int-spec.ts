import { PERMISSIONS } from '@footix/shared';
import { RolePermissionsService } from '@src/roles/application/role-permissions.service.js';
import { DrizzleRolePermissionRepository } from '@src/roles/infrastructure/drizzle-role-permission.repository.js';
import { connect } from '@test/integration/database.js';

// Base partagée avec les autres tests et le dev : les droits effectifs de `user` ne changent jamais pendant le test,
// et ce qui était enregistré est remis à la fin.
describe('DrizzleRolePermissionRepository', () => {
  const db = connect();
  const repository = new DrizzleRolePermissionRepository(db);
  const rolePermissions = new RolePermissionsService(repository);
  let saved: Awaited<ReturnType<typeof repository.findByRole>>;

  beforeAll(async () => {
    saved = await repository.findByRole('user');
  });

  afterAll(async () => {
    await repository.replaceForRole('user', saved.map(({ role, permission, granted }) => ({ role, permission, granted })));
    await db.$client.end();
  });

  it('replaces every saved permission of a role at once', async () => {
    const effective = await rolePermissions.execute('user');
    const rows = PERMISSIONS.map((permission) => ({ role: 'user' as const, permission, granted: effective.includes(permission) }));
    await repository.replaceForRole('user', rows);
    expect((await repository.findByRole('user')).map(({ permission, granted }) => ({ role: 'user', permission, granted }))).toEqual(
      expect.arrayContaining(rows),
    );
    expect(await repository.findByRole('user')).toHaveLength(PERMISSIONS.length);
    expect(await rolePermissions.execute('user')).toEqual(effective);
  });

  it('can clear a role, back to the defaults of the code', async () => {
    await repository.replaceForRole('user', []);
    expect(await repository.findByRole('user')).toEqual([]);
  });
});
