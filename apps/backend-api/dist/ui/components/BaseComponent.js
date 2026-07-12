export class BaseComponent {
    id;
    type;
    properties;
    action;
    subComponents;
    children;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    setAction(eventName, action) {
        if (!this.action) {
            this.action = {};
        }
        this.action[eventName] = action;
        return this;
    }
    addSubComponent(component) {
        if (!this.subComponents) {
            this.subComponents = [];
        }
        this.subComponents.push(component);
        return this;
    }
    addChild(component) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(component);
        return this;
    }
}
//# sourceMappingURL=BaseComponent.js.map