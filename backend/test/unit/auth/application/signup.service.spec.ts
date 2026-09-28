import { InvalidVerificationLinkError } from '@src/auth/domain/errors/invalid-verification-link.error.js';
import { EmailDomainNotAllowedError } from '@src/email-domains/domain/errors/email-domain-not-allowed.error.js';
import { EmailAlreadyUsedError } from '@src/users/domain/errors/email-already-used.error.js';
import { dto, setupAuth } from './setup.js';

describe('SignupService', () => {
  let auth: Awaited<ReturnType<typeof setupAuth>>;

  beforeEach(async () => {
    auth = await setupAuth();
  });

  it('stores the hashed password and never returns it', async () => {
    const user = await auth.signup.execute(dto);
    expect(user).not.toHaveProperty('passwordHash');
    expect(auth.users.rows[0].passwordHash).toBe('hashed:12345678');
  });

  it('saves the available days given at signup', async () => {
    expect((await auth.signup.execute(dto)).availableDays).toEqual(['thursday']);
  });

  it('rejects an email already confirmed', async () => {
    await auth.signup.execute(dto);
    await auth.confirm();
    await expect(auth.signup.execute(dto)).rejects.toBeInstanceOf(EmailAlreadyUsedError);
  });

  it('replaces an unconfirmed account and sends a new link that alone is valid', async () => {
    await auth.signup.execute(dto);
    const oldToken = auth.mailer.lastToken();
    await auth.signup.execute({ ...dto, password: 'new-password' });
    expect(auth.users.rows).toHaveLength(1);
    expect(auth.users.rows[0].passwordHash).toBe('hashed:new-password');
    await expect(auth.confirm('new-password', oldToken)).rejects.toBeInstanceOf(InvalidVerificationLinkError);
    await auth.confirm('new-password');
    expect(auth.users.rows[0].emailVerifiedAt).toBeInstanceOf(Date);
  });

  it('rejects an email outside the allowed domains', async () => {
    await expect(auth.signup.execute({ ...dto, email: 'lea@gmail.com' })).rejects.toBeInstanceOf(EmailDomainNotAllowedError);
    expect(auth.users.rows).toHaveLength(0);
  });
});
