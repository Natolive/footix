import { Injectable } from '@nestjs/common';
import type { EventDto, SaveEventDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { EventNotFoundError } from '../domain/errors/event-not-found.error.js';
import { TooFewPlacesError } from '../domain/errors/too-few-places.error.js';
import { EventRepository } from '../domain/event.repository.js';
import { toEventDto } from '../domain/to-event-dto.js';

@Injectable()
export class UpdateEventService {
  constructor(private readonly events: EventRepository) {}

  async execute(id: string, dto: SaveEventDto): Promise<EventDto> {
    orThrow(await this.events.findById(id), EventNotFoundError);
    const [participants, guests] = await Promise.all([this.events.findParticipants([id]), this.events.findGuests([id])]);
    const taken = participants.filter((p) => p.attending).length + guests.length;
    if (taken > dto.maxParticipants) throw new TooFewPlacesError(taken);
    return toEventDto(orThrow(await this.events.update(id, dto), EventNotFoundError), participants, guests);
  }
}
