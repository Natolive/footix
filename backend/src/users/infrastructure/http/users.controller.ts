import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import {
  type DayAvailabilityDto,
  updateUserPermissionsSchema,
  updateUserRoleSchema,
  updateUserSchema,
  type ManagedUserDto,
  type UpdateUserDto,
  type UpdateUserPermissionsDto,
  type UpdateUserRoleDto,
  type UserDto,
} from '@footix/shared';
import { Authorize } from '../../../auth/infrastructure/http/authorize.decorator.js';
import { CurrentUser } from '../../../auth/infrastructure/http/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { DeleteUserService } from '../../application/delete-user.service.js';
import { FindAvailabilityService } from '../../application/find-availability.service.js';
import { FindUsersService } from '../../application/find-users.service.js';
import { UpdateUserPermissionsService } from '../../application/update-user-permissions.service.js';
import { UpdateUserRoleService } from '../../application/update-user-role.service.js';
import { UpdateUserService } from '../../application/update-user.service.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly findUsersService: FindUsersService,
    private readonly findAvailabilityService: FindAvailabilityService,
    private readonly updateUserService: UpdateUserService,
    private readonly updateUserRoleService: UpdateUserRoleService,
    private readonly updateUserPermissionsService: UpdateUserPermissionsService,
    private readonly deleteUserService: DeleteUserService,
  ) {}

  @Get()
  @Authorize('users.read')
  findAll(): Promise<ManagedUserDto[]> {
    return this.findUsersService.execute();
  }

  @Get('availability')
  @Authorize('planning.read_availability')
  findAvailability(): Promise<DayAvailabilityDto[]> {
    return this.findAvailabilityService.execute();
  }

  @Patch(':id')
  @Authorize('users.update')
  update(
    @CurrentUser() actor: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
  ): Promise<ManagedUserDto> {
    return this.updateUserService.execute(actor, id, dto);
  }

  @Put(':id/role')
  @Authorize('users.update_role')
  updateRole(
    @CurrentUser() actor: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema)) dto: UpdateUserRoleDto,
  ): Promise<ManagedUserDto> {
    return this.updateUserRoleService.execute(actor, id, dto);
  }

  @Put(':id/permissions')
  @Authorize('users.update_permissions')
  updatePermissions(
    @CurrentUser() actor: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserPermissionsSchema)) dto: UpdateUserPermissionsDto,
  ): Promise<ManagedUserDto> {
    return this.updateUserPermissionsService.execute(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize('users.delete')
  delete(@CurrentUser() actor: UserDto, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteUserService.execute(actor, id);
  }
}
