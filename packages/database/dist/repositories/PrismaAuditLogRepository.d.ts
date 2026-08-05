import { PrismaClient } from '@prisma/client';
import { AuditLog, IAuditLogRepository } from '@carbroz/common';
export declare class PrismaAuditLogRepository implements IAuditLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(auditLog: AuditLog): Promise<AuditLog>;
    findByPublicId(publicId: string): Promise<AuditLog | null>;
    listByResource(resource: string, resourcePublicId?: string, limit?: number, offset?: number): Promise<AuditLog[]>;
    listByActor(actorId: number, limit?: number, offset?: number): Promise<AuditLog[]>;
}
