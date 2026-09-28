import { z } from 'zod'
import { ROLES } from '../roles/permissions.ts'

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLES, 'Choisis un rôle dans la liste.'),
})
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>
