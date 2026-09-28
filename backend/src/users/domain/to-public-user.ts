import type { PublicUser } from './public-user.entity.js';
import type { User } from './user.entity.js';

export const toPublicUser = ({ id, email, firstName, lastName, role }: User): PublicUser => ({
  id,
  email,
  firstName,
  lastName,
  role,
});
