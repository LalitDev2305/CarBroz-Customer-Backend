export class BaseTemplate {
    id;
    type;
    properties;
    sections;
    constructor(id, type) {
        this.id = id;
        this.type = type;
        this.sections = [];
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    addSection(section) {
        this.sections.push(section);
        return this;
    }
}
//# sourceMappingURL=BaseTemplate.js.map