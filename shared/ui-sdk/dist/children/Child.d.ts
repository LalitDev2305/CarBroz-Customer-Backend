import { IChild, IChildrenData, UIProperties } from '../models/ui.models.js';
export declare class Child implements IChild {
    id: string;
    type: string;
    properties?: UIProperties;
    childrenData?: IChildrenData[];
    constructor(id: string, type?: string);
    setProperties(properties: UIProperties): this;
    addChildData(childData: IChildrenData): this;
}
//# sourceMappingURL=Child.d.ts.map