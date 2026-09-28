import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { TooManyRequestsError } from '../../domain/errors/too-many-requests.error.js';
import type { RateLimitRule } from './rate-limit-rule.js';
import { RateLimiter } from './rate-limiter.js';

export const RATE_LIMIT_RULES = 'rate-limit';
const limiter = new RateLimiter();

// Posé par `@RateLimit(...)`, jamais à la main.
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rules = this.reflector.get<RateLimitRule[]>(RATE_LIMIT_RULES, context.getHandler());
    const req = context.switchToHttp().getRequest<Request>();
    // Guard avant la validation : body brut, normalisé comme `emailField`.
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    // Toutes les règles comptent la requête, même si l'une bloque.
    const allowed = rules.map((rule) => limiter.hit(`${route}:${rule.by}:${rule.by === 'ip' ? req.ip : email}`, rule));
    if (allowed.includes(false)) throw new TooManyRequestsError('Trop de tentatives, réessaie dans quelques minutes.');
    return true;
  }
}
