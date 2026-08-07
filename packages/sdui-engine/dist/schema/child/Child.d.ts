import { ChildProperties } from './ChildProperties.js';
import { IChildrenData, ChildrenData } from '../child-data/ChildrenData.js';
export interface IChild {
    id: string;
    type: string;
    properties?: ChildProperties;
    childrenData?: IChildrenData[];
    [key: string]: any;
}
export declare class Child implements IChild {
    id: string;
    type: string;
    properties?: ChildProperties;
    childrenData?: IChildrenData[];
    constructor(id: string, type?: string);
    setProperties(properties: ChildProperties): this;
    addChildData(data: ChildrenData | IChildrenData): this;
}
