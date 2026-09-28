import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import type { RateLimitRule } from './rate-limit-rule.js';
import { RATE_LIMIT_RULES, RateLimitGuard } from './rate-limit.guard.js';

// Limite une route : `@RateLimit({ by: 'email', limit: 5, windowMs: HOUR })`.
export const RateLimit = (...rules: RateLimitRule[]) => applyDecorators(SetMetadata(RATE_LIMIT_RULES, rules), UseGuards(RateLimitGuard));
