import { InvalidCredentialsError } from '@src/auth/domain/errors/invalid-credentials.error.js';
import { InvalidResetLinkError } from '@src/auth/domain/errors/invalid-reset-link.error.js';
import { SessionExpiredError } from '@src/auth/domain/errors/session-expired.error.js';
import { credentials, dto, setupAuth } from './setup.js';

describe('ResetPasswordService', () => {
  let auth: Awaited<ReturnType<typeof setupAuth>>;

  beforeEach(async () => {
    auth = await setupAuth();
  });

  it('changes the password once, logs out everywhere and logs in', async () => {
    const old = await auth.loggedIn();
    await auth.forgotPassword.execute({ email: dto.email });
    const token = auth.mailer.lastToken();

    const session = await auth.resetPassword.execute({ token, password: 'new-password' });
    await expect(auth.authenticate.execute(old.token)).rejects.toBeInstanceOf(SessionExpiredError);
    expect(await auth.authenticate.execute(session.token)).toMatchObject({ email: dto.email });
    await expect(auth.login.execute(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    await auth.login.execute({ ...credentials, password: 'new-password' });
    await expect(auth.resetPassword.execute({ token, password: 'other-password' })).rejects.toBeInstanceOf(
      InvalidResetLinkError,
    );
  });

  it('confirms the email of an unconfirmed account', async () => {
    await auth.signup.execute(dto);
    await auth.forgotPassword.execute({ email: dto.email });
    await auth.resetPassword.execute({ token: auth.mailer.lastToken(), password: 'new-password' });
    expect(auth.users.rows[0]).toMatchObject({ emailVerifiedAt: expect.any(Date), emailVerificationTokenHash: null });
  });

  it('rejects an expired link', async () => {
    await auth.signup.execute(dto);
    await auth.forgotPassword.execute({ email: dto.email });
    auth.users.rows[0].passwordResetExpiresAt = new Date(Date.now() - 1);
    await expect(auth.resetPassword.execute({ token: auth.mailer.lastToken(), password: 'new-password' })).rejects.toBeInstanceOf(
      InvalidResetLinkError,
    );
  });
});
