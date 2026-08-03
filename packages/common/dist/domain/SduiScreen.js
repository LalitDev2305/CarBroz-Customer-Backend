export class SduiScreenEntity {
    id;
    publicId;
    screenId;
    targetApp;
    layoutJson;
    version;
    isPublished;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.publicId = props.publicId;
        this.screenId = props.screenId;
        this.targetApp = props.targetApp;
        this.layoutJson = props.layoutJson;
        this.version = props.version;
        this.isPublished = props.isPublished;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
//# sourceMappingURL=SduiScreen.js.map