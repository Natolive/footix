import { Injectable } from '@nestjs/common';
import type { ManagedUserDto, UpdateUserDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { EmailAlreadyUsedError } from '../domain/errors/email-already-used.error.js';
import { UserNotFoundError } from '../domain/errors/user-not-found.error.js';
import type { PublicUser } from '../domain/public-user.entity.js';
import { toManagedUser } from '../domain/to-managed-user.js';
import { UserRepository } from '../domain/user.repository.js';
import { findManageableUser } from './find-manageable-user.js';

@Injectable()
export class UpdateUserService {
  constructor(private readonly users: UserRepository) {}

  async execute(actor: PublicUser, id: string, dto: UpdateUserDto): Promise<ManagedUserDto> {
    await findManageableUser(this.users, actor, id);
    const owner = await this.users.findByEmail(dto.email);
    if (owner && owner.id !== id) throw new EmailAlreadyUsedError();
    return toManagedUser(orThrow(await this.users.update(id, dto), UserNotFoundError));
  }
}
