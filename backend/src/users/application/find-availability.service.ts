import { Injectable } from '@nestjs/common';
import { WEEKDAYS, type DayAvailabilityDto } from '@footix/shared';
import { UserRepository } from '../domain/user.repository.js';
import { byName } from './by-name.js';

@Injectable()
export class FindAvailabilityService {
  constructor(private readonly users: UserRepository) {}

  // Comptes confirmés seulement : un compte jamais activé ne viendra pas jouer.
  async execute(): Promise<DayAvailabilityDto[]> {
    const players = (await this.users.findAll()).filter((u) => u.emailVerifiedAt).toSorted(byName);
    return WEEKDAYS.map((day) => ({
      day,
      people: players.filter((u) => u.availableDays.includes(day)).map(({ id, firstName, lastName }) => ({ id, firstName, lastName })),
    }));
  }
}
