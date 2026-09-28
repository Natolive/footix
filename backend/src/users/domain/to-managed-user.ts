import type { ManagedUserDto } from '@footix/shared';
import { toPublicUser } from './to-public-user.js';
import type { User } from './user.entity.js';

export const toManagedUser = (user: User): ManagedUserDto => ({
  ...toPublicUser(user),
  extraPermissions: user.extraPermissions,
  emailVerified: !!user.emailVerifiedAt,
  createdAt: user.createdAt.toISOString(),
});
