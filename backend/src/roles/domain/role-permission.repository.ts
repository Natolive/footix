import type { Role } from '@footix/shared';
import { BaseRepository } from '../../common/domain/base.repository.js';
import type { NewRolePermission } from './new-role-permission.entity.js';
import type { RolePermission } from './role-permission.entity.js';

export abstract class RolePermissionRepository extends BaseRepository<RolePermission, NewRolePermission> {
  abstract findByRole(role: Role): Promise<RolePermission[]>;
  // Remplace d'un coup tous les droits enregistrés du rôle.
  abstract replaceForRole(role: Role, rows: NewRolePermission[]): Promise<void>;
}
