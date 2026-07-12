import { GenericComponent } from '../components/GenericComponent.js';
/**
 * Helper class to dramatically reduce boilerplate when constructing dynamic UI components.
 */
export declare class UI {
    /**
     * Creates a generic component or wrapper container.
     * If `type` is omitted, it defaults to the `id`.
     */
    static component(id: string, type?: string): GenericComponent;
    /**
     * Creates a text component.
     */
    static text(id: string, text: string): GenericComponent;
    /**
     * Creates an image component.
     */
    static image(id: string, imageUrl: string): GenericComponent;
    /**
     * Creates an icon component.
     */
    static icon(id: string, iconName: string): GenericComponent;
    /**
     * Creates a button component.
     */
    static button(id: string, text: string): GenericComponent;
    /**
     * Creates an input field component.
     */
    static input(id: string, inputType: string): GenericComponent;
}
