import { IUseCase, IUserSessionRepository, UnauthorizedError } from '@carbroz/common';

export interface RefreshTokenInput {
  refreshToken: string;
  deviceId: string;
}

export interface RefreshTokenResult {
  user: unknown;
  session: unknown;
}

/**
 * Resolves and rotates an Identity refresh session using only Identity repository contracts.
 * Token generation remains a production-hardening concern and must be replaced by a secure token
 * provider before architecture freeze.
 */
export class RefreshTokenUseCase implements IUseCase<RefreshTokenInput, RefreshTokenResult> {
  constructor(private readonly userSessionRepository: IUserSessionRepository) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    const { refreshToken, deviceId } = input;
    const session = await this.userSessionRepository.findByRefreshToken(refreshToken, deviceId);
    if (!session) throw new UnauthorizedError('Invalid or expired refresh token');

    const newRefreshToken = `rt_${Buffer.from(session.userId + Date.now().toString()).toString('base64')}`;
    const updatedSession = await this.userSessionRepository.save({
      ...session,
      refreshToken: newRefreshToken,
      lastActiveAt: new Date(),
    } as any);

    return { user: updatedSession.user, session: updatedSession };
  }
}
