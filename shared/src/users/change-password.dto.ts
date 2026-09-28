import { z } from 'zod'
import { newPasswordField } from '../common/new-password.field.ts'

// Le mot de passe actuel est redemandé : une session restée ouverte ne suffit pas pour changer d'accès.
export const changePasswordSchema = z.object({
  currentPassword: z.string('Saisis ton mot de passe actuel.').min(1, 'Saisis ton mot de passe actuel.'),
  password: newPasswordField,
})
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
