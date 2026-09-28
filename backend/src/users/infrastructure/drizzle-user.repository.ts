import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import type { NewUser } from '../domain/new-user.entity.js';
import type { User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { users } from './user.table.js';

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
}
