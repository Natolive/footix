import type { Permission, Role, RoleDto } from '@footix/shared';

export const toRoleDto = (role: Role, permissions: Permission[]): RoleDto => ({ role, permissions, editable: role !== 'super_admin' });
