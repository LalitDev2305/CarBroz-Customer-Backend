export class SduiChildrenDataEntity {
    id;
    publicId;
    name;
    nodeLevel = 'CHILDREN_DATA';
    componentType;
    schemaJson;
    supportedProperties;
    supportedActions;
    version;
    status;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id;
        this.publicId = props.publicId;
        this.name = props.name;
        this.componentType = props.componentType;
        this.schemaJson = props.schemaJson;
        this.supportedProperties = props.supportedProperties;
        this.supportedActions = props.supportedActions;
        this.version = props.version || 1;
        this.status = props.status || 'ACTIVE';
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
//# sourceMappingURL=SduiChildrenData.js.map