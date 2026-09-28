import type { Request } from 'express';
import type { AuthenticatedUser } from '../../application/authenticated-user.js';

// Requête passée par SessionGuard : la personne connectée y est attachée.
export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
