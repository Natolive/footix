import { FindAvailabilityService } from '@src/users/application/find-availability.service.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';
import { person } from './setup.js';

describe('FindAvailabilityService', () => {
  it('lists who can play each day, confirmed accounts only, sorted by name', async () => {
    const users = new InMemoryUserRepository();
    await users.create({ ...person('lea@solem.fr'), emailVerifiedAt: new Date(), availableDays: ['monday', 'thursday'] });
    await users.create({ ...person('max@solem.fr'), lastName: 'Allard', emailVerifiedAt: new Date(), availableDays: ['thursday'] });
    await users.create({ ...person('new@solem.fr'), availableDays: ['thursday'] });
    const days = await new FindAvailabilityService(users).execute();
    expect(days.map((d) => d.day)).toEqual(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
    expect(days.find((d) => d.day === 'monday')!.people.map((p) => p.lastName)).toEqual(['Dupont']);
    expect(days.find((d) => d.day === 'thursday')!.people.map((p) => p.lastName)).toEqual(['Allard', 'Dupont']);
    expect(days.find((d) => d.day === 'friday')!.people).toEqual([]);
  });
});
