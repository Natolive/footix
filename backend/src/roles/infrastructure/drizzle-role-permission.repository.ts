import { Inject, Injectable } from '@nestjs/common';
import type { Role } from '@footix/shared';
import { eq } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import type { NewRolePermission } from '../domain/new-role-permission.entity.js';
import type { RolePermission } from '../domain/role-permission.entity.js';
import { RolePermissionRepository } from '../domain/role-permission.repository.js';
import { rolePermissions } from './role-permission.table.js';

@Injectable()
export class DrizzleRolePermissionRepository
  extends DrizzleRepository<typeof rolePermissions, RolePermission, NewRolePermission>
  implements RolePermissionRepository
{
  constructor(@Inject(DB) db: Database) {
    super(db, rolePermissions);
  }

  findByRole(role: Role): Promise<RolePermission[]> {
    return this.db.select().from(rolePermissions).where(eq(rolePermissions.role, role));
  }

  async replaceForRole(role: Role, rows: NewRolePermission[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.role, role));
      if (rows.length) await tx.insert(rolePermissions).values(rows);
    });
  }
}
