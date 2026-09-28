import { BaseRepository } from '../../common/domain/base.repository.js';
import type { Event } from './event.entity.js';
import type { Guest } from './guest.entity.js';
import type { NewEvent } from './new-event.entity.js';
import type { Participant } from './participant.entity.js';

export abstract class EventRepository extends BaseRepository<Event, NewEvent> {
  // Créneaux pas encore commencés, du plus proche au plus lointain.
  abstract findUpcoming(now: Date): Promise<Event[]>;
  abstract findParticipants(eventIds: string[]): Promise<Participant[]>;
  abstract findGuests(eventIds: string[]): Promise<Guest[]>;
  // Enregistre ou change la réponse ; « je viens » seulement s'il reste une place (false si complet).
  // Invités et inscrits se partagent les places ; « je ne viens pas » retire aussi les invités de la personne.
  abstract answer(eventId: string, userId: string, attending: boolean): Promise<boolean>;
  // Ajoute l'invité seulement si la personne qui le ramène vient et qu'il reste une place.
  abstract addGuest(eventId: string, invitedBy: string, name: string): Promise<'added' | 'not_attending' | 'full'>;
  abstract removeGuest(guestId: string): Promise<void>;
  // true une seule fois par personne et par créneau, et seulement si elle vient : l'appelant envoie alors la confirmation.
  abstract claimConfirmation(eventId: string, userId: string): Promise<boolean>;
}
