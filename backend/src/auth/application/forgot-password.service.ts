import { Injectable } from '@nestjs/common';
import type { ForgotPasswordDto } from '@footix/shared';
import { randomBytes } from 'node:crypto';
import { passwordResetMail } from '../../mail/application/templates/password-reset.mail.js';
import { Mailer } from '../../mail/domain/mailer.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import { hashToken } from './hash-token.js';

export const PASSWORD_RESET_TTL = 60 * 60 * 1000;

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly users: UserRepository,
    private readonly mailer: Mailer,
  ) {}

  // Même réponse que le compte existe ou non. Un nouveau lien remplace le précédent.
  async execute({ email }: ForgotPasswordDto): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return;
    const token = randomBytes(32).toString('base64url');
    await this.users.update(user.id, {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_TTL),
    });
    await this.mailer.send(passwordResetMail(user, token));
  }
}
