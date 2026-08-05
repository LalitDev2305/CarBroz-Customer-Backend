import { IComponent, ISection, ITemplate, UIProperties } from '../models/ui.models.js';
export declare class BaseTemplate implements ITemplate {
    id: string;
    type: string;
    properties?: UIProperties;
    sections?: ISection[];
    components?: IComponent[];
    constructor(id: string, type: string);
    setProperties(properties: UIProperties): this;
    addSection(section: ISection): this;
    addComponent(component: IComponent): this;
}
//# sourceMappingURL=BaseTemplate.d.ts.map