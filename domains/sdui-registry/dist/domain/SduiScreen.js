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
        this.targetApp = props.targetApp || 'CUSTOMER';
        this.versionNumber = props.versionNumber ?? 1;
        this.status = props.status || 'DRAFT';
        this.layoutJson = props.layoutJson;
        this.lockVersion = props.lockVersion ?? 1;
        this.publishedAt = props.publishedAt || null;
        this.publishedBy = props.publishedBy || null;
        this.createdFromVersion = props.createdFromVersion || null;
        this.changeDescription = props.changeDescription || null;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
//# sourceMappingURL=SduiScreen.js.map