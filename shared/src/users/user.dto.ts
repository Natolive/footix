import type { Permission, Role } from '../roles/permissions.ts'
import type { Weekday } from './weekday.ts'

// Utilisateur tel que renvoyé par l'API (jamais le hash du mot de passe), avec ses droits effectifs.
export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  // Visite guidée déjà affichée : elle ne revient plus.
  onboarded: boolean
  availableDays: Weekday[]
  permissions: Permission[]
}
