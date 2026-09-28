import { z } from 'zod'
import { PERMISSIONS } from './permissions.ts'

export const updateRoleSchema = z.object({
  permissions: z.array(z.enum(PERMISSIONS, 'Coche uniquement des droits de la liste.')),
})
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>
