import type { RateLimitRule } from './rate-limit-rule.js';

// Fenêtre fixe par clé : `limit` requêtes au plus par `windowMs`.
// ponytail: en mémoire, par processus et remis à zéro au redémarrage ; passer par Redis si plusieurs instances de l'API.
export class RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  hit(key: string, { limit, windowMs }: RateLimitRule, now = Date.now()): boolean {
    if (this.windows.size > 10_000) for (const [k, w] of this.windows) if (w.resetAt <= now) this.windows.delete(k);
    const window = this.windows.get(key);
    if (!window || window.resetAt <= now) {
      this.windows.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    return ++window.count <= limit;
  }
}
