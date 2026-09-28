import type { User } from '../../users/domain/user.entity.js';

// Personne sans compte ramenée par un inscrit, dans l'ordre d'ajout.
export interface Guest {
  id: string;
  eventId: string;
  name: string;
  invitedBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
}
