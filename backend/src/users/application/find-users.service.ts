import { Injectable } from '@nestjs/common';
import { PERMISSION_LABELS, ROLE_LABELS, type FindUsersQuery, type UserPageDto } from '@footix/shared';
import { toManagedUser } from '../domain/to-managed-user.js';
import type { UserFilter, UserSearchTerm } from '../domain/user-filter.entity.js';
import { UserRepository } from '../domain/user.repository.js';
import { squash } from './squash.js';

@Injectable()
export class FindUsersService {
  constructor(private readonly users: UserRepository) {}

  async execute(query: FindUsersQuery): Promise<UserPageDto> {
    const filter: UserFilter = {
      terms: query.q.split(/\s+/).map(squash).filter(Boolean).map(toSearchTerm),
      roles: query.roles,
      emailVerified: query.emailVerified === 'all' ? null : query.emailVerified === 'verified',
      withExtraPermissions: query.extraPermissions === 'all' ? null : query.extraPermissions === 'with',
    };
    const { total, overall } = await this.users.count(filter);
    // Au-delà de la dernière page (elle s'est vidée après une suppression) : la dernière qui existe.
    const page = Math.min(query.page, Math.max(1, Math.ceil(total / query.pageSize)));
    const users = await this.users.findPage(filter, {
      sort: query.sort,
      desc: query.desc,
      offset: (page - 1) * query.pageSize,
      limit: query.pageSize,
    });
    return { items: users.map(toManagedUser), total, overall, page };
  }
}

// Ce qu'affiche le tableau est cherchable : « admin » trouve aussi les super admins, « attente » les emails pas confirmés.
const labelled = <K extends string>(labels: Record<K, string>, text: string) =>
  (Object.keys(labels) as K[]).filter((key) => squash(labels[key]).includes(text));

const toSearchTerm = (text: string): UserSearchTerm => ({
  text,
  roles: labelled(ROLE_LABELS, text),
  permissions: labelled(PERMISSION_LABELS, text),
  emailVerified: [true, false].filter((verified) => squash(verified ? 'Confirmé' : 'En attente').includes(text)),
});
