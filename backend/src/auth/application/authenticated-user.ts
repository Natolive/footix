import type { Permission, Weekday } from '@footix/shared';
import type { PublicUser } from '../../users/domain/public-user.entity.js';

// Utilisateur renvoyé au front, avec ses droits effectifs : ceux du rôle plus ceux ajoutés à la personne.
export type AuthenticatedUser = PublicUser & { onboarded: boolean; availableDays: Weekday[]; permissions: Permission[] };
