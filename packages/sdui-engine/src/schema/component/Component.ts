import { ComponentProperties } from './ComponentProperties.js';
import { UIAction } from '../child-data/ChildrenDataProperties.js';
import { ISubcomponent, SubComponent } from '../subcomponent/SubComponent.js';
import { IChild, Child } from '../child/Child.js';
import { IChildrenData, ChildrenData } from '../child-data/ChildrenData.js';

export interface IComponent {
  id: string;
  type: string;
  properties?: ComponentProperties;
  action?: UIAction | Record<string, UIAction>;
  subComponents?: ISubcomponent[];
  subcomponents?: ISubcomponent[];
  children?: IChild[];
  childrenData?: IChildrenData[];
}

export class Component implements IComponent {
  public id: string;
  public type: string;
  public properties?: ComponentProperties = {};
  public action?: UIAction | Record<string, UIAction>;
  public subComponents?: ISubcomponent[] = [];
  public subcomponents?: ISubcomponent[] = [];
  public children?: IChild[];
  public childrenData?: IChildrenData[];

  constructor(id: string, type: string = 'default_component_layout') {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: ComponentProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public setSingleAction(action: UIAction): this {
    this.action = action;
    return this;
  }

  public addSubcomponent(sub: SubComponent | ISubcomponent): this {
    if (!this.subComponents) this.subComponents = [];
    this.subComponents.push(sub);
    this.subcomponents = this.subComponents;
    return this;
  }

  public addChild(child: Child | IChild): this {
    if (!this.children) this.children = [];
    this.children.push(child);
    return this;
  }

  public addChildData(data: ChildrenData | IChildrenData): this {
    if (!this.childrenData) this.childrenData = [];
    this.childrenData.push(data);
    return this;
  }
}
