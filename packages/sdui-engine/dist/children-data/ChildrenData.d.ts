import { IChildrenData, UIAction, UIProperties } from '../models/ui.models.js';
export declare class ChildrenData implements IChildrenData {
    id: string;
    type: string;
    properties?: UIProperties;
    action?: UIAction | Record<string, UIAction>;
    analytics?: Record<string, any>;
    constructor(id: string, type: string);
    setProperties(properties: UIProperties): this;
    setAction(eventName: string, action: UIAction): this;
    setSingleAction(action: UIAction): this;
    setAnalytics(analytics: Record<string, any>): this;
}
