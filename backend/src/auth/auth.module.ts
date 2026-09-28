import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EmailDomainsModule } from '../email-domains/email-domains.module.js';
import { MailModule } from '../mail/mail.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthenticateService } from './application/authenticate.service.js';
import { BuildAuthenticatedUserService } from './application/build-authenticated-user.service.js';
import { ChangePasswordService } from './application/change-password.service.js';
import { CompleteOnboardingService } from './application/complete-onboarding.service.js';
import { ForgotPasswordService } from './application/forgot-password.service.js';
import { LoginService } from './application/login.service.js';
import { LogoutService } from './application/logout.service.js';
import { OpenSessionService } from './application/open-session.service.js';
import { ResetPasswordService } from './application/reset-password.service.js';
import { SignupService } from './application/signup.service.js';
import { UpdateAvailabilityService } from './application/update-availability.service.js';
import { UpdateProfileService } from './application/update-profile.service.js';
import { VerifyEmailService } from './application/verify-email.service.js';
import { PasswordHasher } from './domain/password-hasher.js';
import { SessionRepository } from './domain/session.repository.js';
import { DrizzleSessionRepository } from './infrastructure/drizzle-session.repository.js';
import { AuthController } from './infrastructure/http/auth.controller.js';
import { SessionGuard } from './infrastructure/http/session.guard.js';
import { ScryptPasswordHasher } from './infrastructure/scrypt-password-hasher.js';

@Module({
  imports: [UsersModule, RolesModule, EmailDomainsModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthenticateService,
    BuildAuthenticatedUserService,
    ChangePasswordService,
    CompleteOnboardingService,
    ForgotPasswordService,
    LoginService,
    LogoutService,
    OpenSessionService,
    ResetPasswordService,
    SignupService,
    UpdateAvailabilityService,
    UpdateProfileService,
    VerifyEmailService,
    // Global : `@Authorize(droit)` suffit sur une route de n'importe quel module.
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: SessionRepository, useClass: DrizzleSessionRepository },
  ],
})
export class AuthModule {}
