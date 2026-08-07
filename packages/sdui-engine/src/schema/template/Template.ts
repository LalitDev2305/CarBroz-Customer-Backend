import { TemplateProperties } from './TemplateProperties.js';
import { IComponent, Component } from '../component/Component.js';

export interface ITemplate {
  id: string;
  type: string;
  properties?: TemplateProperties;
  components?: IComponent[];
  [key: string]: any;
}

export class Template implements ITemplate {
  public id: string;
  public type: string;
  public properties?: TemplateProperties = {};
  public components?: IComponent[] = [];

  constructor(id: string, type: string = 'default_template_layout') {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: TemplateProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public addComponent(comp: Component | IComponent): this {
    if (!this.components) this.components = [];
    this.components.push(comp);
    return this;
  }
}
