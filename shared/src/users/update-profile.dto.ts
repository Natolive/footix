import { z } from 'zod'
import { accountSchema } from '../auth/account.dto.ts'

// Ce que la personne modifie elle-même : son nom, pas son email (celui confirmé à l'inscription) ni son rôle.
export const updateProfileSchema = accountSchema.pick({ lastName: true, firstName: true })
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>
