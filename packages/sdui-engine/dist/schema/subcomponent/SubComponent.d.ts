import { SubComponentProperties } from './SubComponentProperties.js';
import { IChild, Child } from '../child/Child.js';
export interface ISubcomponent {
    id: string;
    type: string;
    properties?: SubComponentProperties;
    children?: IChild[];
    [key: string]: any;
}
export declare class SubComponent implements ISubcomponent {
    id: string;
    type: string;
    properties?: SubComponentProperties;
    children?: IChild[];
    constructor(id: string, type?: string);
    setProperties(properties: SubComponentProperties): this;
    addChild(child: Child | IChild): this;
}
