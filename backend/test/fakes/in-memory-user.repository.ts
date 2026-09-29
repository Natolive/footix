import { byName } from '@src/users/application/by-name.js';
import { squash } from '@src/users/application/squash.js';
import type { NewUser } from '@src/users/domain/new-user.entity.js';
import type { UserFilter } from '@src/users/domain/user-filter.entity.js';
import type { UserPageRequest } from '@src/users/domain/user-page-request.entity.js';
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

  async count(filter: UserFilter) {
    return { total: this.matching(filter).length, overall: this.rows.length };
  }

  // Toujours par nom : les tris se testent sur la vraie base (drizzle-user.repository.int-spec.ts).
  async findPage(filter: UserFilter, { offset, limit }: UserPageRequest) {
    return this.matching(filter).toSorted(byName).slice(offset, offset + limit);
  }

  private matching(filter: UserFilter) {
    return this.rows.filter((u) => {
      const haystack = [u.firstName, u.lastName, u.email].map(squash).join(' ');
      return (
        filter.terms.every(
          (t) =>
            haystack.includes(t.text) ||
            t.roles.includes(u.role) ||
            t.permissions.some((p) => u.extraPermissions.includes(p)) ||
            t.emailVerified.includes(!!u.emailVerifiedAt),
        ) &&
        (!filter.roles.length || filter.roles.includes(u.role)) &&
        (filter.emailVerified === null || filter.emailVerified === !!u.emailVerifiedAt) &&
        (filter.withExtraPermissions === null || filter.withExtraPermissions === u.extraPermissions.length > 0)
      );
    });
  }
}
