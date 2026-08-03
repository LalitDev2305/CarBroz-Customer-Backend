import { GenericComponent } from '../components/GenericComponent.js';
export declare class UI {
    static component(id: string, type?: string): GenericComponent;
    static child(id: string, type?: string): GenericComponent;
    static text(id: string, text: string): GenericComponent;
    static image(id: string, imageUrl: string): GenericComponent;
    static icon(id: string, iconName: string): GenericComponent;
    static button(id: string, text: string): GenericComponent;
    static input(id: string, inputType: string): GenericComponent;
}
