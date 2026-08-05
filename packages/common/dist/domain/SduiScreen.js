export class SduiScreenEntity {
    id;
    publicId;
    screenId;
    targetApp;
    versionNumber;
    status;
    layoutJson;
    lockVersion;
    publishedAt;
    publishedBy;
    createdFromVersion;
    changeDescription;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.publicId = props.publicId;
        this.screenId = props.screenId;
        this.targetApp = props.targetApp;
        this.versionNumber = props.versionNumber;
        this.status = props.status;
        this.layoutJson = props.layoutJson;
        this.lockVersion = props.lockVersion;
        this.publishedAt = props.publishedAt;
        this.publishedBy = props.publishedBy;
        this.createdFromVersion = props.createdFromVersion;
        this.changeDescription = props.changeDescription;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    get isPublished() {
        return this.status === 'PUBLISHED';
    }
    get version() {
        return this.versionNumber;
    }
}
//# sourceMappingURL=SduiScreen.js.map