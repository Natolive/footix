import { dto, setupAuth } from './setup.js';

describe('ForgotPasswordService', () => {
  let auth: Awaited<ReturnType<typeof setupAuth>>;

  beforeEach(async () => {
    auth = await setupAuth();
  });

  it('sends nothing for an unknown email', async () => {
    await auth.forgotPassword.execute({ email: 'nobody@solem.fr' });
    expect(auth.mailer.sent).toHaveLength(0);
  });

  it('sends a reset link whose token is stored hashed', async () => {
    await auth.signup.execute(dto);
    await auth.forgotPassword.execute({ email: dto.email });
    const token = auth.mailer.lastToken();
    expect(auth.mailer.sent.at(-1)!.html).toContain(`/reset-password?token=${token}`);
    expect(auth.users.rows[0].passwordResetTokenHash).not.toBe(token);
  });
});
