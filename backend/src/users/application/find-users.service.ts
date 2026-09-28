import { Injectable } from '@nestjs/common';
import type { ManagedUserDto } from '@footix/shared';
import { toManagedUser } from '../domain/to-managed-user.js';
import { UserRepository } from '../domain/user.repository.js';
import { byName } from './by-name.js';

@Injectable()
export class FindUsersService {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<ManagedUserDto[]> {
    return (await this.users.findAll()).toSorted(byName).map(toManagedUser);
  }
}
