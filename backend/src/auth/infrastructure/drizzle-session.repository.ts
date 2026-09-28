import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, ne } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import type { NewSession } from '../domain/new-session.entity.js';
import type { Session } from '../domain/session.entity.js';
import { SessionRepository } from '../domain/session.repository.js';
import { sessions } from './session.table.js';

@Injectable()
export class DrizzleSessionRepository
  extends DrizzleRepository<typeof sessions, Session, NewSession>
  implements SessionRepository
{
  constructor(@Inject(DB) db: Database) {
    super(db, sessions);
  }

  async findValidByTokenHash(tokenHash: string, now: Date): Promise<Session | null> {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);
    return session ?? null;
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  async deleteByUserId(userId: string, exceptTokenHash?: string): Promise<void> {
    await this.db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), exceptTokenHash ? ne(sessions.tokenHash, exceptTokenHash) : undefined));
  }
}
