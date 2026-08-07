import { TemplateProperties } from './TemplateProperties.js';
import { IComponent, Component } from '../component/Component.js';
export interface ITemplate {
    id: string;
    type: string;
    properties?: TemplateProperties;
    components?: IComponent[];
    [key: string]: any;
}
export declare class Template implements ITemplate {
    id: string;
    type: string;
    properties?: TemplateProperties;
    components?: IComponent[];
    constructor(id: string, type?: string);
    setProperties(properties: TemplateProperties): this;
    addComponent(comp: Component | IComponent): this;
}
