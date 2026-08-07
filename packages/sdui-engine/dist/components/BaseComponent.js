export class BaseComponent {
    id;
    type;
    properties;
    action;
    subComponents;
    subcomponents;
    children;
    childrenData;
    constructor(id, type) {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    setAction(eventName, action) {
        if (!this.action || typeof this.action.type === 'string') {
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
    addSubcomponent(component) {
        if (!this.subcomponents) {
            this.subcomponents = [];
        }
        this.subcomponents.push(component);
        return this;
    }
    addChild(component) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(component);
        return this;
    }
    addChildData(component) {
        if (!this.childrenData) {
            this.childrenData = [];
        }
        this.childrenData.push(component);
        return this;
    }
    setSingleAction(action) {
        this.action = action;
        return this;
    }
}
//# sourceMappingURL=BaseComponent.js.map