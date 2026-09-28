import { Injectable } from '@nestjs/common';
import type { EventDto, SaveEventDto } from '@footix/shared';
import { EventRepository } from '../domain/event.repository.js';
import { toEventDto } from '../domain/to-event-dto.js';

@Injectable()
export class CreateEventService {
  constructor(private readonly events: EventRepository) {}

  async execute(dto: SaveEventDto): Promise<EventDto> {
    return toEventDto(await this.events.create(dto), [], []);
  }
}
