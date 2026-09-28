export interface Session {
  id: string;
  userId: string;
  // Seul le hash du jeton est stocké : une fuite de la table ne donne pas de sessions utilisables.
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}
