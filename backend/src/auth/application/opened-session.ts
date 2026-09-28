import type { AuthenticatedUser } from './authenticated-user.js';

export interface OpenedSession {
  token: string;
  expiresAt: Date;
  remember: boolean;
  user: AuthenticatedUser;
}
