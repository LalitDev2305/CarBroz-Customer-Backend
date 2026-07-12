import { IComponent, ISection } from '../models/ui.models.js';

export class BaseSection implements ISection {
  public components: IComponent[];

  constructor(public id: string, public type: string = id) {
    this.components = [];
  }

  public addComponent(component: IComponent): this {
    this.components.push(component);
    return this;
  }
}
