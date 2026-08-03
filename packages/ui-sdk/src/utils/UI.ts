import { GenericComponent } from '../components/GenericComponent.js';

export class UI {
  public static component(id: string, type: string = id): GenericComponent {
    return new GenericComponent(id, type);
  }

  public static child(id: string, type: string = 'default_child_layout'): GenericComponent {
    return new GenericComponent(id, type);
  }

  public static text(id: string, text: string): GenericComponent {
    return new GenericComponent(id, 'text').setProperties({ text });
  }

  public static image(id: string, imageUrl: string): GenericComponent {
    return new GenericComponent(id, 'image').setProperties({ imageUrl });
  }

  public static icon(id: string, iconName: string): GenericComponent {
    return new GenericComponent(id, 'icon').setProperties({ icon: iconName });
  }

  public static button(id: string, text: string): GenericComponent {
    return new GenericComponent(id, 'button').setProperties({ text });
  }

  public static input(id: string, inputType: string): GenericComponent {
    return new GenericComponent(id, 'input_field').setProperties({ inputType });
  }
}
