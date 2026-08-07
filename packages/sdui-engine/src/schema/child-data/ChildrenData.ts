import { ChildrenDataProperties, UIAction } from './ChildrenDataProperties.js';

export interface IChildrenData {
  id: string;
  type: string;
  properties?: ChildrenDataProperties;
  action?: UIAction | Record<string, UIAction>;
  analytics?: Record<string, any>;
  [key: string]: any;
}

export class ChildrenData implements IChildrenData {
  public id: string;
  public type: string;
  public properties?: ChildrenDataProperties = {};
  public action?: UIAction | Record<string, UIAction>;
  public analytics?: Record<string, any>;

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }

  public setProperties(properties: ChildrenDataProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  public setSingleAction(action: UIAction): this {
    this.action = action;
    return this;
  }
}
