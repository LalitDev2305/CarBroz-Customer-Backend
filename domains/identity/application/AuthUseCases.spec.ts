import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedError, ValidationError } from '@carbroz/foundation-kernel';
import type { User } from '../domain/User.js';
import type { UserSession } from '../domain/UserSession.js';
import type { IUserRepository } from '../domain/repositories/IUserRepository.js';
import type { IUserSessionRepository } from '../domain/repositories/IUserSessionRepository.js';
import {
  GuestLoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  SendOtpUseCase,
  VerifyOtpUseCase,
} from './AuthUseCases.js';

const user = { id: 7, phoneNumber: '9999999999', role: 'USER', isGuest: false } as unknown as User;
const guest = { id: 8, phoneNumber: 'guest', role: 'GUEST', isGuest: true } as unknown as User;
const session = {
  id: 11,
  userId: 7,
  deviceId: 'device-1',
  refreshToken: 'old-token',
  isRevoked: false,
  user,
} as unknown as UserSession;

function repositories() {
  const users = {
    findByPhoneNumber: vi.fn(),
    upsert: vi.fn(),
  } as unknown as IUserRepository;
  const sessions = {
    upsert: vi.fn(),
    findByRefreshToken: vi.fn(),
    save: vi.fn(),
    revokeAllForUser: vi.fn(),
  } as unknown as IUserSessionRepository;
  return { users, sessions };
}

describe('Identity authentication use cases', () => {
  it('reports whether OTP authentication belongs to a new or existing user', async () => {
    const { users } = repositories();
    vi.mocked(users.findByPhoneNumber).mockResolvedValueOnce(null).mockResolvedValueOnce(user);
    const useCase = new SendOtpUseCase(users);

    await expect(useCase.execute({ phoneNumber: '9999999999' })).resolves.toMatchObject({
      mockOtp: '123456',
      isNewUser: true,
      nextScreen: { template: 'form_template', api: 'auth/auth_otp' },
    });
    await expect(useCase.execute({ phoneNumber: '9999999999' })).resolves.toMatchObject({ isNewUser: false });
  });

  it('rejects an invalid OTP before creating identity state', async () => {
    const { users, sessions } = repositories();
    const useCase = new VerifyOtpUseCase(users, sessions);

    await expect(useCase.execute({ phoneNumber: '9999999999', otp: '000000', deviceId: 'device-1' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(users.upsert).not.toHaveBeenCalled();
    expect(sessions.upsert).not.toHaveBeenCalled();
  });

  it.each(['123456', '111111'])('accepts supported OTP %s and creates a typed user session', async (otp) => {
    const { users, sessions } = repositories();
    vi.mocked(users.upsert).mockResolvedValue(user);
    vi.mocked(sessions.upsert).mockResolvedValue(session);
    const useCase = new VerifyOtpUseCase(users, sessions);

    const result = await useCase.execute({
      phoneNumber: '9999999999',
      otp,
      deviceId: 'device-1',
      deviceModel: 'Pixel',
      osVersion: '16',
      fcmToken: 'fcm-1',
    });

    expect(result).toMatchObject({ user, session, nextScreen: { template: 'dashboard_template', api: 'home' } });
    expect(users.upsert).toHaveBeenCalledWith('9999999999', { role: 'USER', isGuest: false });
    expect(sessions.upsert).toHaveBeenCalledWith(7, 'device-1', expect.objectContaining({
      deviceModel: 'Pixel',
      osVersion: '16',
      fcmToken: 'fcm-1',
      refreshToken: expect.stringMatching(/^rt_/),
    }));
  });

  it('creates a guest user and device session', async () => {
    const { users, sessions } = repositories();
    vi.mocked(users.upsert).mockResolvedValue(guest);
    vi.mocked(sessions.upsert).mockResolvedValue({ ...session, userId: 8 } as unknown as UserSession);
    const useCase = new GuestLoginUseCase(users, sessions);

    const result = await useCase.execute({ deviceId: 'guest-device', deviceModel: 'Web', osVersion: '1', fcmToken: 'guest-fcm' });

    expect(result.user).toBe(guest);
    expect(users.upsert).toHaveBeenCalledWith(expect.stringMatching(/^guest_/), { isGuest: true, role: 'GUEST' });
    expect(sessions.upsert).toHaveBeenCalledWith(8, 'guest-device', {
      deviceModel: 'Web', osVersion: '1', fcmToken: 'guest-fcm',
    });
  });

  it('rejects missing refresh sessions', async () => {
    const { sessions } = repositories();
    vi.mocked(sessions.findByRefreshToken).mockResolvedValue(null);

    await expect(new RefreshTokenUseCase(sessions).execute({ refreshToken: 'missing', deviceId: 'device-1' }))
      .rejects.toBeInstanceOf(UnauthorizedError);
    expect(sessions.save).not.toHaveBeenCalled();
  });

  it('rejects a rotated refresh session when its owning user is absent', async () => {
    const { sessions } = repositories();
    vi.mocked(sessions.findByRefreshToken).mockResolvedValue(session);
    vi.mocked(sessions.save).mockResolvedValue({ ...session, user: undefined } as unknown as UserSession);

    await expect(new RefreshTokenUseCase(sessions).execute({ refreshToken: 'old-token', deviceId: 'device-1' }))
      .rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rotates a valid refresh token and returns its owning user', async () => {
    const { sessions } = repositories();
    vi.mocked(sessions.findByRefreshToken).mockResolvedValue(session);
    vi.mocked(sessions.save).mockImplementation(async (value) => ({ ...value, user } as UserSession));

    const result = await new RefreshTokenUseCase(sessions).execute({ refreshToken: 'old-token', deviceId: 'device-1' });

    expect(result.user).toBe(user);
    expect(result.session.refreshToken).toMatch(/^rt_/);
    expect(result.session.refreshToken).not.toBe('old-token');
    expect(result.session.lastActiveAt).toBeInstanceOf(Date);
  });

  it('revokes all sessions only when both logout-all and user identity are supplied', async () => {
    const { sessions } = repositories();
    const useCase = new LogoutUseCase(sessions);

    await useCase.execute({ logoutAll: true, userId: 7 });
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith(7);
    expect(sessions.save).not.toHaveBeenCalled();
  });

  it('revokes one session when a session id is supplied', async () => {
    const { sessions } = repositories();
    vi.mocked(sessions.save).mockResolvedValue(session);

    await new LogoutUseCase(sessions).execute({ sessionId: 11 });

    expect(sessions.save).toHaveBeenCalledWith(expect.objectContaining({ id: 11, isRevoked: true, refreshToken: null }));
    expect(sessions.revokeAllForUser).not.toHaveBeenCalled();
  });

  it('performs no revocation when logout input identifies no session scope', async () => {
    const { sessions } = repositories();
    const useCase = new LogoutUseCase(sessions);

    await useCase.execute({ logoutAll: true });
    await useCase.execute({ userId: 7 });
    await useCase.execute({});

    expect(sessions.revokeAllForUser).not.toHaveBeenCalled();
    expect(sessions.save).not.toHaveBeenCalled();
  });
});
