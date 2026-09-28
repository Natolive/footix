import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, eq, gt, inArray, isNull } from 'drizzle-orm';
import { DB, type Database } from '../../common/infrastructure/database/database.module.js';
import { DrizzleRepository } from '../../common/infrastructure/database/drizzle.repository.js';
import { users } from '../../users/infrastructure/user.table.js';
import type { Event } from '../domain/event.entity.js';
import type { Guest } from '../domain/guest.entity.js';
import type { NewEvent } from '../domain/new-event.entity.js';
import type { Participant } from '../domain/participant.entity.js';
import { EventRepository } from '../domain/event.repository.js';
import { eventGuests, eventParticipants, events } from './event.table.js';

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

@Injectable()
export class DrizzleEventRepository extends DrizzleRepository<typeof events, Event, NewEvent> implements EventRepository {
  constructor(@Inject(DB) db: Database) {
    super(db, events);
  }

  findUpcoming(now: Date): Promise<Event[]> {
    return this.db.select().from(events).where(gt(events.startsAt, now)).orderBy(asc(events.startsAt));
  }

  async findParticipants(eventIds: string[]): Promise<Participant[]> {
    if (!eventIds.length) return [];
    return this.db
      .select({
        eventId: eventParticipants.eventId,
        attending: eventParticipants.attending,
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(users.id, eventParticipants.userId))
      .where(inArray(eventParticipants.eventId, eventIds))
      .orderBy(asc(eventParticipants.createdAt));
  }

  async findGuests(eventIds: string[]): Promise<Guest[]> {
    if (!eventIds.length) return [];
    return this.db
      .select({
        id: eventGuests.id,
        eventId: eventGuests.eventId,
        name: eventGuests.name,
        invitedBy: { id: users.id, firstName: users.firstName, lastName: users.lastName },
      })
      .from(eventGuests)
      .innerJoin(users, eq(users.id, eventGuests.invitedBy))
      .where(inArray(eventGuests.eventId, eventIds))
      .orderBy(asc(eventGuests.createdAt));
  }

  answer(eventId: string, userId: string, attending: boolean): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const max = await this.lockEvent(tx, eventId);
      if (max === null) return false;
      if (attending) {
        if (await this.isComing(tx, eventId, userId)) return true;
        if ((await this.taken(tx, eventId)) >= max) return false;
      } else {
        await tx.delete(eventGuests).where(and(eq(eventGuests.eventId, eventId), eq(eventGuests.invitedBy, userId)));
      }
      await tx
        .insert(eventParticipants)
        .values({ eventId, userId, attending })
        .onConflictDoUpdate({ target: [eventParticipants.eventId, eventParticipants.userId], set: { attending } });
      return true;
    });
  }

  // Sous le même verrou que `answer` : un « je ne viens pas » simultané ne laisse pas d'invité sans hôte.
  addGuest(eventId: string, invitedBy: string, name: string): Promise<'added' | 'not_attending' | 'full'> {
    return this.db.transaction(async (tx) => {
      const max = await this.lockEvent(tx, eventId);
      if (max === null || !(await this.isComing(tx, eventId, invitedBy))) return 'not_attending';
      if ((await this.taken(tx, eventId)) >= max) return 'full';
      await tx.insert(eventGuests).values({ eventId, invitedBy, name });
      return 'added';
    });
  }

  async removeGuest(guestId: string): Promise<void> {
    await this.db.delete(eventGuests).where(eq(eventGuests.id, guestId));
  }

  async claimConfirmation(eventId: string, userId: string): Promise<boolean> {
    const claimed = await this.db
      .update(eventParticipants)
      .set({ confirmationSentAt: new Date() })
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.attending, true),
          isNull(eventParticipants.confirmationSentAt),
        ),
      )
      .returning({ userId: eventParticipants.userId });
    return claimed.length > 0;
  }

  // Verrou sur le créneau : deux ajouts simultanés ne dépassent pas le nombre de places.
  private async lockEvent(tx: Tx, eventId: string): Promise<number | null> {
    const [event] = await tx
      .select({ max: events.maxParticipants })
      .from(events)
      .where(eq(events.id, eventId))
      .for('update');
    return event?.max ?? null;
  }

  private async isComing(tx: Tx, eventId: string, userId: string): Promise<boolean> {
    const [mine] = await tx
      .select({ attending: eventParticipants.attending })
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)));
    return !!mine?.attending;
  }

  // Places prises : inscrits qui viennent + invités.
  private async taken(tx: Tx, eventId: string): Promise<number> {
    const [{ people }] = await tx
      .select({ people: count() })
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.attending, true)));
    const [{ guests }] = await tx.select({ guests: count() }).from(eventGuests).where(eq(eventGuests.eventId, eventId));
    return people + guests;
  }
}
