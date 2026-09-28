import { dto, setupAuth } from './setup.js';

describe('UpdateProfileService', () => {
  it('changes the name, never the email', async () => {
    const auth = await setupAuth();
    const { user } = await auth.loggedIn();
    expect(await auth.updateProfile.execute(user, { firstName: 'Léna', lastName: 'Martin' })).toMatchObject({ firstName: 'Léna', lastName: 'Martin', email: dto.email });
  });
});
