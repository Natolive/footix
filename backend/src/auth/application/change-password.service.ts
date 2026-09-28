import { Injectable } from '@nestjs/common';
import type { ChangePasswordDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import { WrongCurrentPasswordError } from '../domain/errors/wrong-current-password.error.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import { SessionRepository } from '../domain/session.repository.js';
import type { AuthenticatedUser } from './authenticated-user.js';
import { hashToken } from './hash-token.js';

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionRepository,
  ) {}

  // Déconnecte les autres sessions (mot de passe peut-être compromis), garde celle qui fait la demande.
  async execute(user: AuthenticatedUser, token: string | undefined, { currentPassword, password }: ChangePasswordDto): Promise<void> {
    const { passwordHash } = orThrow(await this.users.findById(user.id), UserNotFoundError);
    if (!(await this.hasher.verify(currentPassword, passwordHash))) throw new WrongCurrentPasswordError();
    await this.users.update(user.id, { passwordHash: await this.hasher.hash(password) });
    await this.sessions.deleteByUserId(user.id, token && hashToken(token));
  }
}
