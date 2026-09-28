import type { Permission, Role } from '../roles/permissions.ts'

// Utilisateur vu depuis l'administration : son rôle et les droits ajoutés à ceux du rôle.
export interface ManagedUserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  extraPermissions: Permission[]
  emailVerified: boolean
  // Date d'inscription, ISO 8601.
  createdAt: string
}
