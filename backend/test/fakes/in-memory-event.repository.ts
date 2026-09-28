import type { Event } from '@src/events/domain/event.entity.js';
import type { NewEvent } from '@src/events/domain/new-event.entity.js';
import { EventRepository } from '@src/events/domain/event.repository.js';
import { InMemoryRepository } from './in-memory.repository.js';
import type { InMemoryUserRepository } from './in-memory-user.repository.js';

export class InMemoryEventRepository extends InMemoryRepository<Event, NewEvent> implements EventRepository {
  participations: { eventId: string; userId: string; attending: boolean; confirmed?: boolean }[] = [];
  guests: { id: string; eventId: string; invitedBy: string; name: string }[] = [];

  // Les inscrits sont lus dans les utilisateurs, comme la jointure en base.
  constructor(private readonly users: InMemoryUserRepository) {
    super();
  }

  async findUpcoming(now: Date) {
    return this.rows.filter((e) => e.startsAt > now).toSorted((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }

  async findParticipants(eventIds: string[]) {
    return this.participations
      .filter((p) => eventIds.includes(p.eventId))
      .map(({ eventId, userId, attending }) => ({ eventId, attending, ...this.person(userId), email: this.users.rows.find((u) => u.id === userId)!.email }));
  }

  async findGuests(eventIds: string[]) {
    return this.guests
      .filter((g) => eventIds.includes(g.eventId))
      .map(({ invitedBy, ...g }) => ({ ...g, invitedBy: this.person(invitedBy) }));
  }

  async answer(eventId: string, userId: string, attending: boolean) {
    const event = await this.findById(eventId);
    if (!event) return false;
    const mine = this.participations.find((p) => p.eventId === eventId && p.userId === userId);
    if (attending && !mine?.attending && this.taken(eventId) >= event.maxParticipants) return false;
    if (!attending) this.guests = this.guests.filter((g) => !(g.eventId === eventId && g.invitedBy === userId));
    if (mine) mine.attending = attending;
    else this.participations.push({ eventId, userId, attending });
    return true;
  }

  async addGuest(eventId: string, invitedBy: string, name: string) {
    const event = await this.findById(eventId);
    const coming = this.participations.some((p) => p.eventId === eventId && p.userId === invitedBy && p.attending);
    if (!event || !coming) return 'not_attending' as const;
    if (this.taken(eventId) >= event.maxParticipants) return 'full' as const;
    this.guests.push({ id: `guest-${this.guests.length + 1}`, eventId, invitedBy, name });
    return 'added' as const;
  }

  async removeGuest(guestId: string) {
    this.guests = this.guests.filter((g) => g.id !== guestId);
  }

  async claimConfirmation(eventId: string, userId: string) {
    const mine = this.participations.find((p) => p.eventId === eventId && p.userId === userId);
    if (!mine?.attending || mine.confirmed) return false;
    mine.confirmed = true;
    return true;
  }

  private taken(eventId: string) {
    const coming = this.participations.filter((p) => p.eventId === eventId && p.attending).length;
    return coming + this.guests.filter((g) => g.eventId === eventId).length;
  }

  private person(userId: string) {
    const { id, firstName, lastName } = this.users.rows.find((u) => u.id === userId)!;
    return { id, firstName, lastName };
  }
}
