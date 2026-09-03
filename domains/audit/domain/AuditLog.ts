import { type ActorType } from './AuditActor.js';
import { type AuditAction } from './AuditAction.js';

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

export class AuditLog {
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

  constructor(props: AuditLogProps) {
    if (!props.action) throw new Error('AuditLog requires an action');
    if (!props.resource) throw new Error('AuditLog requires a resource name');

    if (props.id !== undefined) this.id = props.id;
    if (props.publicId !== undefined) this.publicId = props.publicId;
    this.actorId = props.actorId ?? null;
    this.actorType = props.actorType ?? 'SYSTEM';
    this.action = props.action;
    this.resource = props.resource;
    this.resourcePublicId = props.resourcePublicId ?? null;
    this.oldValue = props.oldValue ?? null;
    this.newValue = props.newValue ?? null;
    this.ipAddress = props.ipAddress ?? null;
    this.userAgent = props.userAgent ?? null;
    this.correlationId = props.correlationId ?? null;
    if (props.createdAt !== undefined) this.createdAt = props.createdAt;
  }
}
