import { IChild, IChildrenData, UIProperties } from '../models/ui.models.js';

export class Child implements IChild {
  public id: string;
  public type: string;
  public properties?: UIProperties;
  public childrenData?: IChildrenData[];

  constructor(id: string, type: string = 'default_child_layout') {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: UIProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public addChildData(childData: IChildrenData): this {
    if (!this.childrenData) {
      this.childrenData = [];
    }
    this.childrenData.push(childData);
    return this;
  }
}
