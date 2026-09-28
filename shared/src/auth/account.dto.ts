import { z } from 'zod'
import { emailField } from '../common/email.field.ts'
import { newPasswordField } from '../common/new-password.field.ts'

// Première étape de l'inscription : qui on est.
export const accountSchema = z.object({
  lastName: z.string('Saisis ton nom.').trim().min(1, 'Saisis ton nom.').max(100),
  firstName: z.string('Saisis ton prénom.').trim().min(1, 'Saisis ton prénom.').max(100),
  email: emailField,
  password: newPasswordField,
})
export type AccountDto = z.infer<typeof accountSchema>
