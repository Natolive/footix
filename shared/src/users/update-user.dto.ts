import { z } from 'zod'
import { accountSchema } from '../auth/account.dto.ts'

// Un schéma par droit : nom et email ici, rôle et droits ajoutés chacun dans le leur.
export const updateUserSchema = accountSchema.omit({ password: true })
export type UpdateUserDto = z.infer<typeof updateUserSchema>
