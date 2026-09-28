import { Module } from '@nestjs/common';
import { FindRolesService } from './application/find-roles.service.js';
import { RolePermissionsService } from './application/role-permissions.service.js';
import { UpdateRoleService } from './application/update-role.service.js';
import { RolePermissionRepository } from './domain/role-permission.repository.js';
import { DrizzleRolePermissionRepository } from './infrastructure/drizzle-role-permission.repository.js';
import { RolesController } from './infrastructure/http/roles.controller.js';

// Les routes sont protégées par le guard global d'AuthModule : pas besoin de l'importer ici.
@Module({
  controllers: [RolesController],
  providers: [
    FindRolesService,
    RolePermissionsService,
    UpdateRoleService,
    { provide: RolePermissionRepository, useClass: DrizzleRolePermissionRepository },
  ],
  exports: [RolePermissionsService],
})
export class RolesModule {}
