import { Injectable } from '@nestjs/common';
import type { AddGuestDto, EventDto } from '@footix/shared';
import { EventFullError } from '../domain/errors/event-full.error.js';
import { NotAttendingError } from '../domain/errors/not-attending.error.js';
import { EventRepository } from '../domain/event.repository.js';
import { findEventDto } from './find-event-dto.js';
import { findOpenEvent } from './find-open-event.js';

@Injectable()
export class AddGuestService {
  constructor(private readonly events: EventRepository) {}

  async execute(id: string, actorId: string, { name }: AddGuestDto): Promise<EventDto> {
    await findOpenEvent(this.events, id);
    const result = await this.events.addGuest(id, actorId, name);
    if (result === 'not_attending') throw new NotAttendingError();
    if (result === 'full') throw new EventFullError();
    return findEventDto(this.events, id);
  }
}
