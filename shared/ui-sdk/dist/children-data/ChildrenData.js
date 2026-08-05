export class ChildrenData {
    id;
    type;
    properties;
    action;
    analytics;
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
    setSingleAction(action) {
        this.action = action;
        return this;
    }
    setAnalytics(analytics) {
        this.analytics = { ...this.analytics, ...analytics };
        return this;
    }
}
//# sourceMappingURL=ChildrenData.js.map