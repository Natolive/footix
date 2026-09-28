import { BaseRepository } from '../../common/domain/base.repository.js';
import type { NewSession } from './new-session.entity.js';
import type { Session } from './session.entity.js';

export abstract class SessionRepository extends BaseRepository<Session, NewSession> {
  abstract findValidByTokenHash(tokenHash: string, now: Date): Promise<Session | null>;
  abstract deleteByTokenHash(tokenHash: string): Promise<void>;
  // `exceptTokenHash` : garde cette session (celle qui fait la demande).
  abstract deleteByUserId(userId: string, exceptTokenHash?: string): Promise<void>;
}
