import { EmailNotVerifiedError } from '@src/auth/domain/errors/email-not-verified.error.js';
import { InvalidCredentialsError } from '@src/auth/domain/errors/invalid-credentials.error.js';
import { InvalidVerificationLinkError } from '@src/auth/domain/errors/invalid-verification-link.error.js';
import { VerificationPasswordMismatchError } from '@src/auth/domain/errors/verification-password-mismatch.error.js';
import { credentials, dto, setupAuth } from './setup.js';

describe('VerifyEmailService', () => {
  let auth: Awaited<ReturnType<typeof setupAuth>>;

  beforeEach(async () => {
    auth = await setupAuth();
  });

  it('sends a link whose token is stored hashed and works once', async () => {
    await auth.signup.execute(dto);
    const token = auth.mailer.lastToken();
    expect(auth.mailer.sent).toEqual([expect.objectContaining({ to: { email: dto.email, name: dto.firstName } })]);
    expect(auth.mailer.sent[0].html).toContain(`/verify-email?token=${token}`);
    expect(auth.users.rows[0].emailVerificationTokenHash).not.toBe(token);
    await expect(auth.login.execute(credentials)).rejects.toBeInstanceOf(EmailNotVerifiedError);

    const session = await auth.confirm();
    expect(await auth.authenticate.execute(session.token)).toMatchObject({ email: dto.email });
    await expect(auth.login.execute(credentials)).resolves.toMatchObject({ user: { email: dto.email } });
    await expect(auth.confirm()).rejects.toBeInstanceOf(InvalidVerificationLinkError);
  });

  it('never confirms the password of someone else who signed up with the same email', async () => {
    await auth.signup.execute(dto);
    await auth.signup.execute({ ...dto, password: 'attacker-password' });
    // Léa ouvre le lien reçu (celui de la 2e inscription) avec son mot de passe : refusé, le lien reste valable.
    await expect(auth.confirm()).rejects.toBeInstanceOf(VerificationPasswordMismatchError);
    expect(auth.users.rows[0].emailVerifiedAt).toBeNull();
    // Elle se réinscrit : son mot de passe reprend la main.
    await auth.signup.execute(dto);
    await auth.confirm();
    await expect(auth.login.execute({ ...credentials, password: 'attacker-password' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('rejects an expired link', async () => {
    await auth.signup.execute(dto);
    auth.users.rows[0].emailVerificationExpiresAt = new Date(Date.now() - 1);
    await expect(auth.confirm()).rejects.toBeInstanceOf(InvalidVerificationLinkError);
    expect(auth.users.rows[0].emailVerifiedAt).toBeNull();
  });
});
