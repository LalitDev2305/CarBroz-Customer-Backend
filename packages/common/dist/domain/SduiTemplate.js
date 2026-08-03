export class SduiTemplateEntity {
    id;
    publicId;
    templateId;
    templateType;
    defaultLayoutJson;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.publicId = props.publicId;
        this.templateId = props.templateId;
        this.templateType = props.templateType;
        this.defaultLayoutJson = props.defaultLayoutJson;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
//# sourceMappingURL=SduiTemplate.js.map