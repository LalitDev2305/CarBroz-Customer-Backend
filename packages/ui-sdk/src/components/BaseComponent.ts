import { IComponent, UIAction, UIProperties } from '../models/ui.models.js';

export abstract class BaseComponent implements IComponent {
  public id: string;
  public type: string;
  public properties?: UIProperties;
  public action?: UIAction | Record<string, UIAction>;
  public subComponents?: IComponent[];
  public subcomponents?: IComponent[];
  public children?: IComponent[];
  public childrenData?: any[];

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: UIProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public setAction(eventName: string, action: UIAction): this {
    if (!this.action || typeof this.action.type === 'string') {
      this.action = {};
    }
    (this.action as Record<string, UIAction>)[eventName] = action;
    return this;
  }

  public addSubComponent(component: IComponent): this {
    if (!this.subComponents) {
      this.subComponents = [];
    }
    this.subComponents.push(component);
    return this;
  }

  public addSubcomponent(component: IComponent): this {
    if (!this.subcomponents) {
      this.subcomponents = [];
    }
    this.subcomponents.push(component);
    return this;
  }

  public addChild(component: IComponent): this {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(component);
    return this;
  }

  public addChildData(component: IComponent): this {
    if (!this.childrenData) {
      this.childrenData = [];
    }
    this.childrenData.push(component);
    return this;
  }

  public setSingleAction(action: UIAction): this {
    this.action = action;
    return this;
  }
}
