import { IUseCase, IUserSessionRepository, UnauthorizedError } from '@carbroz/common';
import { z } from 'zod';
import { RefreshTokenSchema } from '../dtos/auth.dto.js';

type Input = z.infer<typeof RefreshTokenSchema>;

export class RefreshTokenUseCase implements IUseCase<Input, any> {
  constructor(
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<any> {
    const { refreshToken, deviceId } = input;

    const session = await this.userSessionRepository.findByRefreshToken(refreshToken, deviceId);
    if (!session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const newRefreshToken = `rt_${Buffer.from(session.userId + Date.now().toString()).toString('base64')}`;

    const updatedSession = await this.userSessionRepository.save({
      ...session,
      refreshToken: newRefreshToken,
      lastActiveAt: new Date()
    } as any);

    return {
      user: updatedSession.user,
      session: updatedSession
    };
  }
}
