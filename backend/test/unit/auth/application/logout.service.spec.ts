import { SessionExpiredError } from '@src/auth/domain/errors/session-expired.error.js';
import { setupAuth } from './setup.js';

describe('LogoutService', () => {
  it('rejects the token after logout', async () => {
    const auth = await setupAuth();
    const { token } = await auth.loggedIn();
    await auth.logout.execute(token);
    await expect(auth.authenticate.execute(token)).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it('does nothing without a session cookie', async () => {
    const auth = await setupAuth();
    await auth.loggedIn();
    const before = auth.sessions.rows.length;
    await auth.logout.execute(undefined);
    expect(auth.sessions.rows).toHaveLength(before);
  });
});
