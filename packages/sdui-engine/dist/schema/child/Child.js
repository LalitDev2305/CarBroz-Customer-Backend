export class Child {
    id;
    type;
    properties = {};
    childrenData = [];
    constructor(id, type = 'default_child_layout') {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    addChildData(data) {
        if (!this.childrenData)
            this.childrenData = [];
        this.childrenData.push(data);
        return this;
    }
}
//# sourceMappingURL=Child.js.map