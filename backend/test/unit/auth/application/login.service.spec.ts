import { SESSION_TTL } from '@src/auth/application/open-session.service.js';
import { InvalidCredentialsError } from '@src/auth/domain/errors/invalid-credentials.error.js';
import { credentials, dto, setupAuth } from './setup.js';

describe('LoginService', () => {
  let auth: Awaited<ReturnType<typeof setupAuth>>;

  beforeEach(async () => {
    auth = await setupAuth();
    await auth.signup.execute(dto);
    await auth.confirm();
  });

  it('opens a session whose token authenticates the user', async () => {
    const session = await auth.login.execute(credentials);
    expect(auth.sessions.rows.at(-1)!.tokenHash).not.toBe(session.token);
    expect(await auth.authenticate.execute(session.token)).toMatchObject({ email: dto.email });
  });

  it('lasts longer with remember', async () => {
    const short = await auth.login.execute(credentials);
    const long = await auth.login.execute({ ...credentials, remember: true });
    expect(long.expiresAt.getTime() - short.expiresAt.getTime()).toBeGreaterThan(SESSION_TTL.remember - SESSION_TTL.short - 1000);
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    await expect(auth.login.execute({ ...credentials, password: 'wrong-password' })).rejects.toBeInstanceOf(InvalidCredentialsError);
    await expect(auth.login.execute({ ...credentials, email: 'nobody@solem.fr' })).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
