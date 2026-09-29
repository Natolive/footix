import { orThrow } from '../../common/application/or-throw.js';
import { EventCancelledError } from '../domain/errors/event-cancelled.error.js';
import { EventNotFoundError } from '../domain/errors/event-not-found.error.js';
import { EventStartedError } from '../domain/errors/event-started.error.js';
import type { Event } from '../domain/event.entity.js';
import type { EventRepository } from '../domain/event.repository.js';

// Créneau ni commencé ni annulé : on peut encore y répondre ou y ramener quelqu'un.
export async function findOpenEvent(events: EventRepository, id: string): Promise<Event> {
  const event = orThrow(await events.findById(id), EventNotFoundError);
  if (event.startsAt <= new Date()) throw new EventStartedError();
  if (event.cancelledAt) throw new EventCancelledError();
  return event;
}
