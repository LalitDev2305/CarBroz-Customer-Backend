import { IComponent, UIAction, UIProperties } from '../models/ui.models.js';
export declare abstract class BaseComponent implements IComponent {
    id: string;
    type: string;
    properties?: UIProperties;
    action?: UIAction | Record<string, UIAction>;
    subComponents?: IComponent[];
    subcomponents?: IComponent[];
    children?: IComponent[];
    childrenData?: any[];
    constructor(id: string, type: string);
    setProperties(properties: UIProperties): this;
    setAction(eventName: string, action: UIAction): this;
    addSubComponent(component: IComponent): this;
    addSubcomponent(component: IComponent): this;
    addChild(component: IComponent): this;
    addChildData(component: IComponent): this;
    setSingleAction(action: UIAction): this;
}
//# sourceMappingURL=BaseComponent.d.ts.map