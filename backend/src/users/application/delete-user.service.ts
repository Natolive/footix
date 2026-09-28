import { Injectable } from '@nestjs/common';
import type { PublicUser } from '../domain/public-user.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { findManageableUser } from './find-manageable-user.js';

@Injectable()
export class DeleteUserService {
  constructor(private readonly users: UserRepository) {}

  // Ses réponses, ses invités et ses sessions partent avec lui (cascade en base).
  async execute(actor: PublicUser, id: string): Promise<void> {
    await findManageableUser(this.users, actor, id, { self: false });
    await this.users.delete(id);
  }
}
