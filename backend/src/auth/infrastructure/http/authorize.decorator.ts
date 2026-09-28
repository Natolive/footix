import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@footix/shared';
import { PERMISSION } from './session.guard.js';

// Protège une route derrière un droit : `@Authorize('profile.read')`, puis `@CurrentUser() user` dans le handler.
export const Authorize = (permission: Permission) => SetMetadata(PERMISSION, permission);
