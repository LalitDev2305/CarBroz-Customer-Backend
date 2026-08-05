export class AuditLog {
    id;
    publicId;
    actorId;
    actorType;
    action;
    resource;
    resourcePublicId;
    oldValue;
    newValue;
    ipAddress;
    userAgent;
    correlationId;
    createdAt;
    constructor(props) {
        if (!props.action)
            throw new Error('AuditLog requires an action');
        if (!props.resource)
            throw new Error('AuditLog requires a resource name');
        this.id = props.id;
        this.publicId = props.publicId;
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
        this.createdAt = props.createdAt;
    }
}
//# sourceMappingURL=AuditLog.js.map