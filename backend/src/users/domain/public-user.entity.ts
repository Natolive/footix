import type { User } from './user.entity.js';

// Ce qui peut sortir de l'API : jamais le hash du mot de passe.
export type PublicUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
