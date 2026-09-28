import type { User } from '../../users/domain/user.entity.js';

// Réponse d'une personne au sondage d'un créneau, dans l'ordre des réponses.
export type Participant = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'> & { eventId: string; attending: boolean };
