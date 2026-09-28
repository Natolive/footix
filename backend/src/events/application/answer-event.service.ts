import { Injectable, Logger } from '@nestjs/common';
import type { AnswerEventDto, EventDto, UserDto } from '@footix/shared';
import { eventRegistrationMail } from '../../mail/application/templates/event-registration.mail.js';
import { Mailer } from '../../mail/domain/mailer.js';
import { EventFullError } from '../domain/errors/event-full.error.js';
import { EventRepository } from '../domain/event.repository.js';
import { findEventDto } from './find-event-dto.js';
import { findOpenEvent } from './find-open-event.js';

@Injectable()
export class AnswerEventService {
  private readonly logger = new Logger(AnswerEventService.name);

  constructor(
    private readonly events: EventRepository,
    private readonly mailer: Mailer,
  ) {}

  // Premier « je viens » qui prend une place : email de confirmation avec le match en .ics (une seule fois).
  async execute(id: string, user: Pick<UserDto, 'id' | 'email' | 'firstName'>, { attending }: AnswerEventDto): Promise<EventDto> {
    const event = await findOpenEvent(this.events, id);
    if (!(await this.events.answer(id, user.id, attending))) throw new EventFullError();
    if (attending && (await this.events.claimConfirmation(id, user.id))) {
      // ponytail: email perdu s'il échoue (pas de renvoi) ; la place reste prise, sans erreur pour la personne.
      await this.mailer.send(eventRegistrationMail(user, event)).catch((e) => this.logger.error(`Confirmation non envoyée à ${user.email}`, e));
    }
    return findEventDto(this.events, id);
  }
}
