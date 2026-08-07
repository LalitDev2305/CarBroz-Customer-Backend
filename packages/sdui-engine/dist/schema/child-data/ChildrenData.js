export class ChildrenData {
    id;
    type;
    properties = {};
    action;
    analytics;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    setSingleAction(action) {
        this.action = action;
        return this;
    }
}
//# sourceMappingURL=ChildrenData.js.map