import { ChildProperties } from './ChildProperties.js';
import { IChildrenData, ChildrenData } from '../child-data/ChildrenData.js';

export interface IChild {
  id: string;
  type: string;
  properties?: ChildProperties;
  childrenData?: IChildrenData[];
  [key: string]: any;
}

export class Child implements IChild {
  public id: string;
  public type: string;
  public properties?: ChildProperties = {};
  public childrenData?: IChildrenData[] = [];

  constructor(id: string, type: string = 'default_child_layout') {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: ChildProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public addChildData(data: ChildrenData | IChildrenData): this {
    if (!this.childrenData) this.childrenData = [];
    this.childrenData.push(data);
    return this;
  }
}
