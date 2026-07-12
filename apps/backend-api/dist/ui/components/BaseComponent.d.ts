import { IComponent, UIAction, UIProperties } from '../models/ui.models.js';
export declare abstract class BaseComponent implements IComponent {
    id: string;
    type: string;
    properties?: UIProperties;
    action?: Record<string, UIAction>;
    subComponents?: IComponent[];
    children?: IComponent[];
    constructor(id: string, type: string);
    setProperties(properties: UIProperties): this;
    setAction(eventName: string, action: UIAction): this;
    addSubComponent(component: IComponent): this;
    addChild(component: IComponent): this;
}
