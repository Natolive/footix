import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ROLES, updateRoleSchema, type Role, type RoleDto, type UpdateRoleDto } from '@footix/shared';
import { z } from 'zod';
import { Authorize } from '../../../auth/infrastructure/http/authorize.decorator.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { FindRolesService } from '../../application/find-roles.service.js';
import { UpdateRoleService } from '../../application/update-role.service.js';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly findRolesService: FindRolesService,
    private readonly updateRoleService: UpdateRoleService,
  ) {}

  @Get()
  @Authorize('roles.read')
  findAll(): Promise<RoleDto[]> {
    return this.findRolesService.execute();
  }

  @Put(':role')
  @Authorize('roles.update')
  update(
    @Param('role', new ZodValidationPipe(z.enum(ROLES))) role: Role,
    @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    return this.updateRoleService.execute(role, dto);
  }
}
