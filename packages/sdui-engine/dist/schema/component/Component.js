export class Component {
    id;
    type;
    properties = {};
    action;
    subComponents = [];
    subcomponents = [];
    children;
    childrenData;
    constructor(id, type = 'default_component_layout') {
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
    addSubcomponent(sub) {
        if (!this.subComponents)
            this.subComponents = [];
        this.subComponents.push(sub);
        this.subcomponents = this.subComponents;
        return this;
    }
    addChild(child) {
        if (!this.children)
            this.children = [];
        this.children.push(child);
        return this;
    }
    addChildData(data) {
        if (!this.childrenData)
            this.childrenData = [];
        this.childrenData.push(data);
        return this;
    }
}
//# sourceMappingURL=Component.js.map