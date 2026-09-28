import type { NewUser } from '@src/users/domain/new-user.entity.js';
import type { User } from '@src/users/domain/user.entity.js';
import { UserRepository } from '@src/users/domain/user.repository.js';
import { InMemoryRepository } from './in-memory.repository.js';

export class InMemoryUserRepository extends InMemoryRepository<User, NewUser> implements UserRepository {
  // Mêmes défauts que les colonnes en base.
  override create(data: NewUser) {
    return super.create({ role: 'user', extraPermissions: [], availableDays: [], onboardedAt: null, emailVerifiedAt: null, emailVerificationTokenHash: null, emailVerificationExpiresAt: null,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      ...data });
  }

  async findByEmail(email: string) {
    return this.rows.find((u) => u.email === email) ?? null;
  }

  async findByVerificationTokenHash(tokenHash: string) {
    return this.rows.find((u) => u.emailVerificationTokenHash === tokenHash) ?? null;
  }

  async findByPasswordResetTokenHash(tokenHash: string) {
    return this.rows.find((u) => u.passwordResetTokenHash === tokenHash) ?? null;
  }
}
