import { IChild, ISubcomponent, UIProperties } from '../models/ui.models.js';

export class Subcomponent implements ISubcomponent {
  public id: string;
  public type: string;
  public properties?: UIProperties;
  public children?: IChild[];

  constructor(id: string, type: string = 'default_subcomponent_layout') {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: UIProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public addChild(child: IChild): this {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
    return this;
  }

  public addChildData(childData: any): this {
    if (!this.children) {
      const defaultChild = {
        id: `${this.id}_default_child`,
        type: 'default_child_layout',
        childrenData: []
      };
      this.children = [defaultChild];
    }
    const targetChild = this.children[0];
    if (targetChild) {
      if (!targetChild.childrenData) {
        targetChild.childrenData = [];
      }
      targetChild.childrenData.push(childData);
    }
    return this;
  }
}
