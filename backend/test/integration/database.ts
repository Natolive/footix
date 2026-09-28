import * as schema from '@src/common/infrastructure/database/schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';

// Connexion à la vraie base (DATABASE_URL), fermée par chaque fichier en `afterAll`.
export const connect = () => drizzle(process.env.DATABASE_URL!, { schema });

export const person = (email: string) => ({ email, firstName: 'Léa', lastName: 'Dupont', passwordHash: 'x' });
