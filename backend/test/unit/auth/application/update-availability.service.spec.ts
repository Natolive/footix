import { updateAvailabilitySchema } from '@footix/shared';
import { setupAuth } from './setup.js';

describe('UpdateAvailabilityService', () => {
  it('saves the available days, in week order and without duplicates', async () => {
    const auth = await setupAuth();
    const { user } = await auth.loggedIn();
    const availableDays = updateAvailabilitySchema.parse({ availableDays: ['friday', 'monday', 'friday'] }).availableDays;
    expect((await auth.updateAvailability.execute(user, { availableDays })).availableDays).toEqual(['monday', 'friday']);
  });
});
