import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { User } from '../../users/domain/user.entity.js';
import { SessionRepository } from '../domain/session.repository.js';
import { BuildAuthenticatedUserService } from './build-authenticated-user.service.js';
import { hashToken } from './hash-token.js';
import type { OpenedSession } from './opened-session.js';

const HOUR = 60 * 60 * 1000;
export const SESSION_TTL = { short: 12 * HOUR, remember: 30 * 24 * HOUR };

@Injectable()
export class OpenSessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly buildAuthenticatedUser: BuildAuthenticatedUserService,
  ) {}

  async execute(user: User, remember: boolean): Promise<OpenedSession> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + (remember ? SESSION_TTL.remember : SESSION_TTL.short));
    await this.sessions.create({ userId: user.id, tokenHash: hashToken(token), expiresAt });
    return { token, expiresAt, remember, user: await this.buildAuthenticatedUser.execute(user) };
  }
}
