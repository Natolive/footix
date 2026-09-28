import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Permission } from '@footix/shared';
import { AuthenticateService } from '../../application/authenticate.service.js';
import { MissingPermissionError } from '../../domain/errors/missing-permission.error.js';
import type { AuthenticatedRequest } from './authenticated-request.js';
import { readSessionCookie } from './session-cookie.js';

export const PERMISSION = 'permission';

// Guard global (APP_GUARD) : n'agit que sur les routes marquées `@Authorize`, les autres restent publiques.
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly authenticate: AuthenticateService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<Permission | undefined>(PERMISSION, context.getHandler());
    if (!permission) return true;
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    req.user = await this.authenticate.execute(readSessionCookie(req));
    if (!req.user.permissions.includes(permission)) throw new MissingPermissionError();
    return true;
  }
}
