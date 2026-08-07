import { AuditLog } from '@carbroz/foundation-kernel';
export class PrismaAuditLogRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapToDomain(record) {
        return new AuditLog({
            id: record.id,
            publicId: record.publicId,
            actorId: record.actorId,
            actorType: record.actorType,
            action: record.action,
            resource: record.resource,
            resourcePublicId: record.resourcePublicId,
            oldValue: record.oldValue,
            newValue: record.newValue,
            ipAddress: record.ipAddress,
            userAgent: record.userAgent,
            correlationId: record.correlationId,
            createdAt: record.createdAt,
        });
    }
    async create(auditLog) {
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
    async findByPublicId(publicId) {
        const record = await this.prisma.auditLog.findUnique({ where: { publicId } });
        return record ? this.mapToDomain(record) : null;
    }
    async listByResource(resource, resourcePublicId, limit = 50, offset = 0) {
        const records = await this.prisma.auditLog.findMany({
            where: {
                resource,
                ...(resourcePublicId ? { resourcePublicId } : {}),
            },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
    async listByActor(actorId, limit = 50, offset = 0) {
        const records = await this.prisma.auditLog.findMany({
            where: { actorId },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });
        return records.map((r) => this.mapToDomain(r));
    }
}
//# sourceMappingURL=PrismaAuditLogRepository.js.map