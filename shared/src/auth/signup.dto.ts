import { z } from 'zod'
import { updateAvailabilitySchema } from '../users/update-availability.dto.ts'
import { accountSchema } from './account.dto.ts'

// Deuxième étape : ses dispos, facultatives (modifiables ensuite dans « Mon profil »).
export const signupSchema = accountSchema.extend({
  availableDays: updateAvailabilitySchema.shape.availableDays.default([]),
})
export type SignupInput = z.input<typeof signupSchema>
export type SignupDto = z.infer<typeof signupSchema>
