import { z } from 'zod'

export const PASSWORD_MIN = 8

// Mot de passe choisi (inscription, réinitialisation).
export const newPasswordField = z
  .string('Choisis un mot de passe.')
  .min(PASSWORD_MIN, `Choisis un mot de passe d'au moins ${PASSWORD_MIN} caractères.`)
  .max(128)
