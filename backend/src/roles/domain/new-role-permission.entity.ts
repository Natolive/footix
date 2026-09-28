import type { RolePermission } from './role-permission.entity.js';

export type NewRolePermission = Omit<RolePermission, 'id' | 'createdAt'>;
