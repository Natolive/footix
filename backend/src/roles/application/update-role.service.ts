import { Injectable } from '@nestjs/common';
import { PERMISSIONS, type Role, type RoleDto, type UpdateRoleDto } from '@footix/shared';
import { SuperAdminLockedError } from '../domain/errors/super-admin-locked.error.js';
import { RolePermissionRepository } from '../domain/role-permission.repository.js';
import { toRoleDto } from '../domain/to-role-dto.js';
import { RolePermissionsService } from './role-permissions.service.js';

@Injectable()
export class UpdateRoleService {
  constructor(
    private readonly repository: RolePermissionRepository,
    private readonly rolePermissions: RolePermissionsService,
  ) {}

  async execute(role: Role, { permissions }: UpdateRoleDto): Promise<RoleDto> {
    if (role === 'super_admin') throw new SuperAdminLockedError();
    await this.repository.replaceForRole(
      role,
      PERMISSIONS.map((permission) => ({ role, permission, granted: permissions.includes(permission) })),
    );
    return toRoleDto(role, await this.rolePermissions.execute(role));
  }
}
