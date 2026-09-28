import type { User } from '../domain/user.entity.js';

// Tri par nom puis prénom, à la française.
export const byName = (a: User, b: User) => a.lastName.localeCompare(b.lastName, 'fr') || a.firstName.localeCompare(b.firstName, 'fr');
