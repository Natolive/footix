import { Injectable } from '@nestjs/common';
import { ROLES, type RoleDto } from '@footix/shared';
import { toRoleDto } from '../domain/to-role-dto.js';
import { RolePermissionsService } from './role-permissions.service.js';

@Injectable()
export class FindRolesService {
  constructor(private readonly rolePermissions: RolePermissionsService) {}

  execute(): Promise<RoleDto[]> {
    return Promise.all(ROLES.map(async (role) => toRoleDto(role, await this.rolePermissions.execute(role))));
  }
}
