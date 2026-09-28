import { Injectable } from '@nestjs/common';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, type Permission, type Role } from '@footix/shared';
import { RolePermissionRepository } from '../domain/role-permission.repository.js';

// Droits effectifs d'un rôle : ceux enregistrés par un admin, sinon le défaut du code.
@Injectable()
export class RolePermissionsService {
  constructor(private readonly repository: RolePermissionRepository) {}

  // ponytail: une requête par route protégée, mettre en cache si ça pèse.
  async execute(role: Role): Promise<Permission[]> {
    // Le super admin garde tout : personne ne peut perdre l'accès à la gestion des droits.
    if (role === 'super_admin') return [...PERMISSIONS];
    const saved = new Map((await this.repository.findByRole(role)).map((r) => [r.permission, r.granted]));
    return PERMISSIONS.filter((p) => saved.get(p) ?? DEFAULT_ROLE_PERMISSIONS[role].includes(p));
  }
}
