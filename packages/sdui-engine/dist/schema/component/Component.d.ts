import { ComponentProperties } from './ComponentProperties.js';
import { UIAction } from '../child-data/ChildrenDataProperties.js';
import { ISubcomponent, SubComponent } from '../subcomponent/SubComponent.js';
import { IChild, Child } from '../child/Child.js';
import { IChildrenData, ChildrenData } from '../child-data/ChildrenData.js';
export interface IComponent {
    id: string;
    type: string;
    properties?: ComponentProperties;
    action?: UIAction | Record<string, UIAction>;
    subComponents?: ISubcomponent[];
    subcomponents?: ISubcomponent[];
    children?: IChild[];
    childrenData?: IChildrenData[];
}
export declare class Component implements IComponent {
    id: string;
    type: string;
    properties?: ComponentProperties;
    action?: UIAction | Record<string, UIAction>;
    subComponents?: ISubcomponent[];
    subcomponents?: ISubcomponent[];
    children?: IChild[];
    childrenData?: IChildrenData[];
    constructor(id: string, type?: string);
    setProperties(properties: ComponentProperties): this;
    setSingleAction(action: UIAction): this;
    addSubcomponent(sub: SubComponent | ISubcomponent): this;
    addChild(child: Child | IChild): this;
    addChildData(data: ChildrenData | IChildrenData): this;
}
