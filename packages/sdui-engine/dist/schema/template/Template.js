export class Template {
    id;
    type;
    properties = {};
    components = [];
    constructor(id, type = 'default_template_layout') {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    addComponent(comp) {
        if (!this.components)
            this.components = [];
        this.components.push(comp);
        return this;
    }
}
//# sourceMappingURL=Template.js.map