import { BaseRepository } from '../../common/domain/base.repository.js';
import type { NewUser } from './new-user.entity.js';
import type { UserFilter } from './user-filter.entity.js';
import type { UserPageRequest } from './user-page-request.entity.js';
import type { User } from './user.entity.js';

export abstract class UserRepository extends BaseRepository<User, NewUser> {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByVerificationTokenHash(tokenHash: string): Promise<User | null>;
  abstract findByPasswordResetTokenHash(tokenHash: string): Promise<User | null>;
  // `total` : comptes qui passent le filtre, `overall` : tous les comptes.
  abstract count(filter: UserFilter): Promise<{ total: number; overall: number }>;
  // Triés selon la demande, puis par nom à égalité.
  abstract findPage(filter: UserFilter, request: UserPageRequest): Promise<User[]>;
}
