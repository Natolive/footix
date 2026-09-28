// Entité trouvée, ou l'erreur métier donnée : `orThrow(await repository.findById(id), UserNotFoundError)`.
export function orThrow<T>(entity: T | null, error: new () => Error): T {
  if (entity === null) throw new error();
  return entity;
}
