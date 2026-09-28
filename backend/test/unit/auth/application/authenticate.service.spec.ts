import { SessionExpiredError } from '@src/auth/domain/errors/session-expired.error.js';
import { setupAuth } from './setup.js';

describe('AuthenticateService', () => {
  it('rejects a missing or unknown token', async () => {
    const auth = await setupAuth();
    await expect(auth.authenticate.execute(undefined)).rejects.toBeInstanceOf(SessionExpiredError);
    await expect(auth.authenticate.execute('unknown')).rejects.toBeInstanceOf(SessionExpiredError);
  });

  it('rejects an expired session', async () => {
    const auth = await setupAuth();
    const { token } = await auth.loggedIn();
    auth.sessions.rows.at(-1)!.expiresAt = new Date(Date.now() - 1);
    await expect(auth.authenticate.execute(token)).rejects.toBeInstanceOf(SessionExpiredError);
  });
});
