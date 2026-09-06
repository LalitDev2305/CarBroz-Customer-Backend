import type { IReadRepository, IWriteRepository } from '@carbroz/foundation-kernel';
import type { UserSession } from '../UserSession.js';

/** Identity-owned device-session repository. Refresh tokens are persisted by IRefreshTokenRepository. */
export interface IUserSessionRepository extends IReadRepository<UserSession, number>, IWriteRepository<UserSession, number> {
  findByDevice(userId: number, deviceId: string): Promise<UserSession | null>;
  upsert(userId: number, deviceId: string, data: Partial<UserSession>): Promise<UserSession>;
  revokeAllForUser(userId: number): Promise<void>;
}
