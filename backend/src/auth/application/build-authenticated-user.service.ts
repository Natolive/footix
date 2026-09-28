import { Injectable } from '@nestjs/common';
import { PERMISSIONS } from '@footix/shared';
import { RolePermissionsService } from '../../roles/application/role-permissions.service.js';
import { toPublicUser } from '../../users/domain/to-public-user.js';
import type { User } from '../../users/domain/user.entity.js';
import type { AuthenticatedUser } from './authenticated-user.js';

// Droits effectifs = droits du rôle + droits ajoutés à la personne.
@Injectable()
export class BuildAuthenticatedUserService {
  constructor(private readonly rolePermissions: RolePermissionsService) {}

  async execute(user: User): Promise<AuthenticatedUser> {
    const fromRole = await this.rolePermissions.execute(user.role);
    const permissions = PERMISSIONS.filter((p) => fromRole.includes(p) || user.extraPermissions.includes(p));
    return { ...toPublicUser(user), onboarded: user.onboardedAt !== null, availableDays: user.availableDays, permissions };
  }
}
