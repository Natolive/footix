import { RateLimiter } from '@src/common/infrastructure/http/rate-limiter.js';

describe('RateLimiter', () => {
  const rule = { by: 'email' as const, limit: 2, windowMs: 1000 };

  it('blocks past the limit, per key, until the window ends', () => {
    const limiter = new RateLimiter();
    expect([limiter.hit('a', rule, 0), limiter.hit('a', rule, 1), limiter.hit('a', rule, 2)]).toEqual([true, true, false]);
    expect(limiter.hit('b', rule, 3)).toBe(true);
    expect(limiter.hit('a', rule, 1000)).toBe(true);
  });
});
