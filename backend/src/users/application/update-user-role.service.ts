import { Injectable } from '@nestjs/common';
import type { ManagedUserDto, UpdateUserRoleDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { SuperAdminOnlyError } from '../domain/errors/super-admin-only.error.js';
import { UserNotFoundError } from '../domain/errors/user-not-found.error.js';
import type { PublicUser } from '../domain/public-user.entity.js';
import { toManagedUser } from '../domain/to-managed-user.js';
import { UserRepository } from '../domain/user.repository.js';
import { findManageableUser } from './find-manageable-user.js';

@Injectable()
export class UpdateUserRoleService {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: PublicUser, id: string, { role }: UpdateUserRoleDto): Promise<ManagedUserDto> {
    await findManageableUser(this.users, actor, id, { self: false });
    if (role === 'super_admin' && actor.role !== 'super_admin') throw new SuperAdminOnlyError();
    return toManagedUser(orThrow(await this.users.update(id, { role }), UserNotFoundError));
  }
}
