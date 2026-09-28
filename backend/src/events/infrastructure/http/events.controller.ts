import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import {
  addGuestSchema,
  answerEventSchema,
  eventSchema,
  type AddGuestDto,
  type AnswerEventDto,
  type EventDto,
  type SaveEventDto,
  type UserDto,
} from '@footix/shared';
import { Authorize } from '../../../auth/infrastructure/http/authorize.decorator.js';
import { CurrentUser } from '../../../auth/infrastructure/http/current-user.decorator.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { AddGuestService } from '../../application/add-guest.service.js';
import { AnswerEventService } from '../../application/answer-event.service.js';
import { CreateEventService } from '../../application/create-event.service.js';
import { DeleteEventService } from '../../application/delete-event.service.js';
import { FindUpcomingEventsService } from '../../application/find-upcoming-events.service.js';
import { RemoveGuestService } from '../../application/remove-guest.service.js';
import { UpdateEventService } from '../../application/update-event.service.js';

@Controller('events')
export class EventsController {
  constructor(
    private readonly findUpcomingEventsService: FindUpcomingEventsService,
    private readonly createEventService: CreateEventService,
    private readonly updateEventService: UpdateEventService,
    private readonly deleteEventService: DeleteEventService,
    private readonly answerEventService: AnswerEventService,
    private readonly addGuestService: AddGuestService,
    private readonly removeGuestService: RemoveGuestService,
  ) {}

  @Get()
  @Authorize('events.read')
  findAll(): Promise<EventDto[]> {
    return this.findUpcomingEventsService.execute();
  }

  @Post()
  @Authorize('planning.create_event')
  create(@Body(new ZodValidationPipe(eventSchema)) dto: SaveEventDto): Promise<EventDto> {
    return this.createEventService.execute(dto);
  }

  @Put(':id')
  @Authorize('planning.update_event')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(eventSchema)) dto: SaveEventDto,
  ): Promise<EventDto> {
    return this.updateEventService.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize('planning.delete_event')
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteEventService.execute(id);
  }

  // Réponse de la personne connectée au sondage : « je viens » ou « je ne viens pas ».
  @Put(':id/participation')
  @Authorize('events.participate')
  answer(
    @CurrentUser() user: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(answerEventSchema)) dto: AnswerEventDto,
  ): Promise<EventDto> {
    return this.answerEventService.execute(id, user, dto);
  }

  // Invité sans compte ramené par la personne connectée, qui doit venir elle-même.
  @Post(':id/guests')
  @Authorize('events.invite_guest')
  addGuest(
    @CurrentUser() user: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(addGuestSchema)) dto: AddGuestDto,
  ): Promise<EventDto> {
    return this.addGuestService.execute(id, user.id, dto);
  }

  @Delete(':id/guests/:guestId')
  @Authorize('events.invite_guest')
  removeGuest(
    @CurrentUser() user: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('guestId', ParseUUIDPipe) guestId: string,
  ): Promise<EventDto> {
    return this.removeGuestService.execute(id, guestId, user);
  }
}
