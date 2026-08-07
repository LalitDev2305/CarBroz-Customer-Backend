export class BaseSection {
    id;
    type;
    components;
    constructor(id, type = id) {
        this.id = id;
        this.type = type;
        this.components = [];
    }
    addComponent(component) {
        this.components.push(component);
        return this;
    }
}
//# sourceMappingURL=BaseSection.js.map