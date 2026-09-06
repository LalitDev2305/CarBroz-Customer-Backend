import type { Prisma, PrismaClient } from '@prisma/client';
import type { UserSession } from '../../domain/UserSession.js';
import type {
  IRefreshTokenRepository,
  IssueRefreshTokenInput,
  RefreshRotationResult,
  RefreshRotationStatus,
  RotateRefreshTokenInput,
} from '../../domain/repositories/IRefreshTokenRepository.js';

/** Prisma persistence adapter for hashed refresh-token families and rotation state. */
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async issue(input: IssueRefreshTokenInput): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.refreshToken.updateMany({
        where: { sessionId: input.sessionId, revokedAt: null, consumedAt: null },
        data: { revokedAt: input.now },
      });
      await tx.refreshToken.create({
        data: {
          sessionId: input.sessionId,
          tokenHash: input.tokenHash,
          familyId: input.familyId,
          expiresAt: input.expiresAt,
        },
      });
      await tx.userSession.update({
        where: { id: input.sessionId },
        data: { isRevoked: false, lastActiveAt: input.now },
      });
    });
  }

  async rotate(input: RotateRefreshTokenInput): Promise<RefreshRotationResult> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const token = await tx.refreshToken.findUnique({
        where: { tokenHash: input.currentTokenHash },
        include: { session: { include: { user: true } } },
      });
      if (!token) return { status: 'INVALID' as const };

      const compromise = async (status: RefreshRotationStatus): Promise<RefreshRotationResult> => {
        await tx.refreshToken.updateMany({
          where: { familyId: token.familyId, revokedAt: null },
          data: { revokedAt: input.now },
        });
        await tx.userSession.updateMany({
          where: { id: token.sessionId },
          data: { isRevoked: true },
        });
        return { status };
      };

      if (token.session.deviceId !== input.deviceId) return compromise('DEVICE_MISMATCH');
      if (token.consumedAt || token.revokedAt || token.session.isRevoked) return compromise('REUSED');
      if (token.expiresAt.getTime() <= input.now.getTime()) return compromise('EXPIRED');

      const consume = await tx.refreshToken.updateMany({
        where: {
          id: token.id,
          consumedAt: null,
          revokedAt: null,
          expiresAt: { gt: input.now },
        },
        data: { consumedAt: input.now },
      });
      if (consume.count !== 1) return compromise('REUSED');

      await tx.refreshToken.create({
        data: {
          sessionId: token.sessionId,
          tokenHash: input.replacementTokenHash,
          familyId: token.familyId,
          expiresAt: input.replacementExpiresAt,
        },
      });
      const session = await tx.userSession.update({
        where: { id: token.sessionId },
        data: { lastActiveAt: input.now, isRevoked: false },
        include: { user: true },
      });

      return { status: 'ROTATED', session: this.mapSession(session) };
    });
  }

  async revokeSession(sessionId: number, now: Date): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.refreshToken.updateMany({
        where: { sessionId, revokedAt: null },
        data: { revokedAt: now },
      });
      await tx.userSession.updateMany({
        where: { id: sessionId },
        data: { isRevoked: true },
      });
    });
  }

  async revokeAllForUser(userId: number, now: Date): Promise<void> {
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const sessions = await tx.userSession.findMany({
        where: { userId, deletedAt: null },
        select: { id: true },
      });
      const sessionIds = sessions.map((session: { id: number }) => session.id);
      if (sessionIds.length > 0) {
        await tx.refreshToken.updateMany({
          where: { sessionId: { in: sessionIds }, revokedAt: null },
          data: { revokedAt: now },
        });
        await tx.userSession.updateMany({
          where: { id: { in: sessionIds } },
          data: { isRevoked: true },
        });
      }
    });
  }

  private mapSession(session: any): UserSession {
    return {
      id: session.id,
      publicId: session.publicId,
      userId: session.userId,
      deviceId: session.deviceId,
      deviceModel: session.deviceModel,
      osVersion: session.osVersion,
      fcmToken: session.fcmToken,
      isRevoked: session.isRevoked,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      deletedAt: session.deletedAt,
      user: session.user,
    };
  }
}
