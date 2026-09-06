import {
  ApplicationError,
  IUseCase,
  UnauthorizedError,
  systemClock,
} from '@carbroz/foundation-kernel';
import type { User } from '../domain/User.js';
import type { UserSession } from '../domain/UserSession.js';
import type { IOtpChallengeRepository } from '../domain/repositories/IOtpChallengeRepository.js';
import type { IRefreshTokenRepository } from '../domain/repositories/IRefreshTokenRepository.js';
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { IUserSessionRepository } from '../domain/repositories/IUserSessionRepository.js';
import type { IAuthSecurityProvider } from './ports/IAuthSecurityProvider.js';
import type { IOtpDeliveryProvider } from './ports/IOtpDeliveryProvider.js';
import { AUTH_SECURITY_POLICY } from './AuthSecurityPolicy.js';

const otpFailure = () => new UnauthorizedError('Invalid or expired OTP challenge');
const refreshFailure = () => new UnauthorizedError('Invalid or expired refresh token');

/** Input for beginning the phone-number OTP flow. */
export interface SendOtpInput {
  phoneNumber: string;
  deviceId: string;
}

/** Transport-neutral result of beginning the OTP flow. The OTP itself is intentionally absent. */
export interface SendOtpResult {
  message: string;
  challengeId: string;
  expiresInSeconds: number;
  isNewUser: boolean;
  nextScreen: {
    template: string;
    api: string;
  };
}

/** Starts a persisted, rate-limited, provider-delivered OTP challenge. */
export class SendOtpUseCase implements IUseCase<SendOtpInput, SendOtpResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly otpChallengeRepository: IOtpChallengeRepository,
    private readonly smsProvider: IOtpDeliveryProvider,
    private readonly authSecurityProvider: IAuthSecurityProvider,
  ) {}

  async execute(input: SendOtpInput): Promise<SendOtpResult> {
    const now = systemClock.now();
    const latest = await this.otpChallengeRepository.findLatestByPhone(input.phoneNumber);
    if (latest && !latest.invalidatedAt && !latest.consumedAt) {
      const cooldownEndsAt = new Date(latest.createdAt.getTime() + AUTH_SECURITY_POLICY.otp.resendCooldownMs);
      if (cooldownEndsAt.getTime() > now.getTime()) {
        throw new ApplicationError('OTP resend cooldown is active', 429, 'OTP_RESEND_COOLDOWN');
      }
    }

    const rateWindowStart = new Date(now.getTime() - AUTH_SECURITY_POLICY.otp.rateLimitWindowMs);
    const recentChallenges = await this.otpChallengeRepository.countCreatedSince(input.phoneNumber, rateWindowStart);
    if (recentChallenges >= AUTH_SECURITY_POLICY.otp.maxChallengesPerWindow) {
      throw new ApplicationError('OTP request limit exceeded', 429, 'OTP_RATE_LIMITED');
    }

    const user = await this.userRepository.findByPhoneNumber(input.phoneNumber);
    const otp = this.authSecurityProvider.generateOtp(AUTH_SECURITY_POLICY.otp.length);
    const otpHash = await this.authSecurityProvider.hashSecret(otp);
    const challenge = await this.otpChallengeRepository.create({
      phoneNumber: input.phoneNumber,
      deviceId: input.deviceId,
      otpHash,
      maxAttempts: AUTH_SECURITY_POLICY.otp.maxAttempts,
      expiresAt: new Date(now.getTime() + AUTH_SECURITY_POLICY.otp.ttlMs),
    });

    try {
      const delivery = await this.smsProvider.sendOtp({ phoneNumber: input.phoneNumber, otp });
      if (!delivery.success) {
        await this.otpChallengeRepository.invalidate(challenge.id, now);
        throw new ApplicationError('OTP delivery is temporarily unavailable', 503, 'OTP_DELIVERY_FAILED');
      }
    } catch (error) {
      await this.otpChallengeRepository.invalidate(challenge.id, now);
      if (error instanceof ApplicationError) throw error;
      throw new ApplicationError('OTP delivery is temporarily unavailable', 503, 'OTP_DELIVERY_FAILED');
    }

    return {
      message: 'OTP sent successfully',
      challengeId: challenge.publicId,
      expiresInSeconds: Math.floor(AUTH_SECURITY_POLICY.otp.ttlMs / 1000),
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
  challengeId: string;
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
  refreshToken: string;
  nextScreen: {
    template: string;
    api: string;
  };
}

/** Verifies and one-time consumes an OTP challenge, then issues a hashed refresh-token family. */
export class VerifyOtpUseCase implements IUseCase<VerifyOtpInput, VerifyOtpResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userSessionRepository: IUserSessionRepository,
    private readonly otpChallengeRepository: IOtpChallengeRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly authSecurityProvider: IAuthSecurityProvider,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    const now = systemClock.now();
    const challenge = await this.otpChallengeRepository.findForVerification(
      input.challengeId,
      input.phoneNumber,
      input.deviceId,
    );
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.invalidatedAt ||
      challenge.attemptCount >= challenge.maxAttempts ||
      challenge.expiresAt.getTime() <= now.getTime()
    ) {
      throw otpFailure();
    }

    const matches = await this.authSecurityProvider.verifySecret(input.otp, challenge.otpHash);
    if (!matches) {
      const updated = await this.otpChallengeRepository.recordFailedAttempt(challenge.id, challenge.maxAttempts);
      if (updated && updated.attemptCount >= updated.maxAttempts) {
        await this.otpChallengeRepository.invalidate(updated.id, now);
      }
      throw otpFailure();
    }

    const consumed = await this.otpChallengeRepository.tryConsume(challenge.id, now, challenge.maxAttempts);
    if (!consumed) throw otpFailure();

    const user = await this.userRepository.upsert(input.phoneNumber, {
      role: 'USER',
      isGuest: false,
    });
    const session = await this.userSessionRepository.upsert(user.id, input.deviceId, {
      deviceModel: input.deviceModel,
      osVersion: input.osVersion,
      fcmToken: input.fcmToken,
      lastActiveAt: now,
    });

    const refreshToken = this.authSecurityProvider.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    await this.refreshTokenRepository.issue({
      sessionId: session.id,
      tokenHash: this.authSecurityProvider.hashRefreshToken(refreshToken),
      familyId: this.authSecurityProvider.generateTokenFamilyId(),
      expiresAt: new Date(now.getTime() + AUTH_SECURITY_POLICY.refresh.ttlMs),
      now,
    });

    return {
      user,
      session,
      refreshToken,
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
    const now = systemClock.now();
    const guestUser = await this.userRepository.upsert(`guest_${now.getTime()}`, {
      isGuest: true,
      role: 'GUEST',
    });
    const session = await this.userSessionRepository.upsert(guestUser.id, input.deviceId, {
      deviceModel: input.deviceModel,
      osVersion: input.osVersion,
      fcmToken: input.fcmToken,
      lastActiveAt: now,
    });

    return { user: guestUser, session };
  }
}

/** Input for rotating an Identity refresh session. */
export interface RefreshTokenInput {
  refreshToken: string;
  deviceId: string;
}

/** Raw replacement refresh material is returned only once, after its hash has been persisted. */
export interface RefreshTokenResult {
  user: User;
  session: UserSession;
  refreshToken: string;
}

/** Performs one-time refresh-token rotation with family replay detection. */
export class RefreshTokenUseCase implements IUseCase<RefreshTokenInput, RefreshTokenResult> {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly authSecurityProvider: IAuthSecurityProvider,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    const now = systemClock.now();
    const replacementToken = this.authSecurityProvider.generateRefreshToken(AUTH_SECURITY_POLICY.refresh.tokenBytes);
    const rotation = await this.refreshTokenRepository.rotate({
      currentTokenHash: this.authSecurityProvider.hashRefreshToken(input.refreshToken),
      deviceId: input.deviceId,
      replacementTokenHash: this.authSecurityProvider.hashRefreshToken(replacementToken),
      replacementExpiresAt: new Date(now.getTime() + AUTH_SECURITY_POLICY.refresh.ttlMs),
      now,
    });

    if (rotation.status !== 'ROTATED' || !rotation.session?.user) throw refreshFailure();

    return {
      user: rotation.session.user,
      session: rotation.session,
      refreshToken: replacementToken,
    };
  }
}

/** Input for revoking one Identity session or all sessions belonging to a user. */
export interface LogoutInput {
  sessionId?: number;
  userId?: number;
  logoutAll?: boolean;
}

/** Revokes the session and every hashed refresh token in its token family. */
export class LogoutUseCase implements IUseCase<LogoutInput, void> {
  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    const now = systemClock.now();
    if (input.logoutAll && input.userId) {
      await this.refreshTokenRepository.revokeAllForUser(input.userId, now);
      return;
    }
    if (input.sessionId) await this.refreshTokenRepository.revokeSession(input.sessionId, now);
  }
}
