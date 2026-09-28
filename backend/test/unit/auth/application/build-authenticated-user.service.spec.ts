import { dto, setupAuth } from './setup.js';

describe('BuildAuthenticatedUserService', () => {
  it('gives the effective permissions of the role', async () => {
    const auth = await setupAuth();
    expect(await auth.signup.execute(dto)).toMatchObject({
      role: 'user',
      permissions: ['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'events.read', 'events.participate', 'events.invite_guest'],
    });
  });

  it('adds the extra permissions of the person to those of the role', async () => {
    const auth = await setupAuth();
    const { token } = await auth.loggedIn();
    auth.users.rows[0].extraPermissions = ['users.read'];
    expect((await auth.authenticate.execute(token)).permissions).toEqual(['profile.read', 'profile.update', 'profile.change_password', 'profile.update_availability', 'profile.complete_onboarding', 'users.read', 'events.read', 'events.participate', 'events.invite_guest']);
  });
});
