import { Injectable } from '@nestjs/common';
import type { LoginDto } from '@footix/shared';
import { randomBytes } from 'node:crypto';
import { UserRepository } from '../../users/domain/user.repository.js';
import { EmailNotVerifiedError } from '../domain/errors/email-not-verified.error.js';
import { InvalidCredentialsError } from '../domain/errors/invalid-credentials.error.js';
import { PasswordHasher } from '../domain/password-hasher.js';
import { OpenSessionService } from './open-session.service.js';
import type { OpenedSession } from './opened-session.js';

@Injectable()
export class LoginService {
  private dummyHash?: Promise<string>;

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly openSession: OpenSessionService,
  ) {}

  async execute({ email, password, remember = false }: LoginDto): Promise<OpenedSession> {
    const user = await this.users.findByEmail(email);
    // Email inconnu : on vérifie quand même un hash pour que le temps de réponse ne trahisse pas l'existence du compte.
    this.dummyHash ??= this.hasher.hash(randomBytes(16).toString('hex'));
    const valid = await this.hasher.verify(password, user?.passwordHash ?? (await this.dummyHash));
    if (!user || !valid) throw new InvalidCredentialsError();
    if (!user.emailVerifiedAt) throw new EmailNotVerifiedError();
    return this.openSession.execute(user, remember);
  }
}
