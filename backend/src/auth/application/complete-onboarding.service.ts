import { Injectable } from '@nestjs/common';
import { orThrow } from '../../common/application/or-throw.js';
import { UserNotFoundError } from '../../users/domain/errors/user-not-found.error.js';
import { UserRepository } from '../../users/domain/user.repository.js';
import type { AuthenticatedUser } from './authenticated-user.js';

@Injectable()
export class CompleteOnboardingService {
  constructor(private readonly users: UserRepository) {}

  // Idempotent : la date de la première visite est conservée.
  async execute({ id }: AuthenticatedUser): Promise<void> {
    const user = orThrow(await this.users.findById(id), UserNotFoundError);
    if (!user.onboardedAt) await this.users.update(id, { onboardedAt: new Date() });
  }
}
