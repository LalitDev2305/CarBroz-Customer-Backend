export class BaseTemplate {
    id;
    type;
    properties;
    sections;
    components;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    addSection(section) {
        if (!this.sections) {
            this.sections = [];
        }
        this.sections.push(section);
        return this;
    }
    addComponent(component) {
        if (!this.components) {
            this.components = [];
        }
        this.components.push(component);
        return this;
    }
}
//# sourceMappingURL=BaseTemplate.js.map