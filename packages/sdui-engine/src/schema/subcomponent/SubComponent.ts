import { SubComponentProperties } from './SubComponentProperties.js';
import { IChild, Child } from '../child/Child.js';

export interface ISubcomponent {
  id: string;
  type: string;
  properties?: SubComponentProperties;
  children?: IChild[];
  [key: string]: any;
}

export class SubComponent implements ISubcomponent {
  public id: string;
  public type: string;
  public properties?: SubComponentProperties = {};
  public children?: IChild[] = [];

  constructor(id: string, type: string = 'default_subcomponent_layout') {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: SubComponentProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public addChild(child: Child | IChild): this {
    if (!this.children) this.children = [];
    this.children.push(child);
    return this;
  }
}
