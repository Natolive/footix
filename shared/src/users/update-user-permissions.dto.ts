import { z } from 'zod'
import { PERMISSIONS } from '../roles/permissions.ts'

export const updateUserPermissionsSchema = z.object({
  extraPermissions: z.array(z.enum(PERMISSIONS, 'Coche uniquement des droits de la liste.')),
})
export type UpdateUserPermissionsDto = z.infer<typeof updateUserPermissionsSchema>
