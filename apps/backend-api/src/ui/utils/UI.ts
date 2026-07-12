import { GenericComponent } from '../components/GenericComponent.js';

/**
 * Helper class to dramatically reduce boilerplate when constructing dynamic UI components.
 */
export class UI {
  /**
   * Creates a generic component or wrapper container.
   * If `type` is omitted, it defaults to the `id`.
   */
  public static component(id: string, type: string = id): GenericComponent {
    return new GenericComponent(id, type);
  }

  /**
   * Creates a child layout component.
   * If `type` is omitted, it defaults to `default_child_layout`.
   */
  public static child(id: string, type: string = 'default_child_layout'): GenericComponent {
    return new GenericComponent(id, type);
  }

  /**
   * Creates a text component.
   */
  public static text(id: string, text: string): GenericComponent {
    return new GenericComponent(id, 'text').setProperties({ text });
  }

  /**
   * Creates an image component.
   */
  public static image(id: string, imageUrl: string): GenericComponent {
    return new GenericComponent(id, 'image').setProperties({ imageUrl });
  }

  /**
   * Creates an icon component.
   */
  public static icon(id: string, iconName: string): GenericComponent {
    return new GenericComponent(id, 'icon').setProperties({ icon: iconName });
  }

  /**
   * Creates a button component.
   */
  public static button(id: string, text: string): GenericComponent {
    return new GenericComponent(id, 'button').setProperties({ text });
  }

  /**
   * Creates an input field component.
   */
  public static input(id: string, inputType: string): GenericComponent {
    return new GenericComponent(id, 'input_field').setProperties({ inputType });
  }
}
