import { Injectable } from '@nestjs/common';
import type { EventDto } from '@footix/shared';
import { EventRepository } from '../domain/event.repository.js';
import { toEventDto } from '../domain/to-event-dto.js';

@Injectable()
export class FindUpcomingEventsService {
  constructor(private readonly events: EventRepository) {}

  // ponytail: pas d'historique, les créneaux passés disparaissent de la liste.
  async execute(): Promise<EventDto[]> {
    const events = await this.events.findUpcoming(new Date());
    const ids = events.map((e) => e.id);
    const [participants, guests] = await Promise.all([this.events.findParticipants(ids), this.events.findGuests(ids)]);
    return events.map((e) =>
      toEventDto(
        e,
        participants.filter((p) => p.eventId === e.id),
        guests.filter((g) => g.eventId === e.id),
      ),
    );
  }
}
