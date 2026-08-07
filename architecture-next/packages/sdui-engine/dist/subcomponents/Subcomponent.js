export class Subcomponent {
    id;
    type;
    properties;
    children;
    constructor(id, type = 'default_subcomponent_layout') {
        this.id = id;
        this.type = type;
    }
    setProperties(properties) {
        this.properties = { ...this.properties, ...properties };
        return this;
    }
    addChild(child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
        return this;
    }
    addChildData(childData) {
        if (!this.children) {
            const defaultChild = {
                id: `${this.id}_default_child`,
                type: 'default_child_layout',
                childrenData: []
            };
            this.children = [defaultChild];
        }
        const targetChild = this.children[0];
        if (!targetChild.childrenData) {
            targetChild.childrenData = [];
        }
        targetChild.childrenData.push(childData);
        return this;
    }
}
//# sourceMappingURL=Subcomponent.js.map