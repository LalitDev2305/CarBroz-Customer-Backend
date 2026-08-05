import { IComponent, ISection, ITemplate, UIProperties } from '../models/ui.models.js';

export class BaseTemplate implements ITemplate {
  public id: string;
  public type: string;
  public properties?: UIProperties;
  public sections?: ISection[];
  public components?: IComponent[];

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: UIProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public addSection(section: ISection): this {
    if (!this.sections) {
      this.sections = [];
    }
    this.sections.push(section);
    return this;
  }

  public addComponent(component: IComponent): this {
    if (!this.components) {
      this.components = [];
    }
    this.components.push(component);
    return this;
  }
}
