import { IUseCase, IUserSessionRepository } from '@carbroz/common';
import { z } from 'zod';
import { LogoutSchema } from '../dtos/auth.dto.js';

type Input = z.infer<typeof LogoutSchema> & { sessionId?: number; userId?: number; logoutAll?: boolean };

export class LogoutUseCase implements IUseCase<Input, void> {
  constructor(
    private readonly userSessionRepository: IUserSessionRepository
  ) {}

  async execute(input: Input): Promise<void> {
    const { sessionId, userId, logoutAll } = input;

    if (logoutAll && userId) {
      await this.userSessionRepository.revokeAllForUser(userId);
    } else if (sessionId) {
      await this.userSessionRepository.save({
        id: sessionId,
        isRevoked: true,
        refreshToken: null
      } as any);
    }
  }
}
