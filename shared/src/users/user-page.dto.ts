import type { ManagedUserDto } from './managed-user.dto.ts'

// Une page de la liste des utilisateurs.
export interface UserPageDto {
  items: ManagedUserDto[]
  // Comptes qui correspondent à la recherche et aux filtres.
  total: number
  // Tous les comptes, sans filtre.
  overall: number
  // Page renvoyée : la dernière qui existe si celle demandée est au-delà (après une suppression).
  page: number
}
