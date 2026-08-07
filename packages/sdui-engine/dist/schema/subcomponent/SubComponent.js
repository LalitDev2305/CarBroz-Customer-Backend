export class SubComponent {
    id;
    type;
    properties = {};
    children = [];
    constructor(id, type = 'default_subcomponent_layout') {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    addChild(child) {
        if (!this.children)
            this.children = [];
        this.children.push(child);
        return this;
    }
}
//# sourceMappingURL=SubComponent.js.map