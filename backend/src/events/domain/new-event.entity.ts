import type { Event } from './event.entity.js';

export type NewEvent = Omit<Event, 'id' | 'createdAt'>;
