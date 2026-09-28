import { setupAuth } from './setup.js';

describe('CompleteOnboardingService', () => {
  it('marks the guided tour as shown once and keeps the first date', async () => {
    const auth = await setupAuth();
    const { user } = await auth.loggedIn();
    await auth.completeOnboarding.execute(user);
    const first = auth.users.rows[0].onboardedAt;
    expect(first).toBeInstanceOf(Date);
    await auth.completeOnboarding.execute(user);
    expect(auth.users.rows[0].onboardedAt).toBe(first);
  });
});
