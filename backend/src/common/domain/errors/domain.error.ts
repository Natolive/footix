// Erreurs métier, indépendantes du transport : traduites en réponses HTTP par DomainErrorFilter.
export abstract class DomainError extends Error {}
