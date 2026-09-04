import { IUseCase, UnauthorizedError, ValidationError } from '@carbroz/foundation-kernel';
import type { User } from '../domain/User.js';
import type { UserSession } from '../domain/UserSession.js';
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { IUserSessionRepository } from '../domain/repositories/IUserSessionRepository.js';

/** Input for beginning the phone-number OTP flow. */
export interface SendOtpInput {
  phoneNumber: string;
}

/** Transport-neutral result of beginning the OTP flow. */
export interface SendOtpResult {
  message: string;
  mockOtp: string;
  isNewUser: boolean;
  nextScreen: {
    template: string;
    api: string;
  };
}

/**
 * Starts Identity's OTP authentication flow through Identity-owned repository ports.
 *
 * The mock OTP is intentionally preserved from the existing behavior so this ownership migration
 * does not silently change authentication semantics. Production closeout must replace it with the
 * approved OTP provider, persistence, expiry and replay protections before architecture freeze.
 */
export class SendOtpUseCase implements IUseCase<SendOtpInput, SendOtpResult> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: SendOtpInput): Promise<SendOtpResult> {
    const user = await this.userRepository.findByPhoneNumber(input.phoneNumber);

    return {
      message: 'OTP sent successfully',
      mockOtp: '123456',
      isNewUser: !user,
      nextScreen: {
        template: 'form_template',
        api: 'auth/auth_otp',
      },
    };
  }
}

/** Input for verifying an OTP and establishing an authenticated session. */
export interface VerifyOtpInput {
  phoneNumber: string;
  otp: string;
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

/** Typed Identity result consumed by transport adapters after OTP verification. */
export interface VerifyOtpResult {
  user: User;
  session: UserSession;
  nextScreen: {
    template: string;
    api: string;
  };
}

/**
 * Verifies an OTP and establishes an Identity session without any HTTP dependency.
 *
 * Result types deliberately expose Identity's public User/UserSession contracts rather than
 * `unknown`; transport must not reconstruct domain/application typing with casts.
 */
export class VerifyOtpUseCase implements IUseCase<VerifyOtpInput, VerifyOtpResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    const { phoneNumber, otp, deviceId, deviceModel, osVersion, fcmToken } = input;

    if (otp !== '123456' && otp !== '111111') {
      throw new ValidationError('Invalid OTP');
    }

    const user = await this.userRepository.upsert(phoneNumber, {
      role: 'USER',
      isGuest: false,
    });
    const refreshToken = `rt_${Buffer.from(user.id + Date.now().toString()).toString('base64')}`;
    const session = await this.userSessionRepository.upsert(user.id, deviceId, {
      deviceModel,
      osVersion,
      fcmToken,
      refreshToken,
    });

    return {
      user,
      session,
      nextScreen: {
        template: 'dashboard_template',
        api: 'home',
      },
    };
  }
}

/** Input for creating a guest Identity session. */
export interface GuestLoginInput {
  deviceId: string;
  deviceModel?: string;
  osVersion?: string;
  fcmToken?: string;
}

/** Typed guest Identity/session result consumed by transport. */
export interface GuestLoginResult {
  user: User;
  session: UserSession;
}

/** Creates a guest identity and device session through Identity-owned repositories. */
export class GuestLoginUseCase implements IUseCase<GuestLoginInput, GuestLoginResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(input: GuestLoginInput): Promise<GuestLoginResult> {
    const guestUser = await this.userRepository.upsert(`guest_${Date.now()}`, {
      isGuest: true,
      role: 'GUEST',
    });
    const session = await this.userSessionRepository.upsert(guestUser.id, input.deviceId, {
      deviceModel: input.deviceModel,
      osVersion: input.osVersion,
      fcmToken: input.fcmToken,
    });

    return { user: guestUser, session };
  }
}

/** Input for rotating an Identity refresh session. */
export interface RefreshTokenInput {
  refreshToken: string;
  deviceId: string;
}

/** Typed refresh result; a refresh is invalid unless the repository supplies its owning user. */
export interface RefreshTokenResult {
  user: User;
  session: UserSession;
}

/** Resolves and rotates an Identity refresh session through the session repository port. */
export class RefreshTokenUseCase implements IUseCase<RefreshTokenInput, RefreshTokenResult> {
  constructor(private readonly userSessionRepository: IUserSessionRepository) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    const session = await this.userSessionRepository.findByRefreshToken(input.refreshToken, input.deviceId);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const updatedSession = await this.userSessionRepository.save({
      ...session,
      refreshToken: `rt_${Buffer.from(session.userId + Date.now().toString()).toString('base64')}`,
      lastActiveAt: new Date(),
    });
    if (!updatedSession.user) {
      throw new UnauthorizedError('Refresh session is missing its owning user');
    }

    return { user: updatedSession.user, session: updatedSession };
  }
}

/** Input for revoking one Identity session or all sessions belonging to a user. */
export interface LogoutInput {
  sessionId?: number;
  userId?: number;
  logoutAll?: boolean;
}

/** Revokes Identity sessions through the Identity repository boundary. */
export class LogoutUseCase implements IUseCase<LogoutInput, void> {
  constructor(private readonly userSessionRepository: IUserSessionRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    if (input.logoutAll && input.userId) {
      await this.userSessionRepository.revokeAllForUser(input.userId);
      return;
    }

    if (input.sessionId) {
      await this.userSessionRepository.save({
        id: input.sessionId,
        isRevoked: true,
        refreshToken: null,
      } as UserSession);
    }
  }
}
