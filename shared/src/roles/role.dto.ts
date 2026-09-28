import type { Permission, Role } from './permissions.ts'

// Rôle et ses droits effectifs ; le super admin a toujours tout et n'est pas modifiable.
export interface RoleDto {
  role: Role
  permissions: Permission[]
  editable: boolean
}
