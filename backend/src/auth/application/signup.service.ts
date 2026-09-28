import { Injectable } from '@nestjs/common';
import type { SignupDto } from '@footix/shared';
import { randomBytes } from 'node:crypto';
import { orThrow } from '../../common/application/or-throw.js';
import { AssertEmailAllowedService } from '../../email-domains/application/assert-email-allowed.service.js';
import { emailVerificationMail } from '../../mail/application/templates/email-verification.mail.js';
import { Mailer } from '../../mail/domain/mailer.js';
import { EmailAlreadyUsedError } from '../../users/domain/errors/email-already-used.error.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import type { AuthenticatedUser } from './authenticated-user.js';
import { BuildAuthenticatedUserService } from './build-authenticated-user.service.js';
import { hashToken } from './hash-token.js';

export const EMAIL_VERIFICATION_TTL = 48 * 60 * 60 * 1000;

@Injectable()
export class SignupService {
  constructor(
    private readonly assertEmailAllowed: AssertEmailAllowedService,
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly mailer: Mailer,
    private readonly buildAuthenticatedUser: BuildAuthenticatedUserService,
  ) {}

  // Compte inactif tant que l'email n'est pas confirmé par le lien envoyé.
  // Se réinscrire avec un email pas encore confirmé remplace le compte et renvoie un lien (email perdu, faute de frappe) :
  // sans risque, car confirmer demande aussi le mot de passe de la dernière inscription (voir VerifyEmailService).
  async execute({ password, ...dto }: SignupDto): Promise<AuthenticatedUser> {
    await this.assertEmailAllowed.execute(dto.email);
    const existing = await this.users.findByEmail(dto.email);
    if (existing?.emailVerifiedAt) throw new EmailAlreadyUsedError();

    const token = randomBytes(32).toString('base64url');
    const data = {
      ...dto,
      passwordHash: await this.hasher.hash(password),
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL),
    };
    const user = existing ? orThrow(await this.users.update(existing.id, data), UserNotFoundError) : await this.users.create(data);
    await this.mailer.send(emailVerificationMail(user, token));
    return this.buildAuthenticatedUser.execute(user);
  }
}
