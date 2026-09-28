import { orThrow } from '../../common/application/or-throw.js';
import { OwnAccessLockedError } from '../domain/errors/own-access-locked.error.js';
import { SuperAdminOnlyError } from '../domain/errors/super-admin-only.error.js';
import { UserNotFoundError } from '../domain/errors/user-not-found.error.js';
import type { PublicUser } from '../domain/public-user.entity.js';
import type { User } from '../domain/user.entity.js';
import type { UserRepository } from '../domain/user.repository.js';

// `actor` : l'administrateur qui fait la modification, `id` : la personne modifiée.
// Seul un super admin touche à un super admin ; son propre accès ne se modifie pas
// (évite de se retirer l'administration par erreur, ou de s'accorder plus de droits).
export async function findManageableUser(users: UserRepository, actor: PublicUser, id: string, { self = true } = {}): Promise<User> {
  if (!self && actor.id === id) throw new OwnAccessLockedError();
  const target = orThrow(await users.findById(id), UserNotFoundError);
  if (target.role === 'super_admin' && actor.role !== 'super_admin') throw new SuperAdminOnlyError();
  return target;
}
