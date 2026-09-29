import type { EventDto } from '@footix/shared';
import type { Event } from './event.entity.js';
import type { Guest } from './guest.entity.js';
import type { Participant } from './participant.entity.js';

const toParticipantDto = ({ id, firstName, lastName }: Participant) => ({ id, firstName, lastName });

export const toEventDto = (
  { id, title, description, location, startsAt, durationMinutes, maxParticipants, paymentUrl, cancelledAt }: Event,
  participants: Participant[],
  guests: Guest[],
): EventDto => ({
  id,
  title,
  description,
  location,
  startsAt: startsAt.toISOString(),
  durationMinutes,
  maxParticipants,
  paymentUrl,
  cancelledAt: cancelledAt?.toISOString() ?? null,
  participants: participants.filter((p) => p.attending).map(toParticipantDto),
  declined: participants.filter((p) => !p.attending).map(toParticipantDto),
  guests: guests.map(({ id, name, invitedBy }) => ({ id, name, invitedBy })),
});
