import { GenericComponent } from '../components/GenericComponent.js';
import { Subcomponent } from '../subcomponents/Subcomponent.js';
import { Child } from '../children/Child.js';
import { ChildrenData } from '../children-data/ChildrenData.js';
export declare class UI {
    static component(id: string, type?: string): GenericComponent;
    static subcomponent(id: string, type?: string): Subcomponent;
    static child(id: string, type?: string): Child;
    static childrenData(id: string, type: string): ChildrenData;
    static text(id: string, text: string): ChildrenData;
    static image(id: string, imageUrl: string): ChildrenData;
    static icon(id: string, iconName: string): ChildrenData;
    static button(id: string, text: string): ChildrenData;
    static input(id: string, inputType: string): ChildrenData;
}
