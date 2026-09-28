import type { User } from './user.entity.js';

// Facultatifs à la création : `user`, aucun droit en plus, aucune dispo et null par défaut en base.
type Defaulted =
  | 'role'
  | 'extraPermissions'
  | 'availableDays'
  | 'onboardedAt'
  | 'emailVerifiedAt'
  | 'emailVerificationTokenHash'
  | 'emailVerificationExpiresAt'
  | 'passwordResetTokenHash'
  | 'passwordResetExpiresAt';
export type NewUser = Omit<User, 'id' | 'createdAt' | Defaulted> & Partial<Pick<User, Defaulted>>;
