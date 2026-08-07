import { IChild, ISubcomponent, UIProperties } from '../models/ui.models.js';
export declare class Subcomponent implements ISubcomponent {
    id: string;
    type: string;
    properties?: UIProperties;
    children?: IChild[];
    constructor(id: string, type?: string);
    setProperties(properties: UIProperties): this;
    addChild(child: IChild): this;
    addChildData(childData: any): this;
}
