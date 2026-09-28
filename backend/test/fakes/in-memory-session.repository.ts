import type { NewSession } from '@src/auth/domain/new-session.entity.js';
import type { Session } from '@src/auth/domain/session.entity.js';
import { SessionRepository } from '@src/auth/domain/session.repository.js';
import { InMemoryRepository } from './in-memory.repository.js';

export class InMemorySessionRepository extends InMemoryRepository<Session, NewSession> implements SessionRepository {
  async findValidByTokenHash(tokenHash: string, now: Date) {
    return this.rows.find((s) => s.tokenHash === tokenHash && s.expiresAt > now) ?? null;
  }

  async deleteByTokenHash(tokenHash: string) {
    this.rows = this.rows.filter((s) => s.tokenHash !== tokenHash);
  }

  async deleteByUserId(userId: string, exceptTokenHash?: string) {
    this.rows = this.rows.filter((s) => s.userId !== userId || s.tokenHash === exceptTokenHash);
  }
}
