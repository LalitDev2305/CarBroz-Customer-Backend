import { GenericComponent } from '../components/GenericComponent.js';
/**
 * Helper class to dramatically reduce boilerplate when constructing dynamic UI components.
 */
export class UI {
    /**
     * Creates a generic component or wrapper container.
     * If `type` is omitted, it defaults to the `id`.
     */
    static component(id, type = id) {
        return new GenericComponent(id, type);
    }
    /**
     * Creates a child layout component.
     * If `type` is omitted, it defaults to `default_child_layout`.
     */
    static child(id, type = 'default_child_layout') {
        return new GenericComponent(id, type);
    }
    /**
     * Creates a text component.
     */
    static text(id, text) {
        return new GenericComponent(id, 'text').setProperties({ text });
    }
    /**
     * Creates an image component.
     */
    static image(id, imageUrl) {
        return new GenericComponent(id, 'image').setProperties({ imageUrl });
    }
    /**
     * Creates an icon component.
     */
    static icon(id, iconName) {
        return new GenericComponent(id, 'icon').setProperties({ icon: iconName });
    }
    /**
     * Creates a button component.
     */
    static button(id, text) {
        return new GenericComponent(id, 'button').setProperties({ text });
    }
    /**
     * Creates an input field component.
     */
    static input(id, inputType) {
        return new GenericComponent(id, 'input_field').setProperties({ inputType });
    }
}
//# sourceMappingURL=UI.js.map