import { Injectable } from '@nestjs/common';
import type { ManagedUserDto, UpdateUserPermissionsDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { UserNotFoundError } from '../domain/errors/user-not-found.error.js';
import type { PublicUser } from '../domain/public-user.entity.js';
import { toManagedUser } from '../domain/to-managed-user.js';
import { UserRepository } from '../domain/user.repository.js';
import { findManageableUser } from './find-manageable-user.js';

@Injectable()
export class UpdateUserPermissionsService {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: PublicUser, id: string, { extraPermissions }: UpdateUserPermissionsDto): Promise<ManagedUserDto> {
    await findManageableUser(this.users, actor, id, { self: false });
    return toManagedUser(orThrow(await this.users.update(id, { extraPermissions }), UserNotFoundError));
  }
}
