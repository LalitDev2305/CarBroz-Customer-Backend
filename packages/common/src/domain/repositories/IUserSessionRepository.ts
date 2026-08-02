import { UserSession } from '../UserSession.js';
import { IReadRepository } from '../IReadRepository.js';
import { IWriteRepository } from '../IWriteRepository.js';

export interface IUserSessionRepository extends IReadRepository<UserSession, number>, IWriteRepository<UserSession, number> {
  findByDevice(userId: number, deviceId: string): Promise<UserSession | null>;
  findByRefreshToken(refreshToken: string, deviceId: string): Promise<UserSession | null>;
  upsert(userId: number, deviceId: string, data: Partial<UserSession>): Promise<UserSession>;
  revokeAllForUser(userId: number): Promise<void>;
}
