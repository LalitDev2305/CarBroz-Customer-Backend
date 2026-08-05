import { IChildrenData, UIAction, UIProperties } from '../models/ui.models.js';

export class ChildrenData implements IChildrenData {
  public id: string;
  public type: string;
  public properties?: UIProperties;
  public action?: UIAction | Record<string, UIAction>;
  public analytics?: Record<string, any>;

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

  public setSingleAction(action: UIAction): this {
    this.action = action;
    return this;
  }

  public setAnalytics(analytics: Record<string, any>): this {
    this.analytics = { ...this.analytics, ...analytics };
    return this;
  }
}
