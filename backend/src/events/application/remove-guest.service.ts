import { Injectable } from '@nestjs/common';
import type { EventDto, UserDto } from '@footix/shared';
import { GuestNotFoundError } from '../domain/errors/guest-not-found.error.js';
import { NotYourGuestError } from '../domain/errors/not-your-guest.error.js';
import { EventRepository } from '../domain/event.repository.js';
import { findEventDto } from './find-event-dto.js';
import { findOpenEvent } from './find-open-event.js';

@Injectable()
export class RemoveGuestService {
  constructor(private readonly events: EventRepository) {}

  // Ses propres invités, ou ceux de tout le monde avec le droit de modifier les créneaux.
  async execute(id: string, guestId: string, actor: Pick<UserDto, 'id' | 'permissions'>): Promise<EventDto> {
    await findOpenEvent(this.events, id);
    const guest = (await this.events.findGuests([id])).find((g) => g.id === guestId);
    if (!guest) throw new GuestNotFoundError();
    if (guest.invitedBy.id !== actor.id && !actor.permissions.includes('planning.update_event')) throw new NotYourGuestError();
    await this.events.removeGuest(guestId);
    return findEventDto(this.events, id);
  }
}
