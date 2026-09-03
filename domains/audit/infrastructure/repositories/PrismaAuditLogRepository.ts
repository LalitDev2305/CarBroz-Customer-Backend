import { PrismaClient } from '@prisma/client';
import { type ActorType } from '../../domain/AuditActor.js';
import { AuditLog } from '../../domain/AuditLog.js';
import { type IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository.js';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaClient: PrismaClient) {}

  private get prisma() {
    return this.unitOfWorkPrisma || this.prismaClient;
  }

  private mapToDomain(record: any): AuditLog {
    return new AuditLog({
      id: record.id,
      publicId: record.publicId,
      actorId: record.actorId,
      actorType: record.actorType as ActorType,
      action: record.action,
      resource: record.resource,
      resourcePublicId: record.resourcePublicId,
      oldValue: record.oldValue as Record<string, any>,
      newValue: record.newValue as Record<string, any>,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      correlationId: record.correlationId,
      createdAt: record.createdAt,
    });
  }

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const record = await this.prisma.auditLog.create({
      data: {
        actorId: auditLog.actorId,
        actorType: auditLog.actorType,
        action: auditLog.action,
        resource: auditLog.resource,
        resourcePublicId: auditLog.resourcePublicId,
        oldValue: auditLog.oldValue ?? undefined,
        newValue: auditLog.newValue ?? undefined,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        correlationId: auditLog.correlationId,
      },
    });
    return this.mapToDomain(record);
  }

  async findByPublicId(publicId: string): Promise<AuditLog | null> {
    const record = await this.prisma.auditLog.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async listByResource(resource: string, resourcePublicId?: string, limit = 50, offset = 0): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: {
        resource,
        ...(resourcePublicId ? { resourcePublicId } : {}),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }

  async listByActor(actorId: number, limit = 50, offset = 0): Promise<AuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { actorId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapToDomain(r));
  }
}
