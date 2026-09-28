import type { Role } from '@footix/shared';
import type { NewRolePermission } from '@src/roles/domain/new-role-permission.entity.js';
import type { RolePermission } from '@src/roles/domain/role-permission.entity.js';
import { RolePermissionRepository } from '@src/roles/domain/role-permission.repository.js';
import { InMemoryRepository } from './in-memory.repository.js';

export class InMemoryRolePermissionRepository
  extends InMemoryRepository<RolePermission, NewRolePermission>
  implements RolePermissionRepository
{
  async findByRole(role: Role) {
    return this.rows.filter((r) => r.role === role);
  }

  async replaceForRole(role: Role, rows: NewRolePermission[]) {
    this.rows = this.rows.filter((r) => r.role !== role);
    for (const row of rows) await this.create(row);
  }
}
