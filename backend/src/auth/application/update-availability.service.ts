import { Injectable } from '@nestjs/common';
import type { UpdateAvailabilityDto } from '@footix/shared';
import { orThrow } from '../../common/application/or-throw.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import type { AuthenticatedUser } from './authenticated-user.js';
import { BuildAuthenticatedUserService } from './build-authenticated-user.service.js';

@Injectable()
export class UpdateAvailabilityService {
  constructor(
    private readonly users: UserRepository,
    private readonly buildAuthenticatedUser: BuildAuthenticatedUserService,
  ) {}

  async execute(user: AuthenticatedUser, { availableDays }: UpdateAvailabilityDto): Promise<AuthenticatedUser> {
    return this.buildAuthenticatedUser.execute(orThrow(await this.users.update(user.id, { availableDays }), UserNotFoundError));
  }
}
