import type { EventDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { EventNotFoundError } from '../domain/errors/event-not-found.error.js';
import type { EventRepository } from '../domain/event.repository.js';
import { toEventDto } from '../domain/to-event-dto.js';

// Créneau avec ses réponses et ses invités, tel que renvoyé après chaque modification.
export async function findEventDto(events: EventRepository, id: string): Promise<EventDto> {
  const [event, participants, guests] = await Promise.all([events.findById(id), events.findParticipants([id]), events.findGuests([id])]);
  return toEventDto(orThrow(event, EventNotFoundError), participants, guests);
}
