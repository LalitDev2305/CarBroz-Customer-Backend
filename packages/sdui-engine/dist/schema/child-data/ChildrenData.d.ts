import { ChildrenDataProperties, UIAction } from './ChildrenDataProperties.js';
export interface IChildrenData {
    id: string;
    type: string;
    properties?: ChildrenDataProperties;
    action?: UIAction | Record<string, UIAction>;
    analytics?: Record<string, any>;
    [key: string]: any;
}
export declare class ChildrenData implements IChildrenData {
    id: string;
    type: string;
    properties?: ChildrenDataProperties;
    action?: UIAction | Record<string, UIAction>;
    analytics?: Record<string, any>;
    constructor(id: string, type: string);
    setProperties(properties: ChildrenDataProperties): this;
    setSingleAction(action: UIAction): this;
}
