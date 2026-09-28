import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { BaseRepository } from '../../domain/base.repository.js';
import { ConflictError } from '../../domain/errors/conflict.error.js';
import type { Database } from './database.module.js';

type TableWithId = PgTable & { id: PgColumn };

const UNIQUE_VIOLATION = '23505';

// Implémentation Drizzle des méthodes de base, pour toute table ayant une colonne `id`.
// Les types Drizzle ne se propagent pas bien sur une table générique : les casts restent confinés ici.
export abstract class DrizzleRepository<TTable extends TableWithId, TEntity, TCreate>
  implements BaseRepository<TEntity, TCreate>
{
  protected constructor(
    protected readonly db: Database,
    protected readonly table: TTable,
  ) {}

  async findById(id: string): Promise<TEntity | null> {
    const [row] = await this.db.select().from(this.table as PgTable).where(eq(this.table.id, id)).limit(1);
    return (row as TEntity) ?? null;
  }

  async findAll(): Promise<TEntity[]> {
    return (await this.db.select().from(this.table as PgTable)) as TEntity[];
  }

  async create(data: TCreate): Promise<TEntity> {
    try {
      const rows = await this.db.insert(this.table).values(data as TTable['$inferInsert']).returning();
      return (rows as unknown as TEntity[])[0];
    } catch (e) {
      throw this.translate(e);
    }
  }

  async update(id: string, data: Partial<TCreate>): Promise<TEntity | null> {
    try {
      const rows = await this.db
        .update(this.table)
        .set(data as Partial<TTable['$inferInsert']>)
        .where(eq(this.table.id, id))
        .returning();
      return (rows as unknown as TEntity[])[0] ?? null;
    } catch (e) {
      throw this.translate(e);
    }
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(this.table).where(eq(this.table.id, id)).returning({ id: this.table.id });
    return rows.length > 0;
  }

  // Violation d'unicité (ex. deux inscriptions simultanées) : erreur métier plutôt qu'une 500.
  protected translate(e: unknown): unknown {
    const code = (e as { cause?: { code?: string } }).cause?.code ?? (e as { code?: string }).code;
    return code === UNIQUE_VIOLATION ? new ConflictError('Cette ressource existe déjà.') : e;
  }
}
