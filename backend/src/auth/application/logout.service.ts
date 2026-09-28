import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../domain/session.repository.js';
import { hashToken } from './hash-token.js';

@Injectable()
export class LogoutService {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(token: string | undefined): Promise<void> {
    if (token) await this.sessions.deleteByTokenHash(hashToken(token));
  }
}
