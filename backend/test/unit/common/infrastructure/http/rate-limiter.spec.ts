import { RateLimiter } from '@src/common/infrastructure/http/rate-limiter.js';

describe('RateLimiter', () => {
  const rule = { by: 'email' as const, limit: 2, windowMs: 1000 };

  it('blocks past the limit, per key, until the window ends', () => {
    const limiter = new RateLimiter();
    expect([limiter.hit('a', rule, 0), limiter.hit('a', rule, 1), limiter.hit('a', rule, 2)]).toEqual([true, true, false]);
    expect(limiter.hit('b', rule, 3)).toBe(true);
    expect(limiter.hit('a', rule, 1000)).toBe(true);
  });

  it('forgets expired windows once more than 10 000 keys are tracked, keeps the running ones', () => {
    const limiter = new RateLimiter();
    const size = () => limiter['windows'].size;
    for (let i = 0; i <= 10_000; i++) limiter.hit(`key-${i}`, rule, 0);
    limiter.hit('running', rule, 500);
    expect(size()).toBe(10_002);
    limiter.hit('new', rule, 1000);
    expect(size()).toBe(2);
  });
});
