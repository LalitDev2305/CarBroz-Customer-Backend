import { type IUseCase } from '@carbroz/foundation-kernel';
import { type IUserSessionRepository } from '../domain/repositories/IUserSessionRepository.js';

interface Input {
  deviceId?: string;
  sessionId?: number;
  userId?: number;
  logoutAll?: boolean;
}

export class LogoutUseCase implements IUseCase<Input, void> {
  constructor(private readonly userSessionRepository: IUserSessionRepository) {}

  async execute(input: Input): Promise<void> {
    const { sessionId, userId, logoutAll } = input;
    if (logoutAll && userId) {
      await this.userSessionRepository.revokeAllForUser(userId);
    } else if (sessionId) {
      await this.userSessionRepository.save({
        id: sessionId,
        isRevoked: true,
        refreshToken: null,
      } as any);
    }
  }
}
