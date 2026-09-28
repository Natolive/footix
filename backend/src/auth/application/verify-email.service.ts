import { Injectable } from '@nestjs/common';
import type { VerifyEmailDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import { InvalidVerificationLinkError } from '../domain/errors/invalid-verification-link.error.js';
import { VerificationPasswordMismatchError } from '../domain/errors/verification-password-mismatch.error.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import { hashToken } from './hash-token.js';
import { OpenSessionService } from './open-session.service.js';
import type { OpenedSession } from './opened-session.js';

@Injectable()
export class VerifyEmailService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly openSession: OpenSessionService,
  ) {}

  // Lien (preuve de la boîte mail) + mot de passe (preuve d'être l'auteur de l'inscription) : un tiers qui s'inscrit
  // avec l'email d'un collègue ne récupère jamais le compte, même si le collègue ouvre le lien. Connecte dans la foulée.
  async execute({ token, password, remember = false }: VerifyEmailDto): Promise<OpenedSession> {
    const found = await this.users.findByVerificationTokenHash(hashToken(token));
    if (!found || found.emailVerificationExpiresAt! <= new Date()) throw new InvalidVerificationLinkError();
    // Mauvais mot de passe : le lien reste valable, pour réessayer.
    if (!(await this.hasher.verify(password, found.passwordHash))) throw new VerificationPasswordMismatchError();
    const user = orThrow(
      await this.users.update(found.id, { emailVerifiedAt: new Date(), emailVerificationTokenHash: null, emailVerificationExpiresAt: null }),
      UserNotFoundError,
    );
    return this.openSession.execute(user, remember);
  }
}
