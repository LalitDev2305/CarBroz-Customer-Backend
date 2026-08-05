export class DeviceToken {
    id;
    publicId;
    userId;
    deviceId;
    platform;
    token;
    appVersion;
    lastSeenAt;
    isActive;
    createdAt;
    updatedAt;
    constructor(props) {
        if (!props.userId)
            throw new Error('DeviceToken must be associated with a userId');
        if (!props.deviceId)
            throw new Error('DeviceToken deviceId is required');
        if (!props.token)
            throw new Error('DeviceToken token payload is required');
        this.id = props.id;
        this.publicId = props.publicId;
        this.userId = props.userId;
        this.deviceId = props.deviceId;
        this.platform = props.platform;
        this.token = props.token;
        this.appVersion = props.appVersion ?? null;
        this.lastSeenAt = props.lastSeenAt ?? new Date();
        this.isActive = props.isActive ?? true;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    touch(appVersion) {
        this.lastSeenAt = new Date();
        this.isActive = true;
        if (appVersion)
            this.appVersion = appVersion;
    }
    deactivate() {
        this.isActive = false;
    }
}
//# sourceMappingURL=DeviceToken.js.map