import { IUseCase, IUserSessionRepository } from '@carbroz/common';

export interface LogoutInput {
  sessionId?: number;
  userId?: number;
  logoutAll?: boolean;
}

/** Revokes one Identity session or all sessions for a user through the session repository port. */
export class LogoutUseCase implements IUseCase<LogoutInput, void> {
  constructor(private readonly userSessionRepository: IUserSessionRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    const { sessionId, userId, logoutAll } = input;

    if (logoutAll && userId) {
      await this.userSessionRepository.revokeAllForUser(userId);
      return;
    }

    if (sessionId) {
      await this.userSessionRepository.save({
        id: sessionId,
        isRevoked: true,
        refreshToken: null,
      } as any);
    }
  }
}
