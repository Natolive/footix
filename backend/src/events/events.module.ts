import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { AddGuestService } from './application/add-guest.service.js';
import { AnswerEventService } from './application/answer-event.service.js';
import { CreateEventService } from './application/create-event.service.js';
import { DeleteEventService } from './application/delete-event.service.js';
import { FindUpcomingEventsService } from './application/find-upcoming-events.service.js';
import { RemoveGuestService } from './application/remove-guest.service.js';
import { UpdateEventService } from './application/update-event.service.js';
import { EventRepository } from './domain/event.repository.js';
import { DrizzleEventRepository } from './infrastructure/drizzle-event.repository.js';
import { EventsController } from './infrastructure/http/events.controller.js';

// Routes protégées par le guard global d'AuthModule.
@Module({
  imports: [MailModule],
  controllers: [EventsController],
  providers: [
    AddGuestService,
    AnswerEventService,
    CreateEventService,
    DeleteEventService,
    FindUpcomingEventsService,
    RemoveGuestService,
    UpdateEventService,
    { provide: EventRepository, useClass: DrizzleEventRepository },
  ],
})
export class EventsModule {}
