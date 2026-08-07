import { IComponent, ISection } from '../models/ui.models.js';
export declare class BaseSection implements ISection {
    id: string;
    type: string;
    components: IComponent[];
    constructor(id: string, type?: string);
    addComponent(component: IComponent): this;
}
