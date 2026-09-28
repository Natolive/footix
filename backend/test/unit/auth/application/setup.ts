import type { SignupDto } from '@footix/shared';
import { AuthenticateService } from '@src/auth/application/authenticate.service.js';
import { BuildAuthenticatedUserService } from '@src/auth/application/build-authenticated-user.service.js';
import { ChangePasswordService } from '@src/auth/application/change-password.service.js';
import { CompleteOnboardingService } from '@src/auth/application/complete-onboarding.service.js';
import { ForgotPasswordService } from '@src/auth/application/forgot-password.service.js';
import { LoginService } from '@src/auth/application/login.service.js';
import { LogoutService } from '@src/auth/application/logout.service.js';
import { OpenSessionService } from '@src/auth/application/open-session.service.js';
import { ResetPasswordService } from '@src/auth/application/reset-password.service.js';
import { SignupService } from '@src/auth/application/signup.service.js';
import { UpdateAvailabilityService } from '@src/auth/application/update-availability.service.js';
import { UpdateProfileService } from '@src/auth/application/update-profile.service.js';
import { VerifyEmailService } from '@src/auth/application/verify-email.service.js';
import { AssertEmailAllowedService } from '@src/email-domains/application/assert-email-allowed.service.js';
import { FindEmailDomainsService } from '@src/email-domains/application/find-email-domains.service.js';
import { RolePermissionsService } from '@src/roles/application/role-permissions.service.js';
import { FakeMailer } from '@test/fakes/fake-mailer.js';
import { FakePasswordHasher } from '@test/fakes/fake-password-hasher.js';
import { InMemoryEmailDomainRepository } from '@test/fakes/in-memory-email-domain.repository.js';
import { InMemoryRolePermissionRepository } from '@test/fakes/in-memory-role-permission.repository.js';
import { InMemorySessionRepository } from '@test/fakes/in-memory-session.repository.js';
import { InMemoryUserRepository } from '@test/fakes/in-memory-user.repository.js';

export const dto: SignupDto = { lastName: 'Dupont', firstName: 'Léa', email: 'lea@solem.fr', password: '12345678', availableDays: ['thursday'] };
export const credentials = { email: dto.email, password: dto.password };

// Cas d'usage d'auth câblés sur des fakes en mémoire, avec solem.fr autorisé : les parcours s'enchaînent comme en vrai.
export async function setupAuth() {
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const mailer = new FakeMailer();
  const hasher = new FakePasswordHasher();
  const emailDomains = new InMemoryEmailDomainRepository();
  await emailDomains.create({ domain: 'solem.fr' });
  const buildAuthenticatedUser = new BuildAuthenticatedUserService(new RolePermissionsService(new InMemoryRolePermissionRepository()));
  const openSession = new OpenSessionService(sessions, buildAuthenticatedUser);
  const assertEmailAllowed = new AssertEmailAllowedService(emailDomains, new FindEmailDomainsService(emailDomains));

  const signup = new SignupService(assertEmailAllowed, users, hasher, mailer, buildAuthenticatedUser);
  const verifyEmail = new VerifyEmailService(users, hasher, openSession);
  const login = new LoginService(users, hasher, openSession);
  // Ouvre le dernier lien envoyé, avec le mot de passe saisi sur la page de confirmation.
  const confirm = (password = dto.password, token = mailer.lastToken()) => verifyEmail.execute({ token, password });

  return {
    users,
    sessions,
    mailer,
    signup,
    verifyEmail,
    login,
    confirm,
    forgotPassword: new ForgotPasswordService(users, mailer),
    resetPassword: new ResetPasswordService(users, hasher, sessions, openSession),
    logout: new LogoutService(sessions),
    authenticate: new AuthenticateService(sessions, users, buildAuthenticatedUser),
    completeOnboarding: new CompleteOnboardingService(users),
    updateProfile: new UpdateProfileService(users, buildAuthenticatedUser),
    updateAvailability: new UpdateAvailabilityService(users, buildAuthenticatedUser),
    changePassword: new ChangePasswordService(users, hasher, sessions),
    // Compte inscrit, confirmé et connecté.
    loggedIn: async () => {
      await signup.execute(dto);
      await confirm();
      return login.execute(credentials);
    },
  };
}
