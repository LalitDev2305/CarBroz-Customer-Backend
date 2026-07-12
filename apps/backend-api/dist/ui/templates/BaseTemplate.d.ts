import { ISection, ITemplate, UIProperties } from '../models/ui.models.js';
export declare class BaseTemplate implements ITemplate {
    id: string;
    type: string;
    properties?: UIProperties;
    sections: ISection[];
    constructor(id: string, type: string);
    setProperties(properties: UIProperties): this;
    addSection(section: ISection): this;
}
