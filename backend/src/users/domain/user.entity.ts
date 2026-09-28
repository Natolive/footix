import type { ManagedUserDto, Permission, Role, Weekday } from '@footix/shared';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: Role;
  extraPermissions: Permission[];
  availableDays: Weekday[];
  onboardedAt: Date | null;
  emailVerifiedAt: Date | null;
  emailVerificationTokenHash: string | null;
  emailVerificationExpiresAt: Date | null;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  createdAt: Date;
}

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

// Ce qui peut sortir de l'API : jamais le hash du mot de passe.
export type PublicUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;

export const toPublicUser = ({ id, email, firstName, lastName, role }: User): PublicUser => ({
  id,
  email,
  firstName,
  lastName,
  role,
});

export const toManagedUser = (user: User): ManagedUserDto => ({
  ...toPublicUser(user),
  extraPermissions: user.extraPermissions,
  emailVerified: !!user.emailVerifiedAt,
  createdAt: user.createdAt.toISOString(),
});
