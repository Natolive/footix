import type { Event } from './event.entity.js';

// Créé non annulé ; `cancelledAt` ne se pose qu'à l'annulation.
export type NewEvent = Omit<Event, 'id' | 'createdAt' | 'cancelledAt'> & Partial<Pick<Event, 'cancelledAt'>>;
