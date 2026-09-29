import { Injectable, Logger } from '@nestjs/common';
import type { EventDto } from '@footix/shared';
import { eventCancelledMail } from '../../mail/application/templates/event-cancelled.mail.js';
import { Mailer } from '../../mail/domain/mailer.js';
import { EventRepository } from '../domain/event.repository.js';
import { findEventDto } from './find-event-dto.js';
import { findOpenEvent } from './find-open-event.js';

@Injectable()
export class CancelEventService {
  private readonly logger = new Logger(CancelEventService.name);

  constructor(
    private readonly events: EventRepository,
    private readonly mailer: Mailer,
  ) {}

  // Le créneau reste affiché, marqué annulé, jusqu'à sa date ; ceux qui venaient sont prévenus par email.
  // ponytail: pas de retour en arrière, recréer le créneau si l'annulation était une erreur.
  async execute(id: string): Promise<EventDto> {
    const event = await findOpenEvent(this.events, id);
    await this.events.update(id, { cancelledAt: new Date() });
    const participants = await this.events.findParticipants([id]);
    // ponytail: email perdu s'il échoue (pas de renvoi), l'annulation reste faite.
    await Promise.all(
      participants
        .filter((p) => p.attending)
        .map((p) => this.mailer.send(eventCancelledMail(p, event)).catch((e) => this.logger.error(`Annulation non envoyée à ${p.email}`, e))),
    );
    return findEventDto(this.events, id);
  }
}
