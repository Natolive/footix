import { z } from 'zod'
import { accountSchema } from '../auth/signup.dto.ts'
import { PERMISSIONS, ROLES, type Permission, type Role } from '../roles/permissions.ts'

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

// Un schéma par droit : chacun se modifie séparément.
export const updateUserSchema = accountSchema.omit({ password: true })
export type UpdateUserDto = z.infer<typeof updateUserSchema>

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLES, 'Choisis un rôle dans la liste.'),
})
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>

export const updateUserPermissionsSchema = z.object({
  extraPermissions: z.array(z.enum(PERMISSIONS, 'Coche uniquement des droits de la liste.')),
})
export type UpdateUserPermissionsDto = z.infer<typeof updateUserPermissionsSchema>
