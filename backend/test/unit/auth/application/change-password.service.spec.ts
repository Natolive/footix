import { InvalidCredentialsError } from '@src/auth/domain/errors/invalid-credentials.error.js';
import { SessionExpiredError } from '@src/auth/domain/errors/session-expired.error.js';
import { WrongCurrentPasswordError } from '@src/auth/domain/errors/wrong-current-password.error.js';
import { credentials, dto, setupAuth } from './setup.js';

describe('ChangePasswordService', () => {
  it('asks for the current password, then logs out the other sessions only', async () => {
    const auth = await setupAuth();
    const here = await auth.loggedIn();
    const elsewhere = await auth.login.execute(credentials);
    await expect(auth.changePassword.execute(here.user, here.token, { currentPassword: 'wrong', password: 'new-password' })).rejects.toBeInstanceOf(WrongCurrentPasswordError);
    await auth.changePassword.execute(here.user, here.token, { currentPassword: dto.password, password: 'new-password' });
    await expect(auth.authenticate.execute(here.token)).resolves.toMatchObject({ email: dto.email });
    await expect(auth.authenticate.execute(elsewhere.token)).rejects.toBeInstanceOf(SessionExpiredError);
    await expect(auth.login.execute(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError);
    await auth.login.execute({ ...credentials, password: 'new-password' });
  });
});
