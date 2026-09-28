import { Injectable } from '@nestjs/common';
import type { ResetPasswordDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import { InvalidResetLinkError } from '../domain/errors/invalid-reset-link.error.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import { SessionRepository } from '../domain/session.repository.js';
import { hashToken } from './hash-token.js';
import { OpenSessionService } from './open-session.service.js';
import type { OpenedSession } from './opened-session.js';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionRepository,
    private readonly openSession: OpenSessionService,
  ) {}

  // Le lien prouve la boîte mail : il confirme aussi l'email d'un compte pas encore confirmé.
  // Déconnecte partout (mot de passe peut-être compromis), puis connecte ici.
  async execute({ token, password, remember = false }: ResetPasswordDto): Promise<OpenedSession> {
    const found = await this.users.findByPasswordResetTokenHash(hashToken(token));
    if (!found || found.passwordResetExpiresAt! <= new Date()) throw new InvalidResetLinkError();
    const user = orThrow(
      await this.users.update(found.id, {
        passwordHash: await this.hasher.hash(password),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        emailVerifiedAt: found.emailVerifiedAt ?? new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      }),
      UserNotFoundError,
    );
    await this.sessions.deleteByUserId(user.id);
    return this.openSession.execute(user, remember);
  }
}
