import { z } from 'zod'
import { newPasswordField } from '../common/new-password.field.ts'

// Jeton du lien reçu par email, et nouveau mot de passe.
export const resetPasswordSchema = z.object({
  token: z.string('Ouvre le lien reçu par email.').min(1, 'Ouvre le lien reçu par email.').max(100),
  password: newPasswordField,
  remember: z.boolean().optional(),
})
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>
