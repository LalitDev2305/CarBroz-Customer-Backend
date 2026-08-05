import { ActorType } from './AuditActor.js';
import { AuditAction } from './AuditAction.js';
export interface AuditLogProps {
    id?: number;
    publicId?: string;
    actorId?: number | null;
    actorType?: ActorType;
    action: AuditAction | string;
    resource: string;
    resourcePublicId?: string | null;
    oldValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    correlationId?: string | null;
    createdAt?: Date;
}
export declare class AuditLog {
    id?: number;
    publicId?: string;
    actorId: number | null;
    actorType: ActorType;
    action: string;
    resource: string;
    resourcePublicId: string | null;
    oldValue: Record<string, any> | null;
    newValue: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    correlationId: string | null;
    createdAt?: Date;
    constructor(props: AuditLogProps);
}
