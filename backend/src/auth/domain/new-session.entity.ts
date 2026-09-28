import type { Session } from './session.entity.js';

export type NewSession = Omit<Session, 'id' | 'createdAt'>;
