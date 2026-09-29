import type { Permission, Role } from '@footix/shared';

// Un mot cherché, déjà sans accents ni ponctuation : trouvé dans le prénom, le nom ou l'email,
// ou désignant un rôle, un droit en plus ou un statut d'email par son libellé.
export interface UserSearchTerm {
  text: string;
  roles: Role[];
  permissions: Permission[];
  emailVerified: boolean[];
}

// Chaque mot doit être trouvé ; `null` = pas de filtre.
export interface UserFilter {
  terms: UserSearchTerm[];
  roles: Role[];
  emailVerified: boolean | null;
  withExtraPermissions: boolean | null;
}
