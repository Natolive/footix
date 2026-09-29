import { Inject, Injectable } from '@nestjs/common';
import type { UserSort } from '@footix/shared';
import { type AnyColumn, and, arrayOverlaps, asc, count, desc, eq, inArray, isNotNull, isNull, or, sql, type SQL } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import type { NewUser } from '../domain/new-user.entity.js';
import type { UserFilter } from '../domain/user-filter.entity.js';
import type { UserPageRequest } from '../domain/user-page-request.entity.js';
import type { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { users } from './user.table.js';

// Même règle que `squash()` côté service (extension unaccent).
// ponytail: calculé à chaque requête, sans index ; colonne générée + index trigramme si la boîte dépasse quelques milliers de comptes.
const squashed = (column: AnyColumn) => sql`regexp_replace(lower(unaccent(${column})), '[^[:alnum:]@.]', '', 'g')`;
const haystack = sql`${squashed(users.firstName)} || ' ' || ${squashed(users.lastName)} || ' ' || ${squashed(users.email)}`;
const verified = (value: boolean) => (value ? isNotNull(users.emailVerifiedAt) : isNull(users.emailVerifiedAt));

const byName = [sql`lower(unaccent(${users.lastName}))`, sql`lower(unaccent(${users.firstName}))`];
// Le type Postgres `role` suit l'ordre de ROLES (utilisateur, admin, super admin).
const sortKeys: Record<UserSort, SQL[]> = {
  name: byName,
  email: [sql`${users.email}`],
  emailVerified: [sql`${users.emailVerifiedAt} is not null`],
  role: [sql`${users.role}`],
  extraPermissions: [sql`cardinality(${users.extraPermissions})`],
  createdAt: [sql`${users.createdAt}`],
};

@Injectable()
export class DrizzleUserRepository extends DrizzleRepository<typeof users, User, NewUser> implements UserRepository {
  constructor(@Inject(DB) db: Database) {
    super(db, users);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findByVerificationTokenHash(tokenHash: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.emailVerificationTokenHash, tokenHash)).limit(1);
    return user ?? null;
  }

  async findByPasswordResetTokenHash(tokenHash: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.passwordResetTokenHash, tokenHash)).limit(1);
    return user ?? null;
  }

  async count(filter: UserFilter): Promise<{ total: number; overall: number }> {
    const [row] = await this.db
      .select({ total: sql<number>`count(*) filter (where ${this.where(filter) ?? sql`true`})`.mapWith(Number), overall: count() })
      .from(users);
    return row;
  }

  async findPage(filter: UserFilter, request: UserPageRequest): Promise<User[]> {
    const direction = request.desc ? desc : asc;
    return this.db
      .select()
      .from(users)
      .where(this.where(filter))
      .orderBy(...sortKeys[request.sort].map((key) => direction(key)), ...byName, users.id)
      .offset(request.offset)
      .limit(request.limit);
  }

  private where(filter: UserFilter): SQL | undefined {
    return and(
      ...filter.terms.map((term) =>
        or(
          sql`${haystack} like ${`%${term.text}%`}`,
          term.roles.length ? inArray(users.role, term.roles) : undefined,
          term.permissions.length ? arrayOverlaps(users.extraPermissions, term.permissions) : undefined,
          ...term.emailVerified.map(verified),
        ),
      ),
      filter.roles.length ? inArray(users.role, filter.roles) : undefined,
      filter.emailVerified === null ? undefined : verified(filter.emailVerified),
      filter.withExtraPermissions === null
        ? undefined
        : filter.withExtraPermissions
          ? sql`cardinality(${users.extraPermissions}) > 0`
          : sql`cardinality(${users.extraPermissions}) = 0`,
    );
  }
}
