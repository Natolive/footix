import { z } from 'zod'
import { emailField } from '../common/email.field.ts'

export const loginSchema = z.object({
  email: emailField,
  password: z.string('Saisis ton mot de passe.').min(1, 'Saisis ton mot de passe.'),
  remember: z.boolean().optional(),
})
export type LoginDto = z.infer<typeof loginSchema>
