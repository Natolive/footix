import { createHash } from 'node:crypto';

// Jetons (session, liens envoyés par email) stockés hachés : une fuite de la base ne donne rien d'utilisable.
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
