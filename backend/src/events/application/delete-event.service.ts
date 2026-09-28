import { Injectable, Logger } from '@nestjs/common';
import { orThrow } from '../../common/application/or-throw.js';
import { eventCancelledMail } from '../../mail/application/templates/event-cancelled.mail.js';
import { Mailer } from '../../mail/domain/mailer.js';
import { EventNotFoundError } from '../domain/errors/event-not-found.error.js';
import { EventRepository } from '../domain/event.repository.js';

@Injectable()
export class DeleteEventService {
  private readonly logger = new Logger(DeleteEventService.name);

  constructor(
    private readonly events: EventRepository,
    private readonly mailer: Mailer,
  ) {}

  // Les inscrits qui venaient sont prévenus par email, sauf si le match a déjà commencé.
  async execute(id: string): Promise<void> {
    const event = orThrow(await this.events.findById(id), EventNotFoundError);
    const participants = await this.events.findParticipants([id]);
    await this.events.delete(id);
    if (event.startsAt <= new Date()) return;
    // ponytail: email perdu s'il échoue (pas de renvoi), la suppression reste faite.
    await Promise.all(
      participants
        .filter((p) => p.attending)
        .map((p) => this.mailer.send(eventCancelledMail(p, event)).catch((e) => this.logger.error(`Annulation non envoyée à ${p.email}`, e))),
    );
  }
}
